from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import Conversation, Message
from .serializers import MessageSerializer

# IMPORTANT: Must import the Match model for the permission check.
# Since Match model is in the 'harmony' app:
from harmony.models import Match 

class MessageListView(APIView):
    """
    GET: List all messages for a specific match (conversation).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, match_id, format=None):
        # 1. Get the Conversation linked to the Match ID
        conversation = get_object_or_404(Conversation, match_id=match_id)
        
        # 2. Permission Check: Ensure the user is one of the two people in the Match.
        # This uses the Match model we just created in harmony.
        match = conversation.match
        if request.user not in [match.user1, match.user2]:
            return Response({"detail": "Permission denied. User is not part of this match."}, status=status.HTTP_403_FORBIDDEN)

        # 3. Retrieve and serialize messages
        messages = Message.objects.filter(conversation=conversation)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class MessageCreateView(APIView):
    """
    POST: Create a new message in a conversation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_id, format=None):
        # 1. Get the Conversation
        conversation = get_object_or_404(Conversation, match_id=match_id)
        
        # 2. Permission Check
        match = conversation.match
        if request.user not in [match.user1, match.user2]:
            return Response({"detail": "Permission denied. User is not part of this match."}, status=status.HTTP_403_FORBIDDEN)

        # 3. Prepare data: Inject the conversation and sender before validation
        data = request.data.copy()
        data['conversation'] = conversation.pk # Sets the FK for the Conversation
        
        serializer = MessageSerializer(data=data)
        if serializer.is_valid():
            # Save the message, explicitly setting the sender to the authenticated user
            serializer.save(sender=request.user) 
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)