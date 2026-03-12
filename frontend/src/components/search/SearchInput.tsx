"use client";

import { forwardRef } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
  isLoading: boolean;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onKeyDown, onSubmit, onClear, isLoading }, ref) => {
    return (
      <form onSubmit={onSubmit} className="relative">
        <div className="relative">
          {/* Main input container - with explicit border and outline removal */}
          <div className="relative bg-white rounded-full shadow-sm hover:shadow-md focus-within:shadow-md transition-all duration-300 border-0 outline-none" style={{ border: 'none', outline: 'none' }}>
            <input
              type="text"
              ref={ref}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search products, brands, or categories..."
              className="w-full px-12 py-4 text-base text-foreground placeholder-muted-foreground bg-transparent rounded-full focus:outline-none transition-all duration-200 border-0"
              style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              aria-label="Search products, brands, and categories"
              autoComplete="off"
              spellCheck="false"
            />
            
            {/* Search icon */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400">
              <Search className="w-5 h-5" />
            </div>
            
            {/* Clear button */}
            {value && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors duration-200 rounded-full hover:bg-neutral-50"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit search"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></div>
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </form>
    );
  }
);

SearchInput.displayName = "SearchInput";
export default SearchInput;