import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '@/constants';

interface ValidatedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  error,
  helperText,
  required,
  showPasswordToggle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [labelAnimation] = useState(new Animated.Value(props.value ? 1 : 0));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(labelAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!props.value) {
      Animated.timing(labelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    props.onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getBorderColor = () => {
    if (error) return COLORS.ERROR;
    if (isFocused) return COLORS.PRIMARY;
    return COLORS.BORDER;
  };

  const actualSecureTextEntry = showPasswordToggle 
    ? !isPasswordVisible 
    : secureTextEntry;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Animated.Text
            style={[
              styles.label,
              {
                color: labelAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [COLORS.TEXT.SECONDARY, isFocused ? COLORS.PRIMARY : COLORS.TEXT.PRIMARY],
                }),
                fontSize: labelAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [TYPOGRAPHY.FONT_SIZES.MD, TYPOGRAPHY.FONT_SIZES.SM],
                }),
              },
            ]}
          >
            {label}
            {required && <Text style={styles.requiredMark}> *</Text>}
          </Animated.Text>
        </View>
      )}

      <View style={[styles.inputContainer, { borderColor: getBorderColor() }]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={20}
            color={isFocused ? COLORS.PRIMARY : COLORS.TEXT.SECONDARY}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          {...props}
          style={[styles.input, style]}
          secureTextEntry={actualSecureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={COLORS.TEXT.SECONDARY}
        />

        {showPasswordToggle && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.rightIcon}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.TEXT.SECONDARY}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !showPasswordToggle && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons
              name={rightIcon as any}
              size={20}
              color={isFocused ? COLORS.PRIMARY : COLORS.TEXT.SECONDARY}
            />
          </TouchableOpacity>
        )}
      </View>

      {(error || helperText) && (
        <View style={styles.messageContainer}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.MD,
  },
  labelContainer: {
    marginBottom: SPACING.XS,
  },
  label: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT.PRIMARY,
  },
  requiredMark: {
    color: COLORS.ERROR,
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: LAYOUT.CARD_RADIUS,
    backgroundColor: COLORS.SURFACE,
    minHeight: LAYOUT.INPUT_HEIGHT,
    paddingHorizontal: SPACING.SM,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    color: COLORS.TEXT.PRIMARY,
    paddingVertical: SPACING.SM,
  },
  leftIcon: {
    marginRight: SPACING.SM,
  },
  rightIcon: {
    marginLeft: SPACING.SM,
    padding: SPACING.XS,
  },
  messageContainer: {
    marginTop: SPACING.XS,
    paddingHorizontal: SPACING.XS,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.ERROR,
  },
  helperText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT.SECONDARY,
  },
});