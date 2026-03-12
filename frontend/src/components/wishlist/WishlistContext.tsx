"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { API_ENDPOINTS } from "@/lib/config";
import { WishlistItem, WishlistContextType } from "@/types";
import { useUser } from "@/components/auth/UserContext";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      
      // Temporary localStorage solution until backend is ready
      const storedWishlist = localStorage.getItem(`wishlist_${user.username}`);
      const wishlistData = storedWishlist ? JSON.parse(storedWishlist) : [];
      
      setWishlistItems(wishlistData);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToWishlist = useCallback(async (productId: number) => {
    if (!user) {
      alert("Please log in to save items to wishlist");
      return;
    }

    try {
      // Get current wishlist from localStorage first
      const storedWishlist = localStorage.getItem(`wishlist_${user.username}`);
      const currentWishlist = storedWishlist ? JSON.parse(storedWishlist) : [];
      
      // Check if product already in wishlist
      const existingIndex = currentWishlist.findIndex((item: { product: { id: number } }) => item.product.id === productId);
      if (existingIndex !== -1) {
        console.log("Product already in wishlist");
        return;
      }

      setLoading(true);
      
      // Fetch product details
      const response = await fetch(`${API_ENDPOINTS.PRODUCTS.LIST}?id=${productId}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Product not found");
      
      const products = await response.json();
      if (!products || products.length === 0) throw new Error("Product not found");
      
      // Find the specific product by ID (API might return all products)
      const product = products.find((p: { id: number }) => p.id === productId);
      if (!product) throw new Error("Product not found");
      
      // Add to wishlist
      const newWishlistItem = {
        id: Date.now(), // temporary ID
        product: product,
        added_at: new Date().toISOString()
      };
      
      const updatedWishlist = [...currentWishlist, newWishlistItem];
      localStorage.setItem(`wishlist_${user.username}`, JSON.stringify(updatedWishlist));
      
      setWishlistItems(updatedWishlist);
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      throw error; // Let the button handle the error
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeFromWishlist = useCallback(async (productId: number) => {
    if (!user) return;

    try {
      // Get current wishlist from localStorage
      const storedWishlist = localStorage.getItem(`wishlist_${user.username}`);
      const currentWishlist = storedWishlist ? JSON.parse(storedWishlist) : [];
      
      // Remove product from wishlist
      const updatedWishlist = currentWishlist.filter((item: { product: { id: number } }) => item.product.id !== productId);
      localStorage.setItem(`wishlist_${user.username}`, JSON.stringify(updatedWishlist));
      
      setWishlistItems(updatedWishlist);
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      throw error; // Let the button handle the error
    }
  }, [user]);

  const clearWishlist = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      localStorage.removeItem(`wishlist_${user.username}`);
      setWishlistItems([]);
    } catch (error) {
      console.error("Failed to clear wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const isInWishlist = useCallback((productId: number): boolean => {
    return wishlistItems.some(item => item.product.id === productId);
  }, [wishlistItems]);

  // Load wishlist when user changes
  useEffect(() => {
    if (user) {
      refreshWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user, refreshWishlist]);

  const contextValue = useMemo(
    () => ({
      wishlistItems,
      wishlistCount: wishlistItems.length,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      refreshWishlist,
      clearWishlist,
    }),
    [wishlistItems, loading, addToWishlist, removeFromWishlist, isInWishlist, refreshWishlist, clearWishlist]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};