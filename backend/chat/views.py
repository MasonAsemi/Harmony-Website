# backend/chat/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404

# NEW IMPORTS FOR CHANNELS BROADCAST
from asgiref.sync import async_to_sync  # Allows calling async channel layer from sync view
from channels.layers import get_channel_layer  # Accesses the Channel Layer instance

from .models import Conversation, Message
from .serializers import MessageSerializer
from harmony.models import Match 

# Get the channel layer instance once at the module level
channel_layer = get_channel_layer() 

class MessageListView(APIView):
    """
    GET: List all messages for a specific match (conversation).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, match_id, format=None):
        # 1. Get the Conversation linked to the Match ID
        conversation = get_object_or_404(Conversation, match_id=match_id)
        
        # 2. Permission Check: Ensure the user is one of the two people in the Match.
        match = conversation.match
        if request.user not in [match.user1, match.user2]:
            return Response({"detail": "Permission denied. User is not part of this match."}, status=status.HTTP_403_FORBIDDEN)

        # 3. Retrieve and serialize messages
        messages = Message.objects.filter(conversation=conversation)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class MessageCreateView(APIView):
    """
    POST: Create a new message in a conversation AND broadcast it over WebSocket.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_id, format=None):
        # 1. Get the Conversation and Match
        conversation = get_object_or_404(Conversation, match_id=match_id)
        match = conversation.match
        
        # 2. Permission Check
        if request.user not in [match.user1, match.user2]:
            return Response({"detail": "Permission denied. User is not part of this match."}, status=status.HTTP_403_FORBIDDEN)

        # 3. Prepare data and Validate
        data = request.data.copy()
        data['conversation'] = conversation.pk
        
        serializer = MessageSerializer(data=data)
        if serializer.is_valid():
            # 4. Save the message
            message = serializer.save(sender=request.user) 
            
            # 5. Get the fully serialized data for the broadcast payload
            serialized_message = MessageSerializer(message).data

            # 6. BROADCAST via Channel Layer (The Real-Time Part!) 
            group_name = f'chat_{match_id}'

            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    # 'type' must match the method in ChatConsumer (chat_message)
                    'type': 'chat.message', 
                    'message': serialized_message # This is the payload sent to the consumer
                }
            )
            
            # 7. Return the API response
            return Response(serialized_message, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)