"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "./WishlistContext";
import { useUser } from "@/components/auth/UserContext";
import { useCart } from "@/components/cart/HeaderContext";
import { buildImageUrl } from "@/lib/config";
import { cn } from "@/lib/utils";

interface WishlistDropdownProps {
  onError?: (error: string) => void;
}

export default function WishlistDropdown({ onError }: WishlistDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { wishlistItems, wishlistCount, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMoveToCart = async (productId: number, productName: string) => {
    try {
      await addToCart(productId);
      await removeFromWishlist(productId);
    } catch (error) {
      onError?.(`Failed to move ${productName} to cart`);
    }
  };

  const handleRemoveFromWishlist = async (productId: number, productName: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      onError?.(`Failed to remove ${productName} from wishlist`);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2.5 mobile:p-3 transition-all duration-300 min-w-[44px] min-h-[44px] touch-manipulation",
          "hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring/20",
          isOpen && "bg-muted/50"
        )}
        style={{ borderRadius: "var(--radius)" }}
        aria-label="Wishlist"
        title={`Wishlist (${wishlistCount})`}
      >
        <Heart className="w-5 h-5 text-foreground" />
        
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-light w-5 h-5 rounded-full flex items-center justify-center">
            {wishlistCount > 99 ? "99+" : wishlistCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            className={cn(
              "absolute right-0 top-full mt-2 w-80 bg-background border border-border/40 shadow-xl backdrop-blur-sm z-50",
              "mobile:fixed mobile:inset-0 mobile:w-full mobile:h-full mobile:mt-0 mobile:border-0 mobile:shadow-none",
              "md:absolute md:top-full md:right-0 md:h-auto"
            )}
            style={{ borderRadius: "var(--radius)" }}
          >
          <div className="p-4 border-b border-border/20 flex items-center justify-between">
            <div>
              <h3 className="font-light text-foreground text-lg tracking-tight">
                Saved Items
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 mobile:w-12 mobile:h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors md:hidden touch-manipulation"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5 mobile:w-6 mobile:h-6" />
            </button>
          </div>

          <div className="mobile:max-h-[calc(100vh-120px)] max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 flex items-center justify-center">
                <div className="w-5 h-5 border border-border/40 border-t-foreground rounded-full animate-spin" />
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">Your wishlist is empty</p>
                <p className="text-xs text-muted-foreground/80">
                  Save items you love for later
                </p>
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="btn-outline mt-4 text-xs"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {wishlistItems.slice(0, 5).map((item) => {
                  return (
                    <div key={item.id} className="p-4 group">
                      <div className="flex gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={buildImageUrl(item.product.main_image || "")}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                            sizes="64px"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/products/${item.product.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-light text-foreground hover:text-muted-foreground transition-colors line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.product.brand.name}
                          </p>
                          <p className="text-sm font-light text-foreground mt-1">
                            ฿{item.product.price}
                          </p>
                          
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleMoveToCart(item.product.id, item.product.name)}
                              className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                              title="Move to cart"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              Add to Cart
                            </button>
                            
                            <button
                              onClick={() => handleRemoveFromWishlist(item.product.id, item.product.name)}
                              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                              title="Remove from wishlist"
                            >
                              <X className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {wishlistItems.length > 0 && (
            <div className="p-4 border-t border-border/20">
              <Link
                href="/wishlist"
                onClick={() => setIsOpen(false)}
                className="btn-outline w-full text-center"
              >
                View All Saved Items
              </Link>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}