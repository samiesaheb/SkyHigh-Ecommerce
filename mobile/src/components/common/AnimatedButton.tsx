import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '@/constants';
import { useHaptics } from '@/utils/haptics';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
  animationType?: 'scale' | 'bounce' | 'fade';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  hapticFeedback = true,
  animationType = 'scale',
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const haptics = useHaptics();

  const handlePressIn = () => {
    if (disabled || loading) return;

    if (animationType === 'scale' || animationType === 'bounce') {
      scale.value = withSpring(0.95, {
        damping: 15,
        stiffness: 150,
      });
    }

    if (animationType === 'fade') {
      opacity.value = withTiming(0.7, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    if (animationType === 'scale') {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    } else if (animationType === 'bounce') {
      scale.value = withSpring(1, {
        damping: 8,
        stiffness: 200,
      });
    }

    if (animationType === 'fade') {
      opacity.value = withTiming(1, { duration: 100 });
    }
  };

  const handlePress = async () => {
    if (disabled || loading) return;

    if (hapticFeedback) {
      runOnJS(haptics.buttonPress)();
    }

    runOnJS(onPress)();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.button;
    const sizeStyle = styles[size];
    
    let variantStyle: ViewStyle = {};
    
    switch (variant) {
      case 'primary':
        variantStyle = styles.primary;
        break;
      case 'secondary':
        variantStyle = styles.secondary;
        break;
      case 'outline':
        variantStyle = styles.outline;
        break;
      case 'ghost':
        variantStyle = styles.ghost;
        break;
    }

    if (disabled) {
      variantStyle = { ...variantStyle, ...styles.disabled };
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
    };
  };

  const getTextStyle = (): TextStyle => {
    let variantTextStyle: TextStyle = {};
    
    switch (variant) {
      case 'primary':
        variantTextStyle = styles.primaryText;
        break;
      case 'secondary':
        variantTextStyle = styles.secondaryText;
        break;
      case 'outline':
        variantTextStyle = styles.outlineText;
        break;
      case 'ghost':
        variantTextStyle = styles.ghostText;
        break;
    }

    if (disabled) {
      variantTextStyle = { ...variantTextStyle, ...styles.disabledText };
    }

    return {
      ...styles.text,
      ...variantTextStyle,
    };
  };

  return (
    <AnimatedTouchable
      style={[animatedStyle, getButtonStyle(), style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={1} // We handle opacity with animations
    >
      <Text style={[getTextStyle(), textStyle]}>
        {loading ? 'Loading...' : title}
      </Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: LAYOUT.CARD_RADIUS,
    flexDirection: 'row',
  },
  text: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    textAlign: 'center',
  },
  
  // Sizes
  small: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minHeight: LAYOUT.BUTTON_HEIGHT,
  },
  large: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    minHeight: 56,
  },
  
  // Variants
  primary: {
    backgroundColor: COLORS.PRIMARY,
  },
  primaryText: {
    color: COLORS.SURFACE,
  },
  
  secondary: {
    backgroundColor: COLORS.SECONDARY,
  },
  secondaryText: {
    color: COLORS.SURFACE,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  outlineText: {
    color: COLORS.PRIMARY,
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: COLORS.PRIMARY,
  },
  
  disabled: {
    backgroundColor: COLORS.BORDER,
  },
  disabledText: {
    color: COLORS.TEXT.DISABLED,
  },
});