import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchBar } from './SearchBar';
import { SearchSuggestions } from './SearchSuggestions';
import { ProductCard, OptimizedFlatList, LoadingSpinner, ErrorMessage } from '@/components/common';
import { useProductsStore } from '@/stores';
import { Product } from '@/types';
import { COLORS, SPACING, STORAGE_KEYS } from '@/constants';
import { useDebounce } from '@/hooks';
import api from '@/services/api';

interface SearchScreenProps {
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = `${STORAGE_KEYS.USER_DATA}_recent_searches`;
const MAX_RECENT_SEARCHES = 5;

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onSelectProduct,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    searchResults,
    isSearching,
    error,
    searchProducts,
    clearSearch,
  } = useProductsStore();

  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.trim() && debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentQueries(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const saveRecentSearch = async (searchQuery: string) => {
    try {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;

      const updatedQueries = [
        trimmedQuery,
        ...recentQueries.filter(q => q !== trimmedQuery)
      ].slice(0, MAX_RECENT_SEARCHES);

      setRecentQueries(updatedQueries);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedQueries));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      setRecentQueries([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoadingSuggestions(true);
    
    try {
      const response = await api.get<Product[]>(
        `/api/products/search-suggestions/?query=${encodeURIComponent(searchQuery)}`
      );
      setSuggestions(response.data.slice(0, 6)); // Limit to 6 suggestions
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setShowSuggestions(false);
    Keyboard.dismiss();
    
    // Save to recent searches
    await saveRecentSearch(trimmedQuery);
    
    // Perform search
    await searchProducts(trimmedQuery);
  }, [searchProducts, recentQueries]);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    setShowSuggestions(text.length >= 2);
    
    if (!text.trim()) {
      clearSearch();
      setSuggestions([]);
    }
  }, [clearSearch]);

  const handleFocus = useCallback(() => {
    setShowSuggestions(query.length >= 2 || recentQueries.length > 0);
  }, [query.length, recentQueries.length]);

  const handleBlur = useCallback(() => {
    // Small delay to allow suggestion selection
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  const handleSelectProduct = useCallback((product: Product) => {
    setShowSuggestions(false);
    onSelectProduct(product);
  }, [onSelectProduct]);

  const handleSelectQuery = useCallback((selectedQuery: string) => {
    setQuery(selectedQuery);
    handleSearch(selectedQuery);
  }, [handleSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    clearSearch();
    setShowSuggestions(recentQueries.length > 0);
  }, [clearSearch, recentQueries.length]);

  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <ProductCard
        product={item}
        onPress={handleSelectProduct}
        showAddButton={false}
      />
    </View>
  ), [handleSelectProduct]);

  const shouldShowSuggestions = showSuggestions && (
    suggestions.length > 0 || 
    recentQueries.length > 0 || 
    isLoadingSuggestions
  );

  const hasSearchResults = searchResults.length > 0;
  const showNoResults = query.trim() && !isSearching && !hasSearchResults && !shouldShowSuggestions;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.SURFACE} />
      
      <View style={styles.header}>
        <SearchBar
          value={query}
          onChangeText={handleQueryChange}
          onSearch={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClear={handleClear}
          showCancelButton
          autoFocus
        />
      </View>

      <View style={styles.content}>
        {shouldShowSuggestions && (
          <SearchSuggestions
            suggestions={suggestions}
            recentQueries={query.length < 2 ? recentQueries : []}
            isVisible={shouldShowSuggestions}
            onSelectProduct={handleSelectProduct}
            onSelectQuery={handleSelectQuery}
            onClearRecentQueries={clearRecentSearches}
            style={styles.suggestions}
          />
        )}

        {isSearching && (
          <LoadingSpinner 
            text="Searching..." 
            style={styles.loading}
          />
        )}

        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => handleSearch(query)}
            style={styles.error}
          />
        )}

        {showNoResults && (
          <ErrorMessage
            message={`No results found for "${query}"`}
            style={styles.error}
          />
        )}

        {hasSearchResults && !shouldShowSuggestions && (
          <OptimizedFlatList
            data={searchResults}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            itemHeight={320}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
  },
  header: {
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: COLORS.SURFACE,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.MD,
  },
  suggestions: {
    marginTop: SPACING.SM,
  },
  loading: {
    marginTop: SPACING.XL,
  },
  error: {
    marginTop: SPACING.XL,
  },
  resultsList: {
    paddingVertical: SPACING.MD,
  },
  productItem: {
    marginBottom: SPACING.MD,
  },
});