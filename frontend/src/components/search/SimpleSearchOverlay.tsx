"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleSearchOverlayProps {
  onError?: (error: string) => void;
}

export default function SimpleSearchOverlay({ onError }: SimpleSearchOverlayProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-md hover:bg-muted/20 transition-colors"
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 transition-all duration-300" />

      {/* Search Modal */}
      <div
        ref={overlayRef}
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300"
      >
        <div className="bg-background rounded-lg border shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="flex items-center p-4">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-muted/20 rounded ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-1 ml-3 text-xs text-muted-foreground">
              <kbd className="px-2 py-1 bg-muted/20 rounded border">Esc</kbd>
              <span>to close</span>
            </div>
          </form>

          {searchTerm && (
            <div className="border-t p-4 text-sm text-muted-foreground">
              Press Enter to search for "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </>
  );
}