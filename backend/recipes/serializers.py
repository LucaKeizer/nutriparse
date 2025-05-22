from rest_framework import serializers
from .models import Recipe, RecipeIngredient, Tag, RecipeTag
from nutrition.serializers import NutritionDataLightSerializer, MeasurementUnitSerializer


class RecipeIngredientSerializer(serializers.ModelSerializer):
    food_details = NutritionDataLightSerializer(source='food', read_only=True)
    unit_details = MeasurementUnitSerializer(source='unit', read_only=True)
    
    class Meta:
        model = RecipeIngredient
        fields = [
            'id', 'food', 'food_details', 'quantity', 'unit', 
            'unit_details', 'preparation', 'original_text', 'is_parsed'
        ]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class RecipeSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(many=True, read_only=True)
    tags = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    nutrition_per_serving = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'user', 'user_username', 'description', 
            'instructions', 'servings', 'prep_time', 'cook_time',
            'original_text', 'image', 'source_url', 'source_name',
            'created_at', 'updated_at', 'ingredients', 'tags',
            'total_calories', 'total_protein', 'total_carbs', 
            'total_fat', 'total_fiber', 'nutrition_per_serving'
        ]
        read_only_fields = [
            'id', 'user_username', 'created_at', 'updated_at', 
            'total_calories', 'total_protein', 'total_carbs', 
            'total_fat', 'total_fiber', 'nutrition_per_serving'
        ]
    
    def get_tags(self, obj):
        recipe_tags = RecipeTag.objects.filter(recipe=obj)
        tags = [recipe_tag.tag for recipe_tag in recipe_tags]
        return TagSerializer(tags, many=True).data
    
    def get_nutrition_per_serving(self, obj):
        if obj.servings and obj.servings > 0:
            return {
                'calories': obj.total_calories / obj.servings if obj.total_calories else None,
                'protein': obj.total_protein / obj.servings if obj.total_protein else None,
                'carbs': obj.total_carbs / obj.servings if obj.total_carbs else None,
                'fat': obj.total_fat / obj.servings if obj.total_fat else None,
                'fiber': obj.total_fiber / obj.servings if obj.total_fiber else None
            }
        return None


class RecipeLightSerializer(serializers.ModelSerializer):
    """A lighter version of RecipeSerializer with fewer details"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    tags = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'user_username', 'description', 
            'servings', 'prep_time', 'cook_time', 'image',
            'created_at', 'updated_at', 'tags',
            'total_calories', 'total_protein', 'total_carbs', 'total_fat'
        ]
    
    def get_tags(self, obj):
        recipe_tags = RecipeTag.objects.filter(recipe=obj)
        tags = [recipe_tag.tag for recipe_tag in recipe_tags]
        return TagSerializer(tags, many=True).data


class RecipeParserSerializer(serializers.Serializer):
    """Serializer for the recipe parser endpoint"""
    recipe_text = serializers.CharField(required=True, help_text="Raw recipe text to parse")
    title = serializers.CharField(required=False, help_text="Recipe title")
    servings = serializers.IntegerField(required=False, help_text="Number of servings")
    save_recipe = serializers.BooleanField(required=False, default=False, help_text="Whether to save the recipe")
    
    def validate_servings(self, value):
        if value and value < 1:
            raise serializers.ValidationError("Servings must be at least 1")
        return value