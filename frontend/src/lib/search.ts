// Advanced search utilities with filtering, sorting, and autocomplete

import { httpCache } from './cache';
import { API_ENDPOINTS } from './config';

export interface SearchFilters {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  rating?: number;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'newest' | 'rating' | 'popularity';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  brand: string;
  category: string;
  rating: number;
  inStock: boolean;
  slug: string;
  tags: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  facets: {
    categories: Array<{ name: string; count: number }>;
    brands: Array<{ name: string; slug: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    ratings: Array<{ rating: number; count: number }>;
  };
  suggestions: string[];
  searchTime: number;
}

export interface AutocompleteSuggestion {
  text: string;
  type: 'product' | 'category' | 'brand' | 'query';
  count?: number;
  image?: string;
  metadata?: {
    slug?: string;
    image?: string;
    brand?: string;
    price?: string | number;
  };
}

export interface AutocompleteResult {
  query: string;
  suggestions: AutocompleteSuggestion[];
}

class SearchEngine {
  private searchHistory: string[] = [];
  private popularSearches: string[] = [];

  // Build search URL with filters using the existing products API
  private buildSearchUrl(filters: SearchFilters): string {
    const params = new URLSearchParams();

    if (filters.query) params.append('search', filters.query);
    if (filters.category) params.append('category', filters.category);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.minPrice !== undefined) params.append('min_price', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('max_price', filters.maxPrice.toString());
    if (filters.inStock !== undefined) params.append('in_stock', filters.inStock.toString());
    if (filters.rating) params.append('min_rating', filters.rating.toString());

    // Map our sortBy values to the existing API's ordering param
    if (filters.sortBy) {
      let ordering = '';
      switch (filters.sortBy) {
        case 'price_low': ordering = 'price'; break;
        case 'price_high': ordering = '-price'; break;
        case 'newest': ordering = '-created_at'; break;
        case 'rating': ordering = '-average_rating'; break;
        case 'popularity': ordering = '-created_at'; break; // Fallback to newest for popularity
        case 'relevance':
        default:
          // Don't add ordering for relevance
          break;
      }
      if (ordering) params.append('ordering', ordering);
    }

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return `${API_ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`;
  }

  // Perform search with caching
  async search(filters: SearchFilters): Promise<SearchResponse> {
    const url = this.buildSearchUrl(filters);

    try {
      const response = await httpCache.fetch<{ results?: unknown[]; count?: number } | unknown[]>(url, {
        cacheOptions: {
          ttl: filters.query ? 5 : 15, // Cache query searches for 5 min, browsing for 15 min
          tags: ['search', 'products'],
          priority: 7,
          staleWhileRevalidate: true,
        },
      });

      // Track search query
      if (filters.query && !this.searchHistory.includes(filters.query)) {
        this.addToSearchHistory(filters.query);
      }

      // Transform the products API response to our SearchResponse format
      const products = Array.isArray(response) ? response : (response.results || []);
      const totalCount = response.count || products.length;

      // Transform products
      const transformedProducts = products.map((product: {
        id: number | string;
        name?: string;
        slug?: string;
        description?: string;
        price?: string | number;
        main_image?: string;
        brand?: { name?: string } | string;
        category?: { name?: string } | string;
        average_rating?: number;
        in_stock?: boolean;
      }) => ({
        id: product.id.toString(),
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: typeof product.price === 'string'
          ? parseFloat(product.price.replace(/[^0-9.-]+/g, ''))
          : (product.price || 0),
        image: product.main_image || '',
        brand: typeof product.brand === 'object' ? product.brand?.name || '' : product.brand || '',
        category: typeof product.category === 'object' ? product.category?.name || '' : product.category || '',
        rating: product.average_rating || 0,
        inStock: product.in_stock !== false, // Default to true if not specified
        tags: [],
      }));

      // Get facets data
      const facets = await this.generateFacets(transformedProducts, filters);

      const transformedResponse: SearchResponse = {
        results: transformedProducts,
        totalCount,
        facets,
        suggestions: [],
        searchTime: 0,
      };

      return transformedResponse;
    } catch (error) {
      console.error('Search failed:', error);
      return {
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
      };
    }
  }

  // Get autocomplete suggestions
  async getAutocompleteSuggestions(query: string): Promise<AutocompleteResult> {
    if (!query || query.length < 2) {
      return {
        query,
        suggestions: this.getRecentAndPopularSuggestions(),
      };
    }

    try {
      // Use the products API with search parameter for autocomplete suggestions
      const url = `${API_ENDPOINTS.PRODUCTS.LIST}?search=${encodeURIComponent(query)}&limit=5`;
      const response = await httpCache.fetch<{ results?: unknown[] } | unknown[]>(url, {
        cacheOptions: {
          ttl: 10, // Cache autocomplete for 10 minutes
          tags: ['autocomplete'],
          priority: 8,
        },
      });

      // Transform the API response to our AutocompleteResult format
      const products = Array.isArray(response) ? response : (response.results || []);

      return {
        query,
        suggestions: products.slice(0, 5).map((item: {
          name?: string;
          slug?: string;
          main_image?: string;
          image?: string;
          brand?: { name?: string } | string;
          price?: string | number;
        }) => ({
          text: item.name || '',
          type: 'product' as const,
          metadata: {
            slug: item.slug,
            image: item.main_image || item.image,
            brand: typeof item.brand === 'object' ? item.brand?.name : item.brand,
            price: item.price,
          }
        }))
      };
    } catch (error) {
      console.error('Autocomplete failed:', error);

      // Fallback to local suggestions
      return {
        query,
        suggestions: this.getLocalSuggestions(query),
      };
    }
  }

  // Get recent and popular suggestions for empty query
  private getRecentAndPopularSuggestions(): AutocompleteSuggestion[] {
    const suggestions: AutocompleteSuggestion[] = [];

    // Add recent searches
    this.searchHistory.slice(-5).reverse().forEach(search => {
      suggestions.push({
        text: search,
        type: 'query' as const,
      });
    });

    // Add popular searches
    this.popularSearches.slice(0, 5).forEach(search => {
      if (!suggestions.find(s => s.text === search)) {
        suggestions.push({
          text: search,
          type: 'query' as const,
        });
      }
    });

    return suggestions;
  }

  // Local fallback suggestions
  private getLocalSuggestions(query: string): AutocompleteSuggestion[] {
    const localSuggestions: AutocompleteSuggestion[] = [
      // Popular categories
      { text: 'Hair Care', type: 'category' as const },
      { text: 'Skin Care', type: 'category' as const },
      { text: 'Body Care', type: 'category' as const },

      // Popular brands
      { text: 'Geometry', type: 'brand' as const },
      { text: 'Body and Skin Care', type: 'brand' as const },

      // Popular products
      { text: 'Hair Serum', type: 'product' as const },
      { text: 'Whitening Soap', type: 'product' as const },
      { text: 'Anti Hair Loss', type: 'product' as const },
    ];

    return localSuggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Search history management
  private addToSearchHistory(query: string) {
    this.searchHistory = [query, ...this.searchHistory.filter(q => q !== query)].slice(0, 10);

    if (typeof window !== 'undefined') {
      localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    }
  }

  loadSearchHistory() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('search_history');
        if (saved) {
          this.searchHistory = JSON.parse(saved);
        }
      } catch (error) {
        console.warn('Failed to load search history:', error);
      }
    }
  }

  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  clearSearchHistory() {
    this.searchHistory = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('search_history');
    }
  }

  // Popular searches management
  setPopularSearches(searches: string[]) {
    this.popularSearches = searches;
  }

  // Clear search cache (for debugging)
  clearCache() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('httpCache');
      console.log('Search cache cleared');
    }
  }

  // Advanced filtering
  applyLocalFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    let filtered = [...results];

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filtered = filtered.filter(item => {
        const price = item.price;
        const minPrice = filters.minPrice ?? 0;
        const maxPrice = filters.maxPrice ?? Infinity;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Stock filter
    if (filters.inStock !== undefined) {
      filtered = filtered.filter(item => item.inStock === filters.inStock);
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(item => item.rating >= filters.rating!);
    }

    // Sort results
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
            // Assume newer items have higher IDs
            return parseInt(b.id) - parseInt(a.id);
          case 'popularity':
            // Could be based on sales, views, etc.
            return b.rating - a.rating; // Fallback to rating
          case 'relevance':
          default:
            return 0; // Keep original order for relevance
        }
      });
    }

    return filtered;
  }

  // Search analytics
  trackSearchEvent(query: string, resultsCount: number, filters: SearchFilters) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search', {
        search_term: query,
        results_count: resultsCount,
        filters: JSON.stringify(filters),
      });
    }
  }

  // Generate facets data for filtering
  async generateFacets(products: SearchResult[], filters: SearchFilters): Promise<SearchResponse['facets']> {
    try {
      // Fetch brands from the API
      const brandsResponse = await httpCache.fetch<{ results?: unknown[] } | unknown[]>(API_ENDPOINTS.PRODUCTS.BRANDS, {
        cacheOptions: {
          ttl: 30, // Cache brands for 30 minutes
          tags: ['brands'],
          priority: 8,
        },
      });

      const allBrands = Array.isArray(brandsResponse) ? brandsResponse : (brandsResponse.results || []);

      // Extract unique categories from current products
      const categoryMap = new Map<string, number>();
      const brandMap = new Map<string, number>();

      // Count categories and brands from current products
      products.forEach(product => {
        if (product.category) {
          categoryMap.set(product.category, (categoryMap.get(product.category) || 0) + 1);
        }
        if (product.brand) {
          brandMap.set(product.brand, (brandMap.get(product.brand) || 0) + 1);
        }
      });

      // Create categories facets (from current search results)
      const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
        name,
        count,
      }));

      // Create brands facets (from API brands list, with counts from current results)
      const brands = allBrands.map((brand: { name?: string; slug?: string } | string) => ({
        name: typeof brand === 'object' ? brand.name || '' : brand,
        slug: typeof brand === 'object' ? (brand.slug || (brand.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')) : brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        count: brandMap.get(typeof brand === 'object' ? brand.name || '' : brand) || 0,
      })).filter((brand: { name: string; slug: string; count: number }) => {
        // Show all brands if no search query and no brand filter is active
        if (!filters.query && !filters.brand) return true;
        // Show all brands if there's a search query but no brand filter (let users filter further)
        if (filters.query && !filters.brand) return true;
        // If a brand filter is active, show all brands to allow switching
        if (filters.brand) return true;
        // Otherwise show brands with results
        return brand.count > 0;
      });

      // Generate price ranges based on current products
      const prices = products.map(p => p.price).filter(p => p > 0).sort((a, b) => a - b);
      const priceRanges = [];

      if (prices.length > 0) {
        const min = Math.floor(prices[0]);
        const max = Math.ceil(prices[prices.length - 1]);
        const range = max - min;

        if (range > 0) {
          const intervals = Math.min(5, Math.ceil(range / 100)); // Create up to 5 price ranges
          const step = Math.ceil(range / intervals);

          for (let i = 0; i < intervals; i++) {
            const rangeMin = min + (i * step);
            const rangeMax = i === intervals - 1 ? max : min + ((i + 1) * step) - 1;
            const count = prices.filter(p => p >= rangeMin && p <= rangeMax).length;

            if (count > 0) {
              priceRanges.push({
                min: rangeMin,
                max: rangeMax,
                count,
              });
            }
          }
        }
      }

      // Generate rating facets
      const ratingMap = new Map<number, number>();
      products.forEach(product => {
        const rating = Math.floor(product.rating);
        if (rating > 0) {
          ratingMap.set(rating, (ratingMap.get(rating) || 0) + 1);
        }
      });

      const ratings = Array.from(ratingMap.entries()).map(([rating, count]) => ({
        rating,
        count,
      })).sort((a, b) => b.rating - a.rating);

      return {
        categories,
        brands,
        priceRanges,
        ratings,
      };
    } catch (error) {
      console.error('Failed to generate facets:', error);

      // Return basic facets from current products as fallback
      const categoryMap = new Map<string, number>();
      const brandMap = new Map<string, number>();

      products.forEach(product => {
        if (product.category) {
          categoryMap.set(product.category, (categoryMap.get(product.category) || 0) + 1);
        }
        if (product.brand) {
          brandMap.set(product.brand, (brandMap.get(product.brand) || 0) + 1);
        }
      });

      return {
        categories: Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count })),
        brands: Array.from(brandMap.entries()).map(([name, count]) => ({
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          count
        })),
        priceRanges: [],
        ratings: [],
      };
    }
  }

  // Debounced search for autocomplete
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// Global search engine instance
export const searchEngine = new SearchEngine();

// Initialize search history on load
if (typeof window !== 'undefined') {
  searchEngine.loadSearchHistory();
}

// Search result highlighting
export function highlightSearchTerm(text: string, term: string): string {
  if (!term) return text;

  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}

// Price formatting
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(price);
}

// Filter URL generation for sharing
export function generateFilterUrl(filters: SearchFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  return `/products?${params.toString()}`;
}

// Parse URL filters
export function parseUrlFilters(searchParams: URLSearchParams): SearchFilters {
  return {
    query: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    minPrice: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    maxPrice: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    inStock: searchParams.get('in_stock') ? searchParams.get('in_stock') === 'true' : undefined,
    rating: searchParams.get('min_rating') ? Number(searchParams.get('min_rating')) : undefined,
    sortBy: (searchParams.get('sort') as SearchFilters['sortBy']) || 'relevance',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
  };
}