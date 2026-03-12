import { create } from 'zustand';
import { Product, Brand, ProductFilters, PaginatedResponse } from '@/types';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/constants';

interface ProductsState {
  products: Product[];
  brands: Brand[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  nextPage: string | null;
  filters: ProductFilters;
  searchResults: Product[];
  isSearching: boolean;
}

interface ProductsActions {
  // Product operations
  fetchProducts: (filters?: ProductFilters, reset?: boolean) => Promise<void>;
  loadMoreProducts: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // Brand operations
  fetchBrands: () => Promise<void>;
  
  // Filter operations
  setFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type ProductsStore = ProductsState & ProductsActions;

export const useProductsStore = create<ProductsStore>((set, get) => ({
  // Initial state
  products: [],
  brands: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasMore: true,
  nextPage: null,
  filters: {},
  searchResults: [],
  isSearching: false,

  // Actions
  fetchProducts: async (filters = {}, reset = true) => {
    const { isLoading, isLoadingMore } = get();
    
    if (isLoading || isLoadingMore) return;

    set({
      isLoading: reset,
      isLoadingMore: !reset,
      error: null,
    });

    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('min_price', filters.minPrice.toString());
      if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
      if (filters.ordering) params.append('ordering', filters.ordering);
      
      // Add pagination
      if (!reset && get().nextPage) {
        const url = new URL(get().nextPage!);
        url.searchParams.forEach((value, key) => {
          if (!params.has(key)) params.append(key, value);
        });
      }

      const queryString = params.toString();
      const url = `${API_ENDPOINTS.PRODUCTS.LIST}${queryString ? `?${queryString}` : ''}`;

      const response = await api.get<PaginatedResponse<Product>>(url);
      const { results, next } = response.data;

      set(state => ({
        products: reset ? results : [...state.products, ...results],
        hasMore: !!next,
        nextPage: next,
        filters: { ...state.filters, ...filters },
        isLoading: false,
        isLoadingMore: false,
        error: null,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        isLoadingMore: false,
        error: error.response?.data?.message || 'Failed to fetch products',
      });
    }
  },

  loadMoreProducts: async () => {
    const { hasMore, filters } = get();
    
    if (!hasMore) return;
    
    await get().fetchProducts(filters, false);
  },

  searchProducts: async (query: string) => {
    if (!query.trim()) {
      get().clearSearch();
      return;
    }

    set({ isSearching: true, error: null });

    try {
      const response = await api.get<Product[]>(
        `${API_ENDPOINTS.PRODUCTS.SEARCH}?query=${encodeURIComponent(query)}`
      );

      set({
        searchResults: response.data,
        isSearching: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isSearching: false,
        error: error.response?.data?.message || 'Search failed',
      });
    }
  },

  clearSearch: () => {
    set({
      searchResults: [],
      isSearching: false,
    });
  },

  fetchBrands: async () => {
    try {
      const response = await api.get<Brand[]>(API_ENDPOINTS.BRANDS.LIST);
      
      set({
        brands: response.data,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch brands',
      });
    }
  },

  setFilters: (filters: ProductFilters) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }));
    
    // Automatically fetch products with new filters
    get().fetchProducts(get().filters, true);
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchProducts({}, true);
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));