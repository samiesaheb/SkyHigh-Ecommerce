import React, { useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../components/ui/Typography';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { useWishlistStore, useCartStore } from '../stores';
import { WishlistItem, Product } from '../types';
import { theme } from '../theme';
import { getImageUrl } from '../utils';

interface WishlistScreenProps {
  navigation: any;
}

const WishlistScreen: React.FC<WishlistScreenProps> = ({ navigation }) => {
  const {
    items,
    isLoading,
    error,
    fetchWishlist,
    removeFromWishlist,
    getWishlistCount,
    getTotalValue,
  } = useWishlistStore();
  
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  const handleRemoveItem = useCallback((productId: number) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromWishlist(productId)
        },
      ]
    );
  }, [removeFromWishlist]);

  const handleAddToCart = useCallback(async (product: Product) => {
    try {
      await addToCart(product.id);
      // Optionally remove from wishlist after adding to cart
      // await removeFromWishlist(product.id);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  }, [addToCart]);

  const renderWishlistItem = useCallback(({ item }: { item: WishlistItem }) => {
    const price = parseFloat(item.product.price || '0');
    const isDisplayOnly = price === 0;
    
    return (
      <View style={styles.itemCard}>
        <TouchableOpacity
          style={styles.itemContent}
          onPress={() => handleProductPress(item.product)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: getImageUrl(item.product.main_image) }}
            style={styles.productImage}
            resizeMode="cover"
          />
          
          <View style={styles.productInfo}>
            <Typography variant="caption" color="secondary" numberOfLines={1}>
              {item.product.brand.name}
            </Typography>
            <Typography variant="body" numberOfLines={2} style={styles.productName}>
              {item.product.name}
            </Typography>
            <Typography variant="caption" color="tertiary" style={styles.addedDate}>
              Added {new Date(item.added_at).toLocaleDateString()}
            </Typography>
            
            <View style={styles.priceRow}>
              <Typography variant="h3" style={styles.price}>
                {isDisplayOnly ? 'Display Only' : `฿${item.product.price}`}
              </Typography>
              
              {item.price_when_added && item.price_when_added !== item.product.price && (
                <Typography variant="caption" color="secondary" style={styles.oldPrice}>
                  was ฿{item.price_when_added}
                </Typography>
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.product.id)}
          >
            <Ionicons name="close" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          
          {!isDisplayOnly && (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(item.product)}
            >
              <Typography variant="caption" style={styles.addToCartText}>
                Add to Cart
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [handleProductPress, handleRemoveItem, handleAddToCart]);

  const EmptyWishlist = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="heart-outline" 
        size={64} 
        color={theme.colors.text.tertiary} 
        style={styles.emptyIcon}
      />
      <Typography variant="h2" style={styles.emptyTitle}>
        Your Wishlist is Empty
      </Typography>
      <Typography variant="body" color="secondary" style={styles.emptySubtitle}>
        Browse products and tap the heart icon to add items to your wishlist
      </Typography>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Typography variant="body" style={styles.browseButtonText}>
          Browse Products
        </Typography>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <LoadingSpinner text="Loading wishlist..." style={styles.loading} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            Wishlist
          </Typography>
          {items.length > 0 && (
            <View style={styles.headerStats}>
              <Typography variant="caption" color="secondary">
                {getWishlistCount()} {getWishlistCount() === 1 ? 'item' : 'items'} • ฿{getTotalValue().toFixed(2)}
              </Typography>
            </View>
          )}
        </View>

        {error && (
          <ErrorMessage
            message={error}
            onRetry={fetchWishlist}
            style={styles.error}
          />
        )}

        {items.length === 0 && !isLoading ? (
          <EmptyWishlist />
        ) : (
          <FlatList
            data={items}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  headerStats: {
    marginTop: theme.spacing.xs,
  },
  error: {
    margin: theme.spacing.md,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  itemCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  addedDate: {
    marginBottom: theme.spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    marginRight: theme.spacing.sm,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
  addToCartButton: {
    backgroundColor: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addToCartText: {
    color: theme.colors.surface,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.layout.screenPadding,
  },
  emptyIcon: {
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  browseButtonText: {
    color: theme.colors.surface,
    fontWeight: '500',
  },
});

export default WishlistScreen;