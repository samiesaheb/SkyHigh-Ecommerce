"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { CartProvider } from "@/components/cart/HeaderContext";
import { UserProvider } from "@/components/auth/UserContext";
import { ErrorProvider } from "@/components/error/ErrorContext";
import { WishlistProvider } from "@/components/wishlist/WishlistContext";
import { SearchProvider, useSearch } from "@/components/search/SearchContext";
import ErrorDisplay from "@/components/error/ErrorDisplay";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import GlobalErrorBoundary from "@/components/error/GlobalErrorBoundary";
import { MobileNavigationProvider, useMobileNavigation } from "@/components/layout/MobileNavigationContext";
import { API_ENDPOINTS } from "@/lib/config";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AnimatePresence, motion } from "framer-motion";

// Dynamic imports for code splitting
const Header = dynamic(() => import("@/components/layout/Header"), {
  loading: () => <div className="h-20 bg-background/80 animate-pulse" />,
});

const Footer = dynamic(() => import("@/components/layout/Footer"), {
  loading: () => <div className="h-64 bg-background/80 animate-pulse" />,
});

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useMobileNavigation();
  const { isSearchOpen } = useSearch();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        id="main-content"
        className={`flex-1 w-full bg-background text-foreground pt-20 transition-all duration-300 ${
          isOpen ? 'blur-sm' : ''
        } ${
          isSearchOpen ? 'blur-md scale-105' : ''
        }`}
      >
        {/* Added pt-20 to account for fixed header height */}
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key="page"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="page-transition"
              >
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      <div className={`${isSearchOpen ? 'blur-md scale-105 transition-all duration-300' : 'transition-all duration-300'}`}>
        <Footer />
      </div>
      <ErrorDisplay />
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize CSRF token in the background without blocking UI
    fetch(API_ENDPOINTS.CSRF, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch CSRF");
        return res.json();
      })
      .then((data) => {
        console.log("✅ CSRF success:", data);
      })
      .catch((err) => console.error("❌ CSRF fetch failed:", err));
  }, []);

  return (
    <GlobalErrorBoundary>
      <ErrorProvider>
        <UserProvider>
          <CartProvider>
            <WishlistProvider>
              <SearchProvider>
                <MobileNavigationProvider>
                  <Elements stripe={stripePromise}>
                    <LayoutContent>
                      {children}
                    </LayoutContent>
                  </Elements>
                </MobileNavigationProvider>
              </SearchProvider>
            </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </ErrorProvider>
    </GlobalErrorBoundary>
  );
}