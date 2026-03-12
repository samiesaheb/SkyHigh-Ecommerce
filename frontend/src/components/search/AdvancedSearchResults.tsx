"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Grid3X3, List, Star, ShoppingCart, Heart, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchResult, SearchFilters, formatPrice, highlightSearchTerm } from '@/lib/search';
import { buildImageUrl } from '@/lib/config';

interface AdvancedSearchResultsProps {
  results: SearchResult[];
  totalCount: number;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isLoading?: boolean;
  searchQuery?: string;
  className?: string;
}

type ViewMode = 'grid' | 'list';

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popularity', label: 'Most Popular' },
];

export default function AdvancedSearchResults({
  results,
  totalCount,
  filters,
  onFiltersChange,
  isLoading = false,
  searchQuery = '',
  className = '',
}: AdvancedSearchResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const currentPage = filters.page || 1;
  const limit = filters.limit || 20;
  const totalPages = Math.ceil(totalCount / limit);

  const handleSortChange = (sortBy: SearchFilters['sortBy']) => {
    onFiltersChange({
      ...filters,
      sortBy,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onFiltersChange({
        ...filters,
        page,
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const renderProductCard = (product: SearchResult, index: number) => {
    const isGridView = viewMode === 'grid';

    return (
      <div
        key={product.id}
        className={`group bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 ${
          isGridView ? 'flex flex-col' : 'flex gap-4 p-4'
        }`}
      >
        {/* Product Image */}
        <div className={`relative overflow-hidden ${
          isGridView ? 'aspect-square' : 'w-24 h-24 flex-shrink-0'
        }`}>
          <Link href={`/products/${product.slug}`}>
            <Image
              src={buildImageUrl(product.image)}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes={isGridView ? "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" : "96px"}
              loading={index < 8 ? "eager" : "lazy"}
            />
          </Link>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-medium">Out of Stock</span>
            </div>
          )}

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white transition-colors ${
              isGridView ? 'opacity-0 group-hover:opacity-100' : ''
            }`}
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* Product Info */}
        <div className={`flex flex-col ${isGridView ? 'p-4' : 'flex-1'}`}>
          {/* Brand */}
          <div className="text-xs text-muted-foreground mb-1">
            {product.brand}
          </div>

          {/* Product Name */}
          <h3 className={`font-medium text-foreground group-hover:text-primary transition-colors ${
            isGridView ? 'text-sm mb-2 line-clamp-2' : 'text-base mb-1'
          }`}>
            <Link href={`/products/${product.slug}`}>
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightSearchTerm(product.name, searchQuery),
                }}
              />
            </Link>
          </h3>

          {/* Description - List view only */}
          {!isGridView && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightSearchTerm(product.description, searchQuery),
                }}
              />
            </p>
          )}

          {/* Rating */}
          <div className="mb-2">
            {renderStars(product.rating)}
          </div>

          {/* Price and Actions */}
          <div className={`flex items-center ${isGridView ? 'justify-between' : 'justify-between'} mt-auto`}>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.category && (
                <span className="text-xs text-muted-foreground">
                  {product.category}
                </span>
              )}
            </div>

            <Button
              size={isGridView ? "sm" : "default"}
              disabled={!product.inStock}
              className="ml-2"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              {isGridView ? 'Add' : 'Add to Cart'}
            </Button>
          </div>

          {/* Tags - List view only */}
          {!isGridView && product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{product.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Loading skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-20 bg-muted animate-pulse rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-lg">
              <div className="aspect-square" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded" />
                <div className="h-4 w-3/4 bg-muted-foreground/20 rounded" />
                <div className="h-6 w-1/2 bg-muted-foreground/20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-foreground">
            {totalCount > 0 ? (
              <>
                {totalCount.toLocaleString()} result{totalCount !== 1 ? 's' : ''}
                {searchQuery && (
                  <>
                    {' '}for{' '}
                    <span className="font-semibold">"{searchQuery}"</span>
                  </>
                )}
              </>
            ) : (
              'No results found'
            )}
          </h2>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={filters.sortBy || 'relevance'}
                onChange={(e) => handleSortChange(e.target.value as SearchFilters['sortBy'])}
                className="appearance-none bg-background border border-border rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none border-r border-border"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results Grid/List */}
      {totalCount > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'
        }>
          {results.map((product, index) => renderProductCard(product, index))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <Button
            variant="outline"
            onClick={() => onFiltersChange({ sortBy: 'relevance', page: 1, limit: 20 })}
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalCount > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {/* First page */}
            {currentPage > 3 && (
              <>
                <Button
                  variant={1 === currentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </Button>
                {currentPage > 4 && <span className="px-2">...</span>}
              </>
            )}

            {/* Current page and neighbors */}
            {[...Array(Math.min(5, totalPages))]
              .map((_, i) => {
                const page = Math.max(1, currentPage - 2) + i;
                return page <= totalPages ? page : null;
              })
              .filter(Boolean)
              .map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(page!)}
                >
                  {page}
                </Button>
              ))}

            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                <Button
                  variant={totalPages === currentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Results Info */}
      {totalCount > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount.toLocaleString()} results
        </div>
      )}
    </div>
  );
}