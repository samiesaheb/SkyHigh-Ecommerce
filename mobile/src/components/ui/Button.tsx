import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.secondary : theme.colors.primary}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.gray[300],
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.gray[300],
  },
  text: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  
  // Sizes
  sm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 52,
  },
  
  // States
  disabled: {
    backgroundColor: theme.colors.gray[100],
    borderColor: theme.colors.gray[200],
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: 0.5,
  },
  primaryText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.base,
  },
  secondaryText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
  },
  ghostText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
  },
  textText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
  },
  disabledText: {
    color: theme.colors.text.tertiary,
  },
  
  // Size text styles
  smText: {
    fontSize: theme.typography.fontSize.sm,
  },
  mdText: {
    fontSize: theme.typography.fontSize.base,
  },
  lgText: {
    fontSize: theme.typography.fontSize.lg,
  },
});