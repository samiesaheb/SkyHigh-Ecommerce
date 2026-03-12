"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/components/wishlist/WishlistContext";
import { useUser } from "@/components/auth/UserContext";
import { useCart } from "@/components/cart/HeaderContext";
import { buildImageUrl } from "@/lib/config";

export default function WishlistPage() {
  const router = useRouter();
  const { user } = useUser();
  const { 
    wishlistItems, 
    wishlistCount, 
    removeFromWishlist, 
    clearWishlist, 
    loading,
    refreshWishlist 
  } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!user) {
      router.push('/account/login?redirect=/wishlist');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      refreshWishlist();
    }
  }, [user, refreshWishlist]);

  const handleMoveToCart = async (productId: number, productName: string) => {
    try {
      await addToCart(productId);
      await removeFromWishlist(productId);
    } catch (error) {
      console.error(`Failed to move ${productName} to cart:`, error);
    }
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const handleClearWishlist = async () => {
    if (confirm("Are you sure you want to remove all items from your wishlist?")) {
      try {
        await clearWishlist();
      } catch (error) {
        console.error("Failed to clear wishlist:", error);
      }
    }
  };

  if (!user) {
    return (
      <div className="container section-container text-center">
        <Heart className="w-16 h-16 text-muted-foreground/40 mx-auto mb-6" />
        <h1 className="section-heading mb-6">Please Log In</h1>
        <p className="body-text mb-8">
          You need to be logged in to view your saved items.
        </p>
        <Link href="/account/login" className="btn-primary">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="container section-container">
      <div className="mb-12">
        <Link 
          href="/products" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-heading mb-4">Saved Items</h1>
            <p className="body-text">
              {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          
          {wishlistCount > 0 && (
            <button
              onClick={handleClearWishlist}
              className="btn-ghost text-destructive hover:text-destructive/80"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="flex gap-3">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : wishlistCount === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-20 h-20 text-muted-foreground/40 mx-auto mb-8" />
          <h2 className="text-2xl font-light text-foreground mb-4">Your wishlist is empty</h2>
          <p className="body-text mb-8 max-w-md mx-auto">
            Save products you love to easily find them later and get notified about price changes.
          </p>
          <Link href="/products" className="btn-primary">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistItems.map((item) => {
            // Ensure only purchasable products are shown
            const priceNum = typeof item.product.price === 'string' 
              ? Number(item.product.price.replace(/[^0-9.-]+/g, ""))
              : Number(item.product.price);
            const isPurchasable = !isNaN(priceNum) && priceNum > 0;

            if (!isPurchasable) return null;

            return (
              <div
                key={item.id}
                className="group card hover:shadow-xl transition-all duration-500"
              >
                <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-lg">
                  <Image
                    src={buildImageUrl(item.product.main_image || "")}
                    alt={item.product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleRemoveFromWishlist(item.product.id)}
                      className="w-8 h-8 bg-background/90 backdrop-blur-sm border border-border/40 flex items-center justify-center transition-all duration-300 hover:border-destructive/40 hover:text-destructive"
                      style={{ borderRadius: "var(--radius)" }}
                      aria-label="Remove from wishlist"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Link href={`/products/${item.product.slug}`}>
                      <h3 className="text-lg font-light text-foreground mb-1 group-hover:text-muted-foreground transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="caption-text text-muted-foreground mb-3">
                      {item.product.brand.name}
                    </p>
                    <p className="text-sm font-light text-muted-foreground leading-relaxed mb-4">
                      {item.product.description.length > 100 
                        ? `${item.product.description.slice(0, 100)}...` 
                        : item.product.description
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-light text-foreground">
                        ฿{item.product.price}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Added {new Date(item.added_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleMoveToCart(item.product.id, item.product.name)}
                        className="btn-primary flex-1 text-xs"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.product.id)}
                        className="btn-outline flex-1 text-xs hover:border-destructive/40 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
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
  );
}