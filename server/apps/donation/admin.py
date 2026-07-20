from django.contrib import admin
from django.utils import timezone
from .models import Donation, DonationPhoto, WishlistItem, CommunityChallenge, DonationStatus
from moderation.models import AuditLog

class DonationPhotoInline(admin.TabularInline):
    model = DonationPhoto
    extra = 0
    readonly_fields = ('uploaded_at',)

@admin.action(description="Approve selected pending donations")
def approve_pending_donations(modeladmin, request, queryset):
    for donation in queryset:
        if donation.status == DonationStatus.PENDING:
            donation.status = DonationStatus.VERIFIED
            donation.reviewed_at = timezone.now()
            donation.rejection_reason = None
            donation.save()
            AuditLog.objects.create(
                user=request.user,
                action_type="DONATION_AUDIT",
                description=f"Donation listing '{donation.title}' (ID: {donation.id}) moderated: APPROVE via Admin Action.",
                ip_address=request.META.get('REMOTE_ADDR')
            )
    modeladmin.message_user(request, "Selected pending donations were approved.")

@admin.action(description="Reject selected pending donations")
def reject_pending_donations(modeladmin, request, queryset):
    for donation in queryset:
        if donation.status == DonationStatus.PENDING:
            donation.status = DonationStatus.REJECTED
            donation.reviewed_at = timezone.now()
            donation.rejection_reason = "Rejected via Admin Action."
            donation.save()
            AuditLog.objects.create(
                user=request.user,
                action_type="DONATION_AUDIT",
                description=f"Donation listing '{donation.title}' (ID: {donation.id}) moderated: REJECT via Admin Action. Remarks/Reason: Rejected via Admin Action.",
                ip_address=request.META.get('REMOTE_ADDR')
            )
    modeladmin.message_user(request, "Selected pending donations were rejected.")


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'donor', 'category', 'status', 'matched_ngo', 'submitted_at')
    list_filter = ('status', 'category')
    search_fields = ('id', 'title', 'donor__email')
    inlines = [DonationPhotoInline]
    actions = [approve_pending_donations, reject_pending_donations]

@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'donation', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'donation__id', 'donation__title')

@admin.register(CommunityChallenge)
class CommunityChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'current_quantity', 'target_quantity', 'is_active', 'start_date', 'end_date')
    list_filter = ('is_active', 'category')
    search_fields = ('title',)
