import { fetchWithSession } from '@/lib/fetchWithSession'
import { getCookie } from '@/lib/utils'

// Mock the getCookie function
jest.mock('@/lib/utils', () => ({
  getCookie: jest.fn(),
}))

// Mock the API_CONFIG
jest.mock('@/lib/config', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:8000/api',
  },
}))

describe('fetchWithSession', () => {
  const mockGetCookie = getCookie as jest.MockedFunction<typeof getCookie>
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    mockFetch.mockClear()
    mockGetCookie.mockClear()
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
      text: async () => 'success',
    } as Response)
  })

  it('makes GET requests with correct URL and headers', async () => {
    mockGetCookie.mockReturnValue('csrf-token-123')

    await fetchWithSession('/products/')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/products/',
      {
        method: 'GET',
        headers: {},
        credentials: 'include',
      }
    )
  })

  it('handles absolute URLs correctly', async () => {
    await fetchWithSession('https://external-api.com/data')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://external-api.com/data',
      {
        method: 'GET',
        headers: {},
        credentials: 'include',
      }
    )
  })

  it('adds CSRF token for POST requests', async () => {
    mockGetCookie.mockReturnValue('csrf-token-456')

    await fetchWithSession('/products/', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Product' }),
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/products/',
      {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Product' }),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': 'csrf-token-456',
        },
        credentials: 'include',
      }
    )
  })

  it('adds CSRF token for PUT requests', async () => {
    mockGetCookie.mockReturnValue('csrf-token-789')

    await fetchWithSession('/products/1/', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated Product' }),
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/products/1/',
      {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Product' }),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': 'csrf-token-789',
        },
        credentials: 'include',
      }
    )
  })

  it('adds CSRF token for PATCH requests', async () => {
    mockGetCookie.mockReturnValue('csrf-token-patch')

    await fetchWithSession('/products/1/', {
      method: 'PATCH',
      body: JSON.stringify({ price: 299.99 }),
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/products/1/',
      {
        method: 'PATCH',
        body: JSON.stringify({ price: 299.99 }),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': 'csrf-token-patch',
        },
        credentials: 'include',
      }
    )
  })

  it('adds CSRF token for DELETE requests', async () => {
    mockGetCookie.mockReturnValue('csrf-token-delete')

    await fetchWithSession('/products/1/', {
      method: 'DELETE',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/products/1/',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': 'csrf-token-delete',
        },
        credentials: 'include',
      }
    )
  })

  it('handles missing CSRF token gracefully', async () => {
    mockGetCookie.mockReturnValue(null)

    await fetchWithSession('/products/', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Product' }),
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/products/',
      {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Product' }),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': '',
        },
        credentials: 'include',
      }
    )
  })

  it('preserves existing headers', async () => {
    mockGetCookie.mockReturnValue('csrf-token-123')

    await fetchWithSession('/products/', {
      method: 'POST',
      headers: {
        'Custom-Header': 'custom-value',
        'Authorization': 'Bearer token',
      },
      body: JSON.stringify({ name: 'Test Product' }),
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/products/',
      {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Product' }),
        headers: {
          'Custom-Header': 'custom-value',
          'Authorization': 'Bearer token',
          'Content-Type': 'application/json',
          'X-CSRFToken': 'csrf-token-123',
        },
        credentials: 'include',
      }
    )
  })

  it('handles case insensitive method names', async () => {
    mockGetCookie.mockReturnValue('csrf-token-123')

    await fetchWithSession('/products/', {
      method: 'post' as RequestInit['method'],
      body: JSON.stringify({ name: 'Test Product' }),
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/products/',
      {
        method: 'post',
        body: JSON.stringify({ name: 'Test Product' }),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': 'csrf-token-123',
        },
        credentials: 'include',
      }
    )
  })
})