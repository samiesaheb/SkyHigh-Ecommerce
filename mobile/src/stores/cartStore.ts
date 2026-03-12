import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, CartItem, Cart } from '@/types';
import api from '@/services/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import { calculateCartTotal, getTotalCartItems } from '@/utils';

interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
}

interface CartActions {
  // Local cart operations (optimistic updates)
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Server sync operations
  syncWithServer: () => Promise<void>;
  fetchCart: () => Promise<void>;
  
  // Utility actions
  calculateTotals: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      totalPrice: 0,
      totalItems: 0,
      isLoading: false,
      error: null,

      // Actions
      addItem: async (product: Product, quantity = 1) => {
        const { items } = get();
        
        // Optimistic update
        const existingItemIndex = items.findIndex(
          item => item.product.id === product.id
        );

        let updatedItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Update existing item
          updatedItems = [...items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
          };
        } else {
          // Add new item
          const newItem: CartItem = {
            id: Date.now(), // Temporary ID
            product,
            quantity,
          };
          updatedItems = [...items, newItem];
        }

        set({ items: updatedItems });
        get().calculateTotals();

        // Sync with server
        try {
          await api.post(API_ENDPOINTS.CART.ADD, {
            product_id: product.id,
            quantity,
          });
          
          // Optionally fetch latest cart state from server
          // await get().fetchCart();
        } catch (error: any) {
          // Revert optimistic update on error
          set({ items });
          get().calculateTotals();
          set({ error: error.response?.data?.message || 'Failed to add item to cart' });
          throw error;
        }
      },

      removeItem: async (productId: number) => {
        const { items } = get();
        const originalItems = [...items];
        
        // Optimistic update
        const updatedItems = items.filter(item => item.product.id !== productId);
        set({ items: updatedItems });
        get().calculateTotals();

        // Sync with server
        try {
          await api.delete(API_ENDPOINTS.CART.REMOVE(productId));
        } catch (error: any) {
          // Revert optimistic update on error
          set({ items: originalItems });
          get().calculateTotals();
          set({ error: error.response?.data?.message || 'Failed to remove item from cart' });
          throw error;
        }
      },

      updateQuantity: async (productId: number, quantity: number) => {
        const { items } = get();
        const originalItems = [...items];

        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        // Optimistic update
        const updatedItems = items.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        );

        set({ items: updatedItems });
        get().calculateTotals();

        // Sync with server
        try {
          await api.put(API_ENDPOINTS.CART.UPDATE(productId), { quantity });
        } catch (error: any) {
          // Revert optimistic update on error
          set({ items: originalItems });
          get().calculateTotals();
          set({ error: error.response?.data?.message || 'Failed to update cart item' });
          throw error;
        }
      },

      clearCart: async () => {
        const { items } = get();
        
        // Optimistic update
        set({ items: [], totalPrice: 0, totalItems: 0 });

        // Sync with server
        try {
          await api.delete(API_ENDPOINTS.CART.CLEAR);
        } catch (error: any) {
          // Revert optimistic update on error
          set({ items });
          get().calculateTotals();
          set({ error: error.response?.data?.message || 'Failed to clear cart' });
          throw error;
        }
      },

      fetchCart: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get<{ cart: Cart; summary: any }>(
            API_ENDPOINTS.CART.GET
          );

          const { cart } = response.data;
          
          set({
            items: cart.items,
            isLoading: false,
          });

          get().calculateTotals();
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to fetch cart',
          });
        }
      },

      syncWithServer: async () => {
        // This could implement logic to sync local changes with server
        // For now, just fetch the latest cart state
        await get().fetchCart();
      },

      calculateTotals: () => {
        const { items } = get();
        const totalPrice = calculateCartTotal(items);
        const totalItems = getTotalCartItems(items);
        
        set({ totalPrice, totalItems });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: STORAGE_KEYS.CART_DATA,
      storage: createJSONStorage(() => AsyncStorage),
      // Persist cart items and totals
      partialize: (state) => ({
        items: state.items,
        totalPrice: state.totalPrice,
        totalItems: state.totalItems,
      }),
    }
  )
);