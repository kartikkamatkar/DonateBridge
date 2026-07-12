from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum

from .models import FraudLog, AuditLog
from .serializers import FraudLogSerializer
from ngo.models import NGO, VerificationStatus, EmergencyCampaign
from ngo.serializers import NGODetailsSerializer
from donation.models import Donation, DonationStatus, CommunityChallenge
from donation.serializers import DonationDetailsSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class PendingNGOQueueView(generics.ListAPIView):
    serializer_class = NGODetailsSerializer
    permission_classes = (IsAdminUser,)

    def get_queryset(self):
        return NGO.objects.filter(verification_status=VerificationStatus.PENDING)

class AuditNGOView(APIView):
    permission_classes = (IsAdminUser,)

    def post(self, request, id):
        try:
            ngo = NGO.objects.get(id=id)
        except NGO.DoesNotExist:
            return Response({"error": "NGO profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        action = request.data.get('action') # 'approve', 'reject', 'request_changes'
        reason = request.data.get('reason', '')
        
        if action not in ['approve', 'reject', 'request_changes']:
            return Response({"error": "Invalid audit action"}, status=status.HTTP_400_BAD_REQUEST)
            
        if action == 'approve':
            ngo.verification_status = VerificationStatus.APPROVED
            ngo.rejection_reason = None
            ngo.trust_score = min(ngo.trust_score + 10, 100) # Approved boosts trust score
        elif action == 'reject':
            ngo.verification_status = VerificationStatus.REJECTED
            ngo.rejection_reason = reason
        elif action == 'request_changes':
            ngo.verification_status = VerificationStatus.CHANGES_REQUESTED
            ngo.rejection_reason = reason
            
        ngo.save()

        # Audit Log record
        AuditLog.objects.create(
            user=request.user,
            action_type="NGO_AUDIT",
            description=f"NGO '{ngo.name}' (ID: {ngo.id}) audited: {action.upper()}. Remarks/Reason: {reason}"
        )
        
        return Response(NGODetailsSerializer(ngo).data)

class PendingDonationQueueView(generics.ListAPIView):
    serializer_class = DonationDetailsSerializer
    permission_classes = (IsAdminUser,)

    def get_queryset(self):
        return Donation.objects.filter(status=DonationStatus.PENDING)

class AuditDonationView(APIView):
    permission_classes = (IsAdminUser,)

    def post(self, request, id):
        try:
            donation = Donation.objects.get(id=id)
        except Donation.DoesNotExist:
            return Response({"error": "Donation listing not found"}, status=status.HTTP_404_NOT_FOUND)
            
        action = request.data.get('action') # 'approve', 'reject'
        reason = request.data.get('reason', '')
        
        if action not in ['approve', 'reject']:
            return Response({"error": "Invalid audit action"}, status=status.HTTP_400_BAD_REQUEST)
            
        if action == 'approve':
            donation.status = DonationStatus.VERIFIED
            donation.reviewed_at = timezone.now()
            donation.rejection_reason = None
        elif action == 'reject':
            donation.status = DonationStatus.REJECTED
            donation.reviewed_at = timezone.now()
            donation.rejection_reason = reason
            
        donation.save()

        # Audit Log record
        AuditLog.objects.create(
            user=request.user,
            action_type="DONATION_AUDIT",
            description=f"Donation listing '{donation.title}' (ID: {donation.id}) moderated: {action.upper()}. Remarks/Reason: {reason}"
        )
        
        return Response(DonationDetailsSerializer(donation, context={'request': request}).data)

class FraudLogListView(generics.ListAPIView):
    serializer_class = FraudLogSerializer
    permission_classes = (IsAdminUser,)

    def get_queryset(self):
        return FraudLog.objects.filter(is_dismissed=False).order_by('-date')

class DismissFraudLogView(APIView):
    permission_classes = (IsAdminUser,)

    def delete(self, request, id):
        try:
            log = FraudLog.objects.get(id=id)
        except FraudLog.DoesNotExist:
            return Response({"error": "Fraud log entry not found"}, status=status.HTTP_404_NOT_FOUND)
            
        log.is_dismissed = True
        log.save()

        # Audit Log record
        AuditLog.objects.create(
            user=request.user,
            action_type="FRAUD_DISMISS",
            description=f"Fraud alert for entity '{log.entity_name}' (ID: {log.id}) dismissed by administrator."
        )
        
        return Response({"message": "Fraud alert dismissed successfully"})

class PlatformMetricsView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        total_donations = Donation.objects.count()
        total_donors = User.objects.filter(role='donor').count()
        total_ngos = User.objects.filter(role='ngo').count()
        pending_ngos = NGO.objects.filter(verification_status=VerificationStatus.PENDING).count()
        
        routed_items = Donation.objects.filter(status__in=['MATCHED', 'DELIVERED']).aggregate(Sum('quantity'))['quantity__sum'] or 0
        carbon_saved = routed_items * 10 
        beneficiaries_served = routed_items * 3 # multiplier of 3 beneficiaries per listing item
        trees_equivalent = round(carbon_saved / 20) # 1 tree offsets approx 20kg CO2 per year
        
        # Success rate
        matched_count = Donation.objects.filter(status='MATCHED').count()
        delivered_count = Donation.objects.filter(status='DELIVERED').count()
        total_claims = matched_count + delivered_count
        success_rate = "100%"
        if total_claims > 0:
            success_rate = f"{round((delivered_count / total_claims) * 100)}%"
            
        active_challenges = CommunityChallenge.objects.filter(is_active=True).count()
        active_campaigns = EmergencyCampaign.objects.filter(is_active=True).count()
            
        return Response({
            "metrics": {
                "totalDonations": total_donations,
                "totalDonors": total_donors,
                "totalNGOs": total_ngos,
                "pendingNGOs": pending_ngos,
                "carbonSavedKg": carbon_saved,
                "beneficiariesServed": beneficiaries_served,
                "treesEquivalent": trees_equivalent,
                "successRate": success_rate,
                "totalItemsTransferred": routed_items,
                "activeChallengesCount": active_challenges,
                "activeCampaignsCount": active_campaigns
            }
        })
