import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../theme';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Typography variant="display" align="center">Sky High</Typography>
            <Typography 
              variant="caption" 
              color="secondary" 
              align="center" 
              style={styles.subtitle}
            >
              Sign in to continue
            </Typography>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Button
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.signInButton}
            />
          </View>

          <View style={styles.footer}>
            <Typography variant="caption" color="secondary" align="center">
              Don't have an account?{' '}
              <Typography 
                variant="caption" 
                color="primary" 
                style={styles.linkText}
                onPress={() => navigation.navigate('Register')}
              >
                Sign Up
              </Typography>
            </Typography>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.layout.screenPadding,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: theme.spacing['4xl'],
  },
  subtitle: {
    marginTop: theme.spacing.md,
    letterSpacing: 1,
  },
  form: {
    marginBottom: theme.spacing['2xl'],
  },
  signInButton: {
    marginTop: theme.spacing.md,
  },
  footer: {
    marginTop: theme.spacing.xl,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;