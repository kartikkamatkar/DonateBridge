from django.contrib import admin
from .models import (
    NGO, NGODocument, NGOReview, EmergencyCampaign, 
    Need, VolunteerEvent, VolunteerRegistration, VerificationStatus
)
from moderation.models import AuditLog

class NGODocumentInline(admin.TabularInline):
    model = NGODocument
    extra = 0
    readonly_fields = ('uploaded_at',)

class NGOReviewInline(admin.TabularInline):
    model = NGOReview
    extra = 0
    readonly_fields = ('created_at',)

@admin.action(description="Approve selected NGOs")
def approve_selected_ngos(modeladmin, request, queryset):
    for ngo in queryset:
        if ngo.verification_status != VerificationStatus.APPROVED:
            ngo.verification_status = VerificationStatus.APPROVED
            ngo.save()
            AuditLog.objects.create(
                user=request.user,
                action_type="NGO_APPROVAL",
                description=f"Approved NGO: {ngo.name} via Admin Action",
                ip_address=request.META.get('REMOTE_ADDR')
            )
    modeladmin.message_user(request, "Selected NGOs were approved.")

@admin.action(description="Reject selected NGOs")
def reject_selected_ngos(modeladmin, request, queryset):
    for ngo in queryset:
        if ngo.verification_status != VerificationStatus.REJECTED:
            ngo.verification_status = VerificationStatus.REJECTED
            ngo.save()
            AuditLog.objects.create(
                user=request.user,
                action_type="NGO_REJECTION",
                description=f"Rejected NGO: {ngo.name} via Admin Action",
                ip_address=request.META.get('REMOTE_ADDR')
            )
    modeladmin.message_user(request, "Selected NGOs were rejected.")

@admin.register(NGO)
class NGOAdmin(admin.ModelAdmin):
    list_display = ('name', 'verification_status', 'trust_score', 'city', 'state', 'created_at')
    list_filter = ('verification_status', 'state')
    search_fields = ('name', 'registration_number', 'gov_registration_number')
    inlines = [NGODocumentInline, NGOReviewInline]
    actions = [approve_selected_ngos, reject_selected_ngos]

@admin.register(Need)
class NeedAdmin(admin.ModelAdmin):
    list_display = ('item', 'ngo', 'category', 'urgency', 'fulfilled_quantity', 'quantity')
    list_filter = ('category', 'urgency')
    search_fields = ('item', 'ngo__name')

@admin.register(EmergencyCampaign)
class EmergencyCampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('title', 'location')

@admin.register(VolunteerEvent)
class VolunteerEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'ngo', 'date', 'location', 'max_volunteers')
    list_filter = ('date',)
    search_fields = ('title', 'ngo__name')

@admin.register(VolunteerRegistration)
class VolunteerRegistrationAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'status', 'registered_at')
    list_filter = ('status',)
    search_fields = ('user__email', 'event__title')
