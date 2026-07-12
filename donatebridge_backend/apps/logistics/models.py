from django.db import models
from donation.models import Donation

class LogisticsJob(models.Model):
    donation = models.OneToOneField(Donation, on_delete=models.CASCADE, related_name='logistics_job')
    carrier_name = models.CharField(max_length=100, default="Express Cargo #DB-990")
    current_step = models.PositiveIntegerField(default=1) # Step 1 to 6
    verification_token = models.CharField(max_length=64, unique=True, blank=True, null=True)
    qr_code_content = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Job {self.id} for Donation {self.donation.id} (Step {self.current_step})"

class TrackingMilestone(models.Model):
    job = models.ForeignKey(LogisticsJob, on_delete=models.CASCADE, related_name='milestones')
    step_num = models.PositiveIntegerField()
    title = models.CharField(max_length=100)
    description = models.TextField()
    lat = models.FloatField()
    lng = models.FloatField()
    time_stamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['step_num']
        unique_together = ('job', 'step_num')

    def __str__(self):
        return f"Job {self.job.id} - Step {self.step_num}: {self.title}"
