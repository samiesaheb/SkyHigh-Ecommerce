import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { SPACING, LAYOUT } from '@/constants';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder>
        <SkeletonPlaceholder.Item
          width="100%"
          height={200}
          borderRadius={LAYOUT.CARD_RADIUS}
          marginBottom={SPACING.MD}
        />
        <SkeletonPlaceholder.Item
          width="60%"
          height={16}
          borderRadius={4}
          marginBottom={SPACING.XS}
        />
        <SkeletonPlaceholder.Item
          width="80%"
          height={18}
          borderRadius={4}
          marginBottom={SPACING.SM}
        />
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <SkeletonPlaceholder.Item
            width={80}
            height={20}
            borderRadius={4}
          />
          <SkeletonPlaceholder.Item
            width={36}
            height={36}
            borderRadius={18}
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
};

export const ProductListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: LAYOUT.CARD_RADIUS,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listContainer: {
    padding: SPACING.MD,
  },
});