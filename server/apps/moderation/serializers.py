from rest_framework import serializers
from .models import FraudLog

class FraudLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FraudLog
        fields = ('id', 'entity_name', 'trigger', 'risk_score', 'date', 'is_dismissed')
