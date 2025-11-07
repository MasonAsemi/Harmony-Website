# backend/chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 1. Get the match_id from the URL route (now required by routing.py)
        # If the connection URL doesn't have a match_id, this will raise an error, preventing connection.
        self.match_id = self.scope['url_route']['kwargs']['match_id']
        self.match_group_name = f'chat_{self.match_id}'

        # 2. Join room group (adds this consumer's channel to the unique group)
        await self.channel_layer.group_add(
            self.match_group_name,
            self.channel_name
        )
        
        # 3. Accept the connection
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.match_group_name,
            self.channel_name
        )

    # Receive message from WebSocket (client) - usually used for typing indicators or status updates
    async def receive(self, text_data):
        # We rely on the REST API to send messages, so this is left empty for now.
        pass

    # Receive message from room group (i.e., a broadcast from the REST API via the Channel Layer)
    async def chat_message(self, event):
        """
        Method that runs when a message is received from the group_send utility.
        The name 'chat_message' must match the 'type' key in group_send payload.
        """
        # Send the JSON payload directly to the client
        await self.send(text_data=json.dumps({
            'message': event['message'] # event['message'] contains the serialized message data
        }))