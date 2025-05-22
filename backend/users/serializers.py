from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
from recipes.serializers import RecipeLightSerializer


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'profile_picture', 'dietary_preferences', 'email_notifications']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    favorite_recipes = RecipeLightSerializer(source='profile.favorite_recipes', many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'profile', 'favorite_recipes']
        read_only_fields = ['id', 'date_joined']
    
    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, **profile_data)
        return user
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update user fields
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        
        # Update or create profile
        profile = instance.profile
        for key, value in profile_data.items():
            setattr(profile, key, value)
        profile.save()
        
        return instance


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 'last_name']
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords do not match")
        return data