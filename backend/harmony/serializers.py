#allows us to map json to models our database can interpret
from rest_framework import serializers
from .models import User, Song

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        # don't expose admin-only fields like is_superuser unless intended
        fields = ['id', 'username', 'email', 'password', 'location', 'profile_image', 'age', 'interests', 'biography']
        

    def create(self, validated_data):
        # Use create_user to hash password
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        # Handle password hashing on update if provided
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = ['id', 'name', 'list_of_artists', 'link', 'user']
        read_only_fields = ['user']  # ✅ User should not be manually set from client

    def create(self, validated_data):
        return Song.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.link = validated_data.get('link', instance.link)
        instance.list_of_artists = validated_data.get('list_of_artists', instance.list_of_artists)
        instance.save()
        return instance