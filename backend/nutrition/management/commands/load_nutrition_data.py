import os
import csv
import json
from django.core.management.base import BaseCommand
from django.db import transaction
from nutrition.models import FoodGroup, NutritionData, MeasurementUnit, FoodConversion


class Command(BaseCommand):
    help = 'Load nutrition data from CSV or JSON files'
    
    def add_arguments(self, parser):
        parser.add_argument(
            'file_path',
            type=str,
            help='Path to the CSV or JSON file containing nutrition data'
        )
        parser.add_argument(
            '--format',
            type=str,
            choices=['csv', 'json'],
            default='csv',
            help='Format of the input file (csv or json)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing nutrition data before loading'
        )
    
    def handle(self, *args, **options):
        file_path = options['file_path']
        file_format = options['format']
        clear_data = options['clear']
        
        # Check if file exists
        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f'File not found: {file_path}'))
            return
        
        # Clear existing data if requested
        if clear_data:
            self.stdout.write(self.style.WARNING('Clearing existing nutrition data...'))
            NutritionData.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Nutrition data cleared!'))
        
        # Load data from file
        self.stdout.write(self.style.WARNING(f'Loading nutrition data from {file_path}...'))
        
        try:
            if file_format == 'csv':
                self.load_from_csv(file_path)
            else:
                self.load_from_json(file_path)
                
            self.stdout.write(self.style.SUCCESS('Nutrition data loaded successfully!'))
            
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error loading nutrition data: {str(e)}'))
    
    @transaction.atomic
    def load_from_csv(self, file_path):
        """Load nutrition data from a CSV file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # Get or create the "Other" food group for unknown groups
            other_group, _ = FoodGroup.objects.get_or_create(name='Other')
            
            # Counter for tracking progress
            count = 0
            
            for row in reader:
                # Get or create food group
                food_group_name = row.get('food_group', '').strip()
                if food_group_name:
                    food_group, _ = FoodGroup.objects.get_or_create(name=food_group_name)
                else:
                    food_group = other_group
                
                # Get or create food item
                food_name = row.get('name', '').strip()
                if not food_name:
                    continue  # Skip entries without a name
                
                # Check if food already exists
                food, created = NutritionData.objects.get_or_create(
                    name=food_name,
                    defaults={
                        'food_group': food_group,
                        'common_name': row.get('common_name', '').strip(),
                        'description': row.get('description', '').strip(),
                        'search_terms': row.get('search_terms', '').strip()
                    }
                )
                
                # Update nutrition values
                try:
                    food.calories = float(row.get('calories', 0))
                    food.protein = float(row.get('protein', 0))
                    food.carbohydrates = float(row.get('carbohydrates', 0))
                    food.fat = float(row.get('fat', 0))
                    food.fiber = float(row.get('fiber', 0))
                    food.sugar = float(row.get('sugar', 0))
                    
                    # Vitamins
                    food.vitamin_a = float(row.get('vitamin_a', 0))
                    food.vitamin_c = float(row.get('vitamin_c', 0))
                    food.vitamin_d = float(row.get('vitamin_d', 0))
                    food.vitamin_e = float(row.get('vitamin_e', 0))
                    food.vitamin_k = float(row.get('vitamin_k', 0))
                    food.thiamin = float(row.get('thiamin', 0))
                    food.riboflavin = float(row.get('riboflavin', 0))
                    food.niacin = float(row.get('niacin', 0))
                    food.vitamin_b6 = float(row.get('vitamin_b6', 0))
                    food.folate = float(row.get('folate', 0))
                    food.vitamin_b12 = float(row.get('vitamin_b12', 0))
                    
                    # Minerals
                    food.calcium = float(row.get('calcium', 0))
                    food.iron = float(row.get('iron', 0))
                    food.magnesium = float(row.get('magnesium', 0))
                    food.phosphorus = float(row.get('phosphorus', 0))
                    food.potassium = float(row.get('potassium', 0))
                    food.sodium = float(row.get('sodium', 0))
                    food.zinc = float(row.get('zinc', 0))
                    
                    # Other nutrients
                    food.cholesterol = float(row.get('cholesterol', 0))
                    food.saturated_fat = float(row.get('saturated_fat', 0))
                    food.monounsaturated_fat = float(row.get('monounsaturated_fat', 0))
                    food.polyunsaturated_fat = float(row.get('polyunsaturated_fat', 0))
                    food.trans_fat = float(row.get('trans_fat', 0))
                    
                    food.save()
                    
                    # Add conversions if provided
                    for unit_name in ['cup', 'tablespoon', 'teaspoon', 'gram', 'ounce', 'pound']:
                        conversion_key = f'{unit_name}_grams'
                        if conversion_key in row and row[conversion_key]:
                            try:
                                # Get the unit
                                unit = MeasurementUnit.objects.get(name=unit_name)
                                
                                # Create or update the conversion
                                conversion, _ = FoodConversion.objects.update_or_create(
                                    food=food,
                                    unit=unit,
                                    defaults={'grams_per_unit': float(row[conversion_key])}
                                )
                            except (MeasurementUnit.DoesNotExist, ValueError):
                                pass
                    
                    count += 1
                    if count % 100 == 0:
                        self.stdout.write(f"Processed {count} food items...")
                        
                except (ValueError, TypeError) as e:
                    self.stderr.write(self.style.WARNING(f"Error processing food {food_name}: {str(e)}"))
                    continue
            
            self.stdout.write(f"Processed {count} food items in total.")
    
    @transaction.atomic
    def load_from_json(self, file_path):
        """Load nutrition data from a JSON file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            # Get or create the "Other" food group for unknown groups
            other_group, _ = FoodGroup.objects.get_or_create(name='Other')
            
            # Counter for tracking progress
            count = 0
            
            for item in data:
                # Get or create food group
                food_group_name = item.get('food_group', '').strip()
                if food_group_name:
                    food_group, _ = FoodGroup.objects.get_or_create(name=food_group_name)
                else:
                    food_group = other_group
                
                # Get or create food item
                food_name = item.get('name', '').strip()
                if not food_name:
                    continue  # Skip entries without a name
                
                # Check if food already exists
                food, created = NutritionData.objects.get_or_create(
                    name=food_name,
                    defaults={
                        'food_group': food_group,
                        'common_name': item.get('common_name', '').strip(),
                        'description': item.get('description', '').strip(),
                        'search_terms': item.get('search_terms', '').strip()
                    }
                )
                
                # Update nutrition values
                try:
                    food.calories = float(item.get('calories', 0))
                    food.protein = float(item.get('protein', 0))
                    food.carbohydrates = float(item.get('carbohydrates', 0))
                    food.fat = float(item.get('fat', 0))
                    food.fiber = float(item.get('fiber', 0))
                    food.sugar = float(item.get('sugar', 0))
                    
                    # Vitamins
                    food.vitamin_a = float(item.get('vitamin_a', 0))
                    food.vitamin_c = float(item.get('vitamin_c', 0))
                    food.vitamin_d = float(item.get('vitamin_d', 0))
                    food.vitamin_e = float(item.get('vitamin_e', 0))
                    food.vitamin_k = float(item.get('vitamin_k', 0))
                    food.thiamin = float(item.get('thiamin', 0))
                    food.riboflavin = float(item.get('riboflavin', 0))
                    food.niacin = float(item.get('niacin', 0))
                    food.vitamin_b6 = float(item.get('vitamin_b6', 0))
                    food.folate = float(item.get('folate', 0))
                    food.vitamin_b12 = float(item.get('vitamin_b12', 0))
                    
                    # Minerals
                    food.calcium = float(item.get('calcium', 0))
                    food.iron = float(item.get('iron', 0))
                    food.magnesium = float(item.get('magnesium', 0))
                    food.phosphorus = float(item.get('phosphorus', 0))
                    food.potassium = float(item.get('potassium', 0))
                    food.sodium = float(item.get('sodium', 0))
                    food.zinc = float(item.get('zinc', 0))
                    
                    # Other nutrients
                    food.cholesterol = float(item.get('cholesterol', 0))
                    food.saturated_fat = float(item.get('saturated_fat', 0))
                    food.monounsaturated_fat = float(item.get('monounsaturated_fat', 0))
                    food.polyunsaturated_fat = float(item.get('polyunsaturated_fat', 0))
                    food.trans_fat = float(item.get('trans_fat', 0))
                    
                    food.save()
                    
                    # Add conversions if provided
                    conversions = item.get('conversions', {})
                    for unit_name, grams_value in conversions.items():
                        try:
                            # Get the unit
                            unit = MeasurementUnit.objects.get(name=unit_name)
                            
                            # Create or update the conversion
                            conversion, _ = FoodConversion.objects.update_or_create(
                                food=food,
                                unit=unit,
                                defaults={'grams_per_unit': float(grams_value)}
                            )
                        except (MeasurementUnit.DoesNotExist, ValueError):
                            pass
                    
                    count += 1
                    if count % 100 == 0:
                        self.stdout.write(f"Processed {count} food items...")
                        
                except (ValueError, TypeError) as e:
                    self.stderr.write(self.style.WARNING(f"Error processing food {food_name}: {str(e)}"))
                    continue
            
            self.stdout.write(f"Processed {count} food items in total.")