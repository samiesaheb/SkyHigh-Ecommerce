import React from 'react';
import { Image } from 'expo-image';
import { View, StyleSheet } from 'react-native';
import { COLORS, LAYOUT } from '@/constants';
import { getImageUrl } from '@/utils';

interface OptimizedImageProps {
  source: string | null;
  style?: any;
  placeholder?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  transition?: number;
  blurhash?: string;
}

const defaultBlurHash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder,
  contentFit = 'cover',
  transition = 200,
  blurhash = defaultBlurHash,
}) => {
  const imageSource = source ? getImageUrl(source) : null;

  if (!imageSource) {
    return <View style={[styles.placeholder, style]} />;
  }

  return (
    <Image
      source={{ uri: imageSource }}
      style={style}
      contentFit={contentFit}
      transition={transition}
      placeholder={{ blurhash }}
      cachePolicy="memory-disk"
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: COLORS.BORDER,
    borderRadius: LAYOUT.CARD_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
});