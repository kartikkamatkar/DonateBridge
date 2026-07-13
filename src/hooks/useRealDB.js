/**
 * useRealDB.js - Real API hook that replaces useMockDB.
 *
 * Provides the same interface as useMockDB but talks to the Django REST API.
 * Pages that imported useMockDB should import this instead.
 */

import { useState, useEffect, useCallback } from 'react';
import { donationAPI, ngoAPI, moderationAPI, getApiError } from '../api/index';
import { useToast } from '../components/ui/Toast';

export function useRealDB() {
  const { toast } = useToast();

  // ─── Donations ───────────────────────────────────
  const [donations, setDonations] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

  const fetchDonations = useCallback(async (params = {}) => {
    setLoadingDonations(true);
    try {
      const res = await donationAPI.list(params);
      const data = res.data.results || res.data;
      setDonations(normalizeDonations(data));
    } catch (err) {
      console.warn('[useRealDB] fetchDonations failed:', getApiError(err));
    } finally {
      setLoadingDonations(false);
    }
  }, []);

  const fetchMyDonations = useCallback(async () => {
    try {
      const res = await donationAPI.getMyDonations();
      const data = res.data.results || res.data;
      setMyDonations(normalizeDonations(data));
    } catch (err) {
      console.warn('[useRealDB] fetchMyDonations failed:', getApiError(err));
    }
  }, []);

  useEffect(() => {
    fetchDonations();
    fetchMyDonations();
  }, []);

  const addDonation = useCallback(async (donationData) => {
    try {
      const payload = {
        title: donationData.itemName || donationData.title,
        category: donationData.category,
        condition: donationData.condition || 'Good',
        quantity: donationData.quantity,
        description: donationData.description,
        pickup_address: donationData.location?.address || donationData.pickup_address || '',
        pickup_lat: donationData.location?.lat ?? donationData.pickup_lat ?? 0,
        pickup_lng: donationData.location?.lng ?? donationData.pickup_lng ?? 0,
        preferred_pickup_time: donationData.preferredPickupTime || 'Flexible',
        photos: donationData.photos || [],
      };
      const res = await donationAPI.create(payload);
      const newDonation = normalizeDonation(res.data);
      setMyDonations(prev => [newDonation, ...prev]);
      return newDonation;
    } catch (err) {
      toast.error(getApiError(err));
      throw err;
    }
  }, [toast]);

  const claimDonation = useCallback(async (donationId) => {
    try {
      const res = await donationAPI.claim(donationId);
      await fetchMyDonations();
      await fetchDonations();
      return res.data;
    } catch (err) {
      toast.error(getApiError(err));
      throw err;
    }
  }, [toast, fetchMyDonations, fetchDonations]);

  // ─── NGOs ─────────────────────────────────────────
  const [ngos, setNgos] = useState([]);
  const [myNgo, setMyNgo] = useState(null);
  const [loadingNgos, setLoadingNgos] = useState(false);

  const fetchNgos = useCallback(async (params = {}) => {
    setLoadingNgos(true);
    try {
      const res = await ngoAPI.list(params);
      const data = res.data.results || res.data;
      setNgos(normalizeNgos(data));
    } catch (err) {
      console.warn('[useRealDB] fetchNgos failed:', getApiError(err));
    } finally {
      setLoadingNgos(false);
    }
  }, []);

  const fetchMyNgo = useCallback(async () => {
    try {
      const res = await ngoAPI.getMe();
      setMyNgo(normalizeNgo(res.data));
    } catch {
      // User may not have an NGO registered
    }
  }, []);

  useEffect(() => {
    fetchNgos();
    fetchMyNgo();
  }, []);

  const registerNgo = useCallback(async (ngoData) => {
    try {
      const res = await ngoAPI.register(ngoData);
      const newNgo = normalizeNgo(res.data);
      setMyNgo(newNgo);
      setNgos(prev => [newNgo, ...prev]);
      return newNgo;
    } catch (err) {
      toast.error(getApiError(err));
      throw err;
    }
  }, [toast]);

  // ─── Needs ────────────────────────────────────────
  const [needs, setNeeds] = useState([]);

  const fetchNeeds = useCallback(async (params = {}) => {
    try {
      const res = await ngoAPI.getNeeds(params);
      const data = res.data.results || res.data;
      setNeeds(normalizeNeeds(data));
    } catch (err) {
      console.warn('[useRealDB] fetchNeeds failed:', getApiError(err));
    }
  }, []);

  useEffect(() => { fetchNeeds(); }, []);

  const addNeed = useCallback(async (needData) => {
    try {
      const payload = {
        category: needData.category,
        item: needData.item,
        quantity: needData.quantity,
        urgency: needData.urgency,
        description: needData.description || '',
        lat: needData.lat || 0,
        lng: needData.lng || 0,
      };
      const res = await ngoAPI.createNeed(payload);
      const newNeed = normalizeNeed(res.data);
      setNeeds(prev => [newNeed, ...prev]);
      return newNeed;
    } catch (err) {
      toast.error(getApiError(err));
      throw err;
    }
  }, [toast]);

  const deleteNeed = useCallback(async (needId) => {
    try {
      await ngoAPI.deleteNeed(needId);
      setNeeds(prev => prev.filter(n => n.id !== needId));
    } catch (err) {
      toast.error(getApiError(err));
      throw err;
    }
  }, [toast]);

  // ─── Smart Matching (uses API) ──────────────────
  const getSmartMatchesForNgo = useCallback(async () => {
    try {
      const res = await donationAPI.getNgoSmartMatches();
      return (res.data || []).map(m => ({
        donation: normalizeDonation(m.donation),
        need: m.need,
        scoreBreakdown: m.scoreBreakdown,
      }));
    } catch {
      return [];
    }
  }, []);

  const getSmartMatchesForDonation = useCallback(async (donationId) => {
    try {
      const res = await donationAPI.getSmartMatchesForDonation(donationId);
      return res.data || [];
    } catch {
      return [];
    }
  }, []);

  const executeMatch = useCallback(async (donationId) => {
    return claimDonation(donationId);
  }, [claimDonation]);

  // ─── Admin / Moderation ─────────────────────────
  const [platformMetrics, setPlatformMetrics] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await moderationAPI.getMetrics();
      setPlatformMetrics(res.data.metrics);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => { fetchMetrics(); }, []);

  const updateNgoStatus = useCallback(async (id, action, reason = '') => {
    try {
      const res = await moderationAPI.auditNGO(id, action, reason);
      await fetchNgos();
      return normalizeNgo(res.data);
    } catch (err) {
      toast.error(getApiError(err));
      throw err;
    }
  }, [toast, fetchNgos]);

  const updateDonationStatus = useCallback(async (id, action, reason = '') => {
    try {
      const res = await moderationAPI.auditDonation(id, action, reason);
      await fetchDonations();
      return normalizeDonation(res.data);
    } catch (err) {
      toast.error(getApiError(err));
      throw err;
    }
  }, [toast, fetchDonations]);

  return {
    // Data
    donations,
    myDonations,
    ngos,
    myNgo,
    needs,
    platformMetrics,
    loadingDonations,
    loadingNgos,

    // Actions
    addDonation,
    claimDonation,
    fetchDonations,
    fetchMyDonations,
    fetchNgos,
    fetchMyNgo,
    registerNgo,
    addNeed,
    deleteNeed,
    getSmartMatchesForNgo,
    getSmartMatchesForDonation,
    executeMatch,
    updateNgoStatus,
    updateDonationStatus,
    fetchMetrics,

    // Legacy useMockDB compat aliases
    donors: [],
  };
}

// ─── Normalizers (API → UI format) ──────────────────────────────────────────

function normalizeDonation(d) {
  if (!d) return null;
  return {
    id: d.id,
    itemName: d.title || d.itemName,
    title: d.title || d.itemName,
    donorName: d.donor_name || d.donorName || 'Donor',
    donorEmail: d.donor_email || d.donorEmail || '',
    category: d.category,
    condition: d.condition,
    quantity: d.quantity,
    description: d.description,
    photos: d.photos || [],
    location: {
      lat: d.pickup_lat ?? d.location?.lat ?? 0,
      lng: d.pickup_lng ?? d.location?.lng ?? 0,
      address: d.pickup_address || d.location?.address || '',
    },
    pickup_lat: d.pickup_lat ?? d.location?.lat ?? 0,
    pickup_lng: d.pickup_lng ?? d.location?.lng ?? 0,
    pickup_address: d.pickup_address || '',
    status: d.status,
    matchedNgoId: d.matched_ngo || d.matchedNgoId || null,
    matchScore: d.match_score || d.matchScore || null,
    rejectionReason: d.rejection_reason || d.rejectionReason || '',
    submittedAt: d.submitted_at || d.submittedAt || new Date().toISOString(),
    reviewedAt: d.reviewed_at || d.reviewedAt || null,
    matchedAt: d.matched_at || d.matchedAt || null,
    deliveredAt: d.delivered_at || d.deliveredAt || null,
    matchedNgoDetails: d.matched_ngo_details || null,
  };
}

function normalizeDonations(arr) {
  return (arr || []).map(normalizeDonation);
}

function normalizeNgo(n) {
  if (!n) return null;
  return {
    id: n.id,
    name: n.name,
    email: n.user?.email || n.email || '',
    lat: n.lat || 0,
    lng: n.lng || 0,
    address: n.address,
    phone: n.phone,
    website: n.website,
    state: n.state,
    district: n.district,
    city: n.city,
    pinCode: n.pin_code || n.pinCode,
    registrationNumber: n.registration_number || n.registrationNumber,
    govRegistrationNumber: n.gov_registration_number || n.govRegistrationNumber,
    ngoType: n.ngo_type || n.ngoType,
    description: n.description,
    mission: n.mission,
    workingAreas: n.working_areas || n.workingAreas || '',
    operatingSince: n.operating_since || n.operatingSince,
    volunteersCount: n.volunteers_count || n.volunteersCount || 0,
    verificationStatus: n.verification_status || n.verificationStatus || 'pending',
    rejectionReason: n.rejection_reason || n.rejectionReason || '',
    trustScore: n.trust_score || n.trustScore || 70,
    responseTime: n.response_time || n.responseTime || '--',
    successRate: n.success_rate || n.successRate || '--',
    createdAt: n.created_at || n.createdAt,
    updatedAt: n.updated_at || n.updatedAt,
    documents: n.documents || {},
    reviews: n.reviews || [],
    needs: n.needs || [],
  };
}

function normalizeNgos(arr) {
  return (arr || []).map(normalizeNgo);
}

function normalizeNeed(n) {
  if (!n) return null;
  return {
    id: n.id,
    ngoId: n.ngo_id || n.ngoId,
    ngoName: n.ngo_name || n.ngoName || '',
    category: n.category,
    item: n.item,
    quantity: n.quantity,
    fulfilledQuantity: n.fulfilled_quantity || n.fulfilledQuantity || 0,
    urgency: n.urgency,
    description: n.description || '',
    lat: n.lat || 0,
    lng: n.lng || 0,
    createdAt: n.created_at || n.createdAt,
  };
}

function normalizeNeeds(arr) {
  return (arr || []).map(normalizeNeed);
}
