from django.urls import path
from .views import LogisticsTrackingView, UpdateLogisticsStepView, VerifyQRCodeView

urlpatterns = [
    path('tracking/<str:donation_id>/', LogisticsTrackingView.as_view(), name='logistics_tracking'),
    path('tracking/<str:donation_id>/step/', UpdateLogisticsStepView.as_view(), name='logistics_update_step'),
    path('tracking/<str:donation_id>/verify-qr/', VerifyQRCodeView.as_view(), name='logistics_verify_qr'),
]
