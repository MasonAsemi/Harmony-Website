from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.users_api, name='users_api'),
    path('api/user-data/', views.get_user_data, name='user_data'),
]