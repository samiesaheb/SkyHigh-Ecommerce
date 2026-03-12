import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Animated, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '@/constants';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  duration?: number;
  onHide: () => void;
  position?: 'top' | 'bottom';
}

const { width: screenWidth } = Dimensions.get('window');

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  visible,
  duration = 3000,
  onHide,
  position = 'top',
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (visible) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Animate in
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto hide after duration
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    } else {
      hideToast();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration]);

  const hideToast = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return styles.successToast;
      case 'error':
        return styles.errorToast;
      case 'warning':
        return styles.warningToast;
      case 'info':
      default:
        return styles.infoToast;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'warning':
        return COLORS.TEXT.PRIMARY;
      default:
        return COLORS.SURFACE;
    }
  };

  if (!visible) return null;

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: position === 'top' ? [-100, 0] : [100, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.topPosition : styles.bottomPosition,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.toast, getToastStyle()]}
        onPress={hideToast}
        activeOpacity={0.9}
      >
        <Text style={[styles.message, { color: getTextColor() }]}>
          {message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Toast context and hook for global usage
import { create } from 'zustand';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
  duration: number;
}

interface ToastActions {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState & ToastActions>((set) => ({
  message: '',
  type: 'info',
  visible: false,
  duration: 3000,

  showToast: (message: string, type: ToastType, duration = 3000) => {
    set({ message, type, visible: true, duration });
  },

  hideToast: () => {
    set({ visible: false });
  },
}));

// Hook for easy toast usage
export const useToast = () => {
  const { showToast } = useToastStore();

  return {
    showSuccess: (message: string, duration?: number) => 
      showToast(message, 'success', duration),
    showError: (message: string, duration?: number) => 
      showToast(message, 'error', duration),
    showWarning: (message: string, duration?: number) => 
      showToast(message, 'warning', duration),
    showInfo: (message: string, duration?: number) => 
      showToast(message, 'info', duration),
  };
};

// Global Toast component to be placed at the root
export const GlobalToast: React.FC = () => {
  const { message, type, visible, duration, hideToast } = useToastStore();

  return (
    <Toast
      message={message}
      type={type}
      visible={visible}
      duration={duration}
      onHide={hideToast}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: SPACING.MD,
  },
  topPosition: {
    top: 50,
  },
  bottomPosition: {
    bottom: 100,
  },
  toast: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: LAYOUT.CARD_RADIUS,
    maxWidth: screenWidth - (SPACING.MD * 2),
    alignSelf: 'center',
    elevation: 5,
    shadowColor: COLORS.TEXT.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  successToast: {
    backgroundColor: COLORS.SUCCESS,
  },
  errorToast: {
    backgroundColor: COLORS.ERROR,
  },
  warningToast: {
    backgroundColor: COLORS.WARNING,
  },
  infoToast: {
    backgroundColor: COLORS.INFO,
  },
  message: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    textAlign: 'center',
    lineHeight: 20,
  },
});