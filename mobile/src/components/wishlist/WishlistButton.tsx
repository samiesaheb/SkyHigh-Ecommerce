import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWishlistStore } from '../../stores';
import { Product } from '../../types';
import { theme } from '../../theme';

interface WishlistButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  disabled?: boolean;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  size = 'md',
  style,
  disabled = false,
}) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  
  if (!product || !product.id) {
    return null;
  }
  
  const isWishlisted = isInWishlist(product.id);
  
  const handlePress = () => {
    if (disabled || !product?.id) return;
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.buttonSm;
      case 'lg':
        return styles.buttonLg;
      default:
        return styles.buttonMd;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 28;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getSizeStyle(),
        isWishlisted ? styles.buttonActive : styles.buttonInactive,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isWishlisted ? 'heart' : 'heart-outline'}
        size={getIconSize()}
        color={isWishlisted ? theme.colors.error : theme.colors.text.secondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSm: {
    width: 28,
    height: 28,
  },
  buttonMd: {
    width: 36,
    height: 36,
  },
  buttonLg: {
    width: 44,
    height: 44,
  },
  buttonInactive: {},
  buttonActive: {},
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default WishlistButton;