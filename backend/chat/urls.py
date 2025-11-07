# backend/chat/urls.py

from django.urls import path
from .views import MessageListView, MessageCreateView

urlpatterns = [
    # 1. GET (List Messages): Matches /api/chat/messages/123/
    path('messages/<int:match_id>/', MessageListView.as_view(), name='message-list'),
    
    # 2. POST (Create Message): Matches /api/chat/messages/123/send/
    path('messages/<int:match_id>/send/', MessageCreateView.as_view(), name='message-create'),
]
