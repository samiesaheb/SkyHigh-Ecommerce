import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { theme } from '../theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
// import WishlistScreen from '../screens/WishlistScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import { View, Text, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: theme.colors.background,
    shadowOpacity: 0,
    elevation: 0,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  headerTintColor: theme.colors.text.primary,
  headerBackTitleVisible: false,
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ProductDetail" 
      component={ProductDetailScreen}
      options={{ title: '' }}
    />
  </Stack.Navigator>
);


// const WishlistStack = () => (
//   <Stack.Navigator screenOptions={screenOptions}>
//     <Stack.Screen 
//       name="Wishlist" 
//       component={WishlistScreen}
//       options={{ headerShown: false }}
//     />
//   </Stack.Navigator>
// );

const CartStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen 
      name="Cart" 
      component={CartScreen}
      options={{ title: 'Cart' }}
    />
    <Stack.Screen 
      name="Checkout" 
      component={CheckoutScreen}
      options={{ title: 'Checkout' }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen} 
      options={{ title: 'Edit Profile' }} 
    />
    <Stack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen} 
      options={{ title: 'Change Password' }} 
    />
    <Stack.Screen 
      name="Notifications" 
      component={NotificationsScreen} 
      options={{ title: 'Notifications' }} 
    />
    <Stack.Screen 
      name="HelpSupport" 
      component={HelpSupportScreen} 
      options={{ title: 'Help & Support' }} 
    />
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const TabBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

const MainTabs = () => {
  const { getTotalItems } = useCart();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'WishlistTab') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'bag' : 'bag-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          const icon = <Ionicons name={iconName} size={22} color={color} />;
          
          if (route.name === 'CartTab') {
            return (
              <View>
                {icon}
                <TabBadge count={getTotalItems()} />
              </View>
            );
          }
          
          return icon;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.gray[200],
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.lg,
          height: 80,
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
          letterSpacing: 0.5,
          marginTop: theme.spacing.xs / 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ tabBarLabel: 'HOME' }}
      />
      {/* <Tab.Screen 
        name="WishlistTab" 
        component={WishlistStack} 
        options={{ tabBarLabel: 'WISHLIST' }}
      /> */}
      <Tab.Screen 
        name="CartTab" 
        component={CartStack} 
        options={{ tabBarLabel: 'BAG' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack} 
        options={{ tabBarLabel: 'PROFILE' }}
      />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  badgeText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 0,
  },
});