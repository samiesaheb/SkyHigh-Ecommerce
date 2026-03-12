"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X, Filter, ChevronDown, Check } from "lucide-react";
import { fetchWithSession } from "@/lib/fetchWithSession";
import { API_ENDPOINTS } from "@/lib/config";

type Brand = {
  id: number;
  name: string;
  slug: string;
};

type FilterState = {
  brands: string[];
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  inStock: boolean;
};

interface FilterSidebarProps {
  onFilterChange?: () => void;
  isLoading?: boolean;
}

export default function FilterSidebar({ onFilterChange, isLoading }: FilterSidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    brands: true,
    price: true,
    sort: true,
    availability: true
  });

  const [filters, setFilters] = useState<FilterState>({
    brands: searchParams.get("brand")?.split(",").filter(Boolean) || [],
    minPrice: searchParams.get("min_price") || "",
    maxPrice: searchParams.get("max_price") || "",
    sortBy: searchParams.get("ordering") || "",
    inStock: searchParams.get("in_stock") === "true"
  });

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // Use direct fetch to avoid session/caching issues
        const res = await fetch(API_ENDPOINTS.PRODUCTS.BRANDS);
        // const res = await fetchWithSession(API_ENDPOINTS.PRODUCTS.BRANDS);
        const data = await res.json();
        const brandsData = data.results || data;
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const updateURL = (newFilters: FilterState, immediate = false) => {
    setFilterLoading(true);
    
    const applyFilters = () => {
      const params = new URLSearchParams();
      
      if (newFilters.brands.length > 0) {
        params.set("brand", newFilters.brands.join(","));
      }
      if (newFilters.minPrice) params.set("min_price", newFilters.minPrice);
      if (newFilters.maxPrice) params.set("max_price", newFilters.maxPrice);
      if (newFilters.sortBy) {
        params.set("ordering", newFilters.sortBy);
      }
      if (newFilters.inStock) params.set("in_stock", "true");
      
      // Preserve search query if it exists
      const currentSearch = searchParams.get("search");
      if (currentSearch) params.set("search", currentSearch);

      router.push(`/products?${params.toString()}`);
      onFilterChange?.();
      
      // Clear loading state after a short delay to show smooth transition
      setTimeout(() => setFilterLoading(false), 150);
    };

    if (immediate) {
      applyFilters();
    } else {
      // Small delay for smooth UX
      setTimeout(applyFilters, 100);
    }
  };

  const handleBrandChange = (brandSlug: string, checked: boolean) => {
    const newBrands = checked 
      ? [...filters.brands, brandSlug]
      : filters.brands.filter(b => b !== brandSlug);
    
    const newFilters = { ...filters, brands: newBrands };
    setFilters(newFilters);
    updateURL(newFilters, true);
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    
    // Debounce URL update for price inputs
    setTimeout(() => updateURL(newFilters), 500);
  };

  const handleSortChange = (sort: string) => {
    const newFilters = { ...filters, sortBy: sort };
    setFilters(newFilters);
    updateURL(newFilters, true);
  };

  const clearAllFilters = () => {
    const newFilters: FilterState = {
      brands: [],
      minPrice: "",
      maxPrice: "",
      sortBy: "",
      inStock: false
    };
    setFilters(newFilters);
    updateURL(newFilters, true);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters = 
    filters.brands.length > 0 || 
    filters.minPrice || 
    filters.maxPrice || 
    filters.sortBy || 
    filters.inStock;

  const sortOptions = [
    { value: "name", label: "Name A-Z" },
    { value: "-name", label: "Name Z-A" },
    { value: "price", label: "Price: Low to High" },
    { value: "-price", label: "Price: High to Low" },
    { value: "created_at", label: "Newest First" },
    { value: "-created_at", label: "Oldest First" }
  ];

  const FilterSection = ({ title, children, section }: { 
    title: string; 
    children: React.ReactNode; 
    section: keyof typeof expandedSections;
  }) => (
    <div className="border-b border-border/20 pb-6 mb-6 last:border-b-0 last:mb-0">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full text-left mb-4 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
      >
        {title}
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            expandedSections[section] ? "rotate-180" : ""
          }`} 
        />
      </button>
      {expandedSections[section] && (
        <div className="space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  const FilterContent = () => (
    <div className={`space-y-6 transition-opacity duration-200 ${filterLoading ? 'opacity-60' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
          {filterLoading && (
            <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
          )}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            disabled={filterLoading}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline decoration-1 underline-offset-2 disabled:opacity-50"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Brands */}
      <FilterSection title="Brands" section="brands">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-6 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {brands.map((brand) => (
              <label 
                key={brand.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand.slug)}
                    onChange={(e) => handleBrandChange(brand.slug, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border border-border rounded flex items-center justify-center transition-colors ${
                    filters.brands.includes(brand.slug) 
                      ? "bg-primary border-primary" 
                      : "bg-background group-hover:border-primary/50"
                  }`}>
                    {filters.brands.includes(brand.slug) && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                </div>
                <span className="text-sm text-foreground group-hover:text-muted-foreground transition-colors">
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" section="price">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Min Price</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handlePriceChange('minPrice', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Max Price</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
              placeholder="1000"
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>
      </FilterSection>

      {/* Sort By */}
      <FilterSection title="Sort By" section="sort">
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={filters.sortBy === option.value}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 border border-border rounded-full flex items-center justify-center transition-colors ${
                  filters.sortBy === option.value 
                    ? "bg-primary border-primary" 
                    : "bg-background group-hover:border-primary/50"
                }`}>
                  {filters.sortBy === option.value && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  )}
                </div>
              </div>
              <span className="text-sm text-foreground group-hover:text-muted-foreground transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" section="availability">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => {
                const newFilters = { ...filters, inStock: e.target.checked };
                setFilters(newFilters);
                updateURL(newFilters, true);
              }}
              className="sr-only"
            />
            <div className={`w-4 h-4 border border-border rounded flex items-center justify-center transition-colors ${
              filters.inStock 
                ? "bg-primary border-primary" 
                : "bg-background group-hover:border-primary/50"
            }`}>
              {filters.inStock && (
                <Check className="w-3 h-3 text-primary-foreground" />
              )}
            </div>
          </div>
          <span className="text-sm text-foreground group-hover:text-muted-foreground transition-colors">
            In Stock Only
          </span>
        </label>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
              {filters.brands.length + (filters.minPrice || filters.maxPrice ? 1 : 0) + (filters.inStock ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24 bg-background border border-border/20 rounded-lg p-6">
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowMobileFilters(false)}
          />
          
          {/* Filter Panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-background border-l border-border shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border/20">
              <h3 className="text-lg font-medium text-foreground">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 hover:bg-muted/50 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto h-full pb-20">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
