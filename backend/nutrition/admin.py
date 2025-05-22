from django.contrib import admin
from .models import FoodGroup, NutritionData, MeasurementUnit, FoodConversion


class FoodConversionInline(admin.TabularInline):
    model = FoodConversion
    extra = 1


@admin.register(FoodGroup)
class FoodGroupAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(NutritionData)
class NutritionDataAdmin(admin.ModelAdmin):
    list_display = ('name', 'food_group', 'calories', 'protein', 'carbohydrates', 'fat')
    list_filter = ('food_group',)
    search_fields = ('name', 'common_name', 'search_terms')
    fieldsets = (
        (None, {
            'fields': ('name', 'common_name', 'food_group', 'description', 'search_terms')
        }),
        ('Macronutrients', {
            'fields': (
                'calories', 'protein', 'carbohydrates', 'fat',
                'fiber', 'sugar', 'saturated_fat', 'monounsaturated_fat',
                'polyunsaturated_fat', 'trans_fat', 'cholesterol'
            )
        }),
        ('Vitamins', {
            'fields': (
                'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e',
                'vitamin_k', 'thiamin', 'riboflavin', 'niacin',
                'vitamin_b6', 'folate', 'vitamin_b12'
            ),
            'classes': ('collapse',),
        }),
        ('Minerals', {
            'fields': (
                'calcium', 'iron', 'magnesium', 'phosphorus',
                'potassium', 'sodium', 'zinc'
            ),
            'classes': ('collapse',),
        }),
    )
    inlines = [FoodConversionInline]


@admin.register(MeasurementUnit)
class MeasurementUnitAdmin(admin.ModelAdmin):
    list_display = ('name', 'abbreviation', 'type')
    list_filter = ('type',)
    search_fields = ('name', 'abbreviation')


@admin.register(FoodConversion)
class FoodConversionAdmin(admin.ModelAdmin):
    list_display = ('food', 'unit', 'grams_per_unit')
    list_filter = ('unit',)
    search_fields = ('food__name',)