"use client";

import { Search, Sparkles, ArrowRight, Tag, Package } from "lucide-react";
import Image from "next/image";
import { buildImageUrl } from "@/lib/config";

interface ProductSuggestion {
  name: string;
  slug: string;
  main_image: string;
  brand?: string;
  price?: string;
  category?: string;
}

interface SearchResultsProps {
  suggestions: ProductSuggestion[];
  highlightedIndex: number;
  searchTerm: string;
  onSelectItem: (slug: string) => void;
  onError: (error: string) => void;
}

export default function SearchResults({ 
  suggestions, 
  highlightedIndex, 
  searchTerm, 
  onSelectItem,
  onError 
}: SearchResultsProps) {
  if (suggestions.length === 0 && !searchTerm.trim()) {
    return null;
  }

  // Map search terms to brand slugs for intelligent category suggestions
  const getBrandFromSearchTerm = (term: string): string | null => {
    const lowerTerm = term.toLowerCase().trim();
    const brandMappings: { [key: string]: string } = {
      'facial': 'facial-care',
      'face': 'facial-care', 
      'skin': 'facial-care',
      'skincare': 'facial-care',
      'body': 'body-and-skin-care',
      'hair': 'hair-care',
      'geometry': 'geometry'
    };
    
    // Check for exact matches first
    if (brandMappings[lowerTerm]) {
      return brandMappings[lowerTerm];
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(brandMappings)) {
      if (lowerTerm.includes(key) || key.includes(lowerTerm)) {
        return value;
      }
    }
    
    return null;
  };

  // Quick actions/shortcuts
  const brandSlug = getBrandFromSearchTerm(searchTerm);
  const quickActions = searchTerm.trim() ? [
    {
      label: `Search all products for "${searchTerm}"`,
      action: () => window.location.href = `/products?search=${encodeURIComponent(searchTerm)}`,
      icon: Search,
      type: 'search'
    },
    ...(brandSlug ? [{
      label: `Browse ${searchTerm.toLowerCase()} products`,
      action: () => window.location.href = `/products?brand=${brandSlug}`,
      icon: Tag,
      type: 'brand'
    }] : [])
  ] : [];

  return (
    <div className="absolute top-full left-0 right-0 mt-3 bg-background/98 backdrop-blur-xl border-0 shadow-xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-60">
      {suggestions.length > 0 ? (
        <>
          {/* Search Results Header */}
          <div className="px-6 py-3 border-b border-border/20 bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Products ({suggestions.length})
            </p>
          </div>
          
          {/* Product Results */}
          <ul className="max-h-80 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => onSelectItem(suggestion.slug)}
                className={`flex items-center gap-4 px-6 py-4 cursor-pointer select-none transition-all duration-200 border-b border-border/10 last:border-b-0 ${
                  index === highlightedIndex 
                    ? "bg-muted/50 border-l-4 border-l-primary" 
                    : "hover:bg-muted/30"
                }`}
                role="option"
                aria-selected={index === highlightedIndex}
                tabIndex={-1}
              >
                <div className="flex-shrink-0">
                  <Image
                    src={buildImageUrl(suggestion.main_image || "")}
                    alt={suggestion.name || "Product"}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded-md border border-border/20 transition-all duration-200"
                    loading="lazy"
                    onError={() => onError(`Failed to load image for ${suggestion.name || "product"}`)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {suggestion.name || "Unknown"}
                  </p>
                  {suggestion.brand && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {suggestion.brand}
                    </p>
                  )}
                </div>
                {suggestion.price && (
                  <div className="text-sm font-medium text-foreground">
                    {suggestion.price}
                  </div>
                )}
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </li>
            ))}
          </ul>

          {/* Quick Actions Footer */}
          {quickActions.length > 0 && (
            <>
              <div className="px-6 py-2 border-t border-border/20 bg-muted/10">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </p>
              </div>
              <ul className="border-t border-border/10">
                {quickActions.map((action, index) => (
                  <li
                    key={index}
                    onClick={action.action}
                    className="flex items-center gap-3 px-6 py-3 cursor-pointer select-none transition-all duration-200 hover:bg-muted/30 border-b border-border/10 last:border-b-0"
                  >
                    <action.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground">{action.label}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0 ml-auto" />
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        searchTerm.trim() && (
          <div className="px-8 py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground mb-1">No products found</p>
                <p className="text-sm text-muted-foreground">Try searching with different keywords or browse categories</p>
              </div>
              
              {/* Fallback actions */}
              <div className="mt-4 space-y-2 w-full max-w-xs">
                <button
                  onClick={() => window.location.href = `/products?search=${encodeURIComponent(searchTerm)}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Search all products
                </button>
                <button
                  onClick={() => window.location.href = '/products'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border border-border bg-background text-foreground rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Browse all products
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}