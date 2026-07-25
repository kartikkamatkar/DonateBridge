import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useRealDB } from '../hooks/useRealDB';
import { getApiError, ngoAPI } from '../api/index';
import Navbar from '../components/layout/Navbar';
import DonationCard from '../components/ui/DonationCard';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { useToast } from '../components/ui/Toast';
import LeafletMap from '../components/ui/LeafletMap';
import { 
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  ShieldCheck, Package, Clock, AlertTriangle, Plus, MapPin, 
  BarChart3, Activity, Trash2, Zap, Radar, CheckCircle2, 
  Sparkles, TrendingUp, Radio, Building2, RefreshCw, Send,
  ShieldAlert, ArrowRight, Check, Leaf, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NgoConsole() {
  const { user } = useAuth();
  const {
    myNgo, needs, donations,
    addNeed, deleteNeed, claimDonation,
    getSmartMatchesForNgo
  } = useRealDB();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('matches');
  const [smartMatches, setSmartMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Need posting form states
  const [needCategory, setNeedCategory] = useState('Clothing');
  const [needItem, setNeedItem] = useState('');
  const [needQty, setNeedQty] = useState('');
  const [needUrgency, setNeedUrgency] = useState('Medium');
  const [needDescription, setNeedDescription] = useState('');
  const [submittingNeed, setSubmittingNeed] = useState(false);

  useEffect(() => {
    if (myNgo === false) {
      toast.error('Please complete your NGO profile registration first.');
      navigate('/ngo-register');
    }
  }, [myNgo, navigate, toast]);

  // Active NGO Hub Info
  const currentNgo = myNgo || {
    id: null, name: user?.name || 'NGO Partner Hub', lat: 12.9716, lng: 77.5946,
    trustScore: 70, responseTime: '--', successRate: '--',
    verificationStatus: user?.verificationStatus || 'pending',
    rejectionReason: user?.rejectionReason || ''
  };

  // NGO-specific data
  const ngoNeeds = needs.filter(n => n.ngoId === currentNgo.id);
  const activeIncoming = donations.filter(d => String(d.matchedNgoId) === String(currentNgo.id) && d.status === 'MATCHED');
  const deliveredDonations = donations.filter(d => String(d.matchedNgoId) === String(currentNgo.id) && d.status === 'DELIVERED');
  const totalReceived = deliveredDonations.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  const totalInTransit = activeIncoming.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  const activeNeedsCount = ngoNeeds.length;

  const fetchMatches = () => {
    if (currentNgo?.verificationStatus === 'approved') {
      setLoadingMatches(true);
      getSmartMatchesForNgo()
        .then(matches => setSmartMatches(matches || []))
        .catch(() => setSmartMatches([]))
        .finally(() => setLoadingMatches(false));
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [currentNgo?.id, currentNgo?.verificationStatus]);

  useEffect(() => {
    if (activeTab === 'analytics' && currentNgo?.id) {
      setLoadingAnalytics(true);
      ngoAPI.getAnalytics()
        .then(res => {
          setMonthlyData(res.data.monthly || []);
          setCategoryData((res.data.categories || []).map((c, i) => ({
            ...c,
            color: ['#4A7C59', '#6B9976', '#3B6647', '#88B090', '#2C352E'][i % 5]
          })));
        })
        .catch(() => toast.error('Failed to load analytics'))
        .finally(() => setLoadingAnalytics(false));
    }
  }, [activeTab, currentNgo?.id]);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    fetchMatches();
    toast.success('Data synchronized with network');
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handlePostNeed = async (e) => {
    e.preventDefault();
    setSubmittingNeed(true);
    try {
      await addNeed({
        category: needCategory,
        item: needItem,
        quantity: parseInt(needQty, 10),
        urgency: needUrgency,
        description: needDescription,
        lat: currentNgo.lat || 0,
        lng: currentNgo.lng || 0,
      });
      setNeedItem('');
      setNeedQty('');
      setNeedDescription('');
      toast.success('Demand broadcasted successfully!');
      setActiveTab('needs');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmittingNeed(false);
    }
  };

  const handleClaimDonation = async (donationId) => {
    try {
      await claimDonation(donationId);
      fetchMatches();
      toast.success('Logistics match claimed! Shipment scheduled.');
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleDeleteNeed = async (id) => {
    try {
      await deleteNeed(id);
      toast.success('Demand broadcast removed.');
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const verStatus = currentNgo?.verificationStatus || 'pending';

  // Screen for Rejected NGOs
  if (verStatus === 'rejected') {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#2C352E] font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 pt-28">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white border border-[#E5E0D5] p-10 rounded-3xl shadow-sm text-center space-y-6"
          >
            <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display font-black text-2xl text-[#2C352E]">NGO Access Restricted</h1>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Your NGO registration requires official audit verification before you can claim matches and broadcast demands.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 text-left space-y-1">
              <p className="font-bold text-rose-800 uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Rejection Reason
              </p>
              <p className="text-[#2C352E] text-xs font-medium">
                {currentNgo?.rejectionReason || 'Invalid registration license number or missing certificate.'}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="secondary" onClick={() => navigate('/settings')} className="bg-[#E8F3EC] text-[#4A7C59] border border-[#4A7C59]/20 hover:bg-[#4A7C59] hover:text-white rounded-xl px-5 h-11 text-xs font-bold transition-all">
                Update License
              </Button>
              <Button variant="primary" onClick={() => navigate('/chat')} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 h-11 text-xs font-bold">
                Contact Support
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Pre-configured markers array for LeafletMap component
  const incomingMarkers = activeIncoming.map(item => ({
    lat: item.location?.lat || (currentNgo.lat + 0.015),
    lng: item.location?.lng || (currentNgo.lng + 0.015),
    popupContent: `<strong>Shipment ${item.id}</strong><br/>${item.title || item.category}<br/>Qty: ${item.quantity}`
  }));

  const mapMarkers = [
    { lat: currentNgo.lat, lng: currentNgo.lng, popupContent: `<strong>${currentNgo.name} (Hub)</strong>` },
    ...incomingMarkers
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#4A7C59]/20">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 pt-24 space-y-8 relative z-10">
        
        {/* TOP STATUS BAR (MINIMALIST) */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-[#6B7280]">
          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#E5E0D5] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#4A7C59] animate-pulse" />
            <span>Hub Location: <strong className="text-[#2C352E]">{currentNgo.city || 'Regional Zone'}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span>Last updated: Just now</span>
            <button 
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 bg-[#4A7C59] hover:bg-[#3B6647] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Data
            </button>
          </div>
        </div>

        {/* CENTERED HERO HEADER SECTION */}
        <section className="text-center space-y-3 py-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F3EC] border border-[#4A7C59]/25 text-[#4A7C59] font-bold text-xs uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5" /> NGO Command Hub
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2C352E] tracking-tight font-display">
            {currentNgo.name}
          </h1>

          <p className="text-[#6B7280] font-medium text-sm md:text-base max-w-xl mx-auto">
            Real-time inventory management, demand broadcasting & AI-powered donor matching
          </p>

          <div className="pt-1 text-xs text-[#6B7280] flex items-center justify-center gap-3">
            <span>Hub ID: <strong className="text-[#2C352E]">#{currentNgo.id || 'NGO-8802'}</strong></span>
            <span>&bull;</span>
            <span>Trust Score: <strong className="text-[#4A7C59]">{currentNgo.trustScore || 95}%</strong></span>
            <span>&bull;</span>
            <span className="text-[#4A7C59] font-bold">{verStatus === 'approved' ? '✓ Verified Partner' : '⏳ Pending Audit'}</span>
          </div>
        </section>

        {/* 3 TOP STAT CARDS (CLEAN ROW) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Units Received</span>
              <div className="w-8 h-8 rounded-xl bg-[#E8F3EC] text-[#4A7C59] flex items-center justify-center">
                <Package className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-[#2C352E] block tracking-tight">{totalReceived} <span className="text-sm text-[#6B7280] font-normal">units</span></span>
              <p className="text-xs text-[#6B7280] mt-1">Verified & fulfilled inventory</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Cargo In Transit</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-sky-700 block tracking-tight">{totalInTransit} <span className="text-sm text-[#6B7280] font-normal">units</span></span>
              <p className="text-xs text-[#6B7280] mt-1">Active shipment logistics</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Active Needs</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Radio className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-amber-800 block tracking-tight">{activeNeedsCount} <span className="text-sm text-[#6B7280] font-normal">broadcasts</span></span>
              <p className="text-xs text-[#6B7280] mt-1">Registered demand specs</p>
            </div>
          </div>

        </section>

        {/* MIDDLE INSIGHT BANNER */}
        <section className="bg-[#E8F3EC]/70 border border-[#4A7C59]/30 rounded-2xl p-5 md:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#4A7C59]">
              <Sparkles className="w-4 h-4 text-[#4A7C59]" /> Smart Hub Insights
            </span>
            <span className="text-xs font-bold text-[#4A7C59] bg-white px-2.5 py-1 rounded-full border border-[#4A7C59]/20">
              4km Radius Matching
            </span>
          </div>

          <p className="text-xs md:text-sm text-[#2C352E] font-medium leading-relaxed">
            Real-time donor listings are automatically matched with your active supply demands using spatial proximity and item category scores.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {['Clothing', 'Food', 'Medical', 'Books', 'Furniture', 'Electronics'].map(cat => (
              <span key={cat} className="bg-white text-[#4A7C59] font-bold text-[11px] px-3 py-1 rounded-lg border border-[#4A7C59]/20 shadow-2xs">
                {cat}
              </span>
            ))}
          </div>
        </section>

        {/* MAIN TAB SELECTOR (CENTERED PILL BAR) */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-white border border-[#E5E0D5] rounded-2xl shadow-xs max-w-full overflow-x-auto">
            {[
              { id: 'matches', label: `Smart Matches (${smartMatches.length})`, icon: Zap },
              { id: 'needs', label: `Broadcast Demands (${ngoNeeds.length})`, icon: Radio },
              { id: 'geo', label: `Coverage Map`, icon: Radar },
              { id: 'analytics', label: `Analytics`, icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#E8F3EC] text-[#4A7C59] border border-[#4A7C59]/30 shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#2C352E] hover:bg-[#F9F7F2]'
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-[#4A7C59]' : 'text-[#6B7280]'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: SMART MATCHES */}
          {activeTab === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* Bottom Quick Action Grid inspired by prompt image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Green Highlight Box */}
                <div className="bg-[#4A7C59] text-white p-6 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">AI Match Engine</span>
                    <Zap className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl text-white">Recommended Listings</h3>
                    <p className="text-emerald-100 text-xs mt-1">Review donor dispatches matching your needs with high accuracy.</p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-white text-[#4A7C59] px-3.5 py-2 rounded-xl">
                      {smartMatches.length} Matches Ready <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </div>

                {/* White Card */}
                <div className="bg-white p-6 rounded-2xl border border-[#E5E0D5] space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Broadcast Demand</span>
                    <Radio className="w-5 h-5 text-[#4A7C59]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl text-[#2C352E]">Post Inventory Need</h3>
                    <p className="text-[#6B7280] text-xs mt-1">Add specific supply items to your live hub request ledger.</p>
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={() => setActiveTab('needs')}
                      className="inline-flex items-center gap-1 text-xs font-bold bg-[#E8F3EC] text-[#4A7C59] border border-[#4A7C59]/20 px-3.5 py-2 rounded-xl hover:bg-[#4A7C59] hover:text-white transition-all"
                    >
                      Post New Need <Plus className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Match List */}
              {loadingMatches ? (
                <div className="bg-white border border-[#E5E0D5] rounded-2xl p-12 text-center text-xs font-bold text-[#6B7280]">
                  Scanning matching matrix...
                </div>
              ) : verStatus === 'approved' && smartMatches.length === 0 ? (
                <div className="bg-white border border-[#E5E0D5] rounded-2xl p-12 text-center space-y-3">
                  <p className="font-bold text-[#2C352E]">No active match recommendations</p>
                  <p className="text-xs text-[#6B7280]">Broadcast a new demand item to trigger algorithm recommendations.</p>
                  <Button variant="primary" onClick={() => setActiveTab('needs')} className="bg-[#4A7C59] text-white text-xs h-10 px-5 rounded-xl font-bold">
                    Create Broadcast
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {smartMatches.map(({ donation, need, scoreBreakdown }) => (
                    <div key={donation.id} className="bg-white border border-[#E5E0D5] rounded-2xl overflow-hidden shadow-xs">
                      <DonationCard
                        donation={donation}
                        matchScoreDetails={scoreBreakdown}
                        onClaim={() => handleClaimDonation(donation.id)}
                        actions={
                          <span className="font-mono text-[#4A7C59] bg-[#E8F3EC] px-3 py-1 rounded-lg border border-[#4A7C59]/20 text-xs font-bold">
                            Matches: {need.item}
                          </span>
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: BROADCAST DEMANDS */}
          {activeTab === 'needs' && (
            <motion.div
              key="needs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              {/* Needs Table */}
              <div className="md:col-span-7 bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-xs space-y-4">
                <h3 className="font-display font-black text-lg text-[#2C352E]">Active Demand Ledger</h3>
                
                {ngoNeeds.length === 0 ? (
                  <p className="text-xs text-[#6B7280] text-center py-8">No demand broadcasts registered yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#E5E0D5] bg-[#F9F7F2] text-[#6B7280] font-bold">
                          <th className="p-3">Category</th>
                          <th className="p-3">Item</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3">Urgency</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E0D5]">
                        {ngoNeeds.map(need => (
                          <tr key={need.id} className="hover:bg-[#F9F7F2]">
                            <td className="p-3 font-bold text-[#4A7C59]">{need.category}</td>
                            <td className="p-3 font-bold text-[#2C352E]">{need.item}</td>
                            <td className="p-3 text-center font-mono font-bold">{need.quantity}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                need.urgency === 'High' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {need.urgency}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button onClick={() => handleDeleteNeed(need.id)} className="text-rose-600 hover:text-rose-800 p-1">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Need Poster Form */}
              <div className="md:col-span-5 bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-xs space-y-4">
                <h3 className="font-display font-black text-lg text-[#2C352E]">Broadcast New Need</h3>
                <form onSubmit={handlePostNeed} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#6B7280]">Category</label>
                    <select
                      value={needCategory}
                      onChange={(e) => setNeedCategory(e.target.value)}
                      className="w-full bg-[#F9F7F2] border border-[#E5E0D5] p-3 rounded-xl text-xs font-bold text-[#2C352E]"
                    >
                      {['Clothing', 'Food', 'Books', 'Furniture', 'Electronics', 'Medical Equipment'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <InputField
                    label="Item Name"
                    id="item-name"
                    placeholder="e.g. Blankets"
                    value={needItem}
                    onChange={(e) => setNeedItem(e.target.value)}
                    required
                    className="!bg-[#F9F7F2] border-[#E5E0D5] text-xs rounded-xl"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Quantity"
                      id="qty"
                      type="number"
                      min="1"
                      placeholder="50"
                      value={needQty}
                      onChange={(e) => setNeedQty(e.target.value)}
                      required
                      className="!bg-[#F9F7F2] border-[#E5E0D5] text-xs rounded-xl"
                    />

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#6B7280]">Urgency</label>
                      <select
                        value={needUrgency}
                        onChange={(e) => setNeedUrgency(e.target.value)}
                        className="w-full bg-[#F9F7F2] border border-[#E5E0D5] p-3 rounded-xl text-xs font-bold text-[#2C352E]"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={submittingNeed}
                    className="w-full h-11 bg-[#4A7C59] hover:bg-[#3B6647] text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    {submittingNeed ? 'Broadcasting...' : 'Broadcast Need'}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 3: COVERAGE MAP */}
          {activeTab === 'geo' && (
            <motion.div
              key="geo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white p-4 rounded-2xl border border-[#E5E0D5] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between px-2">
                <span className="font-bold text-xs text-[#2C352E]">Hub Coverage Radius (4km)</span>
                <span className="text-xs text-[#4A7C59] font-bold">● Active Radius</span>
              </div>
              <div className="h-[450px] w-full rounded-xl overflow-hidden border border-[#E5E0D5]">
                <LeafletMap
                  center={[currentNgo.lat, currentNgo.lng]}
                  zoom={13}
                  markers={mapMarkers}
                  circles={[{ lat: currentNgo.lat, lng: currentNgo.lng, radius: 4000, color: '#4A7C59', fillColor: '#4A7C59', fillOpacity: 0.15 }]}
                  className="h-full w-full border-none"
                />
              </div>
            </motion.div>
          )}

          {/* TAB 4: ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div className="bg-white p-6 rounded-2xl border border-[#E5E0D5] shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-[#2C352E]">Inbound Trajectory</h4>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D5" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: '8px', border: '1px solid #E5E0D5' }} />
                      <Line type="monotone" dataKey="received" stroke="#4A7C59" strokeWidth={2.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E5E0D5] shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-[#2C352E]">Category Composition</h4>
                <div className="h-60 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                        {categoryData.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: '8px', border: '1px solid #E5E0D5' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* BOTTOM HIGHLIGHT BULLETS inspired by picture */}
        <div className="pt-6 border-t border-[#E5E0D5] flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B7280] font-medium">
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4A7C59]" /> Real-time network sync</span>
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4A7C59]" /> Direct donor matching</span>
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4A7C59]" /> Built for verified NGOs</span>
        </div>

      </main>
    </div>
  );
}
