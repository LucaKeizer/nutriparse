from django.db import migrations


def create_initial_food_groups(apps, schema_editor):
    """Add initial food groups"""
    FoodGroup = apps.get_model('nutrition', 'FoodGroup')
    
    food_groups = [
        'Fruits',
        'Vegetables',
        'Grains',
        'Proteins',
        'Dairy',
        'Fats and Oils',
        'Spices and Herbs',
        'Beverages',
        'Nuts and Seeds',
        'Legumes',
        'Sweets',
        'Other',
    ]
    
    for group_name in food_groups:
        FoodGroup.objects.create(name=group_name)


def create_initial_measurement_units(apps, schema_editor):
    """Add initial measurement units"""
    MeasurementUnit = apps.get_model('nutrition', 'MeasurementUnit')
    
    volume_units = [
        ('teaspoon', 'tsp', 'volume'),
        ('tablespoon', 'tbsp', 'volume'),
        ('fluid ounce', 'fl oz', 'volume'),
        ('cup', 'cup', 'volume'),
        ('pint', 'pt', 'volume'),
        ('quart', 'qt', 'volume'),
        ('gallon', 'gal', 'volume'),
        ('milliliter', 'ml', 'volume'),
        ('liter', 'l', 'volume'),
    ]
    
    weight_units = [
        ('pound', 'lb', 'weight'),
        ('ounce', 'oz', 'weight'),
        ('gram', 'g', 'weight'),
        ('kilogram', 'kg', 'weight'),
    ]
    
    count_units = [
        ('slice', 'slice', 'count'),
        ('piece', 'pc', 'count'),
        ('clove', 'clove', 'count'),
        ('bunch', 'bunch', 'count'),
        ('can', 'can', 'count'),
        ('pinch', 'pinch', 'count'),
        ('dash', 'dash', 'count'),
    ]
    
    all_units = volume_units + weight_units + count_units
    
    for name, abbreviation, type_name in all_units:
        MeasurementUnit.objects.create(name=name, abbreviation=abbreviation, type=type_name)


def create_sample_nutrition_data(apps, schema_editor):
    """Add some sample food items with nutrition data"""
    NutritionData = apps.get_model('nutrition', 'NutritionData')
    FoodGroup = apps.get_model('nutrition', 'FoodGroup')
    MeasurementUnit = apps.get_model('nutrition', 'MeasurementUnit')
    FoodConversion = apps.get_model('nutrition', 'FoodConversion')
    
    # Get food groups
    fruits = FoodGroup.objects.get(name='Fruits')
    vegetables = FoodGroup.objects.get(name='Vegetables')
    grains = FoodGroup.objects.get(name='Grains')
    proteins = FoodGroup.objects.get(name='Proteins')
    dairy = FoodGroup.objects.get(name='Dairy')
    
    # Get measurement units
    cup = MeasurementUnit.objects.get(name='cup')
    tbsp = MeasurementUnit.objects.get(name='tablespoon')
    gram = MeasurementUnit.objects.get(name='gram')
    ounce = MeasurementUnit.objects.get(name='ounce')
    
    # Add sample foods
    apple = NutritionData.objects.create(
        name='Apple',
        common_name='apple',
        food_group=fruits,
        calories=52,
        protein=0.3,
        carbohydrates=14,
        fat=0.2,
        fiber=2.4,
        sugar=10.3,
        vitamin_c=4.6,
        potassium=107,
        search_terms='apple, apples, red apple, green apple',
    )
    
    banana = NutritionData.objects.create(
        name='Banana',
        common_name='banana',
        food_group=fruits,
        calories=89,
        protein=1.1,
        carbohydrates=22.8,
        fat=0.3,
        fiber=2.6,
        sugar=12.2,
        vitamin_c=8.7,
        potassium=358,
        search_terms='banana, bananas, ripe banana',
    )
    
    spinach = NutritionData.objects.create(
        name='Spinach',
        common_name='spinach',
        food_group=vegetables,
        calories=23,
        protein=2.9,
        carbohydrates=3.6,
        fat=0.4,
        fiber=2.2,
        vitamin_a=469,
        vitamin_c=28,
        iron=2.7,
        calcium=99,
        search_terms='spinach, fresh spinach, raw spinach, leaf spinach, leafy greens',
    )
    
    rice = NutritionData.objects.create(
        name='White Rice, cooked',
        common_name='rice',
        food_group=grains,
        calories=130,
        protein=2.7,
        carbohydrates=28.2,
        fat=0.3,
        fiber=0.4,
        search_terms='rice, white rice, cooked rice',
    )
    
    chicken = NutritionData.objects.create(
        name='Chicken Breast, cooked',
        common_name='chicken breast',
        food_group=proteins,
        calories=165,
        protein=31,
        carbohydrates=0,
        fat=3.6,
        cholesterol=85,
        search_terms='chicken, chicken breast, cooked chicken, boneless chicken, skinless chicken',
    )
    
    milk = NutritionData.objects.create(
        name='Milk, whole',
        common_name='milk',
        food_group=dairy,
        calories=61,
        protein=3.2,
        carbohydrates=4.8,
        fat=3.3,
        calcium=113,
        vitamin_d=1.3,
        search_terms='milk, whole milk, cow milk',
    )
    
    # Add conversion factors for foods
    # Apple conversions
    FoodConversion.objects.create(food=apple, unit=cup, grams_per_unit=125)
    FoodConversion.objects.create(food=apple, unit=ounce, grams_per_unit=28.35)
    
    # Banana conversions
    FoodConversion.objects.create(food=banana, unit=cup, grams_per_unit=150)
    FoodConversion.objects.create(food=banana, unit=ounce, grams_per_unit=28.35)
    
    # Spinach conversions
    FoodConversion.objects.create(food=spinach, unit=cup, grams_per_unit=30)
    FoodConversion.objects.create(food=spinach, unit=tbsp, grams_per_unit=3.75)
    FoodConversion.objects.create(food=spinach, unit=ounce, grams_per_unit=28.35)
    
    # Rice conversions
    FoodConversion.objects.create(food=rice, unit=cup, grams_per_unit=158)
    FoodConversion.objects.create(food=rice, unit=tbsp, grams_per_unit=10)
    FoodConversion.objects.create(food=rice, unit=ounce, grams_per_unit=28.35)
    
    # Chicken conversions
    FoodConversion.objects.create(food=chicken, unit=cup, grams_per_unit=140)
    FoodConversion.objects.create(food=chicken, unit=ounce, grams_per_unit=28.35)
    
    # Milk conversions
    FoodConversion.objects.create(food=milk, unit=cup, grams_per_unit=244)
    FoodConversion.objects.create(food=milk, unit=tbsp, grams_per_unit=15)
    FoodConversion.objects.create(food=milk, unit=ounce, grams_per_unit=28.35)


class Migration(migrations.Migration):

    dependencies = [
        ('nutrition', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_food_groups),
        migrations.RunPython(create_initial_measurement_units),
        migrations.RunPython(create_sample_nutrition_data),
    ]