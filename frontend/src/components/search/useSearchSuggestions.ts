"use client";
import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/lib/config";

interface ProductSuggestion {
  name: string;
  slug: string;
  main_image: string;
  brand?: string;
  price?: string;
  category?: string;
}

export function useSearchSuggestions(searchTerm: string, onError: (error: string) => void) {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() && searchTerm.length >= 2) { // Only search with 2+ characters
      setIsLoading(true);
      const debounceTimer = setTimeout(() => {
        const controller = new AbortController(); // Add abort controller for cleanup
        
        fetch(
          `${API_ENDPOINTS.PRODUCTS.LIST}?search=${encodeURIComponent(searchTerm)}&limit=8`,
          { signal: controller.signal }
        )
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch suggestions");
            return res.json();
          })
          .then((data: { results?: ProductSuggestion[] } | ProductSuggestion[]) => {
            // Handle products API response format
            const products = Array.isArray(data) ? data : (data.results || []);
            const transformedSuggestions = products.slice(0, 8).map((product) => ({
              name: product.name || '',
              slug: product.slug || '',
              main_image: product.main_image || '',
              brand: product.brand?.name || product.brand || '',
              price: product.price || '',
              category: product.category?.name || product.category || '',
            }));
            setSuggestions(transformedSuggestions);
            setIsLoading(false);
          })
          .catch((err) => {
            if (err.name !== 'AbortError') { // Don't log aborted requests
              console.error("Error fetching suggestions:", err);
              setSuggestions([]);
              setIsLoading(false);
              onError("Failed to load search suggestions");
            }
          });

        return () => controller.abort(); // Cleanup on component unmount
      }, 200); // Reduced debounce time for faster response

      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [searchTerm, onError]);

  return { suggestions, isLoading };
}