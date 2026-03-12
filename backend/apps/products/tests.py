from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from .models import Brand, Product

User = get_user_model()


class BrandModelTest(TestCase):
    """Test the Brand model"""
    
    def test_create_brand(self):
        """Test creating a brand"""
        brand = Brand.objects.create(
            name="Facial Care",
            description="Premium facial care products",
            slug="facial-care"
        )
        
        self.assertEqual(str(brand), "Facial Care")
        self.assertEqual(brand.slug, "facial-care")
        self.assertEqual(brand.description, "Premium facial care products")


class ProductModelTest(TestCase):
    """Test the Product model"""
    
    def setUp(self):
        self.brand = Brand.objects.create(
            name="Facial Care",
            slug="facial-care"
        )
    
    def test_create_product(self):
        """Test creating a product"""
        product = Product.objects.create(
            brand=self.brand,
            name="Premium Face Serum",
            description="Advanced anti-aging serum",
            price=Decimal('1299.99'),
            slug="premium-face-serum"
        )
        
        self.assertEqual(str(product), "Premium Face Serum")
        self.assertEqual(product.brand, self.brand)
        self.assertEqual(product.price, Decimal('1299.99'))
        self.assertEqual(product.slug, "premium-face-serum")
    
    def test_product_ordering(self):
        """Test that products are ordered by creation date (newest first)"""
        product1 = Product.objects.create(
            brand=self.brand,
            name="Product 1",
            description="First product",
            price=Decimal('100.00'),
            slug="product-1"
        )
        
        product2 = Product.objects.create(
            brand=self.brand,
            name="Product 2", 
            description="Second product",
            price=Decimal('200.00'),
            slug="product-2"
        )
        
        products = Product.objects.all()
        self.assertEqual(products[0], product2)  # Newest first
        self.assertEqual(products[1], product1)


class ProductAPITest(APITestCase):
    """Test Product API endpoints"""
    
    def setUp(self):
        self.brand1 = Brand.objects.create(
            name="Facial Care",
            slug="facial-care"
        )
        self.brand2 = Brand.objects.create(
            name="Hair Care",
            slug="hair-care"
        )
        
        self.product1 = Product.objects.create(
            brand=self.brand1,
            name="Face Cleanser",
            description="Gentle face cleanser",
            price=Decimal('299.99'),
            slug="face-cleanser"
        )
        
        self.product2 = Product.objects.create(
            brand=self.brand2,
            name="Hair Serum",
            description="Nourishing hair serum",
            price=Decimal('599.99'),
            slug="hair-serum"
        )
    
    def test_get_products_list(self):
        """Test retrieving products list"""
        url = '/api/products/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['results']), 2)
    
    def test_get_product_detail(self):
        """Test retrieving a single product"""
        url = f'/api/products/{self.product1.slug}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['name'], self.product1.name)
        self.assertEqual(data['slug'], self.product1.slug)
        self.assertEqual(float(data['price']), float(self.product1.price))
    
    def test_get_nonexistent_product(self):
        """Test retrieving a nonexistent product"""
        url = '/api/products/nonexistent/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_filter_products_by_brand(self):
        """Test filtering products by brand"""
        url = '/api/products/'
        response = self.client.get(url, {'brand': self.brand1.slug})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['name'], self.product1.name)
    
    def test_filter_products_by_price_range(self):
        """Test filtering products by price range"""
        url = '/api/products/'
        response = self.client.get(url, {
            'price_min': '500',
            'price_max': '700'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['name'], self.product2.name)
    
    def test_search_products(self):
        """Test searching products"""
        url = '/api/products/'
        response = self.client.get(url, {'search': 'hair'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['name'], self.product2.name)
    
    def test_products_ordering(self):
        """Test products ordering"""
        url = '/api/products/'
        
        # Test ordering by price (low to high)
        response = self.client.get(url, {'ordering': 'price'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['results'][0]['name'], self.product1.name)
        
        # Test ordering by price (high to low)
        response = self.client.get(url, {'ordering': '-price'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['results'][0]['name'], self.product2.name)


class BrandAPITest(APITestCase):
    """Test Brand API endpoints"""
    
    def setUp(self):
        self.brand1 = Brand.objects.create(
            name="Facial Care",
            description="Premium facial care products",
            slug="facial-care"
        )
        self.brand2 = Brand.objects.create(
            name="Hair Care", 
            description="Professional hair care products",
            slug="hair-care"
        )
    
    def test_get_brands_list(self):
        """Test retrieving brands list"""
        url = '/api/products/brands/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 2)
        
        # Check brands are ordered by name
        self.assertEqual(data[0]['name'], "Facial Care")
        self.assertEqual(data[1]['name'], "Hair Care")
    
    def test_get_brand_detail(self):
        """Test retrieving a single brand"""
        url = f'/api/products/brands/{self.brand1.slug}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['name'], self.brand1.name)
        self.assertEqual(data['slug'], self.brand1.slug)
        self.assertEqual(data['description'], self.brand1.description)