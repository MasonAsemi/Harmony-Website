
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    location = models.CharField(max_length=255, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    interests = models.TextField(blank=True, null=True)
    biography = models.TextField(blank=True, null=True)
    
    
    def __str__(self):
        return self.username
    
class Song(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True, null=True)
    list_of_artists = models.JSONField()
    link = models.JSONField()
    def __str__(self):
        return self.name

class Swipe(models.Model):
    swiper_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='swipes_made')
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='swipes_received')
    type = models.CharField(max_length=10, choices=[('LIKE', 'Like'), ('DISLIKE', 'Dislike')])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.swiper_user} {self.type.lower()} {self.target_user}"


class Match(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_initiated')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_received')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Match: {self.user1} and {self.user2}"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages_sent')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages_received')
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} to {self.receiver}: {self.content}"


class Artist(models.Model):
    artist_name = models.CharField(max_length=100)

    def __str__(self):
        return self.artist_name


class Genre(models.Model):
    genre_name = models.CharField(max_length=50)

    def __str__(self):
        return self.genre_name


class SupportedMusicProvider(models.Model):
    smp_name = models.CharField(max_length=50)

    def __str__(self):
        return self.smp_name


class UserProviderAccount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    provider = models.ForeignKey(SupportedMusicProvider, on_delete=models.CASCADE)
    provider_uid = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.user.username} ({self.provider.smp_name})"


class UserFavoriteSong(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} favorite song: {self.song.name}"


class UserFavoriteArtist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} favorite artist: {self.artist.artist_name}"


class UserFavoriteGenre(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} favorite genre: {self.genre.genre_name}"
    

class SpotifyCredentials(models.Model):
    user= models.ForeignKey(User,on_delete= models.CASCADE)
    access_token = models.TextField( blank=True, null=True)
    token_type = models.TextField(  blank=True, null=True)
    scope = models.TextField( blank=True, null=True)
    expires_in = models.IntegerField(); #seconds 
    refresh_token = models.TextField(blank=True, null=True)