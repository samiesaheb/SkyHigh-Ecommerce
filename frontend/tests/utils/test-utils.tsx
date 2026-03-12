import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test data factories
export const createMockProduct = (overrides = {}) => ({
  id: 1,
  name: 'Test Product',
  slug: 'test-product',
  description: 'A test product description',
  price: '29.99',
  main_image: '/test-image.jpg',
  brand: { name: 'Test Brand' },
  category: { name: 'Test Category' },
  inventory_count: 10,
  is_active: true,
  ...overrides,
});

export const createMockSearchResult = (overrides = {}) => ({
  results: [createMockProduct()],
  count: 1,
  next: null,
  previous: null,
  ...overrides,
});

export const createMockApiResponse = (data: any, options = {}) => ({
  ok: true,
  json: () => Promise.resolve(data),
  status: 200,
  statusText: 'OK',
  ...options,
});

// Mock fetch response helper
export const mockFetchSuccess = (data: any) => {
  (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
    createMockApiResponse(data) as Response
  );
};

export const mockFetchError = (status = 500, statusText = 'Internal Server Error') => {
  (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
    ok: false,
    status,
    statusText,
    json: () => Promise.resolve({ error: statusText }),
  } as Response);
};

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock localStorage
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  return localStorageMock;
};

// Mock sessionStorage
export const mockSessionStorage = () => {
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });

  return sessionStorageMock;
};

// Test environment helpers
export const setupTestEnvironment = () => {
  // Clear all mocks
  jest.clearAllMocks();

  // Mock fetch
  global.fetch = jest.fn();

  // Mock storage
  const localStorage = mockLocalStorage();
  const sessionStorage = mockSessionStorage();

  return {
    localStorage,
    sessionStorage,
  };
};

// Custom matchers for better assertions
export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toHaveTextContent(text);
};

export const expectElementToBeVisible = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};