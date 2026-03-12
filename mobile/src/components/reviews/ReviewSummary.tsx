import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ReviewSummary as ReviewSummaryType } from '../../types';
import { Typography } from '../ui/Typography';
import { StarRating } from './StarRating';
import { theme } from '../../theme';

interface ReviewSummaryProps {
  summary: ReviewSummaryType;
  style?: ViewStyle;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  summary,
  style,
}) => {
  const { average_rating, total_reviews, rating_distribution } = summary;

  const getRatingPercentage = (rating: number) => {
    if (total_reviews === 0) return 0;
    return (rating_distribution[rating as keyof typeof rating_distribution] / total_reviews) * 100;
  };

  const renderRatingBar = (starCount: number) => {
    const count = rating_distribution[starCount as keyof typeof rating_distribution];
    const percentage = getRatingPercentage(starCount);

    return (
      <View key={starCount} style={styles.ratingBarRow}>
        <Typography variant="caption" style={styles.ratingLabel}>
          {starCount}★
        </Typography>
        <View style={styles.ratingBarContainer}>
          <View 
            style={[
              styles.ratingBarFill, 
              { width: `${percentage}%` }
            ]} 
          />
        </View>
        <Typography variant="caption" style={styles.ratingCount}>
          {count}
        </Typography>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Overall Rating */}
      <View style={styles.overallRating}>
        <View style={styles.ratingScore}>
          <Typography variant="h1" style={styles.averageRating}>
            {average_rating.toFixed(1)}
          </Typography>
          <StarRating rating={average_rating} size="md" readonly />
          <Typography variant="caption" color="secondary" style={styles.totalReviews}>
            Based on {total_reviews} review{total_reviews !== 1 ? 's' : ''}
          </Typography>
        </View>
      </View>

      {/* Rating Distribution */}
      <View style={styles.distributionContainer}>
        {[5, 4, 3, 2, 1].map(renderRatingBar)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  overallRating: {
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
    marginBottom: theme.spacing.md,
  },
  ratingScore: {
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '300',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.primary,
  },
  totalReviews: {
    marginTop: theme.spacing.xs,
  },
  distributionContainer: {
    gap: theme.spacing.xs,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ratingLabel: {
    width: 24,
    textAlign: 'right',
    color: theme.colors.text.secondary,
    fontSize: 12,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: theme.colors.warning,
    borderRadius: 4,
  },
  ratingCount: {
    width: 24,
    textAlign: 'left',
    color: theme.colors.text.secondary,
    fontSize: 12,
  },
});

export default ReviewSummary;