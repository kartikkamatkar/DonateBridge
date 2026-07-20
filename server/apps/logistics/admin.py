from django.contrib import admin
from .models import LogisticsJob, TrackingMilestone

class TrackingMilestoneInline(admin.TabularInline):
    model = TrackingMilestone
    extra = 0
    ordering = ('step_num',)
    readonly_fields = ('time_stamp',)

@admin.register(LogisticsJob)
class LogisticsJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'donation', 'carrier_name', 'current_step', 'updated_at')
    list_filter = ('current_step', 'carrier_name')
    search_fields = ('donation__id', 'carrier_name')
    inlines = [TrackingMilestoneInline]
