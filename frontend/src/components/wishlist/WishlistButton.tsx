"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "./WishlistContext";
import { useUser } from "@/components/auth/UserContext";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: number;
  productPrice: string | number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function WishlistButton({ 
  productId, 
  productPrice,
  className, 
  showLabel = false, 
  size = "md" 
}: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimisticState, setOptimisticState] = useState<boolean | null>(null);
  
  // Check if product is purchasable (has a valid price)
  const priceNum = typeof productPrice === 'string' 
    ? Number(productPrice.replace(/[^0-9.-]+/g, ""))
    : Number(productPrice);
  const isPurchasable = !isNaN(priceNum) && priceNum > 0;

  // Don't show wishlist button for non-purchasable products
  if (!isPurchasable) {
    return null;
  }

  const actualIsWishlisted = isInWishlist(productId);
  const displayIsWishlisted = optimisticState !== null ? optimisticState : actualIsWishlisted;

  // Reset optimistic state when actual state catches up
  useEffect(() => {
    if (optimisticState !== null && optimisticState === actualIsWishlisted) {
      setOptimisticState(null);
    }
  }, [actualIsWishlisted, optimisticState]);
  
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing) return;
    
    // Check authentication before any UI updates
    if (!user) {
      alert("Please log in to save items to wishlist");
      return;
    }
    
    const currentState = displayIsWishlisted;
    const newState = !currentState;
    
    // Optimistic update (only after authentication check)
    setOptimisticState(newState);
    setIsProcessing(true);
    
    try {
      if (currentState) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      // Revert optimistic update on error
      setOptimisticState(currentState);
    } finally {
      setIsProcessing(false);
    }
  };

  const sizeClasses = {
    sm: "w-11 h-11 min-w-[44px] min-h-[44px]",
    md: "w-11 h-11 min-w-[44px] min-h-[44px]",
    lg: "w-12 h-12 min-w-[48px] min-h-[48px]"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isProcessing}
      className={cn(
        "group relative inline-flex items-center justify-center",
        "bg-background/90 backdrop-blur-sm rounded-full",
        "transition-all duration-300 hover:bg-background hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-1 focus:ring-ring/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        showLabel && "px-4 space-x-2 rounded-[var(--radius)]",
        className
      )}
      aria-label={displayIsWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      title={displayIsWishlisted ? "Remove from wishlist" : "Save for later"}
    >
      <Heart
        className={cn(
          "transition-all duration-300 group-hover:scale-110 group-active:scale-90",
          iconSizes[size],
          displayIsWishlisted 
            ? "fill-red-500 text-red-500 animate-pulse" 
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      
      {showLabel && (
        <span className="text-xs font-extralight tracking-wider uppercase">
          {displayIsWishlisted ? "Saved" : "Save"}
        </span>
      )}

      {/* Loading indicator */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-[var(--radius)]">
          <div className="w-3 h-3 border border-border/40 border-t-foreground rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}