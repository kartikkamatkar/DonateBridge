import { useState, useEffect } from 'react';

// Seeding standard data
const INITIAL_DONORS = [
  { id: "usr-1", name: "Sarah Jenkins", email: "donor@donatebridge.org", avatar: "👩‍💼" },
  { id: "usr-2", name: "John Doe", email: "john@doe.com", avatar: "👨‍💻" },
  { id: "usr-3", name: "Apex Corp", email: "csr@apexcorp.com", avatar: "🏢" }
];

const INITIAL_NGOS = [
  { id: "ngo-1", name: "Hope Foundation", email: "ngo@donatebridge.org", lat: 12.9716, lng: 77.5946, address: "MG Road, Bengaluru", status: "verified", verificationStatus: "approved", trustScore: 98, responseTime: "12m", successRate: "97%" },
  { id: "ngo-2", name: "Feeding Hand", email: "feed@hand.org", lat: 12.9801, lng: 77.6012, address: "Indiranagar, Bengaluru", status: "verified", verificationStatus: "approved", trustScore: 95, responseTime: "24m", successRate: "93%" },
  { id: "ngo-3", name: "Care Society", email: "care@society.org", lat: 12.9634, lng: 77.5878, address: "Jayanagar, Bengaluru", status: "verified", verificationStatus: "approved", trustScore: 92, responseTime: "18m", successRate: "90%" },
  { id: "ngo-4", name: "Tech Academy", email: "tech@academy.org", lat: 12.9550, lng: 77.6105, address: "Koramangala, Bengaluru", status: "verified", verificationStatus: "approved", trustScore: 89, responseTime: "45m", successRate: "88%" },
  {
    id: "ngo-5",
    name: "Youth Empowerment Initiative",
    email: "youth@empower.org",
    lat: 12.9680,
    lng: 77.6120,
    address: "Koramangala 5th Block, Bengaluru",
    registrationNumber: "YEI-560095-2024",
    govRegistrationNumber: "GST-NGO-YEI-0012",
    ngoType: "Trust",
    phone: "9876543210",
    website: "https://youth-empower.org",
    state: "Karnataka",
    district: "Bengaluru Urban",
    city: "Bengaluru",
    pinCode: "560095",
    description: "Empowering underprivileged youth through technical and vocational skills.",
    mission: "To eliminate employment inequality in the local community.",
    workingAreas: "Education, Technology, Skill Development",
    operatingSince: "2019",
    volunteersCount: 45,
    verificationStatus: "pending",
    trustScore: 75,
    responseTime: "--",
    successRate: "--",
    documents: {
      govRegCert: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400",
      panCard: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=400",
      trustRegCert: "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=400",
      doc80G: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
      doc12A: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400",
      officePhoto: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400",
      authPersonPhoto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
      addressProof: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
      idProof: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400",
      verificationLetter: "https://images.unsplash.com/photo-1554224155-6b8906924b5e?w=400"
    }
  }
];

const INITIAL_NEEDS = [
  { id: "need-1", ngoId: "ngo-1", ngoName: "Hope Foundation", category: "Clothing", quantity: 50, urgency: "High", item: "Blankets", description: "Winter is coming, urgent need for warm clothing.", lat: 12.9716, lng: 77.5946 },
  { id: "need-2", ngoId: "ngo-2", ngoName: "Feeding Hand", category: "Food", quantity: 200, urgency: "High", item: "Canned Food", description: "Dry goods and staples needed for community pantry.", lat: 12.9801, lng: 77.6012 },
  { id: "need-3", ngoId: "ngo-3", ngoName: "Care Society", category: "Medical", quantity: 100, urgency: "Medium", item: "Medical Gloves", description: "Disposables for neighborhood clinic audits.", lat: 12.9634, lng: 77.5878 },
  { id: "need-4", ngoId: "ngo-4", ngoName: "Tech Academy", category: "Books", quantity: 30, urgency: "Low", item: "Chemistry Lab Kits", description: "Learning modules for middle school students.", lat: 12.9550, lng: 77.6105 },
  { id: "need-5", ngoId: "ngo-1", ngoName: "Hope Foundation", category: "Books", quantity: 120, urgency: "High", item: "Textbooks", description: "Standard grade science and math books.", lat: 12.9716, lng: 77.5946 }
];

const INITIAL_DONATIONS = [
  {
    id: "DNT-2026-00001",
    donorName: "Sarah Jenkins",
    donorEmail: "donor@donatebridge.org",
    category: "Books",
    condition: "Like New",
    quantity: 15,
    description: "High school algebra and geometry books, very clean.",
    photos: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400"],
    location: { lat: 12.9740, lng: 77.5980, address: "Residency Road, Bengaluru" },
    status: "VERIFIED",
    matchedNgoId: null,
    matchScore: null,
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "DNT-2026-00002",
    donorName: "John Doe",
    donorEmail: "john@doe.com",
    category: "Clothing",
    condition: "Good",
    quantity: 12,
    description: "Warm winter blankets, washed and packed.",
    photos: ["https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=400"],
    location: { lat: 12.9690, lng: 77.5890, address: "Richmond Town, Bengaluru" },
    status: "VERIFIED",
    matchedNgoId: null,
    matchScore: null,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "DNT-2026-00003",
    donorName: "Apex Corp",
    donorEmail: "csr@apexcorp.com",
    category: "Food",
    condition: "New",
    quantity: 100,
    description: "Canned tomato soup cases, expires mid 2027.",
    photos: ["https://images.unsplash.com/photo-1547592180-85f173990554?w=400"],
    location: { lat: 12.9790, lng: 77.6040, address: "Ulsoor, Bengaluru" },
    status: "PENDING",
    matchedNgoId: null,
    matchScore: null,
    submittedAt: new Date().toISOString()
  },
  {
    id: "DNT-2026-00004",
    donorName: "Sarah Jenkins",
    donorEmail: "donor@donatebridge.org",
    category: "Clothing",
    condition: "Good",
    quantity: 25,
    description: "Organic cotton sweaters, minor usage signs.",
    photos: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400"],
    location: { lat: 12.9590, lng: 77.5820, address: "Jayanagar 3rd Block, Bengaluru" },
    status: "MATCHED",
    matchedNgoId: "ngo-1",
    matchScore: 92,
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    matchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "DNT-2026-00005",
    donorName: "John Doe",
    donorEmail: "john@doe.com",
    category: "Medical",
    condition: "New",
    quantity: 50,
    description: "Boxes of sterile nitrile examination gloves.",
    photos: ["https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400"],
    location: { lat: 12.9750, lng: 77.5910, address: "Malleshwaram, Bengaluru" },
    status: "DELIVERED",
    matchedNgoId: "ngo-3",
    matchScore: 88,
    submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    matchedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "DNT-2026-00006",
    donorName: "Apex Corp",
    donorEmail: "csr@apexcorp.com",
    category: "Electronics",
    condition: "Good",
    quantity: 5,
    description: "Refurbished Dell Laptops for student labs.",
    photos: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400"],
    location: { lat: 12.9815, lng: 77.6090, address: "HAL Stage 2, Bengaluru" },
    status: "PENDING",
    submittedAt: new Date().toISOString()
  },
  {
    id: "DNT-2026-00007",
    donorName: "Sarah Jenkins",
    donorEmail: "donor@donatebridge.org",
    category: "Books",
    condition: "Poor",
    quantity: 10,
    description: "Old kids text books.",
    photos: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"],
    location: { lat: 12.9660, lng: 77.5930, address: "Wilson Garden, Bengaluru" },
    status: "REJECTED",
    rejectionReason: "Torn pages and moldy covers.",
    submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "DNT-2026-00008",
    donorName: "John Doe",
    donorEmail: "john@doe.com",
    category: "Food",
    condition: "New",
    quantity: 40,
    description: "Nestle baby cereal cartons, sealed pack.",
    photos: ["https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400"],
    location: { lat: 12.9716, lng: 77.6010, address: "Trinity Circle, Bengaluru" },
    status: "VERIFIED",
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date().toISOString()
  },
  {
    id: "DNT-2026-00009",
    donorName: "Sarah Jenkins",
    donorEmail: "donor@donatebridge.org",
    category: "Medical",
    condition: "Good",
    quantity: 2,
    description: "Foldable medical wheelchairs, sturdy build.",
    photos: ["https://images.unsplash.com/photo-1598137203980-60b64d0840dc?w=400"],
    location: { lat: 12.9602, lng: 77.6025, address: "Langford Town, Bengaluru" },
    status: "VERIFIED",
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date().toISOString()
  },
  {
    id: "DNT-2026-00010",
    donorName: "Apex Corp",
    donorEmail: "csr@apexcorp.com",
    category: "Furniture",
    condition: "Good",
    quantity: 4,
    description: "Wooden office desks, sturdy, minor scratches.",
    photos: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400"],
    location: { lat: 12.9860, lng: 77.5840, address: "Vasanth Nagar, Bengaluru" },
    status: "PENDING",
    submittedAt: new Date().toISOString()
  }
];

// Helper to calculate Haversine distance
export function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Matching Formula implementation
// Score = CategoryFit (40%) + Distance (30%) + Urgency (20%) + Freshness (10%)
export function calculateMatchScore(donation, need) {
  if (!donation || !need) return { total: 0, categoryFit: 0, distanceScore: 0, urgencyScore: 0, freshnessScore: 0, distance: 0 };

  const categoryFit = donation.category.toLowerCase() === need.category.toLowerCase() ? 100 : 0;

  const distance = getDistanceInKm(
    donation.location.lat,
    donation.location.lng,
    need.lat,
    need.lng
  );
  const distanceScore = Math.max(0, 100 - (distance * 5)); // 0km = 100%, 20km = 0%

  let urgencyScore = 30; // Low
  if (need.urgency === "High") urgencyScore = 100;
  else if (need.urgency === "Medium") urgencyScore = 70;

  const daysOpen = (Date.now() - new Date(donation.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
  const freshnessScore = Math.max(0, 100 - (daysOpen * 10)); // Fresh = 100%, drops by 10% per day

  const total = Math.round(
    (categoryFit * 0.40) +
    (distanceScore * 0.30) +
    (urgencyScore * 0.20) +
    (freshnessScore * 0.10)
  );

  return {
    total,
    categoryFit: Math.round(categoryFit * 0.40),
    distanceScore: Math.round(distanceScore * 0.30),
    urgencyScore: Math.round(urgencyScore * 0.20),
    freshnessScore: Math.round(freshnessScore * 0.10),
    distance: parseFloat(distance.toFixed(1))
  };
}

export function useMockDB() {
  const [donations, setDonations] = useState(() => {
    const saved = localStorage.getItem('db_donations');
    return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
  });

  const [needs, setNeeds] = useState(() => {
    const saved = localStorage.getItem('db_needs');
    return saved ? JSON.parse(saved) : INITIAL_NEEDS;
  });

  const [ngos, setNgos] = useState(() => {
    const saved = localStorage.getItem('db_ngos');
    return saved ? JSON.parse(saved) : INITIAL_NGOS;
  });

  const [donors, setDonors] = useState(() => {
    const saved = localStorage.getItem('db_donors');
    return saved ? JSON.parse(saved) : INITIAL_DONORS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('db_donations', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem('db_needs', JSON.stringify(needs));
  }, [needs]);

  useEffect(() => {
    localStorage.setItem('db_ngos', JSON.stringify(ngos));
  }, [ngos]);

  useEffect(() => {
    localStorage.setItem('db_donors', JSON.stringify(donors));
  }, [donors]);

  // Actions
  const addDonation = (donationData) => {
    const newId = `DNT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newDonation = {
      id: newId,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
      matchedNgoId: null,
      matchScore: null,
      ...donationData
    };
    setDonations(prev => [newDonation, ...prev]);
    return newDonation;
  };

  const updateDonationStatus = (id, newStatus, extra = {}) => {
    setDonations(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          ...extra
        };
      }
      return item;
    }));
  };

  const addNeed = (needData) => {
    const newNeed = {
      id: `need-${Math.floor(1000 + Math.random() * 9000)}`,
      ...needData
    };
    setNeeds(prev => [newNeed, ...prev]);
    return newNeed;
  };

  const deleteNeed = (needId) => {
    setNeeds(prev => prev.filter(item => item.id !== needId));
  };

  const getSmartMatchesForNgo = (ngoId) => {
    const ngo = ngos.find(n => n.id === ngoId);
    if (!ngo) return [];

    // NGO's demands
    const ngoNeeds = needs.filter(n => n.ngoId === ngoId);

    // Verified donations that aren't matched yet
    const availableDonations = donations.filter(d => d.status === "VERIFIED");

    const matches = [];
    availableDonations.forEach(donation => {
      // Find matching needs
      ngoNeeds.forEach(need => {
        const scoreBreakdown = calculateMatchScore(donation, {
          ...need,
          lat: ngo.lat,
          lng: ngo.lng
        });

        // If category matches, we consider it
        if (donation.category.toLowerCase() === need.category.toLowerCase()) {
          matches.push({
            donation,
            need,
            scoreBreakdown
          });
        }
      });
    });

    // Sort by highest score
    return matches.sort((a, b) => b.scoreBreakdown.total - a.scoreBreakdown.total);
  };

  const getSmartMatchesForDonation = (donationId) => {
    const donation = donations.find(d => d.id === donationId);
    if (!donation || donation.status !== "VERIFIED") return [];

    const matches = [];
    needs.forEach(need => {
      const ngo = ngos.find(n => n.id === need.ngoId);
      if (!ngo) return;

      const scoreBreakdown = calculateMatchScore(donation, {
        ...need,
        lat: ngo.lat,
        lng: ngo.lng
      });

      if (donation.category.toLowerCase() === need.category.toLowerCase()) {
        matches.push({
          need,
          ngo,
          scoreBreakdown
        });
      }
    });

    return matches.sort((a, b) => b.scoreBreakdown.total - a.scoreBreakdown.total);
  };

  const executeMatch = (donationId, ngoId, score) => {
    updateDonationStatus(donationId, "MATCHED", {
      matchedNgoId: ngoId,
      matchScore: score,
      matchedAt: new Date().toISOString()
    });
  };

  const registerNgo = (ngoData) => {
    const newNgo = {
      id: `ngo-${Math.floor(10000 + Math.random() * 90000)}`,
      verificationStatus: 'pending',
      trustScore: 70,
      responseTime: '--',
      successRate: '--',
      ...ngoData
    };
    setNgos(prev => [newNgo, ...prev]);
    return newNgo;
  };

  const updateNgoStatus = (id, newStatus, reason = '') => {
    setNgos(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          verificationStatus: newStatus,
          rejectionReason: reason
        };
      }
      return item;
    }));
  };

  return {
    donations,
    needs,
    ngos,
    donors,
    addDonation,
    updateDonationStatus,
    addNeed,
    deleteNeed,
    getSmartMatchesForNgo,
    getSmartMatchesForDonation,
    executeMatch,
    registerNgo,
    updateNgoStatus
  };
}
