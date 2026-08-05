import random
from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from .models import ChatChannel, ChatMember, ChatMessage
from .serializers import ChatChannelSerializer, ChatMessageSerializer

class ChannelListView(generics.ListCreateAPIView):
    serializer_class = ChatChannelSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Channels where current user is a member
        return ChatChannel.objects.filter(members__user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Create a channel with another user
        other_user_id = request.data.get('other_user_id')
        if not other_user_id:
            return Response({"error": "other_user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({"error": "Other user not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Check if direct channel already exists between these two users
        existing_channel = ChatChannel.objects.filter(
            members__user=request.user
        ).filter(
            members__user=other_user
        ).first()
        
        if existing_channel:
            serializer = self.get_serializer(existing_channel, context={'request': request})
            return Response(serializer.data)
            
        # Create new channel
        channel = ChatChannel.objects.create()
        ChatMember.objects.create(channel=channel, user=request.user)
        ChatMember.objects.create(channel=channel, user=other_user)
        
        serializer = self.get_serializer(channel, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MessageListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, channel_id):
        # Verify user is member of this channel
        if not ChatMember.objects.filter(channel_id=channel_id, user=request.user).exists():
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
            
        messages = ChatMessage.objects.filter(channel_id=channel_id).order_by('created_at')
        
        # Mark other user's messages as read
        ChatMessage.objects.filter(channel_id=channel_id).exclude(sender=request.user).update(is_read=True, is_delivered=True)
        
        serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, channel_id):
        # Verify user is member
        if not ChatMember.objects.filter(channel_id=channel_id, user=request.user).exists():
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
            
        text = request.data.get('text', '')
        message_type = request.data.get('message_type', 'text')
        media_url = request.data.get('media_url')
        lat = request.data.get('lat')
        lng = request.data.get('lng')
        
        if message_type == 'text' and not text:
            return Response({"error": "Message text is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        message = ChatMessage.objects.create(
            channel_id=channel_id,
            sender=request.user,
            message_type=message_type,
            text=text,
            media_url=media_url,
            lat=lat,
            lng=lng,
            is_delivered=True,
            is_read=False
        )
        
        # Trigger automated mock response from the other user for dynamic feel
        other_member = ChatMember.objects.filter(channel_id=channel_id).exclude(user=request.user).first()
        if other_member and other_member.user.role == 'ngo':
            automated_replies = [
                'Excellent, our dispatch logistics division has acknowledged this.',
                'Perfect. We are tracking this status stamp ID on our dashboard ledger.',
                'Understood. The courier will verify packaging specifications upon arrival.',
                'Thanks for the update. Let us coordinate the final delivery milestone.'
            ]
            reply_text = random.choice(automated_replies)
            ChatMessage.objects.create(
                channel_id=channel_id,
                sender=other_member.user,
                message_type='text',
                text=reply_text,
                is_delivered=True,
                is_read=False
            )
            
        messages = ChatMessage.objects.filter(channel_id=channel_id).order_by('created_at')
        serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
