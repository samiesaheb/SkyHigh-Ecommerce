import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ValidatedInput } from './ValidatedInput';
import { AnimatedButton } from '@/components/common';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useAuthStore } from '@/stores';
import { useToast } from '@/components/common';
import { SPACING } from '@/constants';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onForgotPassword,
}) => {
  const { login, isLoading } = useAuthStore();
  const { showError, showSuccess } = useToast();

  const form = useFormValidation({
    email: {
      value: '',
      rules: {
        required: true,
        email: true,
      },
    },
    password: {
      value: '',
      rules: {
        required: true,
        minLength: 8,
      },
    },
  });

  const handleSubmit = async () => {
    if (!form.validateForm()) {
      showError('Please fix the errors below');
      return;
    }

    form.setSubmitting(true);

    try {
      await login({
        email: form.values.email,
        password: form.values.password,
      });
      
      showSuccess('Login successful!');
      onSuccess?.();
    } catch (error: any) {
      showError(error.message || 'Login failed');
    } finally {
      form.setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ValidatedInput
        {...form.getFieldProps('email')}
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon="mail-outline"
        required
      />

      <ValidatedInput
        {...form.getFieldProps('password')}
        label="Password"
        placeholder="Enter your password"
        showPasswordToggle
        required
      />

      <View style={styles.buttonContainer}>
        <AnimatedButton
          title="Login"
          onPress={handleSubmit}
          disabled={!form.isValid || form.isSubmitting}
          loading={form.isSubmitting || isLoading}
          style={styles.loginButton}
        />

        <AnimatedButton
          title="Forgot Password?"
          onPress={onForgotPassword}
          variant="ghost"
          size="small"
          style={styles.forgotButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.MD,
  },
  buttonContainer: {
    marginTop: SPACING.LG,
  },
  loginButton: {
    marginBottom: SPACING.SM,
  },
  forgotButton: {
    alignSelf: 'center',
  },
});