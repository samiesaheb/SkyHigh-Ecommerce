import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';
import { OptimizedImage } from '@/components/common';
import { formatPrice, truncateText } from '@/utils';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '@/constants';

interface SearchSuggestion extends Product {
  type: 'product';
}

interface SearchQuery {
  id: string;
  query: string;
  type: 'query';
}

type SuggestionItem = SearchSuggestion | SearchQuery;

interface SearchSuggestionsProps {
  suggestions: Product[];
  recentQueries?: string[];
  isVisible: boolean;
  onSelectProduct: (product: Product) => void;
  onSelectQuery: (query: string) => void;
  onClearRecentQueries?: () => void;
  style?: any;
}

const SearchSuggestionItem: React.FC<{
  item: SuggestionItem;
  onSelectProduct: (product: Product) => void;
  onSelectQuery: (query: string) => void;
}> = memo(({ item, onSelectProduct, onSelectQuery }) => {
  if (item.type === 'product') {
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => onSelectProduct(item)}
      >
        <OptimizedImage
          source={item.main_image}
          style={styles.productImage}
          contentFit="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{item.brand.name}</Text>
          <Text style={styles.productName}>
            {truncateText(item.name, 40)}
          </Text>
          <Text style={styles.productPrice}>
            {formatPrice(item.price)}
          </Text>
        </View>
        <Ionicons 
          name="arrow-forward" 
          size={16} 
          color={COLORS.TEXT.SECONDARY} 
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.queryItem}
      onPress={() => onSelectQuery(item.query)}
    >
      <Ionicons 
        name="time-outline" 
        size={16} 
        color={COLORS.TEXT.SECONDARY}
        style={styles.queryIcon}
      />
      <Text style={styles.queryText}>{item.query}</Text>
      <Ionicons 
        name="arrow-up-outline" 
        size={16} 
        color={COLORS.TEXT.SECONDARY} 
      />
    </TouchableOpacity>
  );
});

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = memo(({
  suggestions,
  recentQueries = [],
  isVisible,
  onSelectProduct,
  onSelectQuery,
  onClearRecentQueries,
  style,
}) => {
  // Combine recent queries and product suggestions
  const allSuggestions: SuggestionItem[] = [
    ...recentQueries.map((query, index) => ({
      id: `query_${index}`,
      query,
      type: 'query' as const,
    })),
    ...suggestions.map(product => ({
      ...product,
      type: 'product' as const,
    })),
  ];

  const renderItem: ListRenderItem<SuggestionItem> = ({ item }) => (
    <SearchSuggestionItem
      item={item}
      onSelectProduct={onSelectProduct}
      onSelectQuery={onSelectQuery}
    />
  );

  const renderSectionHeader = () => {
    if (recentQueries.length > 0) {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {onClearRecentQueries && (
            <TouchableOpacity onPress={onClearRecentQueries}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return null;
  };

  const renderSeparator = () => <View style={styles.separator} />;

  if (!isVisible || allSuggestions.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={allSuggestions}
        renderItem={renderItem}
        keyExtractor={(item) => 
          item.type === 'product' ? `product_${item.id}` : item.id
        }
        ListHeaderComponent={renderSectionHeader}
        ItemSeparatorComponent={renderSeparator}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        maxToRenderPerBatch={10}
        initialNumToRender={8}
        getItemLayout={(_, index) => ({
          length: 70,
          offset: 70 * index,
          index,
        })}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: LAYOUT.CARD_RADIUS,
    marginTop: SPACING.XS,
    maxHeight: 300,
    elevation: 4,
    shadowColor: COLORS.TEXT.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT.SECONDARY,
  },
  clearButton: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minHeight: 60,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: SPACING.SM,
  },
  productInfo: {
    flex: 1,
  },
  productBrand: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT.SECONDARY,
    marginBottom: 2,
  },
  productName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT.PRIMARY,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  queryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    minHeight: 50,
  },
  queryIcon: {
    marginRight: SPACING.SM,
  },
  queryText: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    color: COLORS.TEXT.PRIMARY,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginHorizontal: SPACING.MD,
  },
});