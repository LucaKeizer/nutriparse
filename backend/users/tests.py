from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import UserProfile


class UserProfileModelTest(TestCase):
    """Test the UserProfile model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword"
        )
        self.profile = self.user.profile  # Should be created automatically via signal
    
    def test_profile_str(self):
        self.assertEqual(str(self.profile), "testuser's Profile")
    
    def test_profile_created_automatically(self):
        """Test that a profile is created automatically when a user is created"""
        self.assertIsNotNone(self.profile)
        self.assertEqual(self.profile.user, self.user)


class UserAPITest(TestCase):
    """Test the User API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword"
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        self.url = reverse('user-list')
        self.detail_url = reverse('user-detail', args=[self.user.id])
        self.me_url = reverse('user-me')
        self.register_url = reverse('user-register')
        self.login_url = reverse('user-login')
        self.logout_url = reverse('user-logout')
        self.change_password_url = reverse('user-change-password')
    
    def test_get_user_me(self):
        """Test retrieving the current user's profile"""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], "testuser")
    
    def test_register_user(self):
        """Test registering a new user"""
        self.client.credentials()  # Clear authentication
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpassword',
            'confirm_password': 'newpassword'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(User.objects.count(), 2)
        self.assertEqual(User.objects.last().username, 'newuser')
    
    def test_login_user(self):
        """Test logging in a user"""
        self.client.credentials()  # Clear authentication
        data = {
            'username': 'testuser',
            'password': 'testpassword'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
    
    def test_logout_user(self):
        """Test logging out a user"""
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Token.objects.filter(user=self.user).exists())
    
    def test_change_password(self):
        """Test changing a user's password"""
        data = {
            'old_password': 'testpassword',
            'new_password': 'newtestpassword',
            'confirm_password': 'newtestpassword'
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test login with new password
        self.client.credentials()  # Clear authentication
        login_data = {
            'username': 'testuser',
            'password': 'newtestpassword'
        }
        login_response = self.client.post(self.login_url, login_data)
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
    
    def test_update_profile(self):
        """Test updating a user's profile"""
        data = {
            'first_name': 'Test',
            'last_name': 'User',
            'profile': {
                'bio': 'This is a test bio',
                'dietary_preferences': 'Vegetarian'
            }
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh user from database
        self.user.refresh_from_db()
        self.user.profile.refresh_from_db()
        
        # Check that user and profile were updated
        self.assertEqual(self.user.first_name, 'Test')
        self.assertEqual(self.user.last_name, 'User')
        self.assertEqual(self.user.profile.bio, 'This is a test bio')
        self.assertEqual(self.user.profile.dietary_preferences, 'Vegetarian')