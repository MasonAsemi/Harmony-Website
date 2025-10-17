#allows us to map json to models our database can interpret
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

#Used for the creation of an account: Highest priority/level
class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'age', 'interests', 'biography', 'location']
        extra_kwargs = {'password': {'write_only': True}}

#Used for editing existing profiles: Lower priority/level
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'age', 'interests', 'biography', 'location']
        read_only_fields = ['id', 'username', 'email']

class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=True, help_text="First Name ")
    last_name = serializers.CharField(required=True, help_text="Last Name ")
    username = serializers.CharField(required=True, help_text="Username for the account")
    email = serializers.EmailField(required=True, help_text="User's email address")
    password = serializers.CharField(required=True, write_only=True, help_text="Password (min 8 characters)")

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, help_text="Your username")
    password = serializers.CharField(required=True, write_only=True, help_text="Your password")

class TokenResponseSerializer(serializers.Serializer):
    token = serializers.CharField(help_text="Authentication token")
    user = serializers.JSONField(help_text="User information")