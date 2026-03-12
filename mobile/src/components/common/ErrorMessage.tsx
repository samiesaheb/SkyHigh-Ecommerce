import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '@/constants';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  style?: any;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryText = 'Try Again',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.MD,
    backgroundColor: COLORS.SURFACE,
    borderRadius: LAYOUT.CARD_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.ERROR,
    margin: SPACING.MD,
  },
  message: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  retryButton: {
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: LAYOUT.CARD_RADIUS,
  },
  retryText: {
    color: COLORS.SURFACE,
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
});