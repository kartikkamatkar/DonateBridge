from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DonationViewSet,
    NgoSmartMatchesView,
    DonationSmartMatchesView,
    CommunityChallengeViewSet
)

router = DefaultRouter()
router.register(r'donations', DonationViewSet, basename='donation')
router.register(r'challenges', CommunityChallengeViewSet, basename='challenge')

urlpatterns = [
    path('', include(router.urls)),
    path('smart-match/ngo/', NgoSmartMatchesView.as_view(), name='smart_match_ngo'),
    path('smart-match/donation/<str:id>/', DonationSmartMatchesView.as_view(), name='smart_match_donation'),
]
