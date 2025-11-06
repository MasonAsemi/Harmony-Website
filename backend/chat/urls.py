from django.urls import path, re_path
from .views import MessageListView, MessageCreateView

urlpatterns = [
    # GET: /api/chat/<match_id>/messages/ (To list messages for a match)
    path('<int:match_id>/messages/', MessageListView.as_view(), name='message-list'),
    
    # POST: /api/chat/<match_id>/send/ (To send a new message to a match)
    path('<int:match_id>/send/', MessageCreateView.as_view(), name='message-create'),
]
