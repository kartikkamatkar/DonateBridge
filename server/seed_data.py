import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

from ngo.models import NGO, Need, VerificationStatus
from donation.models import Donation, DonationStatus
from django.utils import timezone

def run_seed():
    print("Seeding database...")
    
    # Create some users
    donor1, _ = User.objects.get_or_create(email='donor1@example.com', defaults={'role': 'donor', 'username': 'Alice Donor'})
    donor1.set_password('password123')
    donor1.save()
    
    ngo_user, _ = User.objects.get_or_create(email='contact@hopefoundation.org', defaults={'role': 'ngo', 'username': 'Hope Foundation Contact'})
    ngo_user.set_password('password123')
    ngo_user.save()

    ngo_user2, _ = User.objects.get_or_create(email='contact@foodforall.org', defaults={'role': 'ngo', 'username': 'Food For All Contact'})
    ngo_user2.set_password('password123')
    ngo_user2.save()
    
    # Create NGOs
    ngo1, _ = NGO.objects.get_or_create(
        user=ngo_user,
        defaults={
            'name': 'Hope Foundation',
            'address': 'Sector 4, Vashi, Navi Mumbai, Maharashtra 400703',
            'lat': 19.0760,
            'lng': 72.8777,
            'registration_number': 'REG-HF-2026',
            'gov_registration_number': 'GOV-HF-12345',
            'ngo_type': 'healthcare',
            'phone': '+91-9876543210',
            'verification_status': VerificationStatus.PENDING
        }
    )
    
    ngo2, _ = NGO.objects.get_or_create(
        user=ngo_user2,
        defaults={
            'name': 'Food For All',
            'address': 'Connaught Place, New Delhi 110001',
            'lat': 28.6139,
            'lng': 77.2090,
            'registration_number': 'REG-FFA-2026',
            'gov_registration_number': 'GOV-FFA-98765',
            'ngo_type': 'hunger',
            'phone': '+91-8765432109',
            'verification_status': VerificationStatus.APPROVED,
            'trust_score': 85
        }
    )
    
    # Create NGO Needs
    Need.objects.get_or_create(
        ngo=ngo1,
        item='Medical Kits',
        defaults={'category': 'medical', 'quantity': 100, 'urgency': 'high', 'description': 'First aid and essential medicine for relief camps.'}
    )
    
    Need.objects.get_or_create(
        ngo=ngo2,
        item='Canned Beans',
        defaults={'category': 'food', 'quantity': 500, 'urgency': 'medium', 'description': 'Non-perishable food items for shelters.'}
    )

    Need.objects.get_or_create(
        ngo=ngo1,
        item='Winter Blankets',
        defaults={'category': 'clothing', 'quantity': 200, 'urgency': 'low'}
    )
    
    # Create Donations
    Donation.objects.get_or_create(
        donor=donor1,
        title='50 Boxes of First Aid Supplies',
        defaults={
            'category': 'medical',
            'description': 'Brand new first aid supplies including bandages and antiseptics.',
            'quantity': 50,
            'condition': 'new',
            'pickup_address': '123 Tech Park, Mumbai',
            'lat': 19.1,
            'lng': 72.9,
            'status': DonationStatus.PENDING,
            'submitted_at': timezone.now()
        }
    )

    print("✅ Database successfully seeded with NGOs, Needs, and Donations for Admin Review!")

if __name__ == '__main__':
    run_seed()
