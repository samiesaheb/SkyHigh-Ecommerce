"use client";

import { Search } from "lucide-react";

interface SearchButtonProps {
  onClick: () => void;
}

export default function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-3 w-11 h-11 sm:w-12 sm:h-12 rounded-lg text-neutral-600
        hover:text-neutral-900 transition-all duration-200
        group touch-manipulation"
      aria-label="Open search (⌘K)"
      title="Search (⌘K)"
    >
      <Search className="w-5 h-5 transition-transform duration-200" />
    </button>
  );
}