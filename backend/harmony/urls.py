from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('test-token/', views.test_token, name='test-token'),
    path('profile/', views.get_profile, name='get-profile'),
    path('profile/update/', views.update_profile, name='update-profile'),
]