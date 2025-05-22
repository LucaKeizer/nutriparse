from django.db import models
from django.conf import settings
from nutrition.models import NutritionData, MeasurementUnit


class Recipe(models.Model):
    """Recipe model to store recipe information"""
    title = models.CharField(max_length=255)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recipes')
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True)
    servings = models.PositiveIntegerField(default=1)
    prep_time = models.PositiveIntegerField(help_text="Preparation time in minutes", null=True, blank=True)
    cook_time = models.PositiveIntegerField(help_text="Cooking time in minutes", null=True, blank=True)
    
    # Original recipe text as pasted by the user
    original_text = models.TextField(blank=True)
    
    # Image field (optional)
    image = models.ImageField(upload_to='recipe_images/', null=True, blank=True)
    
    # Recipe metadata
    source_url = models.URLField(blank=True)
    source_name = models.CharField(max_length=255, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Nutritional information cache (to avoid recalculating every time)
    total_calories = models.FloatField(null=True, blank=True)
    total_protein = models.FloatField(null=True, blank=True)
    total_carbs = models.FloatField(null=True, blank=True)
    total_fat = models.FloatField(null=True, blank=True)
    total_fiber = models.FloatField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def calculate_nutrition(self):
        """Calculate and cache nutritional information for the recipe"""
        total_calories = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        total_fiber = 0
        
        for ingredient in self.ingredients.all():
            if ingredient.food and ingredient.quantity and ingredient.unit:
                # Convert to grams
                try:
                    # Try to get specific conversion
                    conversion = ingredient.food.conversions.get(unit=ingredient.unit)
                    grams = ingredient.quantity * conversion.grams_per_unit
                except:
                    # Default fallback
                    grams = ingredient.quantity  # Assume already in grams
                
                # Calculate nutrition based on grams
                proportion = grams / 100  # Nutrition data is per 100g
                total_calories += ingredient.food.calories * proportion
                total_protein += ingredient.food.protein * proportion
                total_carbs += ingredient.food.carbohydrates * proportion
                total_fat += ingredient.food.fat * proportion
                total_fiber += ingredient.food.fiber * proportion
        
        # Save the calculated values
        self.total_calories = total_calories
        self.total_protein = total_protein
        self.total_carbs = total_carbs
        self.total_fat = total_fat
        self.total_fiber = total_fiber
        self.save()


class RecipeIngredient(models.Model):
    """Ingredients for a recipe with quantity and unit information"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    food = models.ForeignKey(NutritionData, on_delete=models.SET_NULL, null=True, blank=True, related_name='recipe_usages')
    quantity = models.FloatField(null=True, blank=True)
    unit = models.ForeignKey(MeasurementUnit, on_delete=models.SET_NULL, null=True, blank=True)
    preparation = models.CharField(max_length=100, blank=True, help_text="E.g., chopped, diced, minced")
    
    # The original text parsed from the recipe
    original_text = models.TextField()
    
    # Whether this ingredient was successfully parsed and matched
    is_parsed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['id']
    
    def __str__(self):
        if self.food and self.quantity and self.unit:
            return f"{self.quantity} {self.unit.abbreviation} {self.food.name}"
        return self.original_text

    
class Tag(models.Model):
    """Tags for categorizing recipes"""
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name


class RecipeTag(models.Model):
    """Many-to-many relationship between recipes and tags"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='recipe_tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='tagged_recipes')
    
    class Meta:
        unique_together = ('recipe', 'tag')