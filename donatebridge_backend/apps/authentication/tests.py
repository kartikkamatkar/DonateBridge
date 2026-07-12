from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from authentication.models import Profile
from ngo.models import NGO, Need, VerificationStatus, EmergencyCampaign, VolunteerEvent, VolunteerRegistration
from donation.models import Donation, DonationStatus, CommunityChallenge
from donation.views import calculate_match_score
from logistics.models import LogisticsJob

User = get_user_model()

class DonateBridgeBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create testing users
        self.donor_user = User.objects.create_user(
            username='donor_test',
            email='donor@test.com',
            password='password123',
            role='donor'
        )
        
        self.ngo_user = User.objects.create_user(
            username='ngo_test',
            email='ngo@test.com',
            password='password123',
            role='ngo'
        )

    def test_donor_registration_and_login(self):
        # Test signup
        response = self.client.post('/api/auth/register/', {
            'username': 'newdonor',
            'email': 'newdonor@test.com',
            'password': 'donorpassword123',
            'role': 'donor'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        
        # Test login
        response = self.client.post('/api/auth/login/', {
            'email': 'newdonor@test.com',
            'password': 'donorpassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'donor')

    def test_ngo_registration_and_needs(self):
        # Register NGO detail
        self.client.force_authenticate(user=self.ngo_user)
        response = self.client.post('/api/ngos/register/', {
            'name': 'Helping Hands NGO',
            'lat': 19.076,
            'lng': 72.8777,
            'address': 'Bandra Kurla Complex, Mumbai',
            'registration_number': 'REG-BKC-789',
            'gov_registration_number': 'GOV-BKC-990',
            'ngo_type': 'Society',
            'phone': '9998887776',
            'state': 'Maharashtra',
            'district': 'Mumbai Suburban',
            'city': 'Mumbai',
            'pin_code': '400051',
            'description': 'Underprivileged assistance society',
            'mission': 'Assist society needs',
            'working_areas': 'Education, Food',
            'operating_since': '2020',
            'volunteers_count': 10
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['verification_status'], 'pending')
        
        # Approve NGO using admin
        ngo = NGO.objects.get(user=self.ngo_user)
        ngo.verification_status = VerificationStatus.APPROVED
        ngo.save()
        
        # Refresh authentication with updated database state
        self.client.force_authenticate(user=User.objects.get(id=self.ngo_user.id))
        
        # Post a Need
        response = self.client.post('/api/needs/', {
            'category': 'Books',
            'item': 'School Textbooks',
            'quantity': 50,
            'urgency': 'High',
            'description': 'High school books',
            'lat': 19.076,
            'lng': 72.8777
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Need.objects.count(), 1)

    def test_donation_and_claim_flow(self):
        # 1. Register NGO & Approve it
        ngo_profile = NGO.objects.create(
            user=self.ngo_user,
            name='Claiming NGO',
            lat=19.076,
            lng=72.8777,
            address='Bandra',
            registration_number='REG-1',
            gov_registration_number='GOV-1',
            ngo_type='Trust',
            phone='12345',
            state='MH',
            district='Mumbai',
            city='Mumbai',
            pin_code='400050',
            description='Test description',
            mission='Test mission',
            working_areas='Books',
            operating_since='2018',
            verification_status=VerificationStatus.APPROVED
        )

        # 2. Upload Donation by Donor
        self.client.force_authenticate(user=self.donor_user)
        response = self.client.post('/api/donations/', {
            'title': 'Cbse school books',
            'category': 'Books',
            'condition': 'Good',
            'quantity': 30,
            'description': '30 textbooks',
            'pickup_address': 'Bandra West',
            'pickup_lat': 19.088,
            'pickup_lng': 72.889,
            'preferred_pickup_time': 'Weekends'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        donation_id = response.data['id']
        
        # Donation starts as PENDING. Admin verifies it.
        donation = Donation.objects.get(id=donation_id)
        donation.status = DonationStatus.VERIFIED
        donation.save()
        
        # 3. Claim Donation by NGO
        self.client.force_authenticate(user=self.ngo_user)
        response = self.client.post(f'/api/donations/{donation_id}/claim/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        donation.refresh_from_db()
        self.assertEqual(donation.status, DonationStatus.MATCHED)
        self.assertEqual(donation.matched_ngo, ngo_profile)

    def test_smart_matching_algorithm(self):
        ngo_profile = NGO.objects.create(
            user=self.ngo_user,
            name='Matching NGO',
            lat=19.076,
            lng=72.8777,
            address='Bandra East',
            registration_number='REG-2',
            gov_registration_number='GOV-2',
            ngo_type='Trust',
            phone='123',
            state='MH',
            district='Mumb',
            city='Mumb',
            pin_code='400',
            description='Test',
            mission='Test',
            working_areas='Books',
            operating_since='2010',
            verification_status=VerificationStatus.APPROVED
        )
        
        need = Need.objects.create(
            ngo=ngo_profile,
            category='Books',
            item='Maths Books',
            quantity=50,
            urgency='High',
            lat=19.076,
            lng=72.8777
        )
        
        donation = Donation.objects.create(
            id='DNT-TEST-001',
            donor=self.donor_user,
            title='Used books',
            category='Books',
            condition='Good',
            quantity=20,
            description='Test description',
            pickup_address='Bandra West',
            pickup_lat=19.088,
            pickup_lng=72.889,
            preferred_pickup_time='Anytime',
            status=DonationStatus.VERIFIED
        )
        
        # Calculate matching affinity score
        score_breakdown = calculate_match_score(donation, need, ngo_profile)
        
        # Distance between 19.088, 72.889 and 19.076, 72.8777 is ~1.76 km.
        self.assertGreater(score_breakdown['total'], 90)
        self.assertEqual(score_breakdown['categoryFit'], 40)

    def test_differentiator_features(self):
        # 1. Create a campaign & challenge
        campaign = EmergencyCampaign.objects.create(
            title='Disaster relief 1',
            description='Relief',
            location='Mumbai',
            is_active=True
        )
        challenge = CommunityChallenge.objects.create(
            title='Winter blanket drive',
            description='Blanket drive',
            category='Blanket',
            target_quantity=100,
            current_quantity=10,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=10),
            is_active=True
        )

        # 2. Register NGO and Approved
        ngo_profile = NGO.objects.create(
            user=self.ngo_user,
            name='Differentiator NGO',
            lat=19.076,
            lng=72.8777,
            address='Bandra',
            registration_number='REG-DIFF',
            gov_registration_number='GOV-DIFF',
            ngo_type='Trust',
            phone='1234567890',
            state='MH',
            district='Mumbai',
            city='Mumbai',
            pin_code='400050',
            description='Desc',
            mission='Mission',
            working_areas='Blanket',
            operating_since='2018',
            verification_status=VerificationStatus.APPROVED
        )

        # 3. Create a Need linked to campaign
        need = Need.objects.create(
            ngo=ngo_profile,
            category='Blanket',
            item='Warm Blankets',
            quantity=50,
            fulfilled_quantity=0,
            urgency='High',
            campaign=campaign,
            lat=19.076,
            lng=72.8777
        )

        # 4. Upload Donation of Blanket category
        self.client.force_authenticate(user=self.donor_user)
        response = self.client.post('/api/donations/', {
            'title': '30 Blankets donation',
            'category': 'Blanket',
            'condition': 'Like New',
            'quantity': 30,
            'description': '30 fresh blankets',
            'pickup_address': 'Bandra West',
            'pickup_lat': 19.088,
            'pickup_lng': 72.889,
            'preferred_pickup_time': 'Weekends'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        donation_id = response.data['id']

        donation = Donation.objects.get(id=donation_id)
        donation.status = DonationStatus.VERIFIED
        donation.save()

        # 5. Claim the donation to trigger Need and Challenge progress increment
        self.client.force_authenticate(user=self.ngo_user)
        response = self.client.post(f'/api/donations/{donation_id}/claim/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify Need & Challenge progress has incremented
        need.refresh_from_db()
        self.assertEqual(need.fulfilled_quantity, 30)

        challenge.refresh_from_db()
        self.assertEqual(challenge.current_quantity, 40) # 10 (base) + 30 (donation) = 40

        # Verify logistics job and token generation
        logistics_job = LogisticsJob.objects.get(donation=donation)
        self.assertIsNotNone(logistics_job.verification_token)

        # 6. Verify QR handover delivery completion
        response = self.client.post(f'/api/tracking/{donation_id}/verify-qr/', {
            'token': logistics_job.verification_token
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        logistics_job.refresh_from_db()
        self.assertEqual(logistics_job.current_step, 5) # Step 5: Delivered

        donation.refresh_from_db()
        self.assertEqual(donation.status, DonationStatus.DELIVERED)

        # 7. Volunteer events & registration
        event = VolunteerEvent.objects.create(
            ngo=ngo_profile,
            title='Blanket distribution drive',
            description='Help sort blankets',
            date=timezone.now() + timezone.timedelta(days=2),
            location='Shelter home',
            max_volunteers=10
        )
        self.client.force_authenticate(user=self.donor_user)
        response = self.client.post('/api/volunteer-registrations/', {
            'event': event.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(VolunteerRegistration.objects.count(), 1)
