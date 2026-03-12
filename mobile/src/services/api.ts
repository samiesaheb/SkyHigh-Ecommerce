import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { STORAGE_KEYS, API_ENDPOINTS, ERROR_MESSAGES } from '../constants';
import { getErrorMessage } from '../utils';

interface QueuedRequest {
  config: AxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

class APIClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;
  private offlineQueue: QueuedRequest[] = [];
  private isOnline = true;

  constructor() {
    const API_URL = this.getApiUrl();

    this.client = axios.create({
      baseURL: API_URL,
      timeout: 15000, // 15 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupNetworkMonitoring();
    this.setupInterceptors();
  }

  private getApiUrl(): string {
    const config = Constants.expoConfig?.extra;
    const homeWifiUrl = config?.apiUrls?.homeWifi || 'http://192.168.1.120:8000';
    const hotspotUrl = config?.apiUrls?.hotspot || 'http://172.20.10.5:8000';
    const fallbackUrl = config?.apiUrl || 'http://localhost:8000';

    try {
      // Default to home WiFi, will be updated by network monitoring
      return homeWifiUrl;
    } catch (error) {
      console.log('Using fallback API URL:', fallbackUrl);
      return fallbackUrl;
    }
  }

  private setupNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // Update API base URL based on network
      this.updateBaseUrlForNetwork(state);

      // Process offline queue when back online
      if (wasOffline && this.isOnline) {
        this.processOfflineQueue();
      }
    });
  }

  private updateBaseUrlForNetwork(state: any) {
    const config = Constants.expoConfig?.extra;
    const homeWifiUrl = config?.apiUrls?.homeWifi || 'http://192.168.1.120:8000';
    const hotspotUrl = config?.apiUrls?.hotspot || 'http://172.20.10.5:8000';
    
    let newBaseUrl = homeWifiUrl; // Default to home WiFi

    if (state.isConnected && state.details) {
      // Check for hotspot indicators
      if (state.type === 'wifi') {
        const ssid = state.details.ssid;
        
        // Common hotspot SSID patterns - you can customize these
        if (ssid && (
          ssid.includes('iPhone') || 
          ssid.includes('iPad') || 
          ssid.includes('Hotspot') ||
          ssid.includes('Personal Hotspot') ||
          ssid === 'macintosh' // Your specific hotspot name if known
        )) {
          newBaseUrl = hotspotUrl;
        }
      } else if (state.type === 'cellular') {
        // If connected via cellular, might be using hotspot
        newBaseUrl = hotspotUrl;
      }
    }

    // Update base URL if it changed
    if (this.client.defaults.baseURL !== newBaseUrl) {
      console.log(`🔄 Switching API URL from ${this.client.defaults.baseURL} to ${newBaseUrl}`);
      this.client.defaults.baseURL = newBaseUrl;
    }
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers = config.headers || {};
        config.headers['X-Request-ID'] = `mobile_${Date.now()}`;

        // Log request in development
        if (__DEV__) {
          console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (__DEV__) {
          console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()}`);
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Network error handling
        if (!error.response) {
          if (!this.isOnline) {
            return this.handleOfflineRequest(originalRequest);
          }
          throw new NetworkError();
        }

        // Log error in development
        if (__DEV__) {
          console.error(`❌ ${error.response.status} ${originalRequest?.method?.toUpperCase()}`);
        }

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            await this.handleLogout();
            throw new AuthenticationError();
          }
        }

        // Parse and throw structured error
        throw new Error(getErrorMessage(error));
      }
    );
  }

  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple concurrent refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = this.performTokenRefresh();
    
    try {
      return await this.refreshTokenPromise;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(
        `${this.client.defaults.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refresh: refreshToken },
        { timeout: 10000 }
      );

      const { access, refresh } = response.data;

      // Store new tokens
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, access);
      if (refresh) {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refresh);
      }

      return access;
    } catch (error) {
      // Clear invalid tokens
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      throw error;
    }
  }

  private async handleLogout() {
    // Clear tokens
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    
    // Clear offline queue
    this.offlineQueue = [];

    // Notify auth store or navigation to redirect to login
    // This would typically emit an event or call a logout function
    console.log('User logged out due to authentication failure');
  }

  private handleOfflineRequest(config: AxiosRequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      this.offlineQueue.push({ config, resolve, reject });
    });
  }

  private async processOfflineQueue() {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const { config, resolve, reject } of queue) {
      try {
        const response = await this.client(config);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }
  }

  // Public methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // Utility methods
  isNetworkConnected(): boolean {
    return this.isOnline;
  }

  getQueueLength(): number {
    return this.offlineQueue.length;
  }

  clearOfflineQueue(): void {
    this.offlineQueue = [];
  }

  // Method to test and find the correct API URL
  async findWorkingApiUrl(): Promise<string> {
    const config = Constants.expoConfig?.extra;
    const urls = [
      config?.apiUrls?.homeWifi || 'http://192.168.1.120:8000', // Home WiFi
      config?.apiUrls?.hotspot || 'http://172.20.10.5:8000',    // Hotspot
    ];

    for (const url of urls) {
      try {
        console.log(`🔍 Testing API URL: ${url}`);
        const testResponse = await axios.get(`${url}/api/health/`, { 
          timeout: 3000,
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (testResponse.status === 200) {
          console.log(`✅ Found working API URL: ${url}`);
          this.client.defaults.baseURL = url;
          return url;
        }
      } catch (error) {
        console.log(`❌ API URL ${url} not reachable`);
      }
    }

    // If no URL works, keep current or use fallback
    const fallback = config?.apiUrl || 'http://localhost:8000';
    console.log(`⚠️ No working API URL found, using fallback: ${fallback}`);
    return fallback;
  }

  // Method to manually switch API URL (useful for testing)
  setApiUrl(url: string): void {
    console.log(`🔧 Manually setting API URL to: ${url}`);
    this.client.defaults.baseURL = url;
  }

  getCurrentApiUrl(): string {
    return this.client.defaults.baseURL || 'Unknown';
  }
}

// Create and export singleton instance
export const api = new APIClient();
export default api;