import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: keyof typeof theme.colors.text;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
  onPress?: () => void;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  style,
  numberOfLines,
  onPress,
}) => {
  const textStyle = [
    styles.base,
    styles[variant],
    { color: theme.colors.text[color] },
    { textAlign: align },
    style,
  ];

  return (
    <Text style={textStyle} numberOfLines={numberOfLines} onPress={onPress}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: theme.typography.fontFamily.regular,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
  },
  display: {
    fontSize: theme.typography.fontSize['5xl'],
    fontWeight: '300',
    letterSpacing: 2.5,
    lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize['5xl'],
  },
  h1: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: '400',
    letterSpacing: 1.2,
    lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize['3xl'],
  },
  h2: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '500',
    letterSpacing: 0.8,
    lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize['2xl'],
  },
  h3: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '600',
    letterSpacing: 0.5,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.xl,
  },
  body: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.normal,
  },
  caption: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.secondary,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});