"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { API_ENDPOINTS } from "@/lib/config";
import { getCookie } from "@/lib/utils";
import { CartItem, CartContextType } from "@/types";

const CartContext = createContext<CartContextType>({
  quantity: 0,
  cartItems: [],
  refreshQuantity: async () => {},
  refreshCart: async () => {},
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [quantity, setQuantity] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(true);

  // Load persisted cart data on mount
  useEffect(() => {
    const savedQuantity = localStorage.getItem('cart_quantity');
    const savedItems = localStorage.getItem('cart_items');
    const savedSyncTime = localStorage.getItem('cart_sync_time');
    
    if (savedQuantity) setQuantity(parseInt(savedQuantity) || 0);
    if (savedItems) {
      try {
        setCartItems(JSON.parse(savedItems));
      } catch (e) {
        console.warn('Failed to parse saved cart items');
      }
    }
    if (savedSyncTime) setLastSyncTime(parseInt(savedSyncTime) || 0);
  }, []);

  // Persist cart data changes
  useEffect(() => {
    localStorage.setItem('cart_quantity', quantity.toString());
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
    localStorage.setItem('cart_sync_time', Date.now().toString());
  }, [quantity, cartItems]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const withRetry = useCallback(async <T,>(operation: () => Promise<T>, retries = 2): Promise<T> => {
    const attemptOperation = async (remainingRetries: number): Promise<T> => {
      try {
        return await operation();
      } catch (error) {
        if (remainingRetries > 0 && isOnline) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return attemptOperation(remainingRetries - 1);
        }
        throw error;
      }
    };
    return attemptOperation(retries);
  }, [isOnline]);

  const refreshQuantity = useCallback(async () => {
    try {
      await withRetry(async () => {
        const res = await fetch(API_ENDPOINTS.CART.QUANTITY, {
          credentials: "include",
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setQuantity(data.quantity || 0);
          setLastSyncTime(Date.now());
          console.log("🧮 Cart quantity synced:", data.quantity);
        } else {
          throw new Error(`Failed to fetch cart quantity: ${res.status}`);
        }
      });
    } catch (err) {
      console.error("❌ Error fetching cart quantity:", err);
      // Keep existing quantity from localStorage if API fails
    }
  }, [isOnline]);

  const refreshCart = useCallback(async () => {
    try {
      await withRetry(async () => {
        const res = await fetch(API_ENDPOINTS.CART.ITEMS, {
          credentials: "include",
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items || []);
          setLastSyncTime(Date.now());
          console.log("🧺 Cart items synced");
        } else {
          throw new Error(`Failed to fetch cart items: ${res.status}`);
        }
      });
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
      // Keep existing cart items from localStorage if API fails
    }
  }, []);

  const addToCart = useCallback(async (productId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!productId || typeof productId !== 'number' || productId <= 0) {
        throw new Error("Invalid product ID");
      }

      const csrfToken = getCookie("csrftoken");
      if (!csrfToken) {
        throw new Error("Session expired. Please refresh the page.");
      }

      const res = await withRetry(async () => 
        fetch(API_ENDPOINTS.CART.ADD, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify({ product_id: productId, quantity: 1 }),
        })
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        const errorMessage = res.status === 400 ? "Product not available" :
                           res.status === 401 ? "Please log in to add items to cart" :
                           res.status === 404 ? "Product not found" :
                           errorData.message || `Server error (${res.status})`;
        throw new Error(errorMessage);
      }

      await Promise.all([refreshCart(), refreshQuantity()]);
      return { success: true };
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      const message = err instanceof Error ? err.message : "Failed to add item to cart";
      return { success: false, message };
    }
  }, [refreshCart, refreshQuantity]);

  const updateQuantity = useCallback(async (productId: number, newQuantity: number): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!productId || typeof productId !== 'number') {
        throw new Error("Invalid product ID");
      }
      
      if (!newQuantity || newQuantity < 1 || newQuantity > 999) {
        throw new Error("Invalid quantity. Must be between 1 and 999.");
      }

      const csrfToken = getCookie("csrftoken");
      if (!csrfToken) {
        throw new Error("Session expired. Please refresh the page.");
      }

      const res = await withRetry(async () => 
        fetch(API_ENDPOINTS.CART.UPDATE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify({ product_id: productId, quantity: newQuantity }),
        })
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        const errorMessage = res.status === 400 ? "Unable to update quantity" :
                           res.status === 401 ? "Please log in to update cart" :
                           res.status === 404 ? "Item not found in cart" :
                           errorData.message || `Server error (${res.status})`;
        throw new Error(errorMessage);
      }

      await Promise.all([refreshCart(), refreshQuantity()]);
      return { success: true };
    } catch (err) {
      console.error("❌ Error updating quantity:", err);
      const message = err instanceof Error ? err.message : "Failed to update quantity";
      return { success: false, message };
    }
  }, [refreshCart, refreshQuantity]);

  const removeFromCart = useCallback(async (productId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!productId || typeof productId !== 'number') {
        throw new Error("Invalid product ID");
      }

      const csrfToken = getCookie("csrftoken");
      if (!csrfToken) {
        throw new Error("Session expired. Please refresh the page.");
      }

      const res = await withRetry(async () => 
        fetch(API_ENDPOINTS.CART.REMOVE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify({ product_id: productId }),
        })
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        const errorMessage = res.status === 400 ? "Unable to remove item" :
                           res.status === 401 ? "Please log in to modify cart" :
                           res.status === 404 ? "Item not found in cart" :
                           errorData.message || `Server error (${res.status})`;
        throw new Error(errorMessage);
      }

      await Promise.all([refreshCart(), refreshQuantity()]);
      return { success: true };
    } catch (err) {
      console.error("❌ Error removing item:", err);
      const message = err instanceof Error ? err.message : "Failed to remove item";
      return { success: false, message };
    }
  }, [refreshCart, refreshQuantity]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetch(API_ENDPOINTS.CSRF, {
          credentials: "include",
        });

        // Initialize quantity
        const quantityRes = await fetch(API_ENDPOINTS.CART.QUANTITY, {
          credentials: "include",
          cache: "no-store",
        });
        if (quantityRes.ok) {
          const quantityData = await quantityRes.json();
          setQuantity(quantityData.quantity || 0);
        }

        // Initialize cart items
        const cartRes = await fetch(API_ENDPOINTS.CART.ITEMS, {
          credentials: "include",
          cache: "no-store",
        });
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartItems(cartData.items || []);
          setLastSyncTime(Date.now());
        }
      } catch (err) {
        console.error("❌ Error initializing cart:", err);
      }
    };
    initialize();
  }, []); // Only run once on mount

  const contextValue = useMemo(
    () => ({
      quantity,
      cartItems,
      refreshQuantity,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
    }),
    [quantity, cartItems, refreshQuantity, refreshCart, addToCart, updateQuantity, removeFromCart]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
