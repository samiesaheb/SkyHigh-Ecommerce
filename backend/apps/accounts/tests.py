from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
import json

User = get_user_model()


class CustomUserModelTest(TestCase):
    """Test the custom user model"""
    
    def test_create_user_with_email(self):
        """Test creating a user with email"""
        email = "test@example.com"
        password = "testpass123"
        user = User.objects.create_user(email=email, password=password)
        
        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
    
    def test_create_superuser(self):
        """Test creating a superuser"""
        email = "admin@example.com"
        password = "adminpass123"
        user = User.objects.create_superuser(email=email, password=password)
        
        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
    
    def test_user_email_normalization(self):
        """Test that email domain is normalized to lowercase"""
        email = "Test@EXAMPLE.com"
        user = User.objects.create_user(email=email, password="testpass123")
        # Django normalizes the domain part to lowercase
        expected = "Test@example.com"
        self.assertEqual(user.email, expected)


class AuthenticationAPITest(APITestCase):
    """Test authentication API endpoints"""
    
    def setUp(self):
        self.client = Client()
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
    
    def test_user_registration(self):
        """Test user registration"""
        url = '/api/accounts/register/'
        response = self.client.post(
            url,
            data=json.dumps(self.user_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email=self.user_data['email']).exists())
    
    def test_user_login(self):
        """Test user login"""
        # Create user first
        user = User.objects.create_user(
            email=self.user_data['email'],
            password=self.user_data['password']
        )
        
        url = '/api/accounts/login/'
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        
        response = self.client.post(
            url,
            data=json.dumps(login_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('sessionid', response.cookies)
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        url = '/api/accounts/login/'
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(
            url,
            data=json.dumps(login_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_user_profile(self):
        """Test authenticated user profile access"""
        user = User.objects.create_user(
            email=self.user_data['email'],
            password=self.user_data['password'],
            first_name=self.user_data['first_name'],
            last_name=self.user_data['last_name']
        )
        
        self.client.force_login(user)
        url = '/api/accounts/user/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['email'], user.email)
        self.assertEqual(data['first_name'], user.first_name)
        self.assertEqual(data['last_name'], user.last_name)
    
    def test_profile_unauthenticated(self):
        """Test profile access without authentication"""
        url = '/api/accounts/user/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_logout(self):
        """Test user logout"""
        user = User.objects.create_user(
            email=self.user_data['email'],
            password=self.user_data['password']
        )
        
        self.client.force_login(user)
        url = '/api/accounts/logout/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PasswordChangeTest(APITestCase):
    """Test password change functionality"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='oldpassword123'
        )
        self.client.force_login(self.user)
    
    def test_password_change_success(self):
        """Test successful password change"""
        url = '/api/accounts/change-password/'
        data = {
            'old_password': 'oldpassword123',
            'new_password1': 'newpassword456',
            'new_password2': 'newpassword456'
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh user from database and check password
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword456'))
    
    def test_password_change_wrong_old_password(self):
        """Test password change with wrong old password"""
        url = '/api/accounts/change-password/'
        data = {
            'old_password': 'wrongpassword',
            'new_password1': 'newpassword456',
            'new_password2': 'newpassword456'
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_password_change_mismatch(self):
        """Test password change with mismatched new passwords"""
        url = '/api/accounts/change-password/'
        data = {
            'old_password': 'oldpassword123',
            'new_password1': 'newpassword456',
            'new_password2': 'differentpassword789'
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
