from rest_framework import serializers
from .models import LogisticsJob, TrackingMilestone

class TrackingMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingMilestone
        fields = ('step_num', 'title', 'description', 'lat', 'lng', 'time_stamp')

class LogisticsJobSerializer(serializers.ModelSerializer):
    milestones = TrackingMilestoneSerializer(many=True, read_only=True)
    donation_id = serializers.CharField(source='donation.id', read_only=True)

    class Meta:
        model = LogisticsJob
        fields = ('id', 'donation_id', 'carrier_name', 'current_step', 'updated_at', 'milestones')
