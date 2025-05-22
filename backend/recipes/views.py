from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Recipe, RecipeIngredient, Tag, RecipeTag
from .serializers import (
    RecipeSerializer, RecipeLightSerializer, RecipeIngredientSerializer,
    TagSerializer, RecipeParserSerializer
)
from .parser import parse_recipe_text, match_ingredients_to_foods


class IsOwnerOrReadOnly:
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request, so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        # Write permissions are only allowed to the owner of the recipe.
        return obj.user == request.user


class RecipeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for recipes
    """
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'ingredients__food__name']
    
    def get_serializer_class(self):
        """
        Use the light serializer for list actions
        """
        if self.action == 'list':
            return RecipeLightSerializer
        return RecipeSerializer
    
    def get_queryset(self):
        """
        Optionally restricts the returned recipes to a given user,
        by filtering against a `username` query parameter in the URL.
        """
        queryset = Recipe.objects.all()
        username = self.request.query_params.get('username')
        if username is not None:
            queryset = queryset.filter(user__username=username)
        return queryset
    
    def perform_create(self, serializer):
        """
        Set the user when creating a new recipe
        """
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def parse(self, request):
        """
        Parse recipe text and extract ingredients
        """
        serializer = RecipeParserSerializer(data=request.data)
        
        if serializer.is_valid():
            recipe_text = serializer.validated_data['recipe_text']
            title = serializer.validated_data.get('title', 'Untitled Recipe')
            servings = serializer.validated_data.get('servings', 1)
            save_recipe = serializer.validated_data.get('save_recipe', False)
            
            # Parse the recipe text
            parsed_data = parse_recipe_text(recipe_text)
            
            if 'ingredients' in parsed_data:
                # Match ingredients to foods in our database
                matched_ingredients = match_ingredients_to_foods(parsed_data['ingredients'])
                
                # If we need to save the recipe
                if save_recipe:
                    # Create a new recipe
                    recipe = Recipe.objects.create(
                        title=title,
                        user=request.user,
                        original_text=recipe_text,
                        servings=servings,
                        instructions=parsed_data.get('instructions', '')
                    )
                    
                    # Create recipe ingredients
                    for ingredient_data in matched_ingredients:
                        RecipeIngredient.objects.create(
                            recipe=recipe,
                            food=ingredient_data.get('food'),
                            quantity=ingredient_data.get('quantity'),
                            unit=ingredient_data.get('unit'),
                            preparation=ingredient_data.get('preparation', ''),
                            original_text=ingredient_data.get('original_text', ''),
                            is_parsed=ingredient_data.get('is_parsed', False)
                        )
                    
                    # Calculate nutrition information
                    recipe.calculate_nutrition()
                    
                    # Return the recipe
                    return Response({
                        'recipe': RecipeSerializer(recipe).data,
                        'parsed_data': parsed_data,
                        'matched_ingredients': matched_ingredients
                    })
                
                # Just return the parsed data
                return Response({
                    'parsed_data': parsed_data,
                    'matched_ingredients': matched_ingredients
                })
            
            return Response({
                'error': 'Failed to parse recipe text'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def favorite(self, request, pk=None):
        """
        Add/remove a recipe from user's favorites
        """
        recipe = self.get_object()
        profile = request.user.profile
        
        if recipe in profile.favorite_recipes.all():
            profile.favorite_recipes.remove(recipe)
            return Response({'status': 'removed from favorites'})
        else:
            profile.favorite_recipes.add(recipe)
            return Response({'status': 'added to favorites'})


class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint for recipe tags
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    
    def get_permissions(self):
        """
        Allow anyone to read tags
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]