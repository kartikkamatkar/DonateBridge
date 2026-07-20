from django.contrib import admin
from .models import FraudLog, AuditLog

@admin.register(FraudLog)
class FraudLogAdmin(admin.ModelAdmin):
    list_display = ('entity_name', 'trigger', 'risk_score', 'date', 'is_dismissed')
    list_filter = ('is_dismissed', 'risk_score', 'date')
    search_fields = ('entity_name', 'trigger')
    readonly_fields = ('entity_name', 'trigger', 'risk_score', 'date')

    def has_add_permission(self, request):
        return False

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action_type', 'user', 'timestamp')
    list_filter = ('action_type', 'timestamp')
    search_fields = ('action_type', 'user__email', 'description')
    readonly_fields = ('user', 'action_type', 'description', 'ip_address', 'timestamp')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
