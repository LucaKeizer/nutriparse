from django.contrib import admin
from .models import Recipe, RecipeIngredient, Tag, RecipeTag


class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 1
    autocomplete_fields = ['food', 'unit']


class RecipeTagInline(admin.TabularInline):
    model = RecipeTag
    extra = 1
    autocomplete_fields = ['tag']


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'created_at', 'servings', 'total_calories')
    list_filter = ('created_at', 'user')
    search_fields = ('title', 'description', 'instructions')
    readonly_fields = ('total_calories', 'total_protein', 'total_carbs', 'total_fat', 'total_fiber')
    fieldsets = (
        (None, {
            'fields': ('title', 'user', 'description', 'instructions', 'servings')
        }),
        ('Timing', {
            'fields': ('prep_time', 'cook_time')
        }),
        ('Source', {
            'fields': ('source_url', 'source_name')
        }),
        ('Original Text', {
            'fields': ('original_text',),
            'classes': ('collapse',),
        }),
        ('Nutritional Information', {
            'fields': ('total_calories', 'total_protein', 'total_carbs', 'total_fat', 'total_fiber'),
            'classes': ('collapse',),
        }),
    )
    inlines = [RecipeIngredientInline, RecipeTagInline]
    actions = ['recalculate_nutrition']
    
    def recalculate_nutrition(self, request, queryset):
        for recipe in queryset:
            recipe.calculate_nutrition()
        self.message_user(request, f"Nutritional information recalculated for {queryset.count()} recipes.")
    recalculate_nutrition.short_description = "Recalculate nutrition for selected recipes"


@admin.register(RecipeIngredient)
class RecipeIngredientAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'food', 'quantity', 'unit', 'preparation', 'is_parsed')
    list_filter = ('is_parsed', 'unit')
    search_fields = ('recipe__title', 'food__name', 'original_text')
    autocomplete_fields = ['recipe', 'food', 'unit']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(RecipeTag)
class RecipeTagAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'tag')
    list_filter = ('tag',)
    search_fields = ('recipe__title', 'tag__name')
    autocomplete_fields = ['recipe', 'tag']