from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import FoodGroupViewSet, NutritionDataViewSet, MeasurementUnitViewSet

router = DefaultRouter()
router.register(r'food-groups', FoodGroupViewSet)
router.register(r'nutrition-data', NutritionDataViewSet)
router.register(r'measurement-units', MeasurementUnitViewSet)

urlpatterns = router.urls