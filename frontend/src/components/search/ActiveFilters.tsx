"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchWithSession } from "@/lib/fetchWithSession";
import { API_ENDPOINTS } from "@/lib/config";

type Brand = {
  id: number;
  name: string;
  slug: string;
};

interface ActiveFiltersProps {
  onFilterChange?: () => void;
}

export default function ActiveFilters({ onFilterChange }: ActiveFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  // Fetch brands for display names
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.PRODUCTS.BRANDS);
        const data = await res.json();
        const brandsData = data.results || data;
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
        setBrands([]);
      } finally {
        setBrandsLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const getBrandName = (slug: string) => {
    const brand = brands.find(b => b.slug === slug);
    return brand ? brand.name : slug;
  };

  const removeFilter = (filterType: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    switch (filterType) {
      case 'brand':
        if (value) {
          const currentBrands = params.get("brand")?.split(",").filter(Boolean) || [];
          const updatedBrands = currentBrands.filter(b => b !== value);
          if (updatedBrands.length > 0) {
            params.set("brand", updatedBrands.join(","));
          } else {
            params.delete("brand");
          }
        }
        break;
      case 'price':
        params.delete("min_price");
        params.delete("max_price");
        break;
      case 'minPrice':
        params.delete("min_price");
        break;
      case 'maxPrice':
        params.delete("max_price");
        break;
      case 'inStock':
        params.delete("in_stock");
        break;
      case 'search':
        params.delete("search");
        break;
      case 'sort':
        params.delete("ordering");
        break;
      default:
        break;
    }

    router.push(`/products?${params.toString()}`);
    onFilterChange?.();
  };

  const clearAllFilters = () => {
    router.push('/products');
    onFilterChange?.();
  };

  const selectedBrands = searchParams.get("brand")?.split(",").filter(Boolean) || [];
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const searchQuery = searchParams.get("search") || "";
  const inStock = searchParams.get("in_stock") === "true";
  const sortBy = searchParams.get("ordering") || "";

  const getSortLabel = (value: string) => {
    const sortOptions = {
      "name": "Name A-Z",
      "-name": "Name Z-A",
      "price": "Price: Low to High",
      "-price": "Price: High to Low",
      "created_at": "Newest First",
      "-created_at": "Oldest First"
    };
    return (sortOptions as any)[value] || value;
  };

  const hasActiveFilters = selectedBrands.length > 0 || minPrice || maxPrice || searchQuery || inStock || sortBy;

  if (!hasActiveFilters) return null;

  return (
    <div className="mb-8 p-4 bg-muted/20 rounded-lg border border-border/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Active Filters:</h3>
        <button
          onClick={clearAllFilters}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline decoration-1 underline-offset-2"
        >
          Clear All
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Search Query */}
        {searchQuery && (
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary-foreground rounded-full text-xs border border-primary/20">
            <span>Search: "{searchQuery}"</span>
            <button
              onClick={() => removeFilter('search')}
              className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              aria-label="Remove search filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Brand Filters */}
        {!brandsLoading && selectedBrands.map((brandSlug) => (
          <div key={brandSlug} className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent-rose/10 text-foreground rounded-full text-xs border border-accent-rose/20">
            <span>Brand: {getBrandName(brandSlug)}</span>
            <button
              onClick={() => removeFilter('brand', brandSlug)}
              className="ml-1 hover:bg-accent-rose/20 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${getBrandName(brandSlug)} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Price Range */}
        {(minPrice || maxPrice) && (
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent-gold/10 text-foreground rounded-full text-xs border border-accent-gold/20">
            <span>
              Price: {minPrice ? `฿${minPrice}` : '฿0'} - {maxPrice ? `฿${maxPrice}` : '฿∞'}
            </span>
            <button
              onClick={() => removeFilter('price')}
              className="ml-1 hover:bg-accent-gold/20 rounded-full p-0.5 transition-colors"
              aria-label="Remove price filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* In Stock Filter */}
        {inStock && (
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent-sage/10 text-foreground rounded-full text-xs border border-accent-sage/20">
            <span>In Stock Only</span>
            <button
              onClick={() => removeFilter('inStock')}
              className="ml-1 hover:bg-accent-sage/20 rounded-full p-0.5 transition-colors"
              aria-label="Remove in stock filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Sort Filter */}
        {sortBy && (
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary/50 text-secondary-foreground rounded-full text-xs border border-secondary/30">
            <span>Sort: {getSortLabel(sortBy)}</span>
            <button
              onClick={() => removeFilter('sort')}
              className="ml-1 hover:bg-secondary/70 rounded-full p-0.5 transition-colors"
              aria-label="Remove sort filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}