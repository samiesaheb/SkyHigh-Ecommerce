from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
import json

from products.models import Brand, Product
from .models import Cart, CartItem

User = get_user_model()


class CartModelTest(TestCase):
    """Test the Cart model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.brand = Brand.objects.create(
            name="Facial Care",
            slug="facial-care"
        )
        self.product = Product.objects.create(
            brand=self.brand,
            name="Face Cleanser",
            description="Gentle face cleanser",
            price=Decimal('299.99'),
            slug="face-cleanser"
        )
    
    def test_create_cart(self):
        """Test creating a cart"""
        cart = Cart.objects.create(user=self.user)
        
        self.assertEqual(cart.user, self.user)
        self.assertEqual(cart.total_items, 0)
        self.assertEqual(cart.total_price, Decimal('0.00'))
    
    def test_create_guest_cart(self):
        """Test creating a guest cart"""
        cart = Cart.objects.create(session_key='test-session-123')
        
        self.assertIsNone(cart.user)
        self.assertEqual(cart.session_key, 'test-session-123')
    
    def test_cart_total_calculation(self):
        """Test cart total calculation"""
        cart = Cart.objects.create(user=self.user)
        
        # Add items to cart
        CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=2
        )
        
        # Refresh cart from database
        cart.refresh_from_db()
        
        self.assertEqual(cart.total_items, 2)
        self.assertEqual(cart.total_price, Decimal('599.98'))


class CartItemModelTest(TestCase):
    """Test the CartItem model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.brand = Brand.objects.create(
            name="Facial Care",
            slug="facial-care"
        )
        self.product = Product.objects.create(
            brand=self.brand,
            name="Face Cleanser",
            description="Gentle face cleanser",
            price=Decimal('299.99'),
            slug="face-cleanser"
        )
        self.cart = Cart.objects.create(user=self.user)
    
    def test_create_cart_item(self):
        """Test creating a cart item"""
        cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=3
        )
        
        self.assertEqual(cart_item.cart, self.cart)
        self.assertEqual(cart_item.product, self.product)
        self.assertEqual(cart_item.quantity, 3)
        self.assertEqual(cart_item.subtotal, Decimal('899.97'))
    
    def test_cart_item_str(self):
        """Test cart item string representation"""
        cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1
        )
        
        expected = f"1x {self.product.name}"
        self.assertEqual(str(cart_item), expected)


class CartAPITest(APITestCase):
    """Test Cart API endpoints"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.brand = Brand.objects.create(
            name="Facial Care",
            slug="facial-care"
        )
        self.product1 = Product.objects.create(
            brand=self.brand,
            name="Face Cleanser",
            description="Gentle face cleanser",
            price=Decimal('299.99'),
            slug="face-cleanser"
        )
        self.product2 = Product.objects.create(
            brand=self.brand,
            name="Face Serum",
            description="Anti-aging serum",
            price=Decimal('599.99'),
            slug="face-serum"
        )
    
    def test_get_empty_cart(self):
        """Test getting an empty cart"""
        self.client.force_authenticate(user=self.user)
        url = '/api/cart/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['items']), 0)
        self.assertEqual(float(data['total_price']), 0.0)
        self.assertEqual(data['total_items'], 0)
    
    def test_add_item_to_cart(self):
        """Test adding an item to cart"""
        self.client.force_authenticate(user=self.user)
        url = '/api/cart/'
        data = {
            'product_id': self.product1.id,
            'quantity': 2
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify cart contents
        response = self.client.get(url)
        data = response.json()
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['items'][0]['quantity'], 2)
        self.assertEqual(data['total_items'], 2)
        self.assertEqual(float(data['total_price']), 599.98)
    
    def test_add_same_item_twice(self):
        """Test adding the same item twice increases quantity"""
        self.client.force_authenticate(user=self.user)
        url = '/api/cart/'
        data = {
            'product_id': self.product1.id,
            'quantity': 1
        }
        
        # Add item first time
        self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Add same item again
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify quantity is updated
        response = self.client.get(url)
        data = response.json()
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['items'][0]['quantity'], 2)
    
    def test_update_cart_item_quantity(self):
        """Test updating cart item quantity"""
        self.client.force_authenticate(user=self.user)
        
        # Add item to cart first
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(
            cart=cart,
            product=self.product1,
            quantity=1
        )
        
        # Update quantity
        url = f'/api/cart/items/{self.product1.id}/'
        data = {'quantity': 5}
        
        response = self.client.put(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify updated quantity
        cart_item = CartItem.objects.get(cart=cart, product=self.product1)
        self.assertEqual(cart_item.quantity, 5)
    
    def test_remove_item_from_cart(self):
        """Test removing an item from cart"""
        self.client.force_authenticate(user=self.user)
        
        # Add item to cart first
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(
            cart=cart,
            product=self.product1,
            quantity=2
        )
        
        # Remove item
        url = f'/api/cart/items/{self.product1.id}/'
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify item is removed
        self.assertFalse(
            CartItem.objects.filter(cart=cart, product=self.product1).exists()
        )
    
    def test_clear_cart(self):
        """Test clearing entire cart"""
        self.client.force_authenticate(user=self.user)
        
        # Add items to cart first
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product1, quantity=1)
        CartItem.objects.create(cart=cart, product=self.product2, quantity=2)
        
        # Clear cart
        url = '/api/cart/clear/'
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify cart is empty
        self.assertEqual(CartItem.objects.filter(cart=cart).count(), 0)
    
    def test_guest_cart_functionality(self):
        """Test cart functionality for guest users"""
        url = '/api/cart/'
        data = {
            'product_id': self.product1.id,
            'quantity': 1
        }
        
        # Add item as guest
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify guest cart was created
        self.assertTrue(Cart.objects.filter(user=None).exists())
    
    def test_invalid_product_id(self):
        """Test adding invalid product ID to cart"""
        self.client.force_authenticate(user=self.user)
        url = '/api/cart/'
        data = {
            'product_id': 99999,  # Non-existent product
            'quantity': 1
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_invalid_quantity(self):
        """Test adding item with invalid quantity"""
        self.client.force_authenticate(user=self.user)
        url = '/api/cart/'
        data = {
            'product_id': self.product1.id,
            'quantity': 0  # Invalid quantity
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
