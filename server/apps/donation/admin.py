from django.contrib import admin
from django.utils import timezone
from .models import Donation, DonationPhoto, WishlistItem, CommunityChallenge, DonationStatus
from moderation.models import AuditLog

class DonationPhotoInline(admin.TabularInline):
    model = DonationPhoto
    extra = 0
    readonly_fields = ('uploaded_at',)

@admin.action(description="Approve selected donations")
def approve_pending_donations(modeladmin, request, queryset):
    for donation in queryset:
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
        try:
            from notification.models import Notification, NotificationType
            Notification.objects.create(
                user=donation.donor,
                notification_type=NotificationType.DELIVERY,
                title="✅ Donation Verified & Listed!",
                message=f"Your donation listing '{donation.title}' was verified by platform admin and is now active for NGO matching."
            )
        except Exception as e:
            print("[Notification Error]", e)
    modeladmin.message_user(request, "Selected donations were approved.")

@admin.action(description="Reject selected donations")
def reject_pending_donations(modeladmin, request, queryset):
    for donation in queryset:
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
        try:
            from notification.models import Notification, NotificationType
            Notification.objects.create(
                user=donation.donor,
                notification_type=NotificationType.DELIVERY,
                title="⚠️ Donation Listing Status Update",
                message=f"Your donation listing '{donation.title}' status was updated to REJECTED by platform admin."
            )
        except Exception as e:
            print("[Notification Error]", e)
    modeladmin.message_user(request, "Selected donations were rejected.")


from django.utils.html import format_html

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'donor', 'category', 'status_badge', 'matched_ngo', 'submitted_at')
    list_filter = ('status', 'category')
    search_fields = ('id', 'title', 'donor__email')
    inlines = [DonationPhotoInline]
    actions = [approve_pending_donations, reject_pending_donations]

    def status_badge(self, obj):
        colors = {
            DonationStatus.VERIFIED: '#10B981',
            DonationStatus.REJECTED: '#EF4444',
            DonationStatus.MATCHED: '#3B82F6',
            DonationStatus.DELIVERED: '#8B5CF6',
            DonationStatus.PENDING: '#F59E0B',
        }
        color = colors.get(obj.status, '#6B7280')
        return format_html(
            '<span style="background-color:{}; color:white; font-weight:700; padding:3px 10px; border-radius:12px; font-size:11px; text-transform:uppercase;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Status"

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
