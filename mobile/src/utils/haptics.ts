import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utility functions
 * Provides consistent haptic feedback across the app
 */

export const HapticFeedback = {
  /**
   * Light haptic feedback for subtle interactions
   * Used for: button taps, toggle switches, small interactions
   */
  light: async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Android fallback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /**
   * Medium haptic feedback for standard interactions
   * Used for: card taps, navigation, medium interactions
   */
  medium: async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Heavy haptic feedback for strong interactions
   * Used for: important actions, confirmations, heavy interactions
   */
  heavy: async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Success haptic feedback
   * Used for: successful operations, confirmations, positive feedback
   */
  success: async () => {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Android fallback - use medium impact
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Warning haptic feedback
   * Used for: warnings, cautionary actions
   */
  warning: async () => {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      // Android fallback - use heavy impact
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Error haptic feedback
   * Used for: errors, failed operations, negative feedback
   */
  error: async () => {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      // Android fallback - use heavy impact
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Selection haptic feedback
   * Used for: changing selections, picker values
   */
  selection: async () => {
    if (Platform.OS === 'ios') {
      await Haptics.selectionAsync();
    } else {
      // Android fallback - use light impact
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },
};

/**
 * Context-specific haptic feedback functions
 */
export const ContextualHaptics = {
  /**
   * Button press haptic
   */
  buttonPress: HapticFeedback.light,

  /**
   * Add to cart haptic
   */
  addToCart: HapticFeedback.medium,

  /**
   * Remove from cart haptic
   */
  removeFromCart: HapticFeedback.light,

  /**
   * Like/favorite haptic
   */
  favorite: HapticFeedback.medium,

  /**
   * Navigation haptic
   */
  navigate: HapticFeedback.light,

  /**
   * Swipe action haptic
   */
  swipe: HapticFeedback.light,

  /**
   * Pull to refresh haptic
   */
  pullToRefresh: HapticFeedback.light,

  /**
   * Search haptic
   */
  search: HapticFeedback.light,

  /**
   * Login success haptic
   */
  loginSuccess: HapticFeedback.success,

  /**
   * Login error haptic
   */
  loginError: HapticFeedback.error,

  /**
   * Form validation error haptic
   */
  validationError: HapticFeedback.warning,

  /**
   * Order placed haptic
   */
  orderPlaced: HapticFeedback.success,

  /**
   * Payment success haptic
   */
  paymentSuccess: HapticFeedback.success,

  /**
   * Payment error haptic
   */
  paymentError: HapticFeedback.error,
};

/**
 * Hook for using haptic feedback in components
 */
export const useHaptics = () => {
  return {
    ...HapticFeedback,
    ...ContextualHaptics,
  };
};