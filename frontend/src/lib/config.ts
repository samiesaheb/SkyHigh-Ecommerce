const isDevelopment = process.env.NODE_ENV === 'development';
const isMobile = process.env.NEXT_PUBLIC_TARGET === 'mobile';

// Get local network IP for mobile testing
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (isDevelopment) {
    return isMobile ? 'http://192.168.1.120:8000' : 'http://localhost:8000';
  }
  return 'https://your-domain.com';
};

const getMediaUrl = () => {
  if (process.env.NEXT_PUBLIC_MEDIA_URL) {
    return process.env.NEXT_PUBLIC_MEDIA_URL;
  }
  if (isDevelopment) {
    return isMobile ? 'http://192.168.1.120:8000/media' : 'http://localhost:8000/media';
  }
  return 'https://your-domain.com/media';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  MEDIA_URL: getMediaUrl(),
} as const;

export const API_ENDPOINTS = {
  CSRF: `${API_CONFIG.BASE_URL}/api/csrf/`,
  AUTH: {
    LOGIN: `${API_CONFIG.BASE_URL}/api/accounts/login/`,
    LOGOUT: `${API_CONFIG.BASE_URL}/api/accounts/logout/`,
    SIGNUP: `${API_CONFIG.BASE_URL}/api/accounts/signup/`,
    USER: `${API_CONFIG.BASE_URL}/api/accounts/user/`,
    PROFILE: `${API_CONFIG.BASE_URL}/api/accounts/profile/`,
    UPDATE_PROFILE: `${API_CONFIG.BASE_URL}/api/accounts/update-profile/`,
    CHANGE_PASSWORD: `${API_CONFIG.BASE_URL}/api/accounts/change-password/`,
    FORGOT_PASSWORD: `${API_CONFIG.BASE_URL}/api/accounts/password-reset/`,
    PASSWORD_RESET_CONFIRM: `${API_CONFIG.BASE_URL}/api/accounts/password-reset-confirm/`,
  },
  PRODUCTS: {
    LIST: `${API_CONFIG.BASE_URL}/api/v1/products/`,
    BRANDS: `${API_CONFIG.BASE_URL}/api/v1/products/brands/`,
    SEARCH: `${API_CONFIG.BASE_URL}/api/v1/products/search-suggestions/`,
  },
  CART: {
    QUANTITY: `${API_CONFIG.BASE_URL}/api/products/cart/quantity/`,
    ITEMS: `${API_CONFIG.BASE_URL}/api/products/cart/`,
    ADD: `${API_CONFIG.BASE_URL}/api/products/cart/`,
    UPDATE: `${API_CONFIG.BASE_URL}/api/products/cart/update/`,
    REMOVE: `${API_CONFIG.BASE_URL}/api/products/cart/remove/`,
  },
  ORDERS: {
    CREATE: `${API_CONFIG.BASE_URL}/api/orders/checkout/`,
    CONFIRM_PAYMENT: `${API_CONFIG.BASE_URL}/api/orders/confirm-payment/`,
    LIST: `${API_CONFIG.BASE_URL}/api/orders/`,
    LATEST: `${API_CONFIG.BASE_URL}/api/orders/latest/`,
    STATUS: `${API_CONFIG.BASE_URL}/api/orders/status/`,
  },
  WISHLIST: {
    LIST: `${API_CONFIG.BASE_URL}/api/wishlist/`,
    ADD: `${API_CONFIG.BASE_URL}/api/wishlist/add/`,
    REMOVE: `${API_CONFIG.BASE_URL}/api/wishlist/remove/`,
    CLEAR: `${API_CONFIG.BASE_URL}/api/wishlist/clear/`,
  },
  REVIEWS: {
    CREATE: `${API_CONFIG.BASE_URL}/api/products/reviews/`,
    LIST: (productId: number) => `${API_CONFIG.BASE_URL}/api/products/reviews/${productId}/`,
    HELPFUL: (reviewId: number) => `${API_CONFIG.BASE_URL}/api/products/reviews/helpful/${reviewId}/`,
    USER_REVIEWS: `${API_CONFIG.BASE_URL}/api/products/reviews/user/`,
  },
  CONTACT: `${API_CONFIG.BASE_URL}/api/contact/`,
  QUOTE_REQUEST: `${API_CONFIG.BASE_URL}/api/quotes/quote-requests/`,
  SAMPLE_REQUEST: `${API_CONFIG.BASE_URL}/api/quotes/sample-requests/`,
  ADMIN: {
    ANALYTICS: {
      SALES_OVERVIEW: `${API_CONFIG.BASE_URL}/api/orders/analytics/sales-overview/`,
      DAILY_SALES: `${API_CONFIG.BASE_URL}/api/orders/analytics/daily-sales/`,
      TOP_PRODUCTS: `${API_CONFIG.BASE_URL}/api/orders/analytics/top-products/`,
      BRAND_PERFORMANCE: `${API_CONFIG.BASE_URL}/api/orders/analytics/brand-performance/`,
      CUSTOMER_INSIGHTS: `${API_CONFIG.BASE_URL}/api/orders/analytics/customer-insights/`,
    },
  },
} as const;

export const buildImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  // If the path already starts with /media/, just prepend the base URL
  if (imagePath.startsWith('/media/')) {
    return `${API_CONFIG.BASE_URL}${imagePath}`;
  }
  
  // Otherwise, use the media URL
  return `${API_CONFIG.MEDIA_URL}/${imagePath.replace(/^\//, '')}`;
};