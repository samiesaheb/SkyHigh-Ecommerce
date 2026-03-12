import { cn } from '@/lib/utils';
import { buildImageUrl, API_ENDPOINTS } from '@/lib/config';

describe('Utils', () => {
  describe('cn (classNames utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toContain('base-class');
      expect(result).toContain('additional-class');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
      expect(result).toContain('base-class');
      expect(result).toContain('conditional-class');
      expect(result).not.toContain('hidden-class');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'valid-class');
      expect(result).toContain('base-class');
      expect(result).toContain('valid-class');
    });

    it('should handle conflicting tailwind classes', () => {
      const result = cn('text-red-500', 'text-blue-500');
      // Should keep the last one when using tailwind-merge
      expect(result).toContain('text-blue-500');
      expect(result).not.toContain('text-red-500');
    });
  });

  describe('buildImageUrl', () => {
    beforeEach(() => {
      // Reset environment variables
      delete process.env.NEXT_PUBLIC_MEDIA_URL;
    });

    it('should return full URL if already absolute', () => {
      const fullUrl = 'https://example.com/image.jpg';
      const result = buildImageUrl(fullUrl);
      expect(result).toBe(fullUrl);
    });

    it('should build URL with MEDIA_URL from environment', () => {
      process.env.NEXT_PUBLIC_MEDIA_URL = 'https://cdn.example.com';
      const result = buildImageUrl('/uploads/image.jpg');
      expect(result).toBe('https://cdn.example.com/uploads/image.jpg');
    });

    it('should build URL with default MEDIA_URL', () => {
      const result = buildImageUrl('/uploads/image.jpg');
      expect(result).toBe('http://localhost:8000/media/uploads/image.jpg');
    });

    it('should handle images without leading slash', () => {
      const result = buildImageUrl('uploads/image.jpg');
      expect(result).toBe('http://localhost:8000/media/uploads/image.jpg');
    });

    it('should handle empty image path', () => {
      const result = buildImageUrl('');
      expect(result).toBe('http://localhost:8000/media/');
    });

    it('should handle data URLs', () => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
      const result = buildImageUrl(dataUrl);
      expect(result).toBe(dataUrl);
    });
  });
});

describe('API Endpoints', () => {
  it('should have all required endpoints defined', () => {
    expect(API_ENDPOINTS.PRODUCTS).toBeDefined();
    expect(API_ENDPOINTS.PRODUCTS.LIST).toBeDefined();
    expect(API_ENDPOINTS.PRODUCTS.DETAIL).toBeDefined();

    expect(API_ENDPOINTS.AUTH).toBeDefined();
    expect(API_ENDPOINTS.AUTH.LOGIN).toBeDefined();
    expect(API_ENDPOINTS.AUTH.LOGOUT).toBeDefined();
    expect(API_ENDPOINTS.AUTH.REGISTER).toBeDefined();

    expect(API_ENDPOINTS.CART).toBeDefined();
    expect(API_ENDPOINTS.ORDERS).toBeDefined();
  });

  it('should return correct endpoint URLs', () => {
    expect(API_ENDPOINTS.PRODUCTS.LIST).toBe('/api/v1/products/');
    expect(API_ENDPOINTS.PRODUCTS.DETAIL).toBe('/api/v1/products/');
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/api/v1/auth/login/');
    expect(API_ENDPOINTS.CART.LIST).toBe('/api/v1/cart/');
  });
});