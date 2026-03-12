"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, Plus, Minus, X } from "lucide-react";
import { useCart } from "@/components/cart/HeaderContext";
import { buildImageUrl } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/common/Toast";
import ShippingCalculator from "@/components/cart/ShippingCalculator";
import Breadcrumb, { generateBreadcrumbs } from "@/components/common/Breadcrumb";

export default function CartPage() {
  const router = useRouter();
  const cartContext = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const { toasts, removeToast, error, success } = useToast();
  const [selectedShipping, setSelectedShipping] = useState<{ price: number; name: string } | null>(null);

  // Add safety checks
  if (!cartContext) {
    return <div className="container section-container">Loading...</div>;
  }

  const { cartItems, updateQuantity, removeFromCart } = cartContext;
  const safeCartItems = cartItems || [];
  const subtotal = safeCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Shipping calculation
  const shipping = selectedShipping?.price || (subtotal > 1000 ? 0 : 50);
  const total = subtotal + shipping;

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    setUpdatingItems(prev => new Set([...prev, itemId]));
    try {
      const result = await updateQuantity(itemId, newQuantity);
      if (!result.success && result.message) {
        error(result.message);
      }
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingItems(prev => new Set([...prev, itemId]));
    try {
      const result = await removeFromCart(itemId);
      if (!result.success && result.message) {
        error(result.message);
      } else if (result.success) {
        success("Item removed from cart");
      }
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (safeCartItems.length === 0) {
    return (
      <div className="container section-container">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={generateBreadcrumbs.cart()} />
        </div>

        <Link 
          href="/products" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Link>
        
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/60" />
          </div>
          <h2 className="section-heading text-2xl mb-4">Your cart is empty</h2>
          <p className="body-text mb-8 max-w-md mx-auto">
            Looks like you haven&apos;t added anything to your cart yet.
            Start shopping to fill it up.
          </p>
          <Link href="/products" className="btn-primary">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-container">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={generateBreadcrumbs.cart()} />
      </div>

      {/* Header */}
      <div className="mb-12">
        <Link 
          href="/products" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Link>
        
        <h1 className="section-heading mb-4">Shopping Cart</h1>
        <p className="body-text">
          {safeCartItems.length} {safeCartItems.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {safeCartItems.map((item, index) => {
            if (!item || !item.id) return null; // Skip invalid items
            const isUpdating = updatingItems.has(item.id);
            const itemTotal = (item.price || 0) * (item.quantity || 0);

            return (
              <div
                key={item.id}
                className={cn(
                  "card p-6 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4",
                  isUpdating && "opacity-60 scale-[0.98]"
                )}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative flex-shrink-0">
                    <Image
                      src={buildImageUrl(item.main_image || "")}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover rounded border border-border/40"
                    />
                    
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isUpdating}
                      className="absolute -top-2 -right-2 w-11 h-11 min-w-[44px] min-h-[44px] bg-background border border-border/40 rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive/40 transition-colors duration-200 disabled:opacity-50"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-light text-foreground leading-tight">
                        {item.name || 'Unknown Product'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        ฿{(item.price || 0).toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Qty:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const currentQty = item.quantity || 0;
                              if (currentQty > 1) {
                                handleUpdateQuantity(item.id, currentQty - 1);
                              } else {
                                handleRemoveItem(item.id);
                              }
                            }}
                            disabled={isUpdating}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center border border-border/40 transition-colors duration-200 hover:border-border/80 hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ borderRadius: "var(--radius)" }}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={item.quantity || 0}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value);
                              if (!isNaN(newQty) && newQty >= 1 && newQty <= 999) {
                                handleUpdateQuantity(item.id, newQty);
                              }
                            }}
                            disabled={isUpdating}
                            className="min-w-[3rem] w-16 text-center text-sm font-light bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                            style={{ borderRadius: "var(--radius)" }}
                          />
                          
                          <button
                            onClick={() => {
                              const currentQty = item.quantity || 0;
                              if (currentQty < 999) {
                                handleUpdateQuantity(item.id, currentQty + 1);
                              } else {
                                error("Maximum quantity is 999");
                              }
                            }}
                            disabled={isUpdating || (item.quantity || 0) >= 999}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center border border-border/40 transition-colors duration-200 hover:border-border/80 hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ borderRadius: "var(--radius)" }}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-light text-foreground">
                          ฿{itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="card p-6 space-y-6">
              <h3 className="text-xl font-light text-foreground tracking-tight">
                Order Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">฿{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Shipping {selectedShipping && `(${selectedShipping.name})`}
                  </span>
                  <span className="text-foreground">
                    {shipping === 0 ? 'Free' : `฿${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="divider" />

                {/* Shipping Calculator */}
                <ShippingCalculator
                  subtotal={subtotal}
                  onShippingChange={setSelectedShipping}
                  selectedShipping={selectedShipping}
                />

                <div className="divider" />
                
                <div className="flex justify-between">
                  <span className="text-lg font-light text-foreground">Total</span>
                  <span className="text-xl font-light text-foreground">
                    ฿{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full text-center"
                >
                  Proceed to Checkout
                </button>
                
                <Link
                  href="/products"
                  className="btn-outline w-full text-center"
                >
                  Continue Shopping
                </Link>
              </div>

              <div className="text-xs text-muted-foreground space-y-2">
                <p>• Secure checkout</p>
                <p>• Free returns within 30 days</p>
                <p>• Customer support 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
