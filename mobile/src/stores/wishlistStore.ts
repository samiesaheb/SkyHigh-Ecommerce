import { create } from 'zustand';
import api from '../services/api';
import { 
  Product
} from '../types';

interface WishlistStore {
  // State
  items: Product[];
  wishlistedProductIds: number[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  // Initial state
  items: [],
  wishlistedProductIds: [],
  isLoading: false,
  error: null,

  // Actions
  addToWishlist: (product: Product) => {
    const { wishlistedProductIds, items } = get();
    
    if (!wishlistedProductIds.includes(product.id)) {
      set({
        items: [...items, product],
        wishlistedProductIds: [...wishlistedProductIds, product.id],
        error: null,
      });
    }
  },

  removeFromWishlist: (productId: number) => {
    const { wishlistedProductIds, items } = get();
    
    set({
      items: items.filter(item => item.id !== productId),
      wishlistedProductIds: wishlistedProductIds.filter(id => id !== productId),
      error: null,
    });
  },

  isInWishlist: (productId: number) => {
    return get().wishlistedProductIds.includes(productId);
  },

  clearWishlist: () => {
    set({
      items: [],
      wishlistedProductIds: [],
      error: null,
    });
  },
}));

export default useWishlistStore;