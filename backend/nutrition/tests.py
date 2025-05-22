from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import FoodGroup, NutritionData, MeasurementUnit, FoodConversion


class FoodGroupModelTest(TestCase):
    """Test the FoodGroup model"""
    
    def setUp(self):
        self.food_group = FoodGroup.objects.create(name="Test Food Group")
    
    def test_food_group_str(self):
        self.assertEqual(str(self.food_group), "Test Food Group")


class NutritionDataModelTest(TestCase):
    """Test the NutritionData model"""
    
    def setUp(self):
        self.food_group = FoodGroup.objects.create(name="Test Food Group")
        self.nutrition_data = NutritionData.objects.create(
            name="Test Food",
            food_group=self.food_group,
            calories=100,
            protein=10,
            carbohydrates=20,
            fat=5
        )
    
    def test_nutrition_data_str(self):
        self.assertEqual(str(self.nutrition_data), "Test Food")


class MeasurementUnitModelTest(TestCase):
    """Test the MeasurementUnit model"""
    
    def setUp(self):
        self.unit = MeasurementUnit.objects.create(
            name="Test Unit",
            abbreviation="tu",
            type="volume"
        )
    
    def test_unit_str(self):
        self.assertEqual(str(self.unit), "Test Unit (tu)")


class FoodConversionModelTest(TestCase):
    """Test the FoodConversion model"""
    
    def setUp(self):
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
            name="Test Unit",
            abbreviation="tu",
            type="volume"
        )
        self.conversion = FoodConversion.objects.create(
            food=self.food,
            unit=self.unit,
            grams_per_unit=50
        )
    
    def test_conversion_str(self):
        self.assertEqual(str(self.conversion), "Test Food: 1 Test Unit = 50g")


class NutritionDataAPITest(TestCase):
    """Test the NutritionData API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.food_group = FoodGroup.objects.create(name="Test Food Group")
        self.nutrition_data = NutritionData.objects.create(
            name="Test Food",
            food_group=self.food_group,
            calories=100,
            protein=10,
            carbohydrates=20,
            fat=5
        )
        self.url = reverse('nutritiondata-list')
        self.detail_url = reverse('nutritiondata-detail', args=[self.nutrition_data.id])
    
    def test_get_all_nutrition_data(self):
        """Test retrieving all nutrition data"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_get_single_nutrition_data(self):
        """Test retrieving a single nutrition data item"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Test Food")


class NutritionSearchTest(TestCase):
    """Test the nutrition search functionality"""
    
    def setUp(self):
        self.client = APIClient()
        self.food_group = FoodGroup.objects.create(name="Test Food Group")
        self.apple = NutritionData.objects.create(
            name="Apple",
            common_name="apple",
            food_group=self.food_group,
            calories=52,
            protein=0.3,
            carbohydrates=14,
            fat=0.2,
            search_terms="apple, red apple, green apple"
        )
        self.banana = NutritionData.objects.create(
            name="Banana",
            common_name="banana",
            food_group=self.food_group,
            calories=89,
            protein=1.1,
            carbohydrates=22.8,
            fat=0.3,
            search_terms="banana, yellow fruit"
        )
        self.search_url = reverse('nutritiondata-search')
    
    def test_search_by_name(self):
        """Test searching by name"""
        response = self.client.post(self.search_url, {'query': 'apple'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Apple")
    
    def test_search_by_terms(self):
        """Test searching by search terms"""
        response = self.client.post(self.search_url, {'query': 'yellow'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Banana")