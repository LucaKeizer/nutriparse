from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from nutrition.views import FoodGroupViewSet, NutritionDataViewSet, MeasurementUnitViewSet
from recipes.views import RecipeViewSet, TagViewSet
from users.views import UserViewSet, CustomAuthToken

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'food-groups', FoodGroupViewSet)
router.register(r'nutrition-data', NutritionDataViewSet)
router.register(r'measurement-units', MeasurementUnitViewSet)
router.register(r'recipes', RecipeViewSet)
router.register(r'tags', TagViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
    path('api/token-auth/', CustomAuthToken.as_view()),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)