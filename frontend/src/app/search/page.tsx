"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/search/SearchBar';
import SearchFilters from '@/components/search/SearchFilters';
import AdvancedSearchResults from '@/components/search/AdvancedSearchResults';
import { searchEngine, SearchFilters as SearchFiltersType, SearchResponse, parseUrlFilters } from '@/lib/search';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Initialize filters from URL
  useEffect(() => {
    const initialFilters = parseUrlFilters(searchParams);
    setFilters(initialFilters);

    // Perform initial search if there are filters
    if (initialFilters.query || initialFilters.category || initialFilters.brand) {
      performSearch(initialFilters);
    }
  }, [searchParams]);

  // Debounced search function
  const debouncedSearch = useCallback(
    searchEngine.debounce(async (searchFilters: SearchFiltersType) => {
      await performSearch(searchFilters);
    }, 500),
    []
  );

  const performSearch = async (searchFilters: SearchFiltersType) => {
    setIsLoading(true);
    try {
      const response = await searchEngine.search(searchFilters);
      setSearchResponse(response);

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
      setSearchResponse({
        results: [],
        totalCount: 0,
        facets: {
          categories: [],
          brands: [],
          priceRanges: [],
          ratings: [],
        },
        suggestions: [],
        searchTime: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUrl = (searchFilters: SearchFiltersType) => {
    const params = new URLSearchParams();

    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
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

  const clearAllFilters = () => {
    const newFilters: SearchFiltersType = {
      sortBy: 'relevance',
      page: 1,
      limit: 20,
    };
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

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                <Filter className="w-4 h-4 mr-2" />
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
                    Price: {filters.minPrice ? `$${filters.minPrice}` : '0'} - {filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}
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
              isLoading={isLoading}
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
                    isLoading={isLoading}
                    className="border-0 p-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="flex-1">
            <AdvancedSearchResults
              results={searchResponse?.results || []}
              totalCount={searchResponse?.totalCount || 0}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
              searchQuery={filters.query}
            />
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