from django.urls import path
from .views import ChannelListView, MessageListView

urlpatterns = [
    path('chat/channels/', ChannelListView.as_view(), name='channel_list'),
    path('chat/channels/<int:channel_id>/messages/', MessageListView.as_view(), name='channel_messages'),
]
