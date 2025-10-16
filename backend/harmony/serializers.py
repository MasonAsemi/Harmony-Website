#allows us to map json to models our database can interpret
from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = User
        fields = ['id', 'username', 'password', 'email']

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, help_text="Username for the account")
    email = serializers.EmailField(required=True, help_text="User's email address")
    password = serializers.CharField(required=True, write_only=True, help_text="Password (min 8 characters)")

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, help_text="Your username")
    password = serializers.CharField(required=True, write_only=True, help_text="Your password")

class TokenResponseSerializer(serializers.Serializer):
    token = serializers.CharField(help_text="Authentication token")
    user = serializers.JSONField(help_text="User information")