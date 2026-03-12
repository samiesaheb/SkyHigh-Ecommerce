import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        setItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async (cartItems: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  React.useEffect(() => {
    loadCart();
  }, []);

  const addToCart = async (product: Product, quantity: number = 1) => {
    // Don't add display-only items (price = 0) to cart
    if (parseFloat(product.price) === 0) {
      return;
    }
    
    const existingItemIndex = items.findIndex(item => item.product.id === product.id);
    let newItems: CartItem[];

    if (existingItemIndex >= 0) {
      newItems = [...items];
      newItems[existingItemIndex].quantity += quantity;
    } else {
      newItems = [...items, { product, quantity }];
    }

    setItems(newItems);
    await saveCart(newItems);
  };

  const removeFromCart = async (productId: number) => {
    const newItems = items.filter(item => item.product.id !== productId);
    setItems(newItems);
    await saveCart(newItems);
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const newItems = items.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    setItems(newItems);
    await saveCart(newItems);
  };

  const clearCart = async () => {
    setItems([]);
    await AsyncStorage.removeItem('cart');
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => 
      total + (parseFloat(item.product.price) * item.quantity), 0
    );
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};