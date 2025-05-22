from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from recipes.models import Recipe


class UserProfile(models.Model):
    """Extended user profile information"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    
    # Personal information
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    
    # Preferences
    favorite_recipes = models.ManyToManyField(Recipe, blank=True, related_name='favorited_by')
    dietary_preferences = models.TextField(blank=True, help_text="Dietary preferences or restrictions")
    
    # Settings
    email_notifications = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"