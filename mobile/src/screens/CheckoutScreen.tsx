import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants';

interface CheckoutScreenProps {
  navigation: any;
}

interface ShippingInfo {
  fullName: string;
  email: string;
  address: string;
  city: string;
  country: string;
  zip: string;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ navigation }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user ? `${user.first_name} ${user.last_name}` : '',
    email: user?.email || '',
    address: '',
    city: '',
    country: '',
    zip: '',
  });

  const updateShippingInfo = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof ShippingInfo)[] = [
      'fullName', 'email', 'address', 'city', 'country', 'zip'
    ];
    
    for (const field of requiredFields) {
      if (!shippingInfo[field].trim()) {
        Alert.alert('Error', `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        ...shippingInfo,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: parseFloat(item.product.price),
        })),
      };

      const response = await api.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
      
      if (response.status === 201) {
        await clearCart();
        Alert.alert(
          'Order Placed!',
          'Your order has been placed successfully. You will receive a confirmation email shortly.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('HomeTab'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
      console.error('Order error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({items.length})</Text>
            <Text style={styles.summaryValue}>฿{getTotalPrice().toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>Free</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>฿{getTotalPrice().toFixed(2)}</Text>
          </View>
        </View>

        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={shippingInfo.fullName}
            onChangeText={(value) => updateShippingInfo('fullName', value)}
            autoCapitalize="words"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={shippingInfo.email}
            onChangeText={(value) => updateShippingInfo('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={shippingInfo.address}
            onChangeText={(value) => updateShippingInfo('address', value)}
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="City"
              value={shippingInfo.city}
              onChangeText={(value) => updateShippingInfo('city', value)}
            />
            
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Country"
              value={shippingInfo.country}
              onChangeText={(value) => updateShippingInfo('country', value)}
            />
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="ZIP Code"
            value={shippingInfo.zip}
            onChangeText={(value) => updateShippingInfo('zip', value)}
          />
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.placeOrderText}>Place Order</Text>
          )}
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  placeOrderButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CheckoutScreen;