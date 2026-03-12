// Advanced cache utilities for client-side caching

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
  etag?: string;
  priority?: number; // Higher number = higher priority
}

interface CacheOptions {
  ttl?: number; // TTL in minutes
  tags?: string[];
  priority?: number;
  staleWhileRevalidate?: boolean;
}

class Cache {
  private storage: Map<string, CacheItem<unknown>> = new Map();
  private maxSize: number = 500; // Increased for better performance
  private hitCount: number = 0;
  private missCount: number = 0;

  set<T>(key: string, data: T, options: CacheOptions | number = 5): void {
    // Handle backward compatibility
    const opts: CacheOptions = typeof options === 'number'
      ? { ttl: options }
      : options;

    const { ttl = 5, tags = [], priority = 0 } = opts;

    // Clear space if needed using intelligent eviction
    if (this.storage.size >= this.maxSize) {
      this.evictLeastUseful();
    }

    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 60 * 1000, // Convert to milliseconds
      tags,
      priority,
    });
  }

  // Intelligent cache eviction based on priority and access frequency
  private evictLeastUseful(): void {
    const entries = Array.from(this.storage.entries());

    // Sort by priority (desc) and timestamp (asc) - remove lowest priority, oldest first
    entries.sort(([, a], [, b]) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    // Remove bottom 10% of entries
    const toRemove = Math.max(1, Math.floor(entries.length * 0.1));
    for (let i = entries.length - toRemove; i < entries.length; i++) {
      this.storage.delete(entries[i][0]);
    }
  }

  get<T>(key: string, options?: { staleWhileRevalidate?: boolean }): T | null {
    const item = this.storage.get(key);

    if (!item) {
      this.missCount++;
      return null;
    }

    const isExpired = Date.now() - item.timestamp > item.ttl;
    const isStale = Date.now() - item.timestamp > item.ttl * 0.8; // 80% of TTL

    if (isExpired) {
      if (options?.staleWhileRevalidate && !isStale) {
        this.hitCount++;
        return item.data; // Return stale data
      }
      this.storage.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return item.data;
  }

  // Get cache hit ratio for monitoring
  getHitRatio(): number {
    const total = this.hitCount + this.missCount;
    return total > 0 ? this.hitCount / total : 0;
  }

  // Invalidate cache entries by tags
  invalidateByTags(tags: string[]): void {
    for (const [key, item] of this.storage.entries()) {
      if (item.tags && item.tags.some(tag => tags.includes(tag))) {
        this.storage.delete(key);
      }
    }
  }

  // Preload critical data
  async preload<T>(entries: Array<{ key: string; fetcher: () => Promise<T>; options?: CacheOptions }>): Promise<void> {
    const promises = entries.map(async ({ key, fetcher, options }) => {
      try {
        if (!this.has(key)) {
          const data = await fetcher();
          this.set(key, data, { ...options, priority: 10 }); // High priority for preloaded data
        }
      } catch (error) {
        console.warn(`Failed to preload cache key ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  // Clean up expired entries
  cleanup(): void {
    for (const [key, item] of this.storage.entries()) {
      const isExpired = Date.now() - item.timestamp > item.ttl;
      if (isExpired) {
        this.storage.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.storage.size,
      maxSize: this.maxSize,
      hitRatio: this.getHitRatio(),
      hitCount: this.hitCount,
      missCount: this.missCount,
      keys: Array.from(this.storage.keys()),
    };
  }
}

// Global cache instance
export const cache = new Cache();

// Cache keys generator
export const cacheKeys = {
  products: (params?: Record<string, unknown>) =>
    `products_${params ? JSON.stringify(params) : 'all'}`,
  product: (id: string | number) => `product_${id}`,
  user: () => 'user_profile',
  cart: () => 'cart_items',
  wishlist: () => 'wishlist_items',
  brands: () => 'brands_list',
  search: (query: string) => `search_${query}`,
};

// Cache with localStorage backup for persistence
export class PersistentCache extends Cache {
  private storageKey: string;

  constructor(storageKey: string = 'app_cache') {
    super();
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return; // Skip localStorage operations on server
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Restore valid cache items
        for (const [key, item] of Object.entries(data)) {
          const cacheItem = item as CacheItem<unknown>;
          const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;
          if (!isExpired) {
            this.storage.set(key, cacheItem);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  private saveToStorage(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return; // Skip localStorage operations on server
    }
    
    try {
      const data = Object.fromEntries(this.storage.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    super.set(key, data, ttlMinutes);
    this.saveToStorage();
  }

  delete(key: string): void {
    super.delete(key);
    this.saveToStorage();
  }

  clear(): void {
    super.clear();
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
}

// Create persistent cache instance for important data
export const persistentCache = new PersistentCache();

// Helper functions for common caching patterns
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMinutes: number = 5,
  persistent: boolean = false
): Promise<T> {
  const cacheInstance = persistent ? persistentCache : cache;
  
  // Try to get from cache first
  const cached = cacheInstance.get<T>(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  // If not in cache, fetch and cache the result
  return fetcher().then((data) => {
    cacheInstance.set(key, data, ttlMinutes);
    return data;
  });
}

// Enhanced cache invalidation helpers
export function invalidateCache(pattern: string): void {
  const keys = Array.from(cache.storage.keys()).filter(key =>
    key.includes(pattern)
  );
  keys.forEach(key => cache.delete(key));

  // Also invalidate persistent cache
  const persistentKeys = Array.from(persistentCache.storage.keys()).filter(key =>
    key.includes(pattern)
  );
  persistentKeys.forEach(key => persistentCache.delete(key));
}

// Advanced HTTP cache with etags and conditional requests
export class HTTPCache {
  private etags = new Map<string, string>();
  private lastModified = new Map<string, string>();

  async fetch<T>(
    url: string,
    options: RequestInit & {
      cacheOptions?: CacheOptions;
      useCache?: boolean;
    } = {}
  ): Promise<T> {
    const { cacheOptions = {}, useCache = true, ...fetchOptions } = options;
    const cacheKey = this.getCacheKey(url, fetchOptions);

    // Try cache first if enabled
    if (useCache) {
      const cached = cache.get<T>(cacheKey, { staleWhileRevalidate: cacheOptions.staleWhileRevalidate });
      if (cached && !cacheOptions.staleWhileRevalidate) {
        return cached;
      }
    }

    try {
      // Prepare conditional headers
      const headers = new Headers(fetchOptions.headers);

      const etag = this.etags.get(url);
      if (etag) {
        headers.set('If-None-Match', etag);
      }

      const lastMod = this.lastModified.get(url);
      if (lastMod) {
        headers.set('If-Modified-Since', lastMod);
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Handle 304 Not Modified
      if (response.status === 304) {
        const cached = cache.get<T>(cacheKey);
        if (cached) return cached;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update ETags and Last-Modified
      const newEtag = response.headers.get('etag');
      if (newEtag) {
        this.etags.set(url, newEtag);
      }

      const newLastModified = response.headers.get('last-modified');
      if (newLastModified) {
        this.lastModified.set(url, newLastModified);
      }

      const data = await response.json();

      // Cache the response
      if (useCache) {
        cache.set(cacheKey, data, cacheOptions);
      }

      return data;
    } catch (error) {
      // Return stale data on network error if available
      const cached = cache.get<T>(cacheKey, { staleWhileRevalidate: true });
      if (cached) {
        console.warn('Network error, returning stale data:', error);
        return cached;
      }
      throw error;
    }
  }

  private getCacheKey(url: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `http_${method}_${url}_${body}`;
  }
}

// Global HTTP cache instance
export const httpCache = new HTTPCache();

// Cache warming strategies
export const CacheWarmer = {
  // Warm critical data on app start
  async warmCriticalData(): Promise<void> {
    await cache.preload([
      {
        key: cacheKeys.brands(),
        fetcher: () => httpCache.fetch('/api/v1/brands/'),
        options: { ttl: 30, priority: 10, tags: ['brands'] }
      },
      {
        key: cacheKeys.products({ featured: true }),
        fetcher: () => httpCache.fetch('/api/v1/products/?featured=true'),
        options: { ttl: 15, priority: 9, tags: ['products', 'featured'] }
      }
    ]);
  },

  // Warm user-specific data after login
  async warmUserData(userId: string): Promise<void> {
    await cache.preload([
      {
        key: cacheKeys.cart(),
        fetcher: () => httpCache.fetch('/api/v1/cart/'),
        options: { ttl: 5, priority: 8, tags: ['cart', 'user'] }
      },
      {
        key: cacheKeys.wishlist(),
        fetcher: () => httpCache.fetch('/api/v1/wishlist/'),
        options: { ttl: 10, priority: 7, tags: ['wishlist', 'user'] }
      }
    ]);
  },

  // Prefetch related products
  async prefetchRelated(productId: string): Promise<void> {
    await cache.preload([
      {
        key: `related_${productId}`,
        fetcher: () => httpCache.fetch(`/api/v1/products/${productId}/related/`),
        options: { ttl: 20, priority: 5, tags: ['products', 'related'] }
      }
    ]);
  }
};

// Cache invalidation by domain
export const CacheInvalidation = {
  // Invalidate all product-related caches
  products: () => {
    cache.invalidateByTags(['products', 'featured', 'related']);
    invalidateCache('product');
  },

  // Invalidate user-related caches
  user: () => {
    cache.invalidateByTags(['user', 'cart', 'wishlist', 'orders']);
    invalidateCache('user');
  },

  // Invalidate cart-related caches
  cart: () => {
    cache.invalidateByTags(['cart']);
    invalidateCache('cart');
  },

  // Invalidate brand-related caches
  brands: () => {
    cache.invalidateByTags(['brands']);
    invalidateCache('brand');
  },

  // Clear all caches
  all: () => {
    cache.clear();
    persistentCache.clear();
  }
};

// Performance monitoring
export const CacheMetrics = {
  getStats() {
    return {
      hitRatio: cache.getHitRatio(),
      cacheSize: cache.storage.size,
      persistentCacheSize: persistentCache.storage.size,
      ...cache.getStats(),
    };
  },

  logStats() {
    const stats = this.getStats();
    console.log('Cache Performance:', {
      hitRatio: `${(stats.hitRatio * 100).toFixed(2)}%`,
      totalEntries: stats.cacheSize + stats.persistentCacheSize,
      memoryCache: stats.cacheSize,
      persistentCache: stats.persistentCacheSize,
    });
  }
};

// Auto-cleanup and monitoring
if (typeof window !== 'undefined') {
  // Warm critical data on page load
  window.addEventListener('DOMContentLoaded', () => {
    CacheWarmer.warmCriticalData().catch(console.warn);
  });

  // Log cache stats periodically in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      CacheMetrics.logStats();
    }, 30000); // Every 30 seconds
  }

  // Cleanup on visibility change (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cache.cleanup();
      persistentCache.cleanup();
    }
  });
}