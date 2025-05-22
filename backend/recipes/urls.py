from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RecipeViewSet, TagViewSet

router = DefaultRouter()
router.register(r'recipes', RecipeViewSet)
router.register(r'tags', TagViewSet)

urlpatterns = router.urls