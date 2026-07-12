from django.db import models
from django.conf import settings

class FraudLog(models.Model):
    entity_name = models.CharField(max_length=255)
    trigger = models.CharField(max_length=255)
    risk_score = models.CharField(max_length=50) # e.g. "Medium (42%)" or "Critical (95%)"
    date = models.DateField(auto_now_add=True)
    is_dismissed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.entity_name} - {self.trigger} ({self.risk_score})"

class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=100) # e.g. "USER_LOGIN", "NGO_APPROVAL", "DONATION_CLAIM"
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action_type} - {self.user} at {self.timestamp}"
