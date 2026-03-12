import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';
import { Typography } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { theme } from '../theme';

interface CartScreenProps {
  navigation: any;
}

const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice,
    getTotalItems 
  } = useCart();

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: () => removeFromCart(productId)
          }
        ]
      );
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: clearCart
        }
      ]
    );
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.product.main_image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Typography variant="body" style={styles.productName} numberOfLines={2}>
          {item.product.name}
        </Typography>
        <Typography variant="caption" style={styles.productBrand}>{item.product.brand.name}</Typography>
        <Typography variant="h3" style={styles.productPrice}>฿{item.product.price}</Typography>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.product.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={20} color="#007AFF" />
        </TouchableOpacity>
        
        <Typography variant="body" style={styles.quantityText}>{item.quantity}</Typography>
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.product.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bag-outline" size={80} color={theme.colors.gray[300]} />
      <Typography variant="h2" style={styles.emptyTitle}>Your cart is empty</Typography>
      <Typography variant="body" style={styles.emptySubtitle}>Add some products to get started</Typography>
      <Button
        title="Start Shopping"
        onPress={() => navigation.navigate('ProductsTab')}
        style={styles.shopButton}
      />
    </View>
  );

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h2" style={styles.headerTitle}>Cart ({getTotalItems()} items)</Typography>
        <TouchableOpacity onPress={handleClearCart}>
          <Typography variant="body" style={styles.clearText}>Clear All</Typography>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product.id.toString()}
        style={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Typography variant="h2" style={styles.totalLabel}>Total</Typography>
          <Typography variant="h1" style={styles.totalAmount}>฿{getTotalPrice().toFixed(2)}</Typography>
        </View>
        
        <Button
          title="Proceed to Checkout"
          onPress={handleCheckout}
          style={styles.checkoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.layout.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerTitle: {
    marginBottom: 0,
  },
  clearText: {
    color: theme.colors.primary,
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
  },
  productInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  productName: {
    lineHeight: 20,
  },
  productBrand: {
    marginVertical: theme.spacing.xs,
  },
  productPrice: {
    marginTop: theme.spacing.xs,
  },
  quantityContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.sm,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  quantityText: {
    marginVertical: theme.spacing.sm,
    minWidth: 24,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    padding: theme.layout.screenPadding,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  totalLabel: {
    marginBottom: 0,
  },
  totalAmount: {
    marginBottom: 0,
  },
  checkoutButton: {
    marginTop: 0,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.layout.screenPadding * 2,
  },
  emptyTitle: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: theme.spacing['2xl'],
    color: theme.colors.text.secondary,
  },
  shopButton: {
    minWidth: 200,
  },
});

export default CartScreen;