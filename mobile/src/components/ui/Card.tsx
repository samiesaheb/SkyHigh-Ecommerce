import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof theme.spacing;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'lg',
  style,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    { padding: theme.spacing[padding] },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
  },
  elevated: {
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 0.5,
    borderColor: theme.colors.gray[100],
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  filled: {
    backgroundColor: theme.colors.surface,
  },
});