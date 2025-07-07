"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CartItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  main_image: string;
};

type CartContextType = {
  quantity: number;
  cartItems: CartItem[];
  refreshQuantity: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, newQuantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
};

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

  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop()!.split(";").shift() : "";
  }

  const refreshQuantity = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/products/cart/quantity/", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setQuantity(data.quantity || 0);
        console.log("🧮 Cart quantity:", data.quantity);
      } else {
        console.warn("⚠️ Failed to fetch cart quantity:", res.status);
      }
    } catch (err) {
      console.error("❌ Error fetching cart quantity:", err);
      setQuantity(0);
    }
  };

  const refreshCart = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/products/cart/", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
        console.log("🧺 Cart items refreshed");
      } else {
        console.warn("⚠️ Failed to fetch cart:", res.status);
      }
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
      setCartItems([]);
    }
  };

  const addToCart = async (productId: number) => {
    try {
      const csrfToken = getCookie("csrftoken");
      if (!csrfToken) throw new Error("Missing CSRF token");

      const res = await fetch("http://localhost:8000/api/products/cart/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });

      const text = await res.text();
      console.log("🧪 addToCart response:", res.status, text);

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}: ${text}`);
      }

      await refreshCart();
      await refreshQuantity();
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    try {
      const csrfToken = getCookie("csrftoken");
      const res = await fetch("http://localhost:8000/api/products/cart/update/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, quantity: newQuantity }),
      });
      if (res.ok) {
        await refreshCart();
        await refreshQuantity();
      } else {
        console.warn("⚠️ Failed to update quantity:", res.status);
      }
    } catch (err) {
      console.error("❌ Error updating quantity:", err);
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      const csrfToken = getCookie("csrftoken");
      const res = await fetch("http://localhost:8000/api/products/cart/remove/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ product_id: productId }),
      });
      if (res.ok) {
        await refreshCart();
        await refreshQuantity();
      } else {
        console.warn("⚠️ Failed to remove item:", res.status);
      }
    } catch (err) {
      console.error("❌ Error removing item:", err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetch("http://localhost:8000/api/csrf/", {
          credentials: "include",
        });
        await refreshQuantity();
        await refreshCart();
      } catch (err) {
        console.error("❌ Error initializing cart:", err);
      }
    };
    initialize();
  }, []);

  return (
    <CartContext.Provider
      value={{
        quantity,
        cartItems,
        refreshQuantity,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
