# backend/chat/routing.py

from django.urls import re_path
from .consumers import ChatConsumer # <-- Must be the new class name

websocket_urlpatterns = [
    # New path: accepts any digits as the match_id, e.g., ws/chat/123/
    re_path(r"ws/chat/(?P<match_id>\d+)/?$", ChatConsumer.as_asgi())
]