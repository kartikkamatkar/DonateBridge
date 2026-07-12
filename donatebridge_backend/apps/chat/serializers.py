from rest_framework import serializers
from .models import ChatChannel, ChatMember, ChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.CharField(source='sender.avatar', read_only=True)
    self = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = (
            'id', 'sender_name', 'sender_avatar', 'message_type', 'text', 
            'media_url', 'lat', 'lng', 'is_delivered', 'is_read', 
            'created_at', 'self', 'time', 'status'
        )

    def get_self(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender == request.user
        return False

    def get_time(self, obj):
        return obj.created_at.strftime("%I:%M %p")

    def get_status(self, obj):
        if obj.is_read:
            return 'read'
        elif obj.is_delivered:
            return 'delivered'
        return 'sent'

class ChatChannelSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    lastMsg = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    unread = serializers.SerializerMethodField()
    verified = serializers.SerializerMethodField()

    class Meta:
        model = ChatChannel
        fields = ('id', 'name', 'lastMsg', 'time', 'unread', 'verified')

    def get_name(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return obj.name
            
        # Display the name of the other chat partner
        other_member = obj.members.exclude(user=request.user).first()
        if other_member:
            return other_member.user.username
        return obj.name or "Conversation Thread"

    def get_lastMsg(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            if last_msg.message_type == 'image':
                return "Sent a photo attachment"
            elif last_msg.message_type == 'location':
                return "Sent shared location coord"
            return last_msg.text
        return "No messages yet."

    def get_time(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return last_msg.created_at.strftime("%I:%M %p")
        return ""

    def get_unread(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.messages.exclude(sender=request.user).filter(is_read=False).count()

    def get_verified(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        # If the other user is a verified NGO, set verified=True
        other_member = obj.members.exclude(user=request.user).first()
        if other_member and other_member.user.role == 'ngo':
            ngo_details = getattr(other_member.user, 'ngo_details', None)
            if ngo_details and ngo_details.verification_status == 'approved':
                return True
        return False
