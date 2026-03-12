import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '@/constants';
import { useDebounce } from '@/hooks';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  showCancelButton?: boolean;
  autoFocus?: boolean;
  style?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search products...',
  value,
  onChangeText,
  onSearch,
  onFocus,
  onBlur,
  onClear,
  showCancelButton = false,
  autoFocus = false,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const animatedValue = useRef(new Animated.Value(showCancelButton ? 1 : 0)).current;

  const debouncedValue = useDebounce(value, 300);

  // Trigger search when debounced value changes
  React.useEffect(() => {
    if (debouncedValue && onSearch) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
    
    if (showCancelButton) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [onFocus, showCancelButton]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleClear = useCallback(() => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  }, [onChangeText, onClear]);

  const handleCancel = useCallback(() => {
    onChangeText('');
    onClear?.();
    Keyboard.dismiss();
    
    if (showCancelButton) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [onChangeText, onClear, showCancelButton]);

  const handleSubmitEditing = useCallback(() => {
    if (value.trim() && onSearch) {
      onSearch(value.trim());
    }
    Keyboard.dismiss();
  }, [value, onSearch]);

  const cancelButtonWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.searchContainer, isFocused && styles.focused]}>
        <Ionicons 
          name="search-outline" 
          size={20} 
          color={isFocused ? COLORS.PRIMARY : COLORS.TEXT.SECONDARY}
          style={styles.searchIcon}
        />
        
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.TEXT.SECONDARY}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmitEditing}
          autoFocus={autoFocus}
          returnKeyType="search"
          clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
          autoCorrect={false}
          autoCapitalize="none"
        />

        {Platform.OS === 'android' && value.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="close-circle" 
              size={20} 
              color={COLORS.TEXT.SECONDARY} 
            />
          </TouchableOpacity>
        )}
      </View>

      {showCancelButton && (
        <Animated.View style={[styles.cancelButtonContainer, { width: cancelButtonWidth }]}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
          >
            <Ionicons name="close" size={16} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: LAYOUT.CARD_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: SPACING.SM,
    height: LAYOUT.INPUT_HEIGHT,
  },
  focused: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.SURFACE,
  },
  searchIcon: {
    marginRight: SPACING.SM,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    color: COLORS.TEXT.PRIMARY,
    height: '100%',
    ...Platform.select({
      android: {
        paddingVertical: 0,
      },
    }),
  },
  clearButton: {
    padding: SPACING.XS,
    marginLeft: SPACING.XS,
  },
  cancelButtonContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderRadius: LAYOUT.CARD_RADIUS,
    marginLeft: SPACING.SM,
  },
});