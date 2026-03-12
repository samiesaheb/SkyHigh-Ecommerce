import { AccessibilityProps, Platform } from 'react-native';

/**
 * Accessibility utility functions and constants
 */

export const AccessibilityRoles = {
  BUTTON: 'button',
  LINK: 'link',
  TEXT: 'text',
  HEADER: 'header',
  IMAGE: 'image',
  SEARCH: 'search',
  TAB: 'tab',
  TAB_LIST: 'tablist',
  LIST: 'list',
  LIST_ITEM: 'listitem',
  MENU: 'menu',
  MENU_ITEM: 'menuitem',
  SWITCH: 'switch',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
} as const;

export const AccessibilityStates = {
  SELECTED: 'selected',
  CHECKED: 'checked',
  EXPANDED: 'expanded',
  BUSY: 'busy',
  DISABLED: 'disabled',
} as const;

export const AccessibilityTraits = {
  ADJUSTABLE: 'adjustable',
  ALLOWS_DIRECT_INTERACTION: 'allowsDirectInteraction',
  CAUSES_PAGE_TURN: 'causesPageTurn',
  HEADER: 'header',
  IMAGE: 'image',
  KEY_KEYBOARD_KEY: 'keyboardKey',
  LINK: 'link',
  NONE: 'none',
  PLAYS_SOUND: 'playsSound',
  SEARCH_FIELD: 'searchField',
  SELECTED: 'selected',
  STARTS_MEDIA_SESSION: 'startsMediaSession',
  SUMMARY_ELEMENT: 'summaryElement',
  UPDATES_FREQUENTLY: 'updatesFrequently',
} as const;

/**
 * Generate accessibility props for buttons
 */
export const createButtonAccessibility = (
  label: string,
  hint?: string,
  disabled?: boolean
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: AccessibilityRoles.BUTTON,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityState: {
    disabled: disabled || false,
  },
});

/**
 * Generate accessibility props for links
 */
export const createLinkAccessibility = (
  label: string,
  hint?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: AccessibilityRoles.LINK,
  accessibilityLabel: label,
  accessibilityHint: hint,
});

/**
 * Generate accessibility props for headers
 */
export const createHeaderAccessibility = (
  text: string,
  level: number = 1
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: AccessibilityRoles.HEADER,
  accessibilityLabel: text,
  ...(Platform.OS === 'ios' && {
    accessibilityTraits: AccessibilityTraits.HEADER,
  }),
});

/**
 * Generate accessibility props for images
 */
export const createImageAccessibility = (
  alt: string,
  decorative: boolean = false
): AccessibilityProps => {
  if (decorative) {
    return {
      accessible: false,
      importantForAccessibility: 'no',
    };
  }

  return {
    accessible: true,
    accessibilityRole: AccessibilityRoles.IMAGE,
    accessibilityLabel: alt,
  };
};

/**
 * Generate accessibility props for search inputs
 */
export const createSearchAccessibility = (
  placeholder: string,
  value?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: AccessibilityRoles.SEARCH,
  accessibilityLabel: placeholder,
  accessibilityValue: value ? { text: value } : undefined,
  ...(Platform.OS === 'ios' && {
    accessibilityTraits: AccessibilityTraits.SEARCH_FIELD,
  }),
});

/**
 * Generate accessibility props for lists
 */
export const createListAccessibility = (
  itemCount: number,
  description?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: AccessibilityRoles.LIST,
  accessibilityLabel: description || `List with ${itemCount} items`,
});

/**
 * Generate accessibility props for list items
 */
export const createListItemAccessibility = (
  label: string,
  position?: { index: number; total: number },
  hint?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: AccessibilityRoles.LIST_ITEM,
  accessibilityLabel: position 
    ? `${label}, ${position.index + 1} of ${position.total}`
    : label,
  accessibilityHint: hint,
});

/**
 * Generate accessibility props for toggle switches
 */
export const createSwitchAccessibility = (
  label: string,
  isOn: boolean,
  hint?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: AccessibilityRoles.SWITCH,
  accessibilityLabel: label,
  accessibilityState: {
    checked: isOn,
  },
  accessibilityHint: hint,
});

/**
 * Generate accessibility props for tabs
 */
export const createTabAccessibility = (
  label: string,
  selected: boolean,
  position: { index: number; total: number }
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: AccessibilityRoles.TAB,
  accessibilityLabel: `${label}, tab ${position.index + 1} of ${position.total}`,
  accessibilityState: {
    selected,
  },
});

/**
 * Generate accessibility props for form inputs
 */
export const createInputAccessibility = (
  label: string,
  value?: string,
  error?: string,
  required?: boolean
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: `${label}${required ? ', required' : ''}`,
  accessibilityValue: value ? { text: value } : undefined,
  accessibilityHint: error || undefined,
  accessibilityInvalid: !!error,
});

/**
 * Generate accessibility props for loading states
 */
export const createLoadingAccessibility = (
  message?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: message || 'Loading',
  accessibilityState: {
    busy: true,
  },
  ...(Platform.OS === 'ios' && {
    accessibilityTraits: AccessibilityTraits.UPDATES_FREQUENTLY,
  }),
});

/**
 * Generate accessibility props for error messages
 */
export const createErrorAccessibility = (
  message: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: AccessibilityRoles.TEXT,
  accessibilityLabel: `Error: ${message}`,
  accessibilityLiveRegion: 'assertive',
  importantForAccessibility: 'yes',
});

/**
 * Generate accessibility props for success messages
 */
export const createSuccessAccessibility = (
  message: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityRole: AccessibilityRoles.TEXT,
  accessibilityLabel: `Success: ${message}`,
  accessibilityLiveRegion: 'polite',
});

/**
 * Screen reader announcements
 */
export const announceForAccessibility = (message: string) => {
  if (Platform.OS === 'ios') {
    require('react-native').AccessibilityInfo.announceForAccessibility(message);
  } else {
    // Android implementation
    require('react-native').AccessibilityInfo.announceForAccessibility(message);
  }
};

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  const { AccessibilityInfo } = require('react-native');
  
  if (Platform.OS === 'ios') {
    return await AccessibilityInfo.isVoiceOverEnabled();
  } else {
    return await AccessibilityInfo.isTalkBackEnabled();
  }
};

/**
 * Focus management utilities
 */
export const setAccessibilityFocus = (ref: any) => {
  if (ref && ref.current) {
    const { AccessibilityInfo } = require('react-native');
    AccessibilityInfo.setAccessibilityFocus(ref.current);
  }
};