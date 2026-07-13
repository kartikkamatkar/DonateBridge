from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NGORegisterView,
    NGOListView,
    NGODetailsView,
    NGODetailsCurrentUserView,
    NGOCreateReviewView,
    NeedViewSet,
    EmergencyCampaignViewSet,
    VolunteerEventViewSet,
    VolunteerRegistrationViewSet
)

router = DefaultRouter()
router.register(r'needs', NeedViewSet, basename='need')
router.register(r'campaigns', EmergencyCampaignViewSet, basename='campaign')
router.register(r'events', VolunteerEventViewSet, basename='event')
router.register(r'volunteer-registrations', VolunteerRegistrationViewSet, basename='volunteer-registration')

urlpatterns = [
    path('', include(router.urls)),
    path('ngos/register/', NGORegisterView.as_view(), name='ngo_register'),
    path('ngos/me/', NGODetailsCurrentUserView.as_view(), name='ngo_me'),
    path('ngos/', NGOListView.as_view(), name='ngo_list'),
    path('ngos/<int:pk>/', NGODetailsView.as_view(), name='ngo_detail'),
    path('ngos/<int:pk>/reviews/', NGOCreateReviewView.as_view(), name='ngo_review'),
]
