// ===================
// CORE DOMAIN TYPES
// ===================

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  main_image: string | null;
  slug: string;
  brand: Brand;
  is_available?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Brand {
  id: number;
  name: string;
  description: string;
  slug: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_joined?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal?: string;
}

export interface Cart {
  id: number;
  user?: User;
  items: CartItem[];
  total_price: string;
  total_items: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user?: User;
  full_name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  country: string;
  zip: string;
  status: OrderStatus;
  total_price: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: string;
  subtotal: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface WishlistItem {
  id: number;
  product: Product;
  added_at: string;
  price_when_added?: string;
  notes?: string;
}

export interface Wishlist {
  id: number;
  user: User;
  items: WishlistItem[];
  item_count: number;
  total_value: string;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: number;
  product: Product;
  user: User;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  helpful_count: number;
  is_helpful?: boolean; // If current user marked as helpful
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewData {
  product_id: number;
  rating: number;
  title: string;
  comment: string;
}

// ===================
// AUTH TYPES
// ===================

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password1: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// ===================
// API TYPES
// ===================

export interface APIResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface APIError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, string[]>;
}

// ===================
// UI STATE TYPES
// ===================

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
}

// ===================
// NAVIGATION TYPES
// ===================

export type RootStackParamList = {
  Home: undefined;
  Products: {
    brand?: string;
    search?: string;
  };
  ProductDetail: {
    product: Product;
  };
  Cart: undefined;
  Checkout: undefined;
  Profile: undefined;
  Login: undefined;
  Register: undefined;
  Orders: undefined;
  Settings: undefined;
  Wishlist: undefined;
  Reviews: {
    productId: number;
  };
  WriteReview: {
    product: Product;
  };
};

// ===================
// FORM TYPES
// ===================

export interface ProductFilters {
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  ordering?: 'name' | '-name' | 'price' | '-price';
}

export interface CheckoutData {
  full_name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  country: string;
  zip: string;
}

// ===================
// UTILITY TYPES
// ===================

export type AsyncAction<T = void> = () => Promise<T>;
export type AsyncActionWithParam<P, T = void> = (param: P) => Promise<T>;

export interface RefreshControl {
  refreshing: boolean;
  onRefresh: () => void;
}