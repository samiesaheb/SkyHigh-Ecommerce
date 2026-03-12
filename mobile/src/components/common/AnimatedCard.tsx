import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { COLORS, SPACING, LAYOUT } from '@/constants';
import { useHaptics } from '@/utils/haptics';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  animationType?: 'fadeIn' | 'slideUp' | 'scale' | 'bounce';
  delay?: number;
  hapticFeedback?: boolean;
  pressAnimation?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  onLongPress,
  style,
  animationType = 'fadeIn',
  delay = 0,
  hapticFeedback = true,
  pressAnimation = true,
}) => {
  const scale = useSharedValue(pressAnimation ? 1 : 0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(animationType === 'slideUp' ? 30 : 0);
  const haptics = useHaptics();

  // Entry animation
  useEffect(() => {
    const animateIn = () => {
      if (animationType === 'fadeIn') {
        opacity.value = withTiming(1, { duration: 500 });
      } else if (animationType === 'slideUp') {
        opacity.value = withTiming(1, { duration: 400 });
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 100,
        });
      } else if (animationType === 'scale') {
        opacity.value = withTiming(1, { duration: 300 });
        scale.value = withSpring(1, {
          damping: 12,
          stiffness: 150,
        });
      } else if (animationType === 'bounce') {
        opacity.value = withTiming(1, { duration: 300 });
        scale.value = withSpring(1, {
          damping: 8,
          stiffness: 200,
        });
      }
    };

    if (delay > 0) {
      setTimeout(animateIn, delay);
    } else {
      animateIn();
    }
  }, [animationType, delay]);

  // Gesture handling
  const gesture = Gesture.Tap()
    .onBegin(() => {
      if (pressAnimation && (onPress || onLongPress)) {
        scale.value = withSpring(0.95, {
          damping: 15,
          stiffness: 150,
        });
      }
    })
    .onEnd(() => {
      if (pressAnimation && (onPress || onLongPress)) {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 150,
        });
      }
      
      if (onPress) {
        if (hapticFeedback) {
          runOnJS(haptics.buttonPress)();
        }
        runOnJS(onPress)();
      }
    })
    .onFinalize(() => {
      if (pressAnimation && (onPress || onLongPress)) {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 150,
        });
      }
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      if (onLongPress) {
        if (hapticFeedback) {
          runOnJS(haptics.medium)();
        }
        runOnJS(onLongPress)();
      }
    });

  const combinedGesture = Gesture.Race(gesture, longPressGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { 
          scale: animationType === 'scale' || animationType === 'bounce' || pressAnimation 
            ? scale.value 
            : 1 
        },
        { translateY: translateY.value },
      ],
    };
  });

  const CardComponent = (
    <Animated.View style={[styles.card, animatedStyle, style]}>
      {children}
    </Animated.View>
  );

  if (onPress || onLongPress) {
    return (
      <GestureDetector gesture={combinedGesture}>
        {CardComponent}
      </GestureDetector>
    );
  }

  return CardComponent;
};

// Animated list item with staggered animation
interface AnimatedListItemProps extends AnimatedCardProps {
  index: number;
  staggerDelay?: number;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  index,
  staggerDelay = 100,
  ...props
}) => {
  return (
    <AnimatedCard
      {...props}
      delay={(props.delay || 0) + (index * staggerDelay)}
    />
  );
};

// Floating Action Button with animation
interface AnimatedFABProps {
  onPress: () => void;
  icon: React.ReactNode;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

export const AnimatedFAB: React.FC<AnimatedFABProps> = ({
  onPress,
  icon,
  style,
  size = 'medium',
}) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const haptics = useHaptics();

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
    rotation.value = withSpring(360, {
      damping: 20,
      stiffness: 100,
    });
  }, []);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.9, {
        damping: 15,
        stiffness: 150,
      });
    })
    .onEnd(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      runOnJS(haptics.medium)();
      runOnJS(onPress)();
    })
    .onFinalize(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.fabSmall;
      case 'large':
        return styles.fabLarge;
      default:
        return styles.fabMedium;
    }
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.fab, getSizeStyle(), animatedStyle, style]}>
        {icon}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: LAYOUT.CARD_RADIUS,
    elevation: 2,
    shadowColor: COLORS.TEXT.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fab: {
    position: 'absolute',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.TEXT.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabSmall: {
    width: 40,
    height: 40,
  },
  fabMedium: {
    width: 56,
    height: 56,
  },
  fabLarge: {
    width: 72,
    height: 72,
  },
});