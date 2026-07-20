from django.urls import path
from .views import (
    PendingNGOQueueView,
    AuditNGOView,
    PendingDonationQueueView,
    AuditDonationView,
    FraudLogListView,
    DismissFraudLogView,
    PlatformMetricsView
)

urlpatterns = [
    path('admin/ngos/pending/', PendingNGOQueueView.as_view(), name='admin_pending_ngos'),
    path('admin/ngos/<int:id>/audit/', AuditNGOView.as_view(), name='admin_audit_ngo'),
    path('admin/donations/pending/', PendingDonationQueueView.as_view(), name='admin_pending_donations'),
    path('admin/donations/<str:id>/audit/', AuditDonationView.as_view(), name='admin_audit_donation'),
    path('admin/fraud-logs/', FraudLogListView.as_view(), name='admin_fraud_logs'),
    path('admin/fraud-logs/<int:id>/', DismissFraudLogView.as_view(), name='admin_dismiss_fraud_log'),
    path('admin/metrics/', PlatformMetricsView.as_view(), name='admin_platform_metrics'),
]
