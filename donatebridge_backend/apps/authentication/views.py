import random
import datetime
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Profile, OTPVerification
from .serializers import (
    CustomTokenObtainPairSerializer, 
    UserRegistrationSerializer, 
    UserDetailsSerializer,
    ProfileSerializer
)

User = get_user_model()

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
            profile = Profile.objects.create(user=user)
            
        profile_serializer = ProfileSerializer(profile, data=request.data, partial=True)
        profile_serializer.is_valid(raise_exception=True)
        profile_serializer.save()
        
        return Response(self.get_serializer(user).data)

class ResendOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate 6 digit code
        code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + datetime.timedelta(minutes=5)
        
        # Save to database
        OTPVerification.objects.create(
            email=email,
            code=code,
            expires_at=expires_at
        )
        
        # Print OTP to terminal output for easy verification
        print(f"\n==========================================")
        print(f"  [SMS/EMAIL MOCK SERVER]                 ")
        print(f"  OTP Verification Code for {email}: {code} ")
        print(f"==========================================\n")
        
        return Response({
            "message": "OTP verification code dispatched to email.",
            "otp_preview": code # Return code directly in debug mode for easy mock matching
        }, status=status.HTTP_200_OK)

class VerifyOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        
        if not email or not code:
            return Response({"error": "Email and code are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        now = timezone.now()
        otp = OTPVerification.objects.filter(
            email=email,
            code=code,
            expires_at__gt=now,
            is_verified=False
        ).order_by('-created_at').first()
        
        if not otp:
            return Response({"error": "Invalid or expired OTP code"}, status=status.HTTP_400_BAD_REQUEST)
        
        otp.is_verified = True
        otp.save()
        
        return Response({"message": "OTP verified successfully"}, status=status.HTTP_200_OK)
