from django.db import models
from django.conf import settings
from ngo.models import NGO

class DonationStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Moderation'
    VERIFIED = 'VERIFIED', 'Verified/Approved'
    REJECTED = 'REJECTED', 'Rejected'
    MATCHED = 'MATCHED', 'Matched/Claimed'
    DELIVERED = 'DELIVERED', 'Delivered'

class Donation(models.Model):
    id = models.CharField(primary_key=True, max_length=50) # Format DNT-YYYY-XXXXX
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='donations')
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    condition = models.CharField(max_length=20)
    quantity = models.PositiveIntegerField()
    description = models.TextField()
    pickup_address = models.TextField()
    pickup_lat = models.FloatField()
    pickup_lng = models.FloatField()
    preferred_pickup_time = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=DonationStatus.choices, default=DonationStatus.PENDING)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # NGO Claim detail
    matched_ngo = models.ForeignKey(NGO, on_delete=models.SET_NULL, null=True, blank=True, related_name='matched_donations')
    match_score = models.IntegerField(blank=True, null=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    matched_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.id} - {self.title} ({self.status})"

class DonationPhoto(models.Model):
    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name='photos')
    photo_url = models.URLField(max_length=500)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.donation.id}"

class WishlistItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist_items')
    donation = models.ForeignKey(Donation, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'donation')

    def __str__(self):
        return f"{self.user.email} wishing {self.donation.id}"

class CommunityChallenge(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100) # category target
    target_quantity = models.PositiveIntegerField()
    current_quantity = models.PositiveIntegerField(default=0)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} ({self.current_quantity}/{self.target_quantity})"
