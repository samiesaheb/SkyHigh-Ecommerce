import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Product } from '@/types';
import { OptimizedImage } from './OptimizedImage';
import { formatPrice, truncateText } from '@/utils';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '@/constants';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  showAddButton?: boolean;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  showAddButton = true,
}) => {
  const handlePress = React.useCallback(() => {
    onPress(product);
  }, [product, onPress]);

  const handleAddToCart = React.useCallback(() => {
    onAddToCart?.(product);
  }, [product, onAddToCart]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <OptimizedImage
          source={product.main_image}
          style={styles.image}
          contentFit="cover"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.brandName}>{product.brand.name}</Text>
        <Text style={styles.productName}>
          {truncateText(product.name, 50)}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>
            {formatPrice(product.price)}
          </Text>
          
          {showAddButton && onAddToCart && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.showAddButton === nextProps.showAddButton
  );
});

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