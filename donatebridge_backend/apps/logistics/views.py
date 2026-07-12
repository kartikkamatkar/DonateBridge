from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from .models import LogisticsJob, TrackingMilestone
from .serializers import LogisticsJobSerializer
from donation.models import Donation, DonationStatus

class LogisticsTrackingView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, donation_id):
        try:
            job = LogisticsJob.objects.prefetch_related('milestones').get(donation_id=donation_id)
        except LogisticsJob.DoesNotExist:
            return Response({"error": "Tracking record not found for this donation ID"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = LogisticsJobSerializer(job)
        return Response(serializer.data)

class UpdateLogisticsStepView(APIView):
    permission_classes = (permissions.AllowAny,)

    def patch(self, request, donation_id):
        try:
            job = LogisticsJob.objects.get(donation_id=donation_id)
        except LogisticsJob.DoesNotExist:
            return Response({"error": "Tracking record not found"}, status=status.HTTP_404_NOT_FOUND)
            
        step = request.data.get('step')
        if not step:
            return Response({"error": "Step number is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            step_num = int(step)
            if not (1 <= step_num <= 6):
                return Response({"error": "Step number must be between 1 and 6"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Invalid step number format"}, status=status.HTTP_400_BAD_REQUEST)
            
        job.current_step = step_num
        job.save()
        
        milestone_choices = {
            1: ('Requested', 'Donation request logged by donor, pending verification.'),
            2: ('Approved', 'Listing approved by Admin and matched with NGO parameters.'),
            3: ('Dispatched', 'Logistics carrier assigned and dispatched to donor pickup location.'),
            4: ('In Transit', 'Shipment picked up, currently in transit to destination NGO hub.'),
            5: ('Delivered', 'Parcels delivered to the destination NGO Hub address.'),
            6: ('Completed', 'Digital receipt matching complete, transaction hashed on ledger.')
        }
        
        donation = job.donation
        
        lat = donation.pickup_lat
        lng = donation.pickup_lng
        if step_num >= 4:
            if donation.matched_ngo:
                lat = (donation.pickup_lat + donation.matched_ngo.lat) / 2
                lng = (donation.pickup_lng + donation.matched_ngo.lng) / 2
        if step_num >= 5:
            if donation.matched_ngo:
                lat = donation.matched_ngo.lat
                lng = donation.matched_ngo.lng
        
        title, desc = milestone_choices[step_num]
        TrackingMilestone.objects.get_or_create(
            job=job,
            step_num=step_num,
            defaults={
                'title': title,
                'description': desc,
                'lat': lat,
                'lng': lng
            }
        )
        
        if step_num == 5:
            donation.status = DonationStatus.DELIVERED
            donation.delivered_at = timezone.now()
            donation.save()
        elif step_num == 6:
            donation.status = DonationStatus.DELIVERED
            donation.save()
            
        return Response(LogisticsJobSerializer(job).data)

class VerifyQRCodeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, donation_id):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Verification token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = LogisticsJob.objects.get(donation_id=donation_id)
        except LogisticsJob.DoesNotExist:
            return Response({"error": "Tracking record not found"}, status=status.HTTP_404_NOT_FOUND)

        if job.verification_token != token:
            return Response({"error": "Invalid verification token"}, status=status.HTTP_400_BAD_REQUEST)

        job.current_step = 5
        job.save()

        donation = job.donation
        donation.status = DonationStatus.DELIVERED
        donation.delivered_at = timezone.now()
        donation.save()

        TrackingMilestone.objects.get_or_create(
            job=job,
            step_num=5,
            defaults={
                'title': 'Delivered',
                'description': 'Parcels delivered to the destination NGO Hub address, verified via secure QR handover code.',
                'lat': donation.matched_ngo.lat if donation.matched_ngo else donation.pickup_lat,
                'lng': donation.matched_ngo.lng if donation.matched_ngo else donation.pickup_lng
            }
        )

        return Response({
            "message": "Delivery verified successfully via QR code.",
            "job": LogisticsJobSerializer(job).data
        }, status=status.HTTP_200_OK)
