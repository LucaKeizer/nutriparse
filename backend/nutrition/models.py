from django.db import models


class FoodGroup(models.Model):
    """Food categories like Fruits, Vegetables, Grains, etc."""
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name


class NutritionData(models.Model):
    """Nutritional information for foods per 100g"""
    name = models.CharField(max_length=255)
    food_group = models.ForeignKey(FoodGroup, on_delete=models.CASCADE, related_name='foods')
    description = models.TextField(blank=True)
    
    # Basic macronutrients (per 100g)
    calories = models.FloatField(help_text="kcal per 100g")
    protein = models.FloatField(help_text="grams per 100g")
    carbohydrates = models.FloatField(help_text="grams per 100g")
    fat = models.FloatField(help_text="grams per 100g")
    fiber = models.FloatField(help_text="grams per 100g", default=0)
    sugar = models.FloatField(help_text="grams per 100g", default=0)
    
    # Essential vitamins (per 100g)
    vitamin_a = models.FloatField(help_text="µg per 100g", default=0)
    vitamin_c = models.FloatField(help_text="mg per 100g", default=0)
    vitamin_d = models.FloatField(help_text="µg per 100g", default=0)
    vitamin_e = models.FloatField(help_text="mg per 100g", default=0)
    vitamin_k = models.FloatField(help_text="µg per 100g", default=0)
    thiamin = models.FloatField(help_text="mg per 100g", default=0)
    riboflavin = models.FloatField(help_text="mg per 100g", default=0)
    niacin = models.FloatField(help_text="mg per 100g", default=0)
    vitamin_b6 = models.FloatField(help_text="mg per 100g", default=0)
    folate = models.FloatField(help_text="µg per 100g", default=0)
    vitamin_b12 = models.FloatField(help_text="µg per 100g", default=0)
    
    # Essential minerals (per 100g)
    calcium = models.FloatField(help_text="mg per 100g", default=0)
    iron = models.FloatField(help_text="mg per 100g", default=0)
    magnesium = models.FloatField(help_text="mg per 100g", default=0)
    phosphorus = models.FloatField(help_text="mg per 100g", default=0)
    potassium = models.FloatField(help_text="mg per 100g", default=0)
    sodium = models.FloatField(help_text="mg per 100g", default=0)
    zinc = models.FloatField(help_text="mg per 100g", default=0)
    
    # Other nutrients and components
    cholesterol = models.FloatField(help_text="mg per 100g", default=0)
    saturated_fat = models.FloatField(help_text="grams per 100g", default=0)
    monounsaturated_fat = models.FloatField(help_text="grams per 100g", default=0)
    polyunsaturated_fat = models.FloatField(help_text="grams per 100g", default=0)
    trans_fat = models.FloatField(help_text="grams per 100g", default=0)
    
    # Search-related fields
    common_name = models.CharField(max_length=255, blank=True)
    search_terms = models.TextField(blank=True, help_text="Comma-separated search terms")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Nutrition Data"
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['common_name']),
        ]
    
    def __str__(self):
        return self.name


class MeasurementUnit(models.Model):
    """Units of measurement for ingredients"""
    TYPE_CHOICES = [
        ('volume', 'Volume'),
        ('weight', 'Weight'),
        ('count', 'Count'),
    ]
    
    name = models.CharField(max_length=50)
    abbreviation = models.CharField(max_length=10)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    
    class Meta:
        unique_together = ('name', 'type')
    
    def __str__(self):
        return f"{self.name} ({self.abbreviation})"


class FoodConversion(models.Model):
    """Conversion factors from unit measures to grams for specific foods"""
    food = models.ForeignKey(NutritionData, on_delete=models.CASCADE, related_name='conversions')
    unit = models.ForeignKey(MeasurementUnit, on_delete=models.CASCADE)
    grams_per_unit = models.FloatField(help_text="Weight in grams for one unit")
    
    class Meta:
        unique_together = ('food', 'unit')
    
    def __str__(self):
        return f"{self.food.name}: 1 {self.unit.name} = {self.grams_per_unit}g"