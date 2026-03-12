import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  onPress?: (rating: number) => void;
  readonly?: boolean;
  style?: ViewStyle;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'md',
  onPress,
  readonly = false,
  style,
}) => {
  const getStarSize = () => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 20;
      default:
        return 16;
    }
  };

  const starSize = getStarSize();
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  const renderStar = (starIndex: number) => {
    const isFullStar = rating >= starIndex;
    const isHalfStar = rating >= starIndex - 0.5 && rating < starIndex;

    const StarWrapper = readonly ? View : TouchableOpacity;

    return (
      <StarWrapper
        key={starIndex}
        style={[styles.starContainer, !readonly && styles.touchableStar]}
        onPress={!readonly ? () => onPress?.(starIndex) : undefined}
        activeOpacity={readonly ? 1 : 0.7}
      >
        {isFullStar ? (
          <Ionicons
            name="star"
            size={starSize}
            color={theme.colors.warning}
          />
        ) : isHalfStar ? (
          <Ionicons
            name="star-half"
            size={starSize}
            color={theme.colors.warning}
          />
        ) : (
          <Ionicons
            name="star-outline"
            size={starSize}
            color={theme.colors.text.tertiary}
          />
        )}
      </StarWrapper>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {stars.map(renderStar)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginRight: 2,
  },
  touchableStar: {
    padding: 4,
    marginRight: -2, // Compensate for padding
  },
});

export default StarRating;