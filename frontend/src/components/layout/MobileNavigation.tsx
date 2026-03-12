"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildImageUrl } from "@/lib/config";

interface MobileNavigationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type NavItem = {
  label: string;
  href: string;
  description?: string;
};

const primaryLinks: NavItem[] = [
  { label: "Brands", href: "/brands", description: "Explore our collection" },
  { label: "Products", href: "/products", description: "Discover all items" },
  { label: "About", href: "/about", description: "Our story & mission" },
  { label: "Services", href: "/services", description: "OEM/ODM solutions" },
  { label: "Contact", href: "/contact", description: "Get in touch" },
];

export default function MobileNavigation({ isOpen, onOpenChange }: MobileNavigationProps) {
  const pathname = usePathname();
  const grouped = useMemo(() => ({ primary: primaryLinks }), []);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {/* Trigger */}
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="p-3 w-11 h-11 sm:w-12 sm:h-12 transition-all duration-300 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/20 touch-manipulation"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
        </Button>
      </SheetTrigger>

      {/* Drawer */}
      <SheetContent
        side="left"
        className={cn(
          "w-80 max-w-[90vw] p-0 border-0 z-50",
          "bg-background/95 backdrop-blur-xl shadow-2xl"
        )}
      >
        {/* Header */}
        <div className="px-8 pt-12 pb-8 border-b border-border/20">
          <SheetHeader className="text-left space-y-3">
            <SheetTitle>
              <Image
                src={buildImageUrl("products/logo.jpg")}
                alt="Sky High"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground font-light leading-relaxed">
              Concept to Creation
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Navigation */}
        <nav aria-label="Primary navigation" className="py-8">
          <ul className="px-6 space-y-2">
            {grouped.primary.map(({ label, href, description }) => {
              const active = pathname === href || pathname?.startsWith(href + "/");

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={(e) => {
                      // Let the link navigate naturally, then close the sidebar
                      setTimeout(() => onOpenChange(false), 100);
                    }}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex flex-col px-4 py-6 no-underline min-h-[60px] rounded-md",
                      "transition-all duration-300 touch-manipulation",
                      active 
                        ? "bg-muted/50 border-l-4 border-foreground" 
                        : "hover:bg-muted/30 border-l-4 border-transparent",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                    )}
                  >
                    <span
                      className={cn(
                        "text-base font-medium tracking-wide mb-1",
                        active ? "text-foreground" : "text-foreground/90 group-hover:text-foreground"
                      )}
                    >
                      {label}
                    </span>
                    {description && (
                      <span className="text-xs text-muted-foreground font-light leading-relaxed">
                        {description}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Divider */}
        <div className="px-8 py-6">
          <hr className="border-border/20" />
        </div>

        {/* Footer */}
        <div className="px-8 py-6 space-y-6">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Premium cosmetics crafted with precision and care for discerning brands worldwide.
            </p>
          </div>
          
          <Link
            href="/products?brand=geometry"
            onClick={() => {
              setTimeout(() => onOpenChange(false), 100);
            }}
            className={cn(
              "inline-flex items-center justify-center w-full no-underline touch-manipulation",
              "h-12 text-sm font-medium tracking-wide rounded-md",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
            )}
            aria-label="Explore Geometry Collection"
          >
            Explore Collection
          </Link>
        </div>

        <style jsx global>{`
          [aria-current="page"] {
            text-decoration: none !important;
          }
          @media (prefers-reduced-motion: reduce) {
            .transition-colors,
            .transition-transform,
            .transition-all {
              transition: none !important;
            }
          }
        `}</style>
      </SheetContent>
    </Sheet>
  );
}