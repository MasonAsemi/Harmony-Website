from django.urls import path, re_path
from .consumers import Consumer

# /api/chat/connect Connect to the websocket    
websocket_urlpatterns = [
    re_path(r"^ws/chat/connect/?$", Consumer.as_asgi())
]