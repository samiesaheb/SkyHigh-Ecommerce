import { API_CONFIG } from "./config";
import { getCookie } from "./utils";
// Temporarily disable cache imports
// import { cache, withCache } from "./cache";

interface FetchWithSessionOptions extends RequestInit {
  cache?: boolean;
  cacheTTL?: number; // in minutes
  cacheKey?: string;
}

export const fetchWithSession = (
  input: string,
  init: FetchWithSessionOptions = {}
) => {
  const url = input.startsWith("http") ? input : `${API_CONFIG.BASE_URL}${input}`;
  const method = (init.method || "GET").toUpperCase();
  const csrfToken = getCookie("csrftoken");

  const headers: HeadersInit = {
    ...(init.headers || {}),
  };

  // Add caching headers for better performance
  if (method === "GET") {
    headers["Cache-Control"] = "public, max-age=300"; // 5 minutes default cache
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers["Content-Type"] = "application/json";
    headers["X-CSRFToken"] = csrfToken || "";
  }

  const { cache: useCache, cacheTTL, cacheKey, ...fetchInit } = init;

  const fetchFn = () => fetch(url, {
    ...fetchInit,
    method,
    headers,
    credentials: "include",
  });

  // Temporarily disable caching to debug issues
  // if (method === "GET" && useCache && typeof window !== 'undefined') {
  //   const key = cacheKey || `${method}_${url}`;
  //   return withCache(key, fetchFn, cacheTTL || 5);
  // }

  return fetchFn();
};

// Cached JSON fetch helper
export const fetchJSON = async <T = any>(
  input: string,
  init: FetchWithSessionOptions = {}
): Promise<T> => {
  const response = await fetchWithSession(input, init);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Cached fetch with automatic retry
export const fetchWithRetry = async (
  input: string,
  init: FetchWithSessionOptions = {},
  maxRetries: number = 3
): Promise<Response> => {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetchWithSession(input, init);
      
      // If it's a server error (5xx), retry
      if (response.status >= 500 && i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000)); // Exponential backoff
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000)); // Exponential backoff
        continue;
      }
    }
  }
  
  throw lastError!;
};

// Temporarily disable cache invalidation
// export const invalidateCacheForMutation = (url: string, method: string) => {
//   if (["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
//     // Clear related cache entries
//     const cachePattern = url.split('/').slice(0, -1).join('/'); // Remove last segment for broader invalidation
//     cache.clear(); // For now, clear all cache. In production, you might want more granular invalidation
//   }
// };
