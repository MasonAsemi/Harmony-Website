
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    location = models.CharField(max_length=255, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    interests = models.TextField(blank=True, null=True)
    biography = models.TextField(blank=True, null=True)
    
    # many to many relationships with weights of how important the prefrence is to the user 
    favorite_songs = models.ManyToManyField('Song', through='UserSongPreference', related_name='favorited_by')
    favorite_artists = models.ManyToManyField('Artist', through='UserArtistPreference', related_name='favorited_by')
    favorite_genres = models.ManyToManyField('Genre', through='UserGenrePreference', related_name='favorited_by')
    
    def __str__(self):
        return self.username
    
class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True, default='Unknown')
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
class Artist(models.Model):
    name = models.CharField(max_length=200, default= 'Unkown')
    spotify_id = models.CharField(max_length=100, unique=True, default='')
    image_url = models.URLField(blank=True)
    popularity = models.IntegerField(default=0)
    genres = models.ManyToManyField(Genre, related_name='artists', blank=True)
    
    def __str__(self):
        return self.name


class Song(models.Model):
    name = models.CharField(max_length=300)
    artists = models.ManyToManyField(Artist, related_name='songs')
    genres = models.ManyToManyField(Genre, related_name='songs', blank=True)
    
    spotify_id = models.CharField(max_length=100, unique=True)
    album = models.CharField(max_length=300, blank=True)
    album_image_url = models.URLField(blank=True)
    embed = models.JSONField( null=True, blank=True) # for song playing info 
    release_date = models.DateField(null=True, blank=True)
    duration_ms = models.IntegerField(null=True, blank=True)
    preview_url = models.URLField(blank=True, null=True) # 30 second preview of song
    spotify_url = models.URLField(blank=True) # spotify page 
    popularity = models.IntegerField(default=0)
    
    # audio features , optional but can be useful later 
    energy = models.FloatField(null=True, blank=True)
    valence = models.FloatField(null=True, blank=True)
    danceability = models.FloatField(null=True, blank=True)
    tempo = models.FloatField(null=True, blank=True)
    acousticness = models.FloatField(null=True, blank=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        artist_names = ', '.join([a.name for a in self.artists.all()[:2]])
        return f"{self.name} - {artist_names}"

# the intermediate modles that hold the weights for how much each song, artist, or genre should affect matching 
class UserSongPreference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    weight = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Importance: 1-10"
    )
    
    class Meta:
        unique_together = ['user', 'song']
    
    def __str__(self):
        return f"{self.user.username} - {self.song.name} (weight: {self.weight})"


class UserArtistPreference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    weight = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Importance: 1-10"
    )
   
    
    class Meta:
        unique_together = ['user', 'artist']
    
    def __str__(self):
        return f"{self.user.username} - {self.artist.name} (weight: {self.weight})"


class UserGenrePreference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE)
    weight = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Importance: 1-10"
    )
    
    class Meta:
        unique_together = ['user', 'genre']
        ordering = ['-weight', 'genre__name']
    
    def __str__(self):
        return f"{self.user.username} - {self.genre.name} (weight: {self.weight})"


class SpotifyCredentials(models.Model):
    user = models.OneToOneField(  # Changed from ForeignKey!
        User, 
        on_delete=models.CASCADE,
        related_name='spotify_credentials'  # Add this!
    )
    access_token = models.TextField( blank=True, null=True)
    token_type = models.TextField(  blank=True, null=True)
    scope = models.TextField( blank=True, null=True)
    expires_in = models.IntegerField(); #seconds 
    refresh_token = models.TextField(blank=True, null=True)


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
 
    compatibilty_score = models.FloatField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    ) 

    #category breakdown 
    genre_match = models.FloatField(default = 0 )
    artist_match = models.FloatField(default = 0 )
    song_match= models.FloatField(default = 0 )
    
    def __str__(self):
        return f"Match: {self.user1} and {self.user2}: {self.compatibilty_score:.1f}%"

class MatchRejection(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rejects')
    user2= models.ForeignKey(User, on_delete=models.CASCADE, related_name='was_rejected_by')
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.user1} rejected {self.user2}"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages_sent')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages_received')
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} to {self.receiver}: {self.content}"

class MatchWeightSettings(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='match_weights'
    )

    genre_weight = models.FloatField(default=1.0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    artist_weight = models.FloatField(default=1.0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    song_weight = models.FloatField(default=1.0, validators=[MinValueValidator(0), MaxValueValidator(5)])

    def __str__(self):
        return f"Match Weights for {self.user.username}"




    

