import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants';
import { Typography } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { theme } from '../theme';

interface ProfileScreenProps {
  navigation: any;
}

// MenuItem component for the profile menu
const MenuItem = ({ 
  icon, 
  title, 
  onPress, 
  showDivider = false 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  title: string; 
  onPress: () => void; 
  showDivider?: boolean;
}) => (
  <>
    {showDivider && <View style={styles.divider} />}
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemContent}>
        <Ionicons name={icon} size={20} color={theme.colors.text.secondary} />
        <Typography variant="body" style={styles.menuItemText}>
          {title}
        </Typography>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.text.tertiary} />
    </TouchableOpacity>
  </>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Profile Screen - User data:', user);
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDERS.LIST);
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'default',
          onPress: logout
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderOrderItem = (order: Order) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Typography variant="body" style={styles.orderNumber}>Order #{order.id}</Typography>
        <Typography variant="caption" style={styles.orderDate}>{formatDate(order.created_at)}</Typography>
      </View>
      <Typography variant="caption" style={styles.orderItems}>
        {order.items.length} item{order.items.length > 1 ? 's' : ''}
      </Typography>
      <View style={styles.orderFooter}>
        <Typography variant="caption" style={styles.orderStatus}>Completed</Typography>
        <Typography variant="h3" style={styles.orderTotal}>
          ฿{order.items.reduce((total, item) => 
            total + (parseFloat(item.price) * item.quantity), 0
          ).toFixed(2)}
        </Typography>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* User Profile Header */}
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons 
                name="person" 
                size={32} 
                color={theme.colors.text.tertiary} 
              />
            </View>
          </View>
          {user ? (
            <>
              <Typography variant="h1" align="center" style={styles.userName}>
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : user.email?.split('@')[0] || 'User'
                }
              </Typography>
              <Typography variant="caption" color="secondary" align="center" style={styles.userEmail}>
                {user.email}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h1" align="center" style={styles.userName}>
                Loading...
              </Typography>
              <Typography variant="caption" color="secondary" align="center" style={styles.userEmail}>
                Please wait
              </Typography>
            </>
          )}
        </View>

        {/* Menu Options */}
        <Card variant="elevated" style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <MenuItem
            icon="lock-closed-outline"
            title="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
            showDivider
          />
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            onPress={() => navigation.navigate('Notifications')}
            showDivider
          />
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => navigation.navigate('HelpSupport')}
            showDivider
          />
        </Card>

      {/* Order History */}
      <View style={styles.ordersSection}>
        <Typography variant="h2" style={styles.sectionTitle}>Recent Orders</Typography>
        {loading ? (
          <Typography variant="body" style={styles.loadingText}>Loading orders...</Typography>
        ) : orders.length > 0 ? (
          orders.slice(0, 3).map(renderOrderItem)
        ) : (
          <Typography variant="body" style={styles.noOrdersText}>No orders yet</Typography>
        )}
        
        {orders.length > 3 && (
          <TouchableOpacity style={styles.viewAllButton}>
            <Typography variant="body" style={styles.viewAllText}>View All Orders</Typography>
          </TouchableOpacity>
        )}
      </View>

        {/* Sign Out */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="text"
          style={styles.logoutButton}
        />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing['4xl'],
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing['4xl'],
  },
  avatarContainer: {
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  userName: {
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  userEmail: {
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  menuCard: {
    marginVertical: theme.spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
    marginHorizontal: -theme.spacing.lg,
  },
  ordersSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  noOrdersText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderStatus: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  viewAllButton: {
    alignItems: 'center',
    padding: 16,
  },
  viewAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;