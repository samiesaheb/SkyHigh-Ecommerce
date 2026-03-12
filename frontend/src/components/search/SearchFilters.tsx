"use client";

import { useState, useEffect } from 'react';
import { X, Filter, Star, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SearchFilters as SearchFiltersType } from '@/lib/search';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  facets?: {
    categories: Array<{ name: string; count: number }>;
    brands: Array<{ name: string; slug: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    ratings: Array<{ rating: number; count: number }>;
  };
  isLoading?: boolean;
  className?: string;
}

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number;
}

function FilterSection({ title, isOpen, onToggle, children, count }: FilterSectionProps) {
  return (
    <div className="border-b border-border pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-left font-medium text-foreground hover:text-primary transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {count !== undefined && count > 0 && (
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              {count}
            </span>
          )}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {isOpen && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  facets,
  isLoading = false,
  className = "",
}: SearchFiltersProps) {
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    rating: true,
    availability: true,
  });

  const [localPriceRange, setLocalPriceRange] = useState({
    min: filters.minPrice?.toString() || '',
    max: filters.maxPrice?.toString() || '',
  });

  // Update local price range when filters change
  useEffect(() => {
    setLocalPriceRange({
      min: filters.minPrice?.toString() || '',
      max: filters.maxPrice?.toString() || '',
    });
  }, [filters.minPrice, filters.maxPrice]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFilter = (key: keyof SearchFiltersType, value: SearchFiltersType[keyof SearchFiltersType]) => {
    const newFilters = { ...filters, [key]: value };

    // Reset page when filters change
    if (key !== 'page') {
      newFilters.page = 1;
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      query: filters.query, // Keep the search query
      sortBy: filters.sortBy || 'relevance',
      page: 1,
      limit: filters.limit || 20,
    });
  };

  const applyPriceRange = () => {
    const minPrice = localPriceRange.min ? Number(localPriceRange.min) : undefined;
    const maxPrice = localPriceRange.max ? Number(localPriceRange.max) : undefined;

    onFiltersChange({
      ...filters,
      minPrice,
      maxPrice,
      page: 1,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.rating) count++;
    if (filters.inStock !== undefined) count++;
    return count;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`bg-background border border-border rounded-lg p-4 h-fit ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs h-8"
          >
            Clear all
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading filters...</p>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-0">
          {/* Category Filter */}
          <FilterSection
            title="Category"
            isOpen={openSections.category}
            onToggle={() => toggleSection('category')}
            count={filters.category ? 1 : 0}
          >
            <div className="space-y-2">
              {facets?.categories?.map((category) => (
                <label
                  key={category.name}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="category"
                      value={category.name}
                      checked={filters.category === category.name}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded transition-colors ${
                      filters.category === category.name
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {filters.category === category.name && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                  <span className="flex-1 text-sm text-foreground">{category.name}</span>
                  <span className="text-xs text-muted-foreground">({category.count})</span>
                </label>
              ))}

              {filters.category && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('category', undefined)}
                  className="w-full justify-start text-xs h-8 text-muted-foreground"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear category
                </Button>
              )}
            </div>
          </FilterSection>

          {/* Brand Filter */}
          <FilterSection
            title="Brand"
            isOpen={openSections.brand}
            onToggle={() => toggleSection('brand')}
            count={filters.brand ? 1 : 0}
          >
            <div className="space-y-2">
              {facets?.brands?.map((brand) => (
                <label
                  key={brand.name}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="brand"
                      value={brand.slug}
                      checked={filters.brand === brand.slug}
                      onChange={(e) => updateFilter('brand', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded transition-colors ${
                      filters.brand === brand.slug
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {filters.brand === brand.slug && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                  <span className="flex-1 text-sm text-foreground">{brand.name}</span>
                  <span className="text-xs text-muted-foreground">({brand.count})</span>
                </label>
              ))}

              {filters.brand && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('brand', undefined)}
                  className="w-full justify-start text-xs h-8 text-muted-foreground"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear brand
                </Button>
              )}
            </div>
          </FilterSection>

          {/* Price Filter */}
          <FilterSection
            title="Price Range"
            isOpen={openSections.price}
            onToggle={() => toggleSection('price')}
            count={filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0}
          >
            <div className="space-y-4">
              {/* Price Range Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Min Price</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={localPriceRange.min}
                    onChange={(e) => setLocalPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max Price</Label>
                  <Input
                    type="number"
                    placeholder="Any"
                    value={localPriceRange.max}
                    onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <Button
                size="sm"
                onClick={applyPriceRange}
                className="w-full h-8"
                disabled={localPriceRange.min === (filters.minPrice?.toString() || '') &&
                         localPriceRange.max === (filters.maxPrice?.toString() || '')}
              >
                Apply Price Range
              </Button>

              {/* Predefined Price Ranges */}
              {facets?.priceRanges && facets.priceRanges.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Quick Select</Label>
                  {facets.priceRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onFiltersChange({
                          ...filters,
                          minPrice: range.min,
                          maxPrice: range.max,
                          page: 1,
                        });
                      }}
                      className="w-full flex items-center justify-between p-2 text-sm rounded hover:bg-muted/50 transition-colors text-left"
                    >
                      <span>
                        {formatPrice(range.min)} - {formatPrice(range.max)}
                      </span>
                      <span className="text-xs text-muted-foreground">({range.count})</span>
                    </button>
                  ))}
                </div>
              )}

              {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    updateFilter('minPrice', undefined);
                    updateFilter('maxPrice', undefined);
                  }}
                  className="w-full justify-start text-xs h-8 text-muted-foreground"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear price range
                </Button>
              )}
            </div>
          </FilterSection>

          {/* Rating Filter */}
          <FilterSection
            title="Customer Rating"
            isOpen={openSections.rating}
            onToggle={() => toggleSection('rating')}
            count={filters.rating ? 1 : 0}
          >
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => {
                const ratingData = facets?.ratings?.find(r => r.rating === rating);
                return (
                  <label
                    key={rating}
                    className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={filters.rating === rating}
                        onChange={(e) => updateFilter('rating', Number(e.target.value))}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border-2 rounded transition-colors ${
                        filters.rating === rating
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {filters.rating === rating && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-foreground">& Up</span>
                    </div>
                    {ratingData && (
                      <span className="text-xs text-muted-foreground">({ratingData.count})</span>
                    )}
                  </label>
                );
              })}

              {filters.rating && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('rating', undefined)}
                  className="w-full justify-start text-xs h-8 text-muted-foreground"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear rating
                </Button>
              )}
            </div>
          </FilterSection>

          {/* Availability Filter */}
          <FilterSection
            title="Availability"
            isOpen={openSections.availability}
            onToggle={() => toggleSection('availability')}
            count={filters.inStock !== undefined ? 1 : 0}
          >
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.inStock === true}
                    onChange={(e) => updateFilter('inStock', e.target.checked ? true : undefined)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border-2 rounded transition-colors ${
                    filters.inStock === true
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {filters.inStock === true && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                </div>
                <span className="flex-1 text-sm text-foreground">In Stock Only</span>
              </label>

              {filters.inStock !== undefined && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('inStock', undefined)}
                  className="w-full justify-start text-xs h-8 text-muted-foreground"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear availability
                </Button>
              )}
            </div>
          </FilterSection>
        </div>
      )}
    </div>
  );
}