import { VALIDATION } from '@/constants';

// ===================
// FORMATTING UTILITIES
// ===================

export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '฿0.00';
  return `฿${numPrice.toFixed(2)}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// ===================
// VALIDATION UTILITIES
// ===================

export const validateEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email.toLowerCase());
};

export const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
};

export const validatePhone = (phone: string): boolean => {
  return VALIDATION.PHONE_REGEX.test(phone);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

// ===================
// ASYNC UTILITIES
// ===================

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ===================
// ERROR HANDLING UTILITIES
// ===================

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: any): boolean => {
  return !error.response && error.code === 'NETWORK_ERROR';
};

export const getStatusCode = (error: any): number => {
  return error?.response?.status || 0;
};

// ===================
// ARRAY UTILITIES
// ===================

export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) return [...new Set(array)];
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const groupBy = <T, K extends keyof any>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((result, item) => {
    const key = getKey(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
};

// ===================
// URL UTILITIES
// ===================

export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const getImageUrl = (imagePath: string | null, baseUrl?: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  const base = baseUrl || 'http://172.20.10.5:8000';
  return `${base}${imagePath}`;
};

// ===================
// DEVICE UTILITIES
// ===================

export const isIOS = (): boolean => {
  return require('react-native').Platform.OS === 'ios';
};

export const isAndroid = (): boolean => {
  return require('react-native').Platform.OS === 'android';
};

// ===================
// CART UTILITIES
// ===================

export const calculateCartTotal = (items: Array<{ quantity: number; product: { price: string } }>): number => {
  return items.reduce((total, item) => {
    const price = parseFloat(item.product.price) || 0;
    return total + (price * item.quantity);
  }, 0);
};

export const getTotalCartItems = (items: Array<{ quantity: number }>): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};