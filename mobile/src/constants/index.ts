// ===================
// APP CONSTANTS
// ===================

export const APP_CONFIG = {
  NAME: 'Sky High Mobile',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.skyhigh.mobile',
} as const;

// ===================
// API CONSTANTS
// ===================

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/mobile/auth/jwt/create/',
    REGISTER: '/api/v1/mobile/accounts/register/',
    REFRESH: '/api/v1/mobile/auth/jwt/refresh/',
    USER: '/api/v1/mobile/accounts/user/',
    LOGOUT: '/api/accounts/logout/',
  },
  PRODUCTS: {
    LIST: '/api/v1/mobile/products/',
    DETAIL: (slug: string) => `/api/v1/mobile/products/${slug}/`,
    SEARCH: '/api/v1/mobile/products/search/',
    SUGGESTIONS: '/api/v1/mobile/products/search-suggestions/',
  },
  CART: {
    GET: '/api/v1/cart/',
    ADD: '/api/v1/cart/',
    UPDATE: (productId: number) => `/api/v1/cart/item/${productId}/`,
    REMOVE: (productId: number) => `/api/v1/cart/item/${productId}/`,
    CLEAR: '/api/v1/cart/clear/',
  },
  ORDERS: {
    LIST: '/api/v1/mobile/orders/history/',
    CREATE: '/api/v1/mobile/orders/checkout/',
    DETAIL: (id: number) => `/api/v1/mobile/orders/${id}/`,
    LATEST: '/api/v1/mobile/orders/latest/',
  },
  BRANDS: {
    LIST: '/api/v1/mobile/products/brands/',
  },
  WISHLIST: {
    LIST: '/api/v1/mobile/wishlist/',
    ADD: '/api/v1/mobile/wishlist/add/',
    REMOVE: (productId: number) => `/api/v1/mobile/wishlist/remove/${productId}/`,
    TOGGLE: '/api/v1/mobile/wishlist/toggle/',
    CHECK: (productId: number) => `/api/v1/mobile/wishlist/check/${productId}/`,
  },
  REVIEWS: {
    LIST: (productId: number) => `/api/v1/mobile/reviews/products/${productId}/`,
    CREATE: '/api/v1/mobile/reviews/',
    SUMMARY: (productId: number) => `/api/v1/mobile/reviews/products/${productId}/summary/`,
    HELPFUL: (reviewId: number) => `/api/v1/mobile/reviews/helpful/${reviewId}/`,
    USER: '/api/v1/mobile/reviews/user/',
  },
} as const;

// ===================
// UI CONSTANTS
// ===================

export const COLORS = {
  PRIMARY: '#007AFF',
  SECONDARY: '#FF6B6B',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',
  BACKGROUND: '#F8F9FA',
  SURFACE: '#FFFFFF',
  TEXT: {
    PRIMARY: '#212121',
    SECONDARY: '#757575',
    DISABLED: '#BDBDBD',
  },
  BORDER: '#E0E0E0',
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const;

export const TYPOGRAPHY = {
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
  FONT_WEIGHTS: {
    LIGHT: '300' as const,
    NORMAL: '400' as const,
    MEDIUM: '500' as const,
    SEMIBOLD: '600' as const,
    BOLD: '700' as const,
  },
} as const;

// ===================
// LAYOUT CONSTANTS
// ===================

export const LAYOUT = {
  SCREEN_PADDING: SPACING.MD,
  CARD_RADIUS: 8,
  BUTTON_HEIGHT: 48,
  INPUT_HEIGHT: 56,
  HEADER_HEIGHT: 64,
  TAB_BAR_HEIGHT: 80,
} as const;

// ===================
// ASYNC STORAGE KEYS
// ===================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  CART_DATA: 'cartData',
  WISHLIST_DATA: 'wishlistData',
  THEME_PREFERENCE: 'themePreference',
  LANGUAGE_PREFERENCE: 'languagePreference',
} as const;

// ===================
// VALIDATION CONSTANTS
// ===================

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PRODUCT_QUANTITY: 99,
  MIN_PRODUCT_QUANTITY: 1,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
} as const;

// ===================
// ERROR MESSAGES
// ===================

export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// ===================
// SUCCESS MESSAGES
// ===================

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Successfully logged out!',
  CART_ADDED: 'Item added to cart!',
  CART_UPDATED: 'Cart updated successfully!',
  CART_REMOVED: 'Item removed from cart!',
  ORDER_PLACED: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  WISHLIST_ADDED: 'Added to wishlist!',
  WISHLIST_REMOVED: 'Removed from wishlist!',
  REVIEW_ADDED: 'Review submitted successfully!',
  REVIEW_HELPFUL: 'Thanks for your feedback!',
} as const;