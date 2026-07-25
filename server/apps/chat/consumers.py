import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatChannel, ChatMember, ChatMessage

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']

        if self.user.is_anonymous:
            await self.close()
            return

        # Check if user is a member of this channel
        is_member = await self.is_channel_member(self.room_id, self.user)
        if not is_member:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )



    # Receive message from room group
    async def chat_message(self, event):
        message_dict = dict(event['message_dict'])
        # Calculate 'self' dynamically per connected client
        message_dict['self'] = (message_dict['sender_id'] == self.user.id)
        
        if not message_dict['self']:
            # For the receiver, consider it delivered/read once pushed to websocket
            # We could do a DB update here, but let's just update the status sent to frontend
            message_dict['status'] = 'delivered'

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message_dict))

    @database_sync_to_async
    def is_channel_member(self, channel_id, user):
        return ChatMember.objects.filter(channel_id=channel_id, user=user).exists()

    @database_sync_to_async
    def save_message(self, channel_id, sender, message_type, text, media_url, lat, lng):
        msg = ChatMessage.objects.create(
            channel_id=channel_id,
            sender=sender,
            message_type=message_type,
            text=text,
            media_url=media_url,
            lat=lat,
            lng=lng,
            is_delivered=True,
            is_read=False
        )
        return msg

    @database_sync_to_async
    def trigger_mock_reply(self, channel_id, current_user):
        other_member = ChatMember.objects.filter(channel_id=channel_id).exclude(user=current_user).first()
        if other_member and other_member.user.role == 'ngo':
            automated_replies = [
                'Excellent, our dispatch logistics division has acknowledged this.',
                'Perfect. We are tracking this status stamp ID on our dashboard ledger.',
                'Understood. The courier will verify packaging specifications upon arrival.',
                'Thanks for the update. Let us coordinate the final delivery milestone.'
            ]
            reply_text = random.choice(automated_replies)
            
            msg = ChatMessage.objects.create(
                channel_id=channel_id,
                sender=other_member.user,
                message_type='text',
                text=reply_text,
                is_delivered=True,
                is_read=False
            )
            
            message_dict = {
                'id': msg.id,
                'sender_id': other_member.user.id,
                'sender_name': other_member.user.username,
                'sender_avatar': getattr(other_member.user, 'avatar', None),
                'message_type': msg.message_type,
                'text': msg.text,
                'media_url': msg.media_url,
                'lat': None,
                'lng': None,
                'is_delivered': msg.is_delivered,
                'is_read': msg.is_read,
                'time': msg.created_at.strftime("%I:%M %p"),
                'status': 'sent'
            }
            
            # Broadcast the mock reply to the channel layer synchronously from this thread,
            # or schedule it on the event loop. Since we're in database_sync_to_async, we should return the dict and let the async context send it.
            return message_dict
        return None

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        
        message_type = text_data_json.get('message_type', 'text')
        text = text_data_json.get('text', '')
        media_url = text_data_json.get('media_url')
        lat = text_data_json.get('lat')
        lng = text_data_json.get('lng')

        if message_type == 'text' and not text:
            return

        msg_obj = await self.save_message(
            channel_id=self.room_id,
            sender=self.user,
            message_type=message_type,
            text=text,
            media_url=media_url,
            lat=lat,
            lng=lng
        )

        message_dict = {
            'id': msg_obj.id,
            'sender_id': self.user.id,
            'sender_name': self.user.username,
            'sender_avatar': getattr(self.user, 'avatar', None),
            'message_type': msg_obj.message_type,
            'text': msg_obj.text,
            'media_url': msg_obj.media_url,
            'lat': float(msg_obj.lat) if msg_obj.lat else None,
            'lng': float(msg_obj.lng) if msg_obj.lng else None,
            'is_delivered': msg_obj.is_delivered,
            'is_read': msg_obj.is_read,
            'time': msg_obj.created_at.strftime("%I:%M %p"),
            'status': 'sent'
        }

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message_dict': message_dict
            }
        )

        mock_reply_dict = await self.trigger_mock_reply(self.room_id, self.user)
        if mock_reply_dict:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message_dict': mock_reply_dict
                }
            )
