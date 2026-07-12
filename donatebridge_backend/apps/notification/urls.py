from django.urls import path
from .views import (
    NotificationListView,
    ReadNotificationView,
    MarkAllReadView
)

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notification_list'),
    path('notifications/<int:id>/read/', ReadNotificationView.as_view(), name='notification_read'),
    path('notifications/mark-all-read/', MarkAllReadView.as_view(), name='notification_mark_all_read'),
]
