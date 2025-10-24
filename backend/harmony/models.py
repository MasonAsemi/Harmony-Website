
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
