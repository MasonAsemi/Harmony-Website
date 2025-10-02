from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Option 1: Using ViewSet with Router
router = DefaultRouter()
router.register(r'users', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]