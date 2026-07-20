from django.db import models
from django.conf import settings

class ChatChannel(models.Model):
    name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Channel {self.id} {self.name}"

class ChatMember(models.Model):
    channel = models.ForeignKey(ChatChannel, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('channel', 'user')

    def __str__(self):
        return f"User {self.user.email} in Channel {self.channel.id}"

class MessageType(models.TextChoices):
    TEXT = 'text', 'Text'
    IMAGE = 'image', 'Image'
    LOCATION = 'location', 'Location'

class ChatMessage(models.Model):
    channel = models.ForeignKey(ChatChannel, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message_type = models.CharField(max_length=10, choices=MessageType.choices, default=MessageType.TEXT)
    text = models.TextField()
    media_url = models.URLField(blank=True, null=True, max_length=500)
    lat = models.FloatField(blank=True, null=True)
    lng = models.FloatField(blank=True, null=True)
    
    # Receipts
    is_delivered = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Msg {self.id} from {self.sender.email} in Channel {self.channel.id}"
