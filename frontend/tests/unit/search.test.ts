import {
  searchEngine,
  SearchFilters,
  parseUrlFilters,
  formatPrice,
  highlightSearchTerm,
  generateFilterUrl
} from '@/lib/search';
import { httpCache } from '@/lib/cache';

// Mock fetch for testing
global.fetch = jest.fn();

// Mock cache module
jest.mock('@/lib/cache', () => ({
  httpCache: {
    fetch: jest.fn(),
  },
}));

describe('Search Engine', () => {
  const mockHttpCache = httpCache as jest.Mocked<typeof httpCache>;

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  describe('search functionality', () => {
    const mockProducts = [
      {
        id: 1,
        name: 'Test Product 1',
        slug: 'test-product-1',
        price: '29.99',
        main_image: '/test1.jpg',
        brand: { name: 'Test Brand' },
        category: { name: 'Test Category' },
        description: 'Test description',
        average_rating: 4.5,
        in_stock: true,
      },
      {
        id: 2,
        name: 'Test Product 2',
        slug: 'test-product-2',
        price: '39.99',
        main_image: '/test2.jpg',
        brand: { name: 'Test Brand 2' },
        category: { name: 'Test Category 2' },
        description: 'Another test description',
        average_rating: 3.8,
        in_stock: false,
      },
    ];

    it('should perform search and return transformed results', async () => {
      mockHttpCache.fetch.mockResolvedValueOnce({
        results: mockProducts,
        count: 2,
        next: null,
        previous: null,
      });

      const result = await searchEngine.search({ query: 'test' });

      expect(result.results).toHaveLength(2);
      expect(result.results[0]).toMatchObject({
        id: '1',
        name: 'Test Product 1',
        slug: 'test-product-1',
        price: 29.99,
        image: '/test1.jpg',
        brand: 'Test Brand',
        category: 'Test Category',
        rating: 4.5,
        inStock: true,
      });
      expect(result.totalCount).toBe(2);
    });

    it('should handle search errors gracefully', async () => {
      mockHttpCache.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await searchEngine.search({ query: 'test' });

      expect(result.results).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should apply local filters correctly', () => {
      const testResults = [
        {
          id: '1',
          name: 'Product 1',
          price: 25.99,
          rating: 4.5,
          inStock: true,
          slug: 'product-1',
          description: '',
          image: '',
          brand: '',
          category: '',
          tags: [],
        },
        {
          id: '2',
          name: 'Product 2',
          price: 45.99,
          rating: 3.2,
          inStock: false,
          slug: 'product-2',
          description: '',
          image: '',
          brand: '',
          category: '',
          tags: [],
        },
      ];

      // Test price filtering
      const priceFiltered = searchEngine.applyLocalFilters(testResults, {
        minPrice: 30,
        maxPrice: 50,
      });
      expect(priceFiltered).toHaveLength(1);
      expect(priceFiltered[0].price).toBe(45.99);

      // Test stock filtering
      const stockFiltered = searchEngine.applyLocalFilters(testResults, {
        inStock: true,
      });
      expect(stockFiltered).toHaveLength(1);
      expect(stockFiltered[0].inStock).toBe(true);

      // Test rating filtering
      const ratingFiltered = searchEngine.applyLocalFilters(testResults, {
        rating: 4,
      });
      expect(ratingFiltered).toHaveLength(1);
      expect(ratingFiltered[0].rating).toBe(4.5);
    });
  });

  describe('autocomplete functionality', () => {
    it('should fetch and return search suggestions', async () => {
      const mockSuggestions = [
        {
          name: 'Geometry Whitening Facial Foam',
          slug: 'geometry-whitening-facial-foam',
          main_image: '/geometry.jpg',
          brand: { name: 'Geometry' },
          price: '25.99',
        },
      ];

      mockHttpCache.fetch.mockResolvedValueOnce({
        results: mockSuggestions,
      });

      const result = await searchEngine.getAutocompleteSuggestions('geometry');

      expect(result.query).toBe('geometry');
      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0]).toMatchObject({
        text: 'Geometry Whitening Facial Foam',
        type: 'product',
        metadata: {
          slug: 'geometry-whitening-facial-foam',
          brand: 'Geometry',
          price: '25.99',
        },
      });
    });

    it('should handle empty query', async () => {
      const result = await searchEngine.getAutocompleteSuggestions('');

      expect(result.query).toBe('');
      expect(result.suggestions).toBeDefined();
    });

    it('should handle API errors for suggestions', async () => {
      mockHttpCache.fetch.mockRejectedValueOnce(new Error('API error'));

      const result = await searchEngine.getAutocompleteSuggestions('test');

      expect(result.query).toBe('test');
      expect(result.suggestions).toBeDefined();
    });
  });

  describe('search history', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
    });

    it('should manage search history', () => {
      const history = searchEngine.getSearchHistory();
      expect(Array.isArray(history)).toBe(true);

      searchEngine.clearSearchHistory();
      expect(localStorage.removeItem).toHaveBeenCalledWith('search_history');
    });
  });
});

describe('Utility Functions', () => {
  describe('parseUrlFilters', () => {
    it('should parse URL search parameters correctly', () => {
      const params = new URLSearchParams('q=test&category=electronics&min_price=10&max_price=100');
      const filters = parseUrlFilters(params);

      expect(filters).toEqual({
        query: 'test',
        category: 'electronics',
        brand: undefined,
        minPrice: 10,
        maxPrice: 100,
        inStock: undefined,
        rating: undefined,
        sortBy: 'relevance',
        page: 1,
        limit: 20,
      });
    });

    it('should handle empty parameters', () => {
      const params = new URLSearchParams('');
      const filters = parseUrlFilters(params);

      expect(filters.query).toBeUndefined();
      expect(filters.page).toBe(1);
      expect(filters.limit).toBe(20);
      expect(filters.sortBy).toBe('relevance');
    });
  });

  describe('generateFilterUrl', () => {
    it('should generate correct filter URL', () => {
      const filters: SearchFilters = {
        query: 'test',
        category: 'electronics',
        minPrice: 10,
        maxPrice: 100,
      };

      const url = generateFilterUrl(filters);
      expect(url).toContain('/products?');
      expect(url).toContain('query=test');
      expect(url).toContain('category=electronics');
      expect(url).toContain('minPrice=10');
      expect(url).toContain('maxPrice=100');
    });
  });

  describe('formatPrice', () => {
    it('should format price in Thai Baht', () => {
      const formatted = formatPrice(29.99);
      expect(formatted).toContain('฿');
      expect(formatted).toContain('29.99');
    });

    it('should handle zero price', () => {
      const formatted = formatPrice(0);
      expect(formatted).toContain('฿');
      expect(formatted).toContain('0');
    });
  });

  describe('highlightSearchTerm', () => {
    it('should highlight search terms', () => {
      const highlighted = highlightSearchTerm('This is a test product', 'test');
      expect(highlighted).toContain('<mark');
      expect(highlighted).toContain('test');
      expect(highlighted).toContain('</mark>');
    });

    it('should handle empty search term', () => {
      const text = 'This is a test product';
      const highlighted = highlightSearchTerm(text, '');
      expect(highlighted).toBe(text);
    });

    it('should be case insensitive', () => {
      const highlighted = highlightSearchTerm('This is a Test product', 'test');
      expect(highlighted).toContain('<mark');
      expect(highlighted).toContain('Test');
    });
  });

  describe('debounce functionality', () => {
    it('should debounce function calls', (done) => {
      const mockFn = jest.fn();
      const debounced = searchEngine.debounce(mockFn, 100);

      debounced('arg1');
      debounced('arg2');
      debounced('arg3');

      // Should not be called immediately
      expect(mockFn).not.toHaveBeenCalled();

      setTimeout(() => {
        // Should be called only once with the last arguments
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('arg3');
        done();
      }, 150);
    });
  });
});