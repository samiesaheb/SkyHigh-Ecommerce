"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, memo, useCallback, useMemo } from "react";
import { useCart } from "@/components/cart/HeaderContext";
import { useMobileNavigation } from "@/components/layout/MobileNavigationContext";
import MobileNavigation from "@/components/layout/MobileNavigation";
import CartDropdown from "@/components/cart/CartDropdown";
import UserDropdown from "@/components/auth/UserDropdown";
import WishlistDropdown from "@/components/wishlist/WishlistDropdown";
import { cn } from "@/lib/utils";
import { buildImageUrl } from "@/lib/config";
import SearchOverlay from "@/components/search/SearchOverlay";

// Constants
const SCROLL_THRESHOLD = 50;

// Optimized navigation links with memoization
const navigationLinks = [
  { label: "Products", href: "/products" },
  { label: "B2B Solutions", href: "/b2b", highlight: true },
  { label: "Brands", href: "/brands" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
] as const;

const Header = memo(function Header() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useMobileNavigation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hideHeader, setHideHeader] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Loading states
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);

  // Enhanced className for performance
  const headerClassName = cn(
    "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-700 ease-in-out",
    isScrolled
      ? "bg-background/95 backdrop-blur-md border-b border-border/30 shadow-lg shadow-black/5"
      : "bg-background/80 backdrop-blur-sm border-b border-border/20",
    hideHeader ? "-translate-y-full" : "translate-y-0"
  );
  
  // Initialize loading states
  useEffect(() => {
    // Set loading to false immediately - loading should depend on actual data fetching
    setIsCartLoading(false);
    setIsWishlistLoading(false);
  }, []);


  // Close menus on pathname change
  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
  }, [pathname, setIsOpen]);

  // Optimized scroll handler with throttling and state batching
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    // Batch state updates to prevent multiple re-renders
    const newIsScrolled = currentScrollY > 10;
    const newHideHeader = currentScrollY > lastScrollY && currentScrollY > SCROLL_THRESHOLD ? true : false;
    
    // Only update if values have changed
    if (isScrolled !== newIsScrolled || hideHeader !== newHideHeader) {
      setIsScrolled(newIsScrolled);
      setHideHeader(newHideHeader);
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY, isScrolled, hideHeader]);

  useEffect(() => {
    let ticking = false;
    
    const optimizedScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", optimizedScrollHandler, { passive: true });
    return () => {
      window.removeEventListener("scroll", optimizedScrollHandler);
    };
  }, [handleScroll]);

  if (error) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground p-4 text-center shadow-lg">
        <div className="container flex items-center justify-center gap-2">
          <span className="text-sm font-medium">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-xs underline hover:no-underline transition-all"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-background p-3 rounded-lg border-2 border-primary shadow-lg z-[100] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 font-medium"
      >
        Skip to main content
      </a>
      
      <header className={headerClassName}>
      {/* Main Navigation Bar */}
      <div className={cn(
        "container transition-all duration-300",
        isScrolled ? "py-2 sm:py-3" : "py-3 sm:py-4"
      )}>
        {/* Top Row - Mobile Nav, Logo, Controls */}
        <div className="flex items-center justify-between relative">
          {/* Left side - Enhanced Mobile Navigation */}
          <div className="flex items-center">
            <div className="lg:hidden relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 -z-10" />
              <MobileNavigation isOpen={isOpen} onOpenChange={setIsOpen} />
            </div>
          </div>

          {/* Enhanced Center - Logo with animations */}
          <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
            <Link
              href="/"
              className="block group relative"
              aria-label="Go to homepage"
            >
              <Image
                src={buildImageUrl("products/logo.jpg")}
                alt="Sky High"
                width={120}
                height={40}
                className="h-8 sm:h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                priority
              />
            </Link>
          </div>

          {/* Enhanced Right side - Controls */}
          <div className="flex items-center gap-2 sm:gap-3 z-20 ml-auto" data-search-overlay>
            {/* Search Component */}
            <div className="relative">
              <SearchOverlay
                searchOpen={searchOpen}
                setSearchOpen={setSearchOpen}
                onError={setError}
              />
            </div>

            {/* Wishlist Dropdown with enhanced loading */}
            {isWishlistLoading ? (
              <div className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-muted/20 animate-pulse">
                <div className="w-5 h-5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="relative group">
                <WishlistDropdown onError={setError} />
                {/* Subtle hover indicator */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
              </div>
            )}

            {/* Cart Dropdown with enhanced loading */}
            {isCartLoading ? (
              <div className="w-11 h-11 flex items-center justify-center rounded-full bg-muted/20 animate-pulse">
                <div className="w-5 h-5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="relative group">
                <CartDropdown onError={setError} />
                {/* Cart item count indicator enhancement */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
              </div>
            )}

            {/* User Dropdown with enhanced styling */}
            <div className="relative group">
              <UserDropdown onError={setError} />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
            </div>
          </div>
        </div>

        {/* Enhanced Desktop Subnav - Below Logo */}
        <div className={cn(
          "hidden lg:block transition-all duration-300",
          isScrolled ? "border-t border-border/20" : "border-t border-border/10"
        )}>
          <nav className="flex items-center justify-center relative">
            <div className="flex items-center space-x-6 py-1 relative z-10">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-all duration-300 relative group px-3 py-1 rounded-full",
                    pathname === link.href
                      ? "text-primary font-semibold"
                      : link.highlight
                      ? "text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/20"
                  )}
                >
                  <span className="relative z-10">{link.label}</span>

                  {/* Hover effect */}
                  {pathname !== link.href && !link.highlight && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  )}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
    </>
  );
});

export default Header;