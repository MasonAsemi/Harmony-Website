from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    location = models.CharField(max_length=255, blank=True, null=True)
    profile_image = models.FileField(upload_to='profile_images/', blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    interests = models.TextField(blank=True, null=True)
    biography = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.username