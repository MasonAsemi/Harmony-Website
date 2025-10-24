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

class Match(models.Model):
    """Represents a successful connection between two users."""
    
    # Links to the two users involved in the match
    user1 = models.ForeignKey(
        'harmony.User', 
        related_name='matches_initiated', 
        on_delete=models.CASCADE
    )
    user2 = models.ForeignKey(
        'harmony.User', 
        related_name='matches_received', 
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures a pair of users can only have one Match object (order doesn't matter)
        unique_together = ('user1', 'user2') 
        verbose_name_plural = "Matches"

    def __str__(self):
        return f"Match between {self.user1.username} and {self.user2.username}"