"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart/HeaderContext";
import CartButton from "./CartButton";
import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";
import CartSummary from "./CartSummary";
import { cn } from "@/lib/utils";

interface CartDropdownProps {
  onError: (error: string) => void;
}

export default function CartDropdown({ onError }: CartDropdownProps) {
  const router = useRouter();
  const {
    quantity: cartQuantity = 0,
    cartItems = [],
    updateQuantity = () => {},
    removeFromCart = () => {},
  } = useCart() || {};

  const cartRef = useRef<HTMLDivElement>(null);
  const [showCartDropdown, setShowCartDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setShowCartDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Prevent body scroll when dropdown is open
    if (showCartDropdown) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCartDropdown]);

  const toggleDropdown = () => {
    setShowCartDropdown(!showCartDropdown);
  };

  const closeDropdown = () => {
    setShowCartDropdown(false);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="relative" ref={cartRef}>
      <CartButton onClick={toggleDropdown} cartQuantity={cartQuantity} />

      {showCartDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={closeDropdown}
          />
          
          {/* Cart Dropdown */}
          <div className={cn(
            "absolute right-0 mt-2 w-80 sm:w-96 bg-background border border-border/40 shadow-2xl backdrop-blur-md z-50 max-h-[85vh] overflow-hidden",
            "max-w-[calc(100vw-2rem)] md:max-w-none",
            "mobile:fixed mobile:inset-0 mobile:w-full mobile:h-full mobile:max-h-full mobile:mt-0 mobile:border-0 mobile:shadow-none",
            "md:absolute md:top-full md:right-0 md:h-auto",
            "cart-dropdown-enter"
          )}
          style={{ borderRadius: "var(--radius)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/20 bg-background/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-extralight text-lg text-foreground tracking-tight">
                    Shopping Bag
                  </h3>
                  {cartQuantity > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {cartQuantity} {cartQuantity === 1 ? 'item' : 'items'}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={closeDropdown}
                className="w-10 h-10 mobile:w-12 mobile:h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors md:hidden touch-manipulation"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 mobile:w-6 mobile:h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto mobile:max-h-[calc(100vh-120px)] max-h-[calc(85vh-140px)] md:max-h-96">
              {cartItems.length === 0 ? (
                <div className="p-6">
                  <EmptyCart />
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemoveFromCart={removeFromCart}
                      onError={onError}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Summary */}
            {cartItems.length > 0 && (
              <div className="border-t border-border/20 bg-background/95 backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-extralight text-muted-foreground uppercase tracking-wider">
                      Subtotal
                    </span>
                    <span className="text-lg font-light text-foreground">
                      ฿{subtotal.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <Link
                      href="/cart"
                      onClick={closeDropdown}
                      className="block w-full px-6 py-3 border border-border/60 text-foreground font-extralight text-sm tracking-wider uppercase transition-all duration-300 hover:bg-black hover:text-white focus:outline-none focus:ring-1 focus:ring-ring/20 text-center"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      View Cart
                    </Link>
                    
                    <Link
                      href="/checkout"
                      onClick={closeDropdown}
                      className="block w-full px-6 py-3 bg-primary text-primary-foreground font-extralight text-sm tracking-wider uppercase transition-all duration-300 hover:bg-black hover:text-white focus:outline-none focus:ring-1 focus:ring-ring/20 text-center"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      Checkout
                    </Link>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Shipping calculated at checkout
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}