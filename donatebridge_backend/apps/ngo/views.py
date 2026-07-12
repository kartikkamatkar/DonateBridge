import math
from rest_framework import status, permissions, generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from .models import NGO, NGODocument, NGOReview, Need, EmergencyCampaign, VolunteerEvent, VolunteerRegistration
from .serializers import (
    NGORegistrationSerializer, 
    NGODetailsSerializer, 
    NGOReviewSerializer, 
    NeedSerializer,
    EmergencyCampaignSerializer,
    VolunteerEventSerializer,
    VolunteerRegistrationSerializer
)

def get_distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0 # Radius of the Earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'

class IsNgoUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'ngo'

class NGORegisterView(generics.CreateAPIView):
    serializer_class = NGORegistrationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if request.user.role != 'ngo':
            return Response({"error": "User role must be NGO to register organization detail"}, status=status.HTTP_403_FORBIDDEN)
        
        if hasattr(request.user, 'ngo_details'):
            return Response({"error": "NGO details already registered for this user"}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ngo = serializer.save()
        
        return Response(NGODetailsSerializer(ngo).data, status=status.HTTP_201_CREATED)

class NGOListView(generics.ListAPIView):
    serializer_class = NGODetailsSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        queryset = NGO.objects.filter(verification_status='approved')
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(working_areas__icontains=category)

        query = self.request.query_params.get('query')
        if query:
            queryset = queryset.filter(name__icontains=query)

        trust_score = self.request.query_params.get('trust_score')
        if trust_score:
            try:
                queryset = queryset.filter(trust_score__gte=int(trust_score))
            except ValueError:
                pass

        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        distance_limit = self.request.query_params.get('distance')
        
        if lat and lng and distance_limit:
            try:
                center_lat = float(lat)
                center_lng = float(lng)
                radius = float(distance_limit)
                
                filtered_ids = []
                for ngo in queryset:
                    dist = get_distance_km(center_lat, center_lng, ngo.lat, ngo.lng)
                    if dist <= radius:
                        filtered_ids.append(ngo.id)
                queryset = queryset.filter(id__in=filtered_ids)
            except ValueError:
                pass

        return queryset

class NGODetailsView(generics.RetrieveAPIView):
    queryset = NGO.objects.all()
    serializer_class = NGODetailsSerializer
    permission_classes = (permissions.AllowAny,)

class NGOCreateReviewView(generics.CreateAPIView):
    serializer_class = NGOReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, id):
        try:
            ngo = NGO.objects.get(id=id)
        except NGO.DoesNotExist:
            return Response({"error": "NGO does not exist"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(ngo=ngo, author_name=request.user.username)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class NeedViewSet(viewsets.ModelViewSet):
    serializer_class = NeedSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        ngo_id = self.request.query_params.get('ngo_id')
        campaign_id = self.request.query_params.get('campaign_id')
        queryset = Need.objects.all()
        if ngo_id:
            queryset = queryset.filter(ngo_id=ngo_id)
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)
        return queryset

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'ngo_details'):
            raise ValidationError("You must register an NGO account to broadcast needs")
        ngo = self.request.user.ngo_details
        if ngo.verification_status != 'approved':
            raise ValidationError("Your NGO verification must be approved to broadcast needs")
        serializer.save(ngo=ngo)

class EmergencyCampaignViewSet(viewsets.ModelViewSet):
    queryset = EmergencyCampaign.objects.all()
    serializer_class = EmergencyCampaignSerializer
    permission_classes = (IsAdminOrReadOnly,)

class VolunteerEventViewSet(viewsets.ModelViewSet):
    queryset = VolunteerEvent.objects.all()
    serializer_class = VolunteerEventSerializer
    permission_classes = (IsNgoUserOrReadOnly,)

    def get_queryset(self):
        ngo_id = self.request.query_params.get('ngo_id')
        if ngo_id:
            return VolunteerEvent.objects.filter(ngo_id=ngo_id)
        return VolunteerEvent.objects.all()

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'ngo_details'):
            raise ValidationError("You must register an NGO account to create events")
        ngo = self.request.user.ngo_details
        if ngo.verification_status != 'approved':
            raise ValidationError("Your NGO verification must be approved to create events")
        serializer.save(ngo=ngo)

class VolunteerRegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = VolunteerRegistrationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return VolunteerRegistration.objects.all()
        elif user.role == 'ngo' and hasattr(user, 'ngo_details'):
            return VolunteerRegistration.objects.filter(event__ngo=user.ngo_details)
        else:
            return VolunteerRegistration.objects.filter(user=user)

    def perform_create(self, serializer):
        event = serializer.validated_data.get('event')
        
        # Check if already registered
        if VolunteerRegistration.objects.filter(event=event, user=self.request.user).exists():
            raise ValidationError("You are already registered for this event")
            
        if event.max_volunteers > 0 and event.registrations.filter(status='approved').count() >= event.max_volunteers:
            raise ValidationError("This event has reached its maximum volunteer capacity")
            
        serializer.save(user=self.request.user)
