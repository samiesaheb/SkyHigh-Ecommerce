"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, Package, Tag, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchEngine, AutocompleteResult } from '@/lib/search';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showRecentSearches?: boolean;
  compact?: boolean;
}

export default function SearchBar({
  placeholder = "Search products, brands, or categories...",
  defaultValue = "",
  onSearch,
  className = "",
  showRecentSearches = true,
  compact = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<AutocompleteResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced autocomplete function
  const debouncedGetSuggestions = useCallback(
    searchEngine.debounce(async (searchQuery: string) => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        setIsLoading(true);
        try {
          const result = await searchEngine.getAutocompleteSuggestions(searchQuery);
          setSuggestions(result);
        } catch (error) {
          console.error('Autocomplete failed:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions(null);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    debouncedGetSuggestions(value);
  };

  // Handle search submission
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    setIsOpen(false);
    if (onSearch) {
      onSearch(finalQuery);
    } else {
      router.push(`/products?search=${encodeURIComponent(finalQuery)}`);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AutocompleteResult['suggestions'][0]) => {
    setQuery(suggestion.text);
    setIsOpen(false);

    if (suggestion.type === 'product' && suggestion.metadata?.slug) {
      // Navigate directly to the product page
      router.push(`/products/${suggestion.metadata.slug}`);
    } else if (suggestion.type === 'category') {
      router.push(`/products?category=${encodeURIComponent(suggestion.text)}`);
    } else if (suggestion.type === 'brand') {
      router.push(`/products?brand=${encodeURIComponent(suggestion.text)}`);
    } else {
      handleSearch(suggestion.text);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions || !isOpen) return;

    const allSuggestions = suggestions.suggestions;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev =>
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev =>
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && allSuggestions[activeIndex]) {
          handleSuggestionSelect(allSuggestions[activeIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    if (!suggestions && showRecentSearches) {
      debouncedGetSuggestions('');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setActiveIndex(-1);
    setSuggestions(null);
    inputRef.current?.focus();
  };

  // Get suggestion icon
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="w-4 h-4" />;
      case 'category': return <Tag className="w-4 h-4" />;
      case 'brand': return <Building className="w-4 h-4" />;
      case 'query': return <Clock className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  // Get suggestion label
  const getSuggestionLabel = (type: string) => {
    switch (type) {
      case 'product': return 'Product';
      case 'category': return 'Category';
      case 'brand': return 'Brand';
      case 'query': return 'Recent';
      default: return '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>

        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className={`pl-10 pr-20 ${compact ? 'h-10' : 'h-12'} bg-background border-border focus:ring-2 focus:ring-primary/20`}
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-8 w-8 p-0 mr-1"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => handleSearch()}
            className={`mr-1 ${compact ? 'h-8 px-3' : 'h-10 px-4'}`}
            disabled={!query.trim()}
          >
            <Search className="h-4 w-4" />
            {!compact && <span className="ml-2 hidden sm:inline">Search</span>}
          </Button>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {isLoading && (
            <div className="p-4 text-center text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            </div>
          )}

          {!isLoading && suggestions.suggestions.length === 0 && query && (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No suggestions found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for products, brands, or categories</p>
            </div>
          )}

          {!isLoading && suggestions.suggestions.length === 0 && !query && showRecentSearches && (
            <div className="p-4 text-center text-muted-foreground">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Start typing to see suggestions</p>
              <p className="text-xs mt-1">Search for products, brands, or categories</p>
            </div>
          )}

          {!isLoading && suggestions.suggestions.length > 0 && (
            <div className="py-2">
              {/* Search History / Popular Searches Header */}
              {!query && (
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                  {showRecentSearches ? 'Recent & Popular Searches' : 'Popular Searches'}
                </div>
              )}

              {/* Suggestions List */}
              {suggestions.suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}-${index}`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none transition-colors ${
                    index === activeIndex ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">
                      {getSuggestionIcon(suggestion.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {suggestion.text}
                        </span>
                        {suggestion.type !== 'query' && (
                          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                            {getSuggestionLabel(suggestion.type)}
                          </span>
                        )}
                      </div>
                      {suggestion.count && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {suggestion.count} items
                        </div>
                      )}
                    </div>

                    {suggestion.image && (
                      <div className="w-8 h-8 rounded bg-muted flex-shrink-0">
                        <img
                          src={suggestion.image}
                          alt=""
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* Clear History Option */}
              {!query && showRecentSearches && suggestions.suggestions.some(s => s.type === 'query') && (
                <div className="border-t border-border mt-2 pt-2">
                  <button
                    onClick={() => {
                      searchEngine.clearSearchHistory();
                      debouncedGetSuggestions('');
                    }}
                    className="w-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear search history
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}