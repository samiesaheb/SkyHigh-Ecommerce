import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { AuthState, User } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        const response = await api.get('/mobile/accounts/user/');
        setAuthState({
          isAuthenticated: true,
          user: response.data,
          token,
        });
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/mobile/auth/jwt/create/', {
        email,
        password,
      });
      
      const { access } = response.data;
      await SecureStore.setItemAsync('authToken', access);
      
      const userResponse = await api.get('/mobile/accounts/user/');
      setAuthState({
        isAuthenticated: true,
        user: userResponse.data,
        token: access,
      });
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> => {
    try {
      await api.post('/mobile/accounts/register/', {
        email,
        password1: password,
        password2: password,
        first_name: firstName,
        last_name: lastName,
      });
      
      return await login(email, password);
    } catch (error) {
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await SecureStore.deleteItemAsync('authToken');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};