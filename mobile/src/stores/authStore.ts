import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types';
import api from '@/services/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

// Custom storage adapter for Zustand with SecureStore
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('Failed to save to secure store:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('Failed to remove from secure store:', error);
    }
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          // Step 1: Get JWT tokens
          const tokenResponse = await api.post(
            API_ENDPOINTS.AUTH.LOGIN,
            credentials
          );

          const { access, refresh } = tokenResponse.data;

          // Store tokens securely
          await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, access);
          await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refresh);

          // Step 2: Get user info with the new token
          const userResponse = await api.get<User>(API_ENDPOINTS.AUTH.USER);

          set({
            user: userResponse.data,
            token: access,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.detail || error.response?.data?.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          // Step 1: Register user
          await api.post(API_ENDPOINTS.AUTH.REGISTER, data);

          // Step 2: Login with the new credentials
          const credentials = {
            email: data.email,
            password: data.password1,
          };
          
          await get().login(credentials);
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error || error.response?.data?.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          // Call logout endpoint if available
          await api.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error);
        }

        // Clear stored tokens
        await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      loadStoredAuth: async () => {
        set({ isLoading: true });

        try {
          const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);

          if (token) {
            // Verify token is still valid by fetching user data
            const response = await api.get<User>(API_ENDPOINTS.AUTH.USER);

            set({
              user: response.data,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
            });
          }
        } catch (error) {
          // Token might be expired, clear it
          await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: secureStorage,
      // Only persist non-sensitive data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);