from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Recipe, RecipeIngredient, Tag, RecipeTag
from nutrition.models import FoodGroup, NutritionData, MeasurementUnit
from .parser import parse_recipe_text, match_ingredients_to_foods


class RecipeModelTest(TestCase):
    """Test the Recipe model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword"
        )
        self.recipe = Recipe.objects.create(
            title="Test Recipe",
            user=self.user,
            description="A test recipe",
            instructions="Test instructions",
            servings=4
        )
    
    def test_recipe_str(self):
        self.assertEqual(str(self.recipe), "Test Recipe")
    
    def test_calculate_nutrition(self):
        # Create food group, nutrition data, and measurement unit
        food_group = FoodGroup.objects.create(name="Test Food Group")
        food = NutritionData.objects.create(
            name="Test Food",
            food_group=food_group,
            calories=100,
            protein=10,
            carbohydrates=20,
            fat=5,
            fiber=2
        )
        unit = MeasurementUnit.objects.create(
            name="cup",
            abbreviation="cup",
            type="volume"
        )
        
        # Create a recipe ingredient
        ingredient = RecipeIngredient.objects.create(
            recipe=self.recipe,
            food=food,
            quantity=2,
            unit=unit,
            original_text="2 cups Test Food"
        )
        
        # Calculate nutrition with no conversion
        self.recipe.calculate_nutrition()
        
        # Check that the nutrition values were calculated correctly
        # Since we don't have a conversion, it should assume 2 grams
        self.assertEqual(self.recipe.total_calories, 2)
        self.assertEqual(self.recipe.total_protein, 0.2)
        self.assertEqual(self.recipe.total_carbs, 0.4)
        self.assertEqual(self.recipe.total_fat, 0.1)
        self.assertEqual(self.recipe.total_fiber, 0.04)


class RecipeIngredientModelTest(TestCase):
    """Test the RecipeIngredient model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword"
        )
        self.recipe = Recipe.objects.create(
            title="Test Recipe",
            user=self.user,
            description="A test recipe",
            instructions="Test instructions",
            servings=4
        )
        self.food_group = FoodGroup.objects.create(name="Test Food Group")
        self.food = NutritionData.objects.create(
            name="Test Food",
            food_group=self.food_group,
            calories=100,
            protein=10,
            carbohydrates=20,
            fat=5
        )
        self.unit = MeasurementUnit.objects.create(
            name="cup",
            abbreviation="cup",
            type="volume"
        )
        self.ingredient = RecipeIngredient.objects.create(
            recipe=self.recipe,
            food=self.food,
            quantity=2,
            unit=self.unit,
            original_text="2 cups Test Food"
        )
    
    def test_ingredient_str_with_food(self):
        self.assertEqual(str(self.ingredient), "2 cup Test Food")
    
    def test_ingredient_str_without_food(self):
        ingredient = RecipeIngredient.objects.create(
            recipe=self.recipe,
            original_text="Some ingredient"
        )
        self.assertEqual(str(ingredient), "Some ingredient")


class TagModelTest(TestCase):
    """Test the Tag model"""
    
    def setUp(self):
        self.tag = Tag.objects.create(name="Test Tag")
    
    def test_tag_str(self):
        self.assertEqual(str(self.tag), "Test Tag")


class RecipeParserTest(TestCase):
    """Test the recipe parser functions"""
    
    def setUp(self):
        # Create some food items for matching
        self.food_group = FoodGroup.objects.create(name="Test Food Group")
        self.apple = NutritionData.objects.create(
            name="Apple",
            common_name="apple",
            food_group=self.food_group,
            calories=52,
            protein=0.3,
            carbohydrates=14,
            fat=0.2
        )
        self.flour = NutritionData.objects.create(
            name="All-purpose flour",
            common_name="flour",
            food_group=self.food_group,
            calories=364,
            protein=10.3,
            carbohydrates=76.3,
            fat=1.0
        )
        
        # Create some measurement units
        self.cup = MeasurementUnit.objects.create(
            name="cup",
            abbreviation="cup",
            type="volume"
        )
        self.tbsp = MeasurementUnit.objects.create(
            name="tablespoon",
            abbreviation="tbsp",
            type="volume"
        )
    
    def test_parse_recipe_text(self):
        recipe_text = """
        Ingredients:
        2 cups all-purpose flour
        1 cup sugar
        1/2 teaspoon salt
        3 apples, diced
        
        Instructions:
        1. Mix dry ingredients
        2. Add apples
        3. Bake at 350F for 30 minutes
        """
        
        parsed_data = parse_recipe_text(recipe_text)
        
        # Check that ingredients were parsed correctly
        self.assertIn('ingredients', parsed_data)
        self.assertEqual(len(parsed_data['ingredients']), 4)
        
        # Check first ingredient details
        first_ingredient = parsed_data['ingredients'][0]
        self.assertEqual(first_ingredient['quantity'], 2)
        self.assertEqual(first_ingredient['unit'], 'cup')
        self.assertEqual(first_ingredient['ingredient'], 'all-purpose flour')
        
        # Check that instructions were included
        self.assertIn('instructions', parsed_data)
    
    def test_match_ingredients_to_foods(self):
        parsed_ingredients = [
            {
                'quantity': 2,
                'unit': 'cup',
                'ingredient': 'all-purpose flour',
                'preparation': None,
                'original_text': '2 cups all-purpose flour'
            },
            {
                'quantity': 3,
                'unit': None,
                'ingredient': 'apples',
                'preparation': 'diced',
                'original_text': '3 apples, diced'
            }
        ]
        
        matched_ingredients = match_ingredients_to_foods(parsed_ingredients)
        
        # Check that ingredients were matched correctly
        self.assertEqual(len(matched_ingredients), 2)
        
        # Check flour match
        self.assertEqual(matched_ingredients[0]['food'], self.flour)
        self.assertEqual(matched_ingredients[0]['unit'], self.cup)
        self.assertTrue(matched_ingredients[0]['is_parsed'])
        
        # Check apple match
        self.assertEqual(matched_ingredients[1]['food'], self.apple)
        self.assertEqual(matched_ingredients[1]['preparation'], 'diced')
        self.assertTrue(matched_ingredients[1]['is_parsed'])


class RecipeAPITest(TestCase):
    """Test the Recipe API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword"
        )
        self.client.force_authenticate(user=self.user)
        
        self.recipe = Recipe.objects.create(
            title="Test Recipe",
            user=self.user,
            description="A test recipe",
            instructions="Test instructions",
            servings=4
        )
        
        self.url = reverse('recipe-list')
        self.detail_url = reverse('recipe-detail', args=[self.recipe.id])
        self.parse_url = reverse('recipe-parse')
    
    def test_get_all_recipes(self):
        """Test retrieving all recipes"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_get_single_recipe(self):
        """Test retrieving a single recipe"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Test Recipe")
    
    def test_create_recipe(self):
        """Test creating a new recipe"""
        data = {
            'title': 'New Recipe',
            'description': 'A new test recipe',
            'instructions': 'New test instructions',
            'servings': 2
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Recipe.objects.count(), 2)
        self.assertEqual(Recipe.objects.last().title, 'New Recipe')
    
    def test_update_recipe(self):
        """Test updating a recipe"""
        data = {
            'title': 'Updated Recipe',
            'description': 'An updated test recipe',
            'instructions': 'Updated test instructions',
            'servings': 6
        }
        response = self.client.put(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()
        self.assertEqual(self.recipe.title, 'Updated Recipe')
        self.assertEqual(self.recipe.servings, 6)
    
    def test_delete_recipe(self):
        """Test deleting a recipe"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Recipe.objects.count(), 0)
    
    def test_parse_recipe(self):
        """Test parsing a recipe"""
        data = {
            'recipe_text': """
            Ingredients:
            2 cups all-purpose flour
            1 cup sugar
            
            Instructions:
            1. Mix ingredients
            2. Bake
            """,
            'title': 'Parsed Recipe',
            'servings': 4
        }
        response = self.client.post(self.parse_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('parsed_data', response.data)
        self.assertIn('ingredients', response.data['parsed_data'])
        self.assertEqual(len(response.data['parsed_data']['ingredients']), 2)