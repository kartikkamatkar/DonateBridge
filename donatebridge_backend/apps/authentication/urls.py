from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    UserMeView,
    ResendOTPView,
    VerifyOTPView
)

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('auth/register/', UserRegistrationView.as_view(), name='auth_register'),
    path('auth/resend-otp/', ResendOTPView.as_view(), name='auth_resend_otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='auth_verify_otp'),
    path('users/me/', UserMeView.as_view(), name='user_me'),
]
