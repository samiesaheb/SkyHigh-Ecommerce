"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}
    >
      {/* Home Link */}
      <Link 
        href="/"
        className="flex items-center hover:text-foreground transition-colors duration-200"
        aria-label="Go to homepage"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.length > 0 && (
        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
      )}

      {/* Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCurrentPage = item.isCurrentPage || isLast;

        return (
          <Fragment key={index}>
            {item.href && !isCurrentPage ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors duration-200 truncate max-w-[200px]"
                title={item.label}
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={cn(
                  "truncate max-w-[200px]",
                  isCurrentPage ? "text-foreground font-medium" : "text-muted-foreground"
                )}
                aria-current={isCurrentPage ? "page" : undefined}
                title={item.label}
              >
                {item.label}
              </span>
            )}

            {!isLast && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

// Helper function to generate common breadcrumb patterns
export const generateBreadcrumbs = {
  // For product listing: Home > Products
  products: (): BreadcrumbItem[] => [
    { label: "Products", href: "/products" }
  ],

  // For filtered products: Home > Products > Brand Name
  productsWithBrand: (brandName: string): BreadcrumbItem[] => [
    { label: "Products", href: "/products" },
    { label: brandName }
  ],

  // For product detail: Home > Products > Brand Name > Product Name
  productDetail: (brandName: string, brandSlug: string, productName: string): BreadcrumbItem[] => [
    { label: "Products", href: "/products" },
    { label: brandName, href: `/products?brand=${brandSlug}` },
    { label: productName, isCurrentPage: true }
  ],

  // For account pages: Home > Account > Page Name
  account: (pageName: string): BreadcrumbItem[] => [
    { label: "Account", href: "/profile" },
    { label: pageName }
  ],

  // For cart: Home > Cart
  cart: (): BreadcrumbItem[] => [
    { label: "Shopping Cart", href: "/cart" }
  ],

  // For checkout: Home > Cart > Checkout
  checkout: (): BreadcrumbItem[] => [
    { label: "Shopping Cart", href: "/cart" },
    { label: "Checkout", isCurrentPage: true }
  ],

  // For wishlist: Home > Wishlist
  wishlist: (): BreadcrumbItem[] => [
    { label: "Wishlist", href: "/wishlist" }
  ],

  // Generic helper for any page
  simple: (items: { label: string; href?: string }[]): BreadcrumbItem[] => {
    return items.map((item, index) => ({
      ...item,
      isCurrentPage: index === items.length - 1
    }));
  }
};