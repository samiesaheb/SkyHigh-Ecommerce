'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X, Loader2, Package } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/config';

type OrderItem = {
  product: string;
  quantity: number;
  price: string;
  image?: string;
};

type Order = {
  id: number;
  created_at: string;
  total_price: string;
  status: string;
  items: OrderItem[];
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch(API_ENDPOINTS.ORDERS.LIST, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch orders. Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching order history:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status: string) => {
    if (!status) return 'text-gray-600 bg-gray-50 border-gray-200';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin w-6 h-6 text-black mb-6" />
        <span className="text-sm font-light text-black/60 tracking-wide">Loading...</span>
      </div>
    );
  }

  return (
    <main className="w-full bg-background">
      <div className="container max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-32">
        {/* Header */}
        <header className="mb-20 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6">
            Order History
          </h1>
          <p className="text-lg lg:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Review your past orders and track their status.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            {/* Mobile Sidebar */}
            <div className="lg:hidden mb-8">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-3 border border-border/20 hover:border-border/40 transition-all duration-300 w-full justify-start"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    Account Navigation
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-12 bg-background border-l-0">
                  <div className="flex items-center justify-between mb-12">
                    <h2 className="text-lg font-light tracking-tight uppercase text-muted-foreground">Account</h2>
                    <Button
                      variant="ghost"
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 hover:bg-muted transition-all duration-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <nav className="space-y-6">
                    <Link
                      href="/profile"
                      className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Profile Overview
                    </Link>
                    <Link
                      href="/profile/edit"
                      className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Edit Profile
                    </Link>
                    <Link
                      href="/profile/orders"
                      className="block text-foreground font-medium pb-2 border-b border-border/20 text-sm tracking-wide"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Order History
                    </Link>
                    <Link
                      href="/profile/change-password"
                      className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Change Password
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <h2 className="text-lg font-light tracking-tight uppercase text-muted-foreground mb-12">Account</h2>
              <nav className="space-y-6">
                <Link
                  href="/profile"
                  className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                >
                  Profile Overview
                </Link>
                <Link
                  href="/profile/edit"
                  className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                >
                  Edit Profile
                </Link>
                <Link
                  href="/profile/orders"
                  className="block text-foreground font-medium pb-2 border-b border-border/20 text-sm tracking-wide"
                >
                  Order History
                </Link>
                <Link
                  href="/profile/change-password"
                  className="block text-muted-foreground font-light hover:text-foreground transition-all duration-300 pb-2 border-b border-transparent hover:border-border/20 text-sm tracking-wide"
                >
                  Change Password
                </Link>
              </nav>
            </div>
        </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="prose prose-lg max-w-none">
              {error && (
                <div className="mb-6 p-4 border border-border/20 bg-muted/30 text-foreground text-sm">
                  {error}
                </div>
              )}

              {!error && orders.length === 0 && (
                <div className="text-center py-16 mt-8">
                  <div className="w-16 h-16 border border-border/20 mx-auto mb-8 flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-base font-light text-foreground mb-3">No orders yet</p>
                  <p className="text-sm font-light text-muted-foreground">Start shopping to see your order history here</p>
                </div>
              )}

              {!error && orders.length > 0 && (
                <section className="mb-16 mt-8">
                  <div className="space-y-12">
                    {orders.map(order => (
                      <div key={order.id} className="border-b border-border/5 pb-12 last:border-b-0">
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h3 className="text-base font-light text-foreground mb-2">Order #{order.id}</h3>
                            <p className="text-sm font-light text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <span className={`px-4 py-2 text-xs font-light tracking-wider uppercase border ${getStatusColor(order.status).replace('text-', 'text-').replace('bg-', 'bg-').replace('border-', 'border-')}`}>
                            {order.status || 'Unknown'}
                          </span>
                        </div>

                        <div className="space-y-6 mb-8">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-6 py-4 border-b border-border/5 last:border-b-0"
                            >
                              <div className="w-16 h-16 border border-border/20 flex-shrink-0">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.product}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-light text-foreground mb-2">{item.product}</h4>
                                <div className="flex items-center gap-6 text-sm font-light text-muted-foreground">
                                  <span>Qty: {item.quantity}</span>
                                  <span>฿{item.price}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-border/20">
                          <span className="text-sm font-light text-muted-foreground tracking-wide uppercase">Total</span>
                          <span className="text-lg font-light text-foreground">฿{order.total_price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Last Updated */}
              <div className="text-center pt-8 border-t border-border/20">
                <p className="caption-text text-muted-foreground">
                  Order history last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}