import random
import uuid
import os
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
OTP_TTL_SECONDS = 600  # 10 minutes

def _generate_otp():
    """Generate a 6-digit OTP. In DEBUG mode, always return 123456 for easy testing."""
    if settings.DEBUG:
        return '123456'
    return str(random.randint(100000, 999999))

def _store_otp(email, otp):
    """Store OTP in Django's cache with a 10-minute TTL."""
    cache_key = f"{OTP_CACHE_PREFIX}{email.lower().strip()}"
    cache.set(cache_key, otp, OTP_TTL_SECONDS)

def _verify_otp(email, code):
    """
    Verify OTP against cache. Returns True if valid.
    In DEBUG mode, always accept '123456' as a fallback.
    """
    cache_key = f"{OTP_CACHE_PREFIX}{email.lower().strip()}"
    stored_otp = cache.get(cache_key)
    
    # Accept the code if it matches the stored OTP
    if stored_otp and str(stored_otp) == str(code):
        cache.delete(cache_key)  # One-time use
        return True
    
    # In DEBUG mode, accept hardcoded '123456' for dev convenience
    if settings.DEBUG and str(code) == '123456':
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
        # update user avatar and profile details
        user.avatar = request.data.get('avatar', user.avatar)
        user.save()
        
        profile = getattr(user, 'profile', None)
        if not profile:
            profile, _ = Profile.objects.get_or_create(user=user)
            
        profile_serializer = ProfileSerializer(profile, data=request.data, partial=True)
        profile_serializer.is_valid(raise_exception=True)
        profile_serializer.save()
        
        return Response(self.get_serializer(user).data)


# ─── OTP Send / Verify / Resend ───────────────────────

class ResendOTPView(APIView):
    """Generate and send (mock) an OTP for email verification during registration or forgot-password."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        otp = _generate_otp()
        _store_otp(email, otp)
        _send_otp_to_email(email, otp)

        return Response({"message": "OTP sent successfully to email."}, status=status.HTTP_200_OK)

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
    """Generate and send (mock) an OTP for password reset."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        # Generate OTP and store it in cache
        otp = _generate_otp()
        _store_otp(email, otp)
        _send_otp_to_email(email, otp)

        return Response({
            "message": "If an account exists, a password reset OTP will be sent to the email."
        }, status=status.HTTP_200_OK)

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

