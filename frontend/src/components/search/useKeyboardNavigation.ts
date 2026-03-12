"use client";

import { useState, useCallback } from "react";

export function useKeyboardNavigation(suggestionsLength: number) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestionsLength - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    }
  }, [suggestionsLength]);

  const resetHighlight = useCallback(() => {
    setHighlightedIndex(-1);
  }, []);

  return {
    highlightedIndex,
    handleKeyDown,
    resetHighlight
  };
}