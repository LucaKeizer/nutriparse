from rest_framework import serializers
from .models import FoodGroup, NutritionData, MeasurementUnit, FoodConversion


class FoodGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodGroup
        fields = ['id', 'name']


class MeasurementUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasurementUnit
        fields = ['id', 'name', 'abbreviation', 'type']


class FoodConversionSerializer(serializers.ModelSerializer):
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    unit_abbreviation = serializers.CharField(source='unit.abbreviation', read_only=True)
    
    class Meta:
        model = FoodConversion
        fields = ['id', 'unit', 'unit_name', 'unit_abbreviation', 'grams_per_unit']


class NutritionDataSerializer(serializers.ModelSerializer):
    food_group_name = serializers.CharField(source='food_group.name', read_only=True)
    conversions = FoodConversionSerializer(many=True, read_only=True)
    
    class Meta:
        model = NutritionData
        fields = [
            'id', 'name', 'food_group', 'food_group_name', 'description',
            'calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar',
            'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
            'thiamin', 'riboflavin', 'niacin', 'vitamin_b6', 'folate', 'vitamin_b12',
            'calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'sodium', 'zinc',
            'cholesterol', 'saturated_fat', 'monounsaturated_fat', 'polyunsaturated_fat', 'trans_fat',
            'common_name', 'search_terms', 'conversions'
        ]


class NutritionDataLightSerializer(serializers.ModelSerializer):
    """A lighter version of NutritionDataSerializer with only essential fields"""
    food_group_name = serializers.CharField(source='food_group.name', read_only=True)
    
    class Meta:
        model = NutritionData
        fields = [
            'id', 'name', 'food_group_name', 'calories', 
            'protein', 'carbohydrates', 'fat', 'fiber'
        ]


class NutritionSearchSerializer(serializers.Serializer):
    """Serializer for the nutrition search endpoint"""
    query = serializers.CharField(required=True, help_text="Food name to search for")
    limit = serializers.IntegerField(required=False, default=20, help_text="Number of results to return")
    
    def validate_limit(self, value):
        if value < 1 or value > 100:
            raise serializers.ValidationError("Limit must be between 1 and 100")
        return value