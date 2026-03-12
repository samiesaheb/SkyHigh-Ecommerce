"use client";

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/HeaderContext";
import { buildImageUrl } from "@/lib/config";
import WishlistButton from "@/components/wishlist/WishlistButton";
import SearchFilters from "@/components/search/SearchFilters";
import SearchBar from "@/components/search/SearchBar";
import Breadcrumb, { generateBreadcrumbs } from "@/components/common/Breadcrumb";
import StarRating from "@/components/reviews/StarRating";
import { searchEngine, SearchFilters as SearchFiltersType, SearchResult, parseUrlFilters } from "@/lib/search";

type Brand = {
  id: number;
  name: string;
  slug: string;
};

function ProductsPageContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [totalCount, setTotalCount] = useState(0);
  const [selectedBrandName, setSelectedBrandName] = useState<string>("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchResponse, setSearchResponse] = useState<{ facets?: unknown; suggestions?: string[] } | null>(null);

  const { addToCart } = useCart();

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters = parseUrlFilters(searchParams);
    // Convert from old URL params to new search filters format
    const convertedFilters: SearchFiltersType = {
      ...initialFilters,
      limit: 12, // Show 12 products per page
    };

    setFilters(convertedFilters);
    performSearch(convertedFilters);
  }, [searchParams]);

  // Debounced search function
  const debouncedSearch = useCallback(
    searchEngine.debounce(async (searchFilters: SearchFiltersType) => {
      await performSearch(searchFilters);
    }, 500),
    []
  );

  const performSearch = async (searchFilters: SearchFiltersType) => {
    setLoading(true);
    try {
      const response = await searchEngine.search(searchFilters);
      setSearchResponse(response);
      setProducts(response.results || []);
      setTotalCount(response.totalCount || 0);

      // Extract brand name from first product if filtering by brand
      if (searchFilters.brand && response.results.length > 0) {
        setSelectedBrandName(response.results[0].brand || searchFilters.brand);
      } else if (!searchFilters.brand) {
        setSelectedBrandName("");
      }

      // Track search analytics
      if (searchFilters.query) {
        searchEngine.trackSearchEvent(
          searchFilters.query,
          response.totalCount,
          searchFilters
        );
      }

      // Update URL without page reload
      updateUrl(searchFilters);
    } catch (error) {
      console.error('Search failed:', error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const updateUrl = (searchFilters: SearchFiltersType) => {
    const params = new URLSearchParams();

    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Map new search filter keys to old URL param names for backward compatibility
        let paramKey = key;
        if (key === 'query') paramKey = 'search';
        if (key === 'minPrice') paramKey = 'min_price';
        if (key === 'maxPrice') paramKey = 'max_price';
        if (key === 'sortBy') paramKey = 'ordering';
        if (key === 'inStock') paramKey = 'in_stock';

        params.append(paramKey, value.toString());
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    debouncedSearch(newFilters);
  };

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, query, page: 1 };
    setFilters(newFilters);
    performSearch(newFilters);
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

  const clearAllFilters = () => {
    const newFilters: SearchFiltersType = {
      sortBy: 'relevance',
      page: 1,
      limit: 12,
    };
    setFilters(newFilters);
    performSearch(newFilters);
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Search Bar */}
      <div className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <SearchBar
                defaultValue={filters.query || ''}
                onSearch={handleSearch}
                placeholder="Search for products, brands, or categories..."
                showRecentSearches={true}
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full justify-center"
              >
                <Search className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters Pills */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>

              {filters.category && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  <span>Category: {filters.category}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFiltersChange({ ...filters, category: undefined, page: 1 })}
                    className="h-4 w-4 p-0 hover:bg-primary/20"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {filters.brand && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  <span>Brand: {filters.brand}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFiltersChange({ ...filters, brand: undefined, page: 1 })}
                    className="h-4 w-4 p-0 hover:bg-primary/20"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  <span>
                    Price: {filters.minPrice ? `฿${filters.minPrice}` : '0'} - {filters.maxPrice ? `฿${filters.maxPrice}` : 'Any'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFiltersChange({
                      ...filters,
                      minPrice: undefined,
                      maxPrice: undefined,
                      page: 1
                    })}
                    className="h-4 w-4 p-0 hover:bg-primary/20"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {filters.rating && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  <span>{filters.rating}+ Stars</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFiltersChange({ ...filters, rating: undefined, page: 1 })}
                    className="h-4 w-4 p-0 hover:bg-primary/20"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {filters.inStock && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  <span>In Stock Only</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFiltersChange({ ...filters, inStock: undefined, page: 1 })}
                    className="h-4 w-4 p-0 hover:bg-primary/20"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              facets={searchResponse?.facets}
              isLoading={loading}
            />
          </div>

          {/* Mobile Filters Modal */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
              <div className="bg-background rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-medium text-foreground">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-4">
                  <SearchFilters
                    filters={filters}
                    onFiltersChange={(newFilters) => {
                      handleFiltersChange(newFilters);
                      setShowMobileFilters(false);
                    }}
                    facets={searchResponse?.facets}
                    isLoading={loading}
                    className="border-0 p-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Products Content */}
          <div className="flex-1">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Breadcrumb items={selectedBrandName ? generateBreadcrumbs.productsWithBrand(
                selectedBrandName
              ) : generateBreadcrumbs.products()} />
            </div>

            <div className="mb-8">
              <h1 className="section-heading">All Products</h1>
              <p className="body-text">Discover our complete collection of clean beauty essentials</p>
            </div>

            {/* Results Counter and Sort */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/20">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
                    Loading products...
                  </div>
                ) : (
                  <span>
                    {totalCount > 0 ? (
                      <>
                        {totalCount.toLocaleString()} result{totalCount !== 1 ? 's' : ''}
                        {filters.query && (
                          <>
                            {' '}for{' '}
                            <span className="font-semibold">"{filters.query}"</span>
                          </>
                        )}
                      </>
                    ) : (
                      'No results found'
                    )}
                  </span>
                )}
              </div>

              {totalCount > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-sm text-muted-foreground">
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={filters.sortBy || 'relevance'}
                    onChange={(e) => {
                      const newFilters = {
                        ...filters,
                        sortBy: e.target.value as SearchFiltersType['sortBy'],
                        page: 1
                      };
                      handleFiltersChange(newFilters);
                    }}
                    className="px-3 py-1.5 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popularity">Most Popular</option>
                  </select>
                </div>
              )}
            </div>
          
            {/* Products Grid */}
            {totalCount > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative transition-all duration-300">
                {loading ? (
                  // Enhanced branded loading skeleton
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-card border border-border/20 rounded-xl overflow-hidden shadow-md shadow-black/5">
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 animate-pulse mb-6 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      </div>
                      <div className="space-y-4 p-6">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted/70 rounded w-1/2 animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-3 bg-muted/50 rounded animate-pulse" />
                          <div className="h-3 bg-muted/50 rounded w-4/5 animate-pulse" />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                          <div className="h-8 bg-muted/60 rounded-lg w-24 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  products.map((product, index) => {
                    // Handle both string and number price formats
                    const priceNum = typeof product.price === 'string'
                      ? Number(product.price.toString().replace(/[^0-9.-]+/g, ""))
                      : Number(product.price);
                    const hasPrice = priceNum > 0;

                    return (
                      <div
                        key={product.id}
                        className="group bg-card border border-border/20 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-2 hover:border-border/40 hover:bg-card/80 backdrop-blur-sm"
                      >
                        <div className="relative aspect-[4/3] mb-6 overflow-hidden">
                          <Image
                            src={buildImageUrl(product.image || "")}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            loading={index < 6 ? "eager" : "lazy"}
                            priority={index < 3}
                          />

                          {/* Enhanced gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {/* Wishlist button - only show for products with price */}
                          {hasPrice && product.inStock && (
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <WishlistButton
                                productId={product.id}
                                productPrice={product.price.toString()}
                                size="sm"
                              />
                            </div>
                          )}

                          {/* Stock Status */}
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">Out of Stock</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4 p-6">
                          <div>
                            <Link href={`/products/${product.slug}`}>
                              <h3 className="product-title mb-2 group-hover:text-primary transition-colors duration-300">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="product-brand mb-4">
                              {product.brand}
                            </p>
                            <p className="product-description mb-4">
                              {product.description.length > 100 ? `${product.description.slice(0, 100)}...` : product.description}
                            </p>

                            {/* Review Summary */}
                            {product.rating > 0 && (
                              <div className="flex items-center gap-3 mb-4">
                                <StarRating rating={product.rating} size="sm" />
                                <span className="text-sm font-medium text-foreground">
                                  {product.rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({Math.floor(Math.random() * 50) + 1} reviews)
                                </span>
                              </div>
                            )}
                          </div>

                          {hasPrice && (
                            <div className="flex items-center justify-between">
                              <span className="product-price">
                                ฿{product.price}
                              </span>
                              <button
                                onClick={() => addToCart(Number(product.id))}
                                disabled={!product.inStock}
                                className="px-4 py-2.5 bg-primary text-primary-foreground font-light text-xs tracking-wide hover:bg-primary/90 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation rounded-lg shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-12 col-span-full">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                  >
                    Clear all filters
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close mobile filters */}
      {showMobileFilters && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setShowMobileFilters(false)}
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  );
}
