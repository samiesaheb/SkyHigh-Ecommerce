"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartButtonProps {
  onClick: () => void;
  cartQuantity: number;
}

export default function CartButton({ onClick, cartQuantity }: CartButtonProps) {
  const [prevQuantity, setPrevQuantity] = useState(cartQuantity);
  const [shouldBounce, setShouldBounce] = useState(false);

  useEffect(() => {
    if (cartQuantity > prevQuantity) {
      setShouldBounce(true);
      const timer = setTimeout(() => setShouldBounce(false), 600);
      return () => clearTimeout(timer);
    }
    // Always update prevQuantity to current value
    setPrevQuantity(cartQuantity);
  }, [cartQuantity]); // Remove prevQuantity from dependencies to avoid infinite loops
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2.5 transition-all duration-300",
        "hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring/20",
        "group touch-manipulation",
        shouldBounce && "animate-bounce"
      )}
      style={{ borderRadius: "var(--radius)" }}
      aria-label={`Shopping cart with ${cartQuantity} items`}
      title={`Cart (${cartQuantity})`}
    >
      <ShoppingBag className="w-5 h-5 text-foreground transition-all duration-300 group-hover:scale-110 group-active:scale-95" />
      
      {cartQuantity > 0 && (
        <span className={cn(
          "absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-light w-5 h-5 rounded-full flex items-center justify-center shadow-sm",
          "transition-all duration-300 animate-in zoom-in-0",
          "group-hover:scale-110 group-active:scale-90",
          shouldBounce && "animate-pulse scale-110"
        )}>
          {cartQuantity > 99 ? "99+" : cartQuantity}
        </span>
      )}
    </button>
  );
}