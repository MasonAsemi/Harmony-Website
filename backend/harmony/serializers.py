# serializers.py
from rest_framework import serializers
from .models import User, Song, Artist, Genre

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'location', 'profile_image', 'age', 'interests', 'biography']
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'spotify_id', 'image_url', 'popularity']


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']


class SongSerializer(serializers.ModelSerializer):
    artists = ArtistSerializer(many=True, read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    
    class Meta:
        model = Song
        fields = [
            'id', 'name', 'spotify_id', 'album', 'album_image_url', 
            'release_date', 'duration_ms', 'preview_url', 'spotify_url',
            'popularity', 'energy', 'valence', 'danceability', 'tempo',
            'acousticness', 'artists', 'genres'
        ]
        read_only_fields = fields  # All fields are read-only since songs come from Spotify