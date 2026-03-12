import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <View style={styles.productCardSkeleton}>
    <SkeletonLoader height={160} borderRadius={theme.borderRadius.lg} style={styles.imageSkeleton} />
    <View style={styles.contentSkeleton}>
      <SkeletonLoader width="60%" height={12} style={styles.brandSkeleton} />
      <SkeletonLoader width="90%" height={16} style={styles.nameSkeleton} />
      <SkeletonLoader width="40%" height={18} style={styles.priceSkeleton} />
    </View>
  </View>
);

export const BrandChipSkeleton: React.FC = () => (
  <SkeletonLoader 
    width={80} 
    height={36} 
    borderRadius={theme.borderRadius.full} 
    style={styles.chipSkeleton} 
  />
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.gray[200],
  },
  productCardSkeleton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  imageSkeleton: {
    marginBottom: theme.spacing.lg,
  },
  contentSkeleton: {
    flex: 1,
  },
  brandSkeleton: {
    marginBottom: theme.spacing.xs,
  },
  nameSkeleton: {
    marginBottom: theme.spacing.sm,
  },
  priceSkeleton: {
    marginTop: 'auto',
  },
  chipSkeleton: {
    marginRight: theme.spacing.lg,
  },
});