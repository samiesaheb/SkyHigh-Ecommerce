"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, X } from "lucide-react";
import { buildImageUrl } from "@/lib/config";
import type { CartItem as CartItemType } from "@/types";
import { cn } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveFromCart: (id: number) => void;
  onError: (error: string) => void;
}

export default function CartItem({ 
  item, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  onError 
}: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDecrease = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      if (item.quantity > 1) {
        await onUpdateQuantity(item.id, item.quantity - 1);
      } else {
        await onRemoveFromCart(item.id);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrease = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      await onUpdateQuantity(item.id, item.quantity + 1);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      await onRemoveFromCart(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const itemTotal = (item.price || 0) * (item.quantity || 0);

  return (
    <div className={cn(
      "flex gap-4 p-3 transition-all duration-300 hover:bg-muted/30 group",
      "animate-in fade-in-0 slide-in-from-left-4 duration-200 ease-out",
      isUpdating && "opacity-60 animate-pulse"
    )}
    style={{ borderRadius: "var(--radius)" }}
    >
      {/* Product Image */}
      <div className="relative flex-shrink-0">
        <Image
          src={buildImageUrl(item.main_image || "")}
          alt={item.name || "Product"}
          width={64}
          height={64}
          className="w-16 h-16 object-cover rounded border border-border/40"
          loading="lazy"
          onError={() => onError(`Failed to load image for ${item.name || "product"}`)}
        />
        
        {/* Remove button overlay */}
        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="absolute -top-1 -right-1 w-6 h-6 bg-background border border-border/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black hover:text-white hover:border-black shadow-sm"
          aria-label={`Remove ${item.name || "product"} from cart`}
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <h4 className="text-sm font-light text-foreground truncate leading-tight">
            {item.name || "Unknown Product"}
          </h4>
          <p className="text-xs text-muted-foreground">
            ฿{(item.price || 0).toFixed(2)} each
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              disabled={isUpdating}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center border border-border/40 transition-colors duration-200 hover:border-border/80 hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: "var(--radius)" }}
              aria-label={`Decrease quantity of ${item.name || "product"}`}
            >
              <Minus className="w-3 h-3" />
            </button>
            
            <span className="min-w-[2rem] text-center text-sm font-light text-foreground">
              {item.quantity || 0}
            </span>
            
            <button
              onClick={handleIncrease}
              disabled={isUpdating}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center border border-border/40 transition-colors duration-200 hover:border-border/80 hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: "var(--radius)" }}
              aria-label={`Increase quantity of ${item.name || "product"}`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Item Total */}
          <div className="text-right">
            <p className="text-sm font-light text-foreground">
              ฿{itemTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}