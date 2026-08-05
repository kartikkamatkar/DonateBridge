from django.contrib import admin
from .models import ChatChannel, ChatMember, ChatMessage

class ChatMemberInline(admin.TabularInline):
    model = ChatMember
    extra = 0
    readonly_fields = ('joined_at',)

@admin.register(ChatChannel)
class ChatChannelAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)
    inlines = [ChatMemberInline]

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('channel', 'sender', 'message_type', 'is_read', 'created_at')
    list_filter = ('message_type', 'is_read')
    search_fields = ('text', 'sender__email')
    readonly_fields = ('channel', 'sender', 'message_type', 'text', 'media_url', 'lat', 'lng', 'is_delivered', 'is_read', 'created_at')

    def has_add_permission(self, request):
        return False
