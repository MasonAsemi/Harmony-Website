from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    # This field shows the sender's username instead of just the user ID.
    sender_username = serializers.ReadOnlyField(source='sender.username')

    class Meta:
        model = Message
        # Fields exposed by the API
        fields = ['id', 'conversation', 'sender', 'sender_username', 'content', 'sent_at']
        # These fields are set automatically by the server, not the client.
        read_only_fields = ['sender', 'sent_at']
        
