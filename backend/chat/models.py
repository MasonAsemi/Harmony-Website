from django.db import models
from django.conf import settings 

class Conversation(models.Model):
    """
    Represents a chat conversation, linked directly to an existing Match object 
    (from the 'harmony' app).
    """
    match = models.OneToOneField('harmony.Match', on_delete=models.CASCADE, primary_key=True)
    
    def __str__(self):
        return f"Chat for Match ID: {self.match_id}"


class Message(models.Model):
    """
    Stores individual chat messages.
    """
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sent_at'] 

    def __str__(self):
        return f"Msg from {self.sender.username} in Match {self.conversation.pk}"
