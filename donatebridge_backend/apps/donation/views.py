import math
import random
from datetime import datetime
from django.utils import timezone as django_timezone
from rest_framework import status, permissions, generics, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from .models import Donation, WishlistItem, DonationPhoto, CommunityChallenge
from .serializers import DonationDetailsSerializer, DonationCreateSerializer, CommunityChallengeSerializer
from ngo.models import NGO, Need
from ngo.views import get_distance_km
from logistics.models import LogisticsJob, TrackingMilestone
from moderation.models import AuditLog

# Smart Matching Priority Calculation
def calculate_match_score(donation, need, ngo):
    # 1. Category Fit (40%)
    category_fit = 100 if donation.category.lower() == need.category.lower() else 0
    
    # 2. Distance Score (30%)
    dist = get_distance_km(donation.pickup_lat, donation.pickup_lng, ngo.lat, ngo.lng)
    distance_score = max(0, 100 - (dist * 5)) # 0km = 100, 20km = 0
    
    # 3. Urgency Score (20%)
    urgency_map = {'High': 100, 'Medium': 70, 'Low': 30}
    urgency_score = urgency_map.get(need.urgency, 30)
    
    # 4. Freshness Score (10%)
    delta_days = (django_timezone.now() - donation.submitted_at).days
    freshness_score = max(0, 100 - (delta_days * 10))
    
    total_score = round(
        (category_fit * 0.40) +
        (distance_score * 0.30) +
        (urgency_score * 0.20) +
        (freshness_score * 0.10)
    )
    
    return {
        "total": total_score,
        "categoryFit": round(category_fit * 0.40),
        "distanceScore": round(distance_score * 0.30),
        "urgencyScore": round(urgency_score * 0.20),
        "freshnessScore": round(freshness_score * 0.10),
        "distance": round(dist, 1)
    }

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DonationCreateSerializer
        return DonationDetailsSerializer

    def get_queryset(self):
        queryset = Donation.objects.filter(status='VERIFIED')
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__icontains=category)
            
        conditions = self.request.query_params.get('condition')
        if conditions:
            condition_list = [c.strip() for c in conditions.split(',')]
            queryset = queryset.filter(condition__in=condition_list)
            
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        distance_limit = self.request.query_params.get('distance')
        
        if lat and lng and distance_limit:
            try:
                center_lat = float(lat)
                center_lng = float(lng)
                radius = float(distance_limit)
                
                filtered_ids = []
                for donation in queryset:
                    dist = get_distance_km(center_lat, center_lng, donation.pickup_lat, donation.pickup_lng)
                    if dist <= radius:
                        filtered_ids.append(donation.id)
                queryset = queryset.filter(id__in=filtered_ids)
            except ValueError:
                pass
                
        sort_by = self.request.query_params.get('sortBy', 'date')
        if sort_by == 'date':
            queryset = queryset.order_by('-submitted_at')
        elif sort_by == 'quantity':
            queryset = queryset.order_by('-quantity')
            
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_donations(self, request):
        donations = Donation.objects.filter(donor=request.user).order_by('-submitted_at')
        serializer = DonationDetailsSerializer(donations, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def claim(self, request, pk=None):
        donation = self.get_object()
        
        if not hasattr(request.user, 'ngo_details'):
            return Response({"error": "User role/profile must be NGO to claim donations"}, status=status.HTTP_403_FORBIDDEN)
        ngo = request.user.ngo_details
        if ngo.verification_status != 'approved':
            return Response({"error": "Your NGO verification status must be approved to claim donations"}, status=status.HTTP_403_FORBIDDEN)
            
        if donation.status != 'VERIFIED':
            return Response({"error": "Donation is not available for claim"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Match Score logic
        matching_need = Need.objects.filter(ngo=ngo, category__iexact=donation.category).first()
        score = 80
        if matching_need:
            score_breakdown = calculate_match_score(donation, matching_need, ngo)
            score = score_breakdown['total']
            
        donation.status = 'MATCHED'
        donation.matched_ngo = ngo
        donation.match_score = score
        donation.matched_at = django_timezone.now()
        donation.save()
        
        # Link Claim to Increment progress counters
        # 1. Update NGO Need fulfilled quantity
        if matching_need:
            matching_need.fulfilled_quantity = min(
                matching_need.fulfilled_quantity + donation.quantity, 
                matching_need.quantity
            )
            matching_need.save()
            
        # 2. Update active Community Challenges matching category
        active_challenges = CommunityChallenge.objects.filter(
            category__iexact=donation.category,
            is_active=True,
            start_date__lte=django_timezone.now(),
            end_date__gte=django_timezone.now()
        )
        for challenge in active_challenges:
            challenge.current_quantity = min(
                challenge.current_quantity + donation.quantity,
                challenge.target_quantity
            )
            challenge.save()
            
        # Generate logistics job with verification QR code token
        verify_token = f"VERIFY-{random.randint(100000, 999999)}-{donation.id}"
        logistics_job = LogisticsJob.objects.create(
            donation=donation,
            carrier_name="Express Cargo #DB-990",
            current_step=2,
            verification_token=verify_token,
            qr_code_content=f"https://donatebridge.org/verify-delivery/{verify_token}"
        )
        
        TrackingMilestone.objects.create(
            job=logistics_job, step_num=1, title='Requested',
            description='Donation request logged by donor, pending verification.',
            lat=donation.pickup_lat, lng=donation.pickup_lng
        )
        TrackingMilestone.objects.create(
            job=logistics_job, step_num=2, title='Approved',
            description='Listing approved by Admin and matched with NGO parameters.',
            lat=donation.pickup_lat, lng=donation.pickup_lng
        )
        
        # Audit log creation
        AuditLog.objects.create(
            user=request.user,
            action_type="DONATION_CLAIM",
            description=f"Donation {donation.id} claimed by NGO {ngo.name} with match score {score}."
        )
        
        return Response({
            "message": "Donation claimed successfully",
            "donation_id": donation.id,
            "status": donation.status,
            "match_score": donation.match_score,
            "qr_token": verify_token
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def wishlist(self, request, pk=None):
        donation = self.get_object()
        wish_item = WishlistItem.objects.filter(user=request.user, donation=donation).first()
        
        if wish_item:
            wish_item.delete()
            return Response({"message": "Removed from wishlist", "is_wishlisted": False})
        else:
            WishlistItem.objects.create(user=request.user, donation=donation)
            return Response({"message": "Added to wishlist", "is_wishlisted": True})

class NgoSmartMatchesView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if not hasattr(request.user, 'ngo_details'):
            return Response({"error": "User must be NGO to view smart matches"}, status=status.HTTP_403_FORBIDDEN)
        ngo = request.user.ngo_details
        
        ngo_needs = Need.objects.filter(ngo=ngo)
        available_donations = Donation.objects.filter(status='VERIFIED')
        
        matches = []
        for donation in available_donations:
            for need in ngo_needs:
                if donation.category.lower() == need.category.lower():
                    score_breakdown = calculate_match_score(donation, need, ngo)
                    matches.append({
                        "donation": DonationDetailsSerializer(donation, context={'request': request}).data,
                        "need": {
                            "id": need.id,
                            "item": need.item,
                            "category": need.category,
                            "urgency": need.urgency
                        },
                        "scoreBreakdown": score_breakdown
                    })
                    
        matches.sort(key=lambda x: x['scoreBreakdown']['total'], reverse=True)
        return Response(matches)

class DonationSmartMatchesView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, id):
        try:
            donation = Donation.objects.get(id=id)
        except Donation.DoesNotExist:
            return Response({"error": "Donation listing not found"}, status=status.HTTP_404_NOT_FOUND)
            
        needs = Need.objects.filter(ngo__verification_status='approved')
        
        matches = []
        for need in needs:
            if donation.category.lower() == need.category.lower():
                ngo = need.ngo
                score_breakdown = calculate_match_score(donation, need, ngo)
                matches.append({
                    "need": {
                        "id": need.id,
                        "item": need.item,
                        "category": need.category,
                        "urgency": need.urgency
                    },
                    "ngo": {
                        "id": ngo.id,
                        "name": ngo.name,
                        "address": ngo.address,
                        "trustScore": ngo.trust_score
                    },
                    "scoreBreakdown": score_breakdown
                })
                
        matches.sort(key=lambda x: x['scoreBreakdown']['total'], reverse=True)
        return Response(matches)

class CommunityChallengeViewSet(viewsets.ModelViewSet):
    queryset = CommunityChallenge.objects.all()
    serializer_class = CommunityChallengeSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        active_only = self.request.query_params.get('active')
        if active_only == 'true':
            return CommunityChallenge.objects.filter(is_active=True)
        return CommunityChallenge.objects.all()
