import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Product } from '@/types';
import { OptimizedImage } from './OptimizedImage';
import { formatPrice, truncateText } from '@/utils';
import { createButtonAccessibility, createImageAccessibility, announceForAccessibility } from '@/utils/accessibility';
import { useHaptics } from '@/utils/haptics';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '@/constants';

interface AccessibleProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  showAddButton?: boolean;
  index?: number;
  totalItems?: number;
}

const AccessibleProductCardComponent: React.FC<AccessibleProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  showAddButton = true,
  index,
  totalItems,
}) => {
  const haptics = useHaptics();

  const handlePress = React.useCallback(() => {
    haptics.navigate();
    onPress(product);
  }, [product, onPress, haptics]);

  const handleAddToCart = React.useCallback(() => {
    haptics.addToCart();
    onAddToCart?.(product);
    announceForAccessibility(`${product.name} added to cart`);
  }, [product, onAddToCart, haptics]);

  // Create accessibility labels
  const cardLabel = `${product.brand.name} ${product.name}, ${formatPrice(product.price)}`;
  const cardHint = 'Double tap to view product details';
  const addToCartLabel = `Add ${product.name} to cart`;
  const positionInfo = index !== undefined && totalItems 
    ? { index, total: totalItems } 
    : undefined;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      {...createButtonAccessibility(
        positionInfo 
          ? `${cardLabel}, item ${index! + 1} of ${totalItems}` 
          : cardLabel,
        cardHint
      )}
    >
      <View style={styles.imageContainer}>
        <OptimizedImage
          source={product.main_image}
          style={styles.image}
          contentFit="cover"
          {...createImageAccessibility(`${product.brand.name} ${product.name} product image`)}
        />
      </View>

      <View style={styles.content}>
        <Text 
          style={styles.brandName}
          importantForAccessibility="no"
        >
          {product.brand.name}
        </Text>
        <Text 
          style={styles.productName}
          importantForAccessibility="no"
        >
          {truncateText(product.name, 50)}
        </Text>
        
        <View style={styles.footer}>
          <Text 
            style={styles.price}
            importantForAccessibility="no"
          >
            {formatPrice(product.price)}
          </Text>
          
          {showAddButton && onAddToCart && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
              {...createButtonAccessibility(addToCartLabel, 'Adds item to shopping cart')}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export const AccessibleProductCard = memo(AccessibleProductCardComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: LAYOUT.CARD_RADIUS,
    marginBottom: SPACING.MD,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.TEXT.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    height: 200,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: SPACING.MD,
  },
  brandName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT.SECONDARY,
    marginBottom: SPACING.XS,
  },
  productName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    color: COLORS.TEXT.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginBottom: SPACING.SM,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.SURFACE,
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
});