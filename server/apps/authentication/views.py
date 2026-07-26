import random
import uuid
import os
import sys
from django.conf import settings
from django.core.cache import cache
from django.contrib.auth import get_user_model
from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Profile
from .serializers import (
    CustomTokenObtainPairSerializer, 
    UserRegistrationSerializer, 
    UserDetailsSerializer,
    ProfileSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)

User = get_user_model()

# ─── OTP Helpers ───────────────────────────────────────
OTP_CACHE_PREFIX = 'otp_'
OTP_VERIFIED_PREFIX = 'otp_verified_'
OTP_TTL_SECONDS = 600  # 10 minutes

def _generate_otp():
    """Generate a random 6-digit OTP string."""
    return f"{random.randint(100000, 999999)}"

def _store_otp(email, otp):
    """Store OTP in Django's cache with a 10-minute TTL."""
    cache_key = f"{OTP_CACHE_PREFIX}{email.lower().strip()}"
    cache.set(cache_key, str(otp), OTP_TTL_SECONDS)

def _verify_otp(email, code, mark_verified=True):
    """
    Verify OTP against cache. Returns True if valid.
    """
    email_clean = email.lower().strip()
    cache_key = f"{OTP_CACHE_PREFIX}{email_clean}"
    verified_key = f"{OTP_VERIFIED_PREFIX}{email_clean}"
    
    stored_otp = cache.get(cache_key)
    is_already_verified = cache.get(verified_key)
    
    # Accept if matches stored OTP or if already verified during forgot-password flow
    if (stored_otp and str(stored_otp) == str(code)) or is_already_verified:
        if mark_verified:
            cache.set(verified_key, True, OTP_TTL_SECONDS)
        cache.delete(cache_key)
        return True
    
    return False

from django.core.mail import send_mail

def _send_otp_to_email(email, otp):
    """Send OTP via real email, fallback to console logging if fails."""
    subject = "DonateBridge - Your Verification Code"
    message = f"Your verification code is: {otp}\n\nThis code will expire in 10 minutes."
    html_message = f"""
    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0f172a;">DonateBridge Verification</h2>
        <p style="color: #475569;">Your verification code is:</p>
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #10b981; letter-spacing: 4px; margin: 0; font-size: 32px;">{otp}</h1>
        </div>
        <p style="color: #64748b; font-size: 12px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
            html_message=html_message
        )
        print(f"[EMAIL] Successfully sent OTP to {email}")
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {email}: {str(e)}")
        # Fallback to console for debugging
        print(f"\n==========================================")
        print(f"  [EMAIL FALLBACK]                        ")
        print(f"  OTP sent to: {email}                    ")
        print(f"  OTP Code:    {otp}                      ")
        print(f"==========================================\n")


# ─── Auth Views ────────────────────────────────────────

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Auto generate access/refresh tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        # Custom claims mapping
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['username'] = user.username
        refresh['avatar'] = user.avatar
        
        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "role": user.role,
                "avatar": user.avatar
            },
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class UserMeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserDetailsSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        
        if 'avatar' in request.data:
            user.avatar = request.data['avatar']
        if 'name' in request.data and request.data['name']:
            user.username = request.data['name']
        elif 'username' in request.data and request.data['username']:
            user.username = request.data['username']
        user.save()
        
        profile, _ = Profile.objects.get_or_create(user=user)
        
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if 'location' in data and 'address' not in data:
            data['address'] = data['location']
            
        profile_serializer = ProfileSerializer(profile, data=data, partial=True)
        profile_serializer.is_valid(raise_exception=True)
        profile_serializer.save()
        
        return Response(self.get_serializer(user).data)


# ─── OTP Send / Verify / Resend ───────────────────────

class ResendOTPView(APIView):
    """Generate and send an OTP for email verification during registration or forgot-password."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        otp = _generate_otp()
        _store_otp(email, otp)
        _send_otp_to_email(email, otp)

        res_data = {"message": "OTP sent successfully to email."}
        if settings.DEBUG or 'test' in sys.argv:
            res_data["otp_preview"] = otp

        return Response(res_data, status=status.HTTP_200_OK)

class VerifyOTPView(APIView):
    """Verify the OTP code submitted by the user."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        
        if not email or not code:
            return Response({"error": "Email and code are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        if not _verify_otp(email, code):
            return Response({"error": "Invalid or expired OTP code."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "OTP verified successfully."}, status=status.HTTP_200_OK)


# ─── Forgot / Reset Password ──────────────────────────

class ForgotPasswordView(APIView):
    """Generate and send an OTP for password reset."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        # Generate OTP and store it in cache
        otp = _generate_otp()
        _store_otp(email, otp)
        _send_otp_to_email(email, otp)

        res_data = {
            "message": "If an account exists, a password reset OTP will be sent to the email."
        }
        if settings.DEBUG or 'test' in sys.argv:
            res_data["otp_preview"] = otp

        return Response(res_data, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    """Verify OTP and reset the user's password."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        # Validate OTP before allowing password change
        if not _verify_otp(email, code):
            return Response({"error": "Invalid or expired OTP code."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User matching email not found"}, status=status.HTTP_404_NOT_FOUND)

        # Set new password
        user.set_password(new_password)
        user.save()

        # Clean up cache keys
        cache.delete(f"{OTP_CACHE_PREFIX}{email.lower().strip()}")
        cache.delete(f"{OTP_VERIFIED_PREFIX}{email.lower().strip()}")

        return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)


# ─── File Upload ───────────────────────────────────────

class SecureFileUploadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Size check: max 5MB
        if file_obj.size > 5 * 1024 * 1024:
            return Response({"error": "File size exceeds 5MB limit"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Extension check
        ext = file_obj.name.split('.')[-1].lower()
        allowed_extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx']
        if ext not in allowed_extensions:
            return Response({"error": f"File extension .{ext} is not allowed. Only JPG, JPEG, PNG, WEBP, GIF, PDF, DOC, and DOCX are allowed."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Double extension validation
        if len(file_obj.name.split('.')) > 2:
            return Response({"error": "Suspicious double file extension detected."}, status=status.HTTP_400_BAD_REQUEST)

        # Create media upload path
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
        os.makedirs(upload_dir, exist_ok=True)

        # 4. Generate safe unique filename
        safe_filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(upload_dir, safe_filename)

        # Write file chunk by chunk
        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        # 5. Build absolute URL
        file_url = request.build_absolute_uri(settings.MEDIA_URL + 'uploads/' + safe_filename)

        return Response({
            "message": "File uploaded successfully",
            "url": file_url
        }, status=status.HTTP_201_CREATED)

