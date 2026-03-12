import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductReview } from '../../types';
import { Typography } from '../ui/Typography';
import { StarRating } from './StarRating';
import { theme } from '../../theme';
import { useReviewsStore } from '../../stores';
// Simple date formatting utility

interface ReviewCardProps {
  review: ProductReview;
  style?: ViewStyle;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  style,
}) => {
  const { markReviewHelpful } = useReviewsStore();

  const handleHelpfulPress = async () => {
    if (review.is_helpful) return; // Already marked as helpful
    
    try {
      await markReviewHelpful(review.id);
    } catch (error) {
      console.error('Failed to mark review helpful:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 30) return `${diffInDays} days ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return date.toLocaleDateString();
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Typography variant="h3" style={styles.avatarText}>
              {review.user.first_name?.[0] || review.user.email[0].toUpperCase()}
            </Typography>
          </View>
          <View style={styles.userDetails}>
            <Typography variant="body" style={styles.userName}>
              {review.user.first_name ? 
                `${review.user.first_name} ${review.user.last_name || ''}`.trim() : 
                'Anonymous'
              }
            </Typography>
            <Typography variant="caption" color="secondary">
              {formatDate(review.created_at)}
            </Typography>
          </View>
        </View>
        
        <View style={styles.badges}>
          {review.verified_purchase && (
            <View style={styles.verifiedBadge}>
              <Ionicons 
                name="checkmark-circle" 
                size={12} 
                color={theme.colors.success} 
              />
              <Typography variant="caption" style={styles.verifiedText}>
                Verified
              </Typography>
            </View>
          )}
        </View>
      </View>

      {/* Rating and Title */}
      <View style={styles.ratingSection}>
        <StarRating rating={review.rating} size="sm" readonly />
        <Typography variant="body" style={styles.title}>
          {review.title}
        </Typography>
      </View>

      {/* Comment */}
      <Typography variant="body" style={styles.comment}>
        {review.comment}
      </Typography>

      {/* Helpful Section */}
      <View style={styles.helpfulSection}>
        <TouchableOpacity
          style={[
            styles.helpfulButton,
            review.is_helpful && styles.helpfulButtonActive
          ]}
          onPress={handleHelpfulPress}
          disabled={review.is_helpful}
          activeOpacity={0.7}
        >
          <Ionicons
            name={review.is_helpful ? 'thumbs-up' : 'thumbs-up-outline'}
            size={16}
            color={review.is_helpful ? theme.colors.primary : theme.colors.text.secondary}
          />
          <Typography
            variant="caption"
            style={[
              styles.helpfulText,
              review.is_helpful && styles.helpfulTextActive
            ]}
          >
            Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
          </Typography>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: '500',
    marginBottom: 2,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    color: theme.colors.success,
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '500',
  },
  ratingSection: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontWeight: '600',
    marginTop: theme.spacing.xs,
    lineHeight: 20,
  },
  comment: {
    lineHeight: 22,
    marginBottom: theme.spacing.md,
    color: theme.colors.text.secondary,
  },
  helpfulSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
    paddingTop: theme.spacing.sm,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  helpfulButtonActive: {
    backgroundColor: theme.colors.primary + '10',
  },
  helpfulText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.text.secondary,
  },
  helpfulTextActive: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default ReviewCard;