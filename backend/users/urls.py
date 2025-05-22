from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CustomAuthToken

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = router.urls + [
    path('token-auth/', CustomAuthToken.as_view(), name='token_auth'),
]