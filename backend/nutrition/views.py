from django.db.models import Q
from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

from .models import FoodGroup, NutritionData, MeasurementUnit, FoodConversion
from .serializers import (
    FoodGroupSerializer, NutritionDataSerializer, NutritionDataLightSerializer,
    MeasurementUnitSerializer, FoodConversionSerializer, NutritionSearchSerializer
)


class FoodGroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint for food groups
    """
    queryset = FoodGroup.objects.all()
    serializer_class = FoodGroupSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    
    def get_permissions(self):
        """
        Allow anyone to read food groups, but only admins to modify
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class NutritionDataViewSet(viewsets.ModelViewSet):
    """
    API endpoint for nutrition data
    """
    queryset = NutritionData.objects.all()
    serializer_class = NutritionDataSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'common_name', 'search_terms']
    
    def get_permissions(self):
        """
        Allow anyone to read nutrition data, but only admins to modify
        """
        if self.action in ['list', 'retrieve', 'search']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_serializer_class(self):
        """
        Use the light serializer for list actions
        """
        if self.action == 'list':
            return NutritionDataLightSerializer
        return NutritionDataSerializer
    
    @action(detail=False, methods=['post'])
    def search(self, request):
        """
        Search for nutrition data based on a query string
        """
        serializer = NutritionSearchSerializer(data=request.data)
        
        if serializer.is_valid():
            query = serializer.validated_data['query']
            limit = serializer.validated_data.get('limit', 20)
            
            # Split the query into terms for better searching
            query_terms = query.strip().lower().split()
            
            # Start with an empty Q object
            q_objects = Q()
            
            # Add each term to the Q object
            for term in query_terms:
                q_objects |= Q(name__icontains=term)
                q_objects |= Q(common_name__icontains=term)
                q_objects |= Q(search_terms__icontains=term)
            
            # Apply the filter
            results = NutritionData.objects.filter(q_objects).distinct()[:limit]
            
            # Return serialized results
            result_serializer = NutritionDataLightSerializer(results, many=True)
            return Response(result_serializer.data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeasurementUnitViewSet(viewsets.ModelViewSet):
    """
    API endpoint for measurement units
    """
    queryset = MeasurementUnit.objects.all()
    serializer_class = MeasurementUnitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Allow anyone to read measurement units, but only admins to modify
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class FoodConversionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for food conversions
    """
    queryset = FoodConversion.objects.all()
    serializer_class = FoodConversionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Allow anyone to read conversions, but only admins to modify
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]