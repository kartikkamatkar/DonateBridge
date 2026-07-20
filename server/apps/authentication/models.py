from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRole(models.TextChoices):
    DONOR = 'donor', 'Donor'
    NGO = 'ngo', 'NGO'
    ADMIN = 'admin', 'Admin'

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=UserRole.choices, default=UserRole.DONOR)
    avatar = models.CharField(max_length=50, default="👩‍💼")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"

class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    mfa_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.email}"

