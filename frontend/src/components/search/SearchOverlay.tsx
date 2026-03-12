"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchButton from "./SearchButton";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import { useSearchSuggestions } from "./useSearchSuggestions";
import { useKeyboardNavigation } from "./useKeyboardNavigation";

interface SearchOverlayProps {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  onError: (error: string) => void;
}

export default function SearchOverlay({
  searchOpen,
  setSearchOpen,
  onError
}: SearchOverlayProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const { suggestions, isLoading } = useSearchSuggestions(searchTerm, onError);
  const { highlightedIndex, handleKeyDown, resetHighlight } = useKeyboardNavigation(suggestions.length);

  // Prevent scrolling when search is open and add search-open class for blur effects
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('search-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('search-open');
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('search-open');
    };
  }, [searchOpen]);

  // Keyboard shortcut for opening search
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [setSearchOpen]);

  // Click outside and ESC handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
      // Focus input when overlay opens
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [searchOpen, setSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      const selected = suggestions[highlightedIndex];
      router.push(`/products/${selected.slug}`);
    } else if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
    setSearchOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit(e);
    } else {
      handleKeyDown(e);
    }
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    resetHighlight();
  };

  const handleClear = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleSelectItem = (slug: string) => {
    setSearchOpen(false);
    router.push(`/products/${slug}`);
  };

  if (!searchOpen) {
    return <SearchButton onClick={() => setSearchOpen(true)} />;
  }

  return (
    <>
      {/* Backdrop without blur - we handle blur with CSS */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-all duration-300"
        onClick={() => setSearchOpen(false)}
        data-search-overlay
      />
      
      <div
        ref={searchContainerRef}
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300"
        style={{ pointerEvents: "auto" }}
        data-search-overlay
      >
        <div className="relative">
          <SearchInput
            ref={inputRef}
            value={searchTerm}
            onChange={handleSearchTermChange}
            onKeyDown={handleInputKeyDown}
            onSubmit={handleSearchSubmit}
            onClear={handleClear}
            isLoading={isLoading}
          />
          
          {/* Results dropdown */}
          {suggestions.length > 0 && (
            <SearchResults
              suggestions={suggestions}
              highlightedIndex={highlightedIndex}
              searchTerm={searchTerm}
              onSelectItem={handleSelectItem}
              onError={onError}
            />
          )}
        </div>
      </div>
    </>
  );
}