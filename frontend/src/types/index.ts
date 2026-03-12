// Shared TypeScript interfaces for the application

export interface User {
  username: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_admin?: boolean;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  main_image: string;
  brand: Brand;
  category?: string;
  images?: string[];
  ingredients?: string;
  directions?: string;
}

export interface ProductReview {
  id: number;
  product: number;
  product_name: string;
  user: number;
  user_name: string;
  user_initials: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  helpful_count: number;
  user_found_helpful: boolean;
  created_at: string;
  updated_at: string;
  is_geometry_product: boolean;
}

export interface ProductDetail extends Product {
  reviews: ProductReview[];
  average_rating: number | null;
  review_count: number;
  rating_distribution: Record<string, number>;
  user_has_reviewed: boolean;
}

export interface ReviewFormData {
  product: number;
  rating: number;
  title: string;
  comment: string;
}

export interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  main_image: string;
  product?: Product;
}

export interface Cart {
  items: CartItem[];
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: string;
  created_at: string;
  shipping_address?: Address;
  billing_address?: Address;
}

export interface Address {
  full_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface SearchResult {
  id: number;
  name: string;
  slug: string;
  main_image: string;
  price: string;
  brand: {
    name: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Context types
export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

export interface CartResult {
  success: boolean;
  message?: string;
}

export interface CartContextType {
  quantity: number;
  cartItems: CartItem[];
  refreshQuantity: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number) => Promise<CartResult>;
  updateQuantity: (productId: number, newQuantity: number) => Promise<CartResult>;
  removeFromCart: (productId: number) => Promise<CartResult>;
}

// Component prop types
export interface HeaderProps {
  onSearch?: (query: string) => void;
  onCartUpdate?: () => void;
}

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
}

export interface FilterSidebarProps {
  brands: Brand[];
  selectedBrands: string[];
  onBrandChange: (brands: string[]) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
}

// Form types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface SignupFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface CheckoutFormData {
  billing_address: Address;
  shipping_address?: Address;
  use_same_address: boolean;
  payment_method: string;
}

// Wishlist types
export interface WishlistItem {
  id: number;
  product: Product;
  added_at: string;
}

export interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  loading: boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  refreshWishlist: () => Promise<void>;
  clearWishlist: () => Promise<void>;
}