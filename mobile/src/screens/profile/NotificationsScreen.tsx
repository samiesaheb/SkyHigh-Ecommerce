import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationsScreenProps {
  navigation: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    newsletter: false,
    pushNotifications: true,
  });

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const NotificationItem = ({ 
    title, 
    description, 
    value, 
    onToggle 
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#ccc', true: '#007AFF' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="notifications" size={40} color="#007AFF" />
          <Text style={styles.title}>Notification Settings</Text>
          <Text style={styles.subtitle}>
            Choose what notifications you'd like to receive
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Notifications</Text>
          
          <NotificationItem
            title="Order Updates"
            description="Get notified about your order status and delivery"
            value={notifications.orderUpdates}
            onToggle={() => toggleNotification('orderUpdates')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketing</Text>
          
          <NotificationItem
            title="Promotions & Deals"
            description="Receive notifications about special offers and discounts"
            value={notifications.promotions}
            onToggle={() => toggleNotification('promotions')}
          />
          
          <NotificationItem
            title="New Products"
            description="Be the first to know about new product releases"
            value={notifications.newProducts}
            onToggle={() => toggleNotification('newProducts')}
          />
          
          <NotificationItem
            title="Newsletter"
            description="Monthly newsletter with company updates and tips"
            value={notifications.newsletter}
            onToggle={() => toggleNotification('newsletter')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <NotificationItem
            title="Push Notifications"
            description="Allow the app to send push notifications to your device"
            value={notifications.pushNotifications}
            onToggle={() => toggleNotification('pushNotifications')}
          />
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  notificationContent: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default NotificationsScreen;