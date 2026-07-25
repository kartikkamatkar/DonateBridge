import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useRealDB } from '../hooks/useRealDB';
import { 
  Search, ShieldCheck, MapPin, Heart, ArrowRight, Star, Award, Leaf, 
  Users, ChevronRight, Check, BookOpen, Clock, Gift, Activity, ArrowUpRight,
  TrendingUp, Sparkles, Building, Calendar, Info, Sliders, Truck, AlertTriangle,
  Plus, Minus, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { motion } from 'framer-motion';

const MOCK_COORDS = {
  Koramangala: { lat: 12.9340, lng: 77.6100, address: "Koramangala, Bengaluru" },
  Indiranagar: { lat: 12.9801, lng: 77.6012, address: "Indiranagar, Bengaluru" },
  Jayanagar: { lat: 12.9634, lng: 77.5878, address: "Jayanagar, Bengaluru" },
  'MG Road': { lat: 12.9716, lng: 77.5946, address: "MG Road, Bengaluru" }
};

const CATEGORY_IMAGES = {
  Food: "https://images.unsplash.com/photo-1599059813005-11265ba4b2e9?auto=format&fit=crop&q=80&w=600",
  Books: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600",
  Clothing: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600",
  Medical: "https://images.unsplash.com/photo-1584308666744-24d59ce3618d?auto=format&fit=crop&q=80&w=600",
};

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { ngos, donations, needs } = useRealDB();
  const navigate = useNavigate();
  const [emailSub, setEmailSub] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Immersive Hero Simulator States
  const [simCategory, setSimCategory] = useState('Food');
  const [simQty, setSimQty] = useState(25);
  const [simCondition, setSimCondition] = useState('Like New');

  // Interactive Sandbox state
  const [sandboxTab, setSandboxTab] = useState('match'); 
  
  // Match Simulator state
  const [matchCategory, setMatchCategory] = useState('Books');
  const [matchLocation, setMatchLocation] = useState('Indiranagar');
  
  // Impact Estimator state
  const [impactCategory, setImpactCategory] = useState('Food');
  const [impactQuantity, setImpactQuantity] = useState(100);
  
  // Stepper Tracker state
  const [trackerStep, setTrackerStep] = useState(2); 

  // Dynamic Ledger feed
  const ledgerActivity = donations
    .filter(d => d.status === 'VERIFIED' || d.status === 'MATCHED' || d.status === 'DELIVERED')
    .slice(0, 4);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailSub) {
      setSubscribed(true);
      setEmailSub('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?query=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/discover');
    }
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    navigate(`/discover?query=${encodeURIComponent(tag)}`);
  };

  const getHeroSimMatches = () => {
    let ngoName = "Hope Foundation";
    let distance = "1.2 km";
    let score = 94;
    let co2 = (simQty * 0.45).toFixed(1);
    let needItem = "Blankets";

    if (simCategory === 'Food') {
      ngoName = "Feeding Hand";
      distance = "0.8 km";
      score = 96;
      needItem = "Canned Food";
    } else if (simCategory === 'Books') {
      ngoName = "Tech Academy";
      distance = "4.5 km";
      score = 88;
      needItem = "Chemistry Lab Kits";
    } else if (simCategory === 'Medical') {
      ngoName = "Care Society";
      distance = "1.8 km";
      score = 91;
      needItem = "Medical Gloves";
    }

    let finalScore = score;
    if (simCondition === 'Good') finalScore -= 5;
    if (simCondition === 'New') finalScore += 3;
    finalScore = Math.min(100, finalScore);

    return { ngoName, distance, score: finalScore, co2, needItem };
  };

  const heroSimOutput = getHeroSimMatches();

  const getSimulationMatches = () => {
    const selectedCoord = MOCK_COORDS[matchLocation] || MOCK_COORDS.Indiranagar;
    
    let dbCategory = matchCategory;
    if (matchCategory === 'Medical Equipment') dbCategory = 'Medical';
    if (matchCategory === 'Clothes') dbCategory = 'Clothing';

    const candidateNeeds = needs.filter(n => n.category.toLowerCase() === dbCategory.toLowerCase());
    
    const matches = candidateNeeds.map(need => {
      const ngo = ngos.find(o => o.id === need.ngoId) || { 
        name: need.ngoName, 
        lat: need.lat, 
        lng: need.lng, 
        address: "Local Hub", 
        trustScore: 85, 
        successRate: "90%" 
      };
      
      const getDist = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };
      
      const distance = getDist(selectedCoord.lat, selectedCoord.lng, need.lat, need.lng);
      const distanceScore = Math.max(0, 100 - (distance * 5));
      
      let urgencyScore = 30;
      if (need.urgency === "High") urgencyScore = 100;
      else if (need.urgency === "Medium") urgencyScore = 70;
      
      const categoryFit = 100;
      const freshnessScore = 95;
      
      const totalScore = Math.round(
        (categoryFit * 0.40) +
        (distanceScore * 0.30) +
        (urgencyScore * 0.20) +
        (freshnessScore * 0.10)
      );
      
      return {
        need,
        ngo,
        distance: distance.toFixed(1),
        score: totalScore,
      };
    });
    
    return matches.sort((a, b) => b.score - a.score);
  };

  const simulationResults = getSimulationMatches();

  const getImpactMetrics = () => {
    const qty = parseInt(impactQuantity, 10) || 0;
    switch (impactCategory) {
      case 'Food':
        return {
          beneficiaries: Math.round(qty * 1.5),
          beneficiaryLabel: "Meals Provided",
          co2: (qty * 0.45).toFixed(1),
          hours: (qty * 0.12).toFixed(1)
        };
      case 'Books':
        return {
          beneficiaries: Math.round(qty / 2),
          beneficiaryLabel: "Students Equipped",
          co2: (qty * 0.38).toFixed(1),
          hours: (qty * 0.25).toFixed(1)
        };
      case 'Clothing':
        return {
          beneficiaries: qty,
          beneficiaryLabel: "People Warmly Clad",
          co2: (qty * 0.62).toFixed(1),
          hours: (qty * 0.08).toFixed(1)
        };
      case 'Medical':
        return {
          beneficiaries: Math.round(qty * 3),
          beneficiaryLabel: "Sterile Kits Stocked",
          co2: (qty * 0.28).toFixed(1),
          hours: (qty * 0.35).toFixed(1)
        };
      default:
        return { beneficiaries: qty, beneficiaryLabel: "Units Distributed", co2: (qty * 0.4).toFixed(1), hours: (qty * 0.1).toFixed(1) };
    }
  };

  const impactMetrics = getImpactMetrics();

  const TRACKER_STAGES = [
    {
      title: "1. Item Registered",
      log: "Donation DNT-2026-00019 (Thermal Fleece Blankets) uploaded. Coordinates verified.",
      status: "COMPLETED",
      time: "10:30 AM"
    },
    {
      title: "2. Condition Audited",
      log: "Platform supervisor certified item condition as 'Brand New' through picture analysis.",
      status: "COMPLETED",
      time: "11:15 AM"
    },
    {
      title: "3. Smart Match Locked",
      log: "Match engine assigned Hope Foundation (92% Score) based on distance (1.2km) and high urgency.",
      status: "ACTIVE",
      time: "12:00 PM"
    },
    {
      title: "4. Handover & Tax Cert",
      log: "Direct courier handover verified via digital signature. Signed 80G tax receipt generated.",
      status: "PENDING",
      time: "Pending Pickup"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1E2923] font-sans antialiased selection:bg-[#2E5B3D]/15">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-28 lg:pb-20 bg-[#FAFAF8] text-[#1E2923] border-b border-[#E8EDE9]">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-150 h-150 bg-linear-to-br from-[#EBF3EE] to-transparent rounded-full blur-3xl opacity-70 pointer-events-none -mt-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          
          {/* Header Title Stack */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF3EE] text-[#2E5B3D] border border-[#2E5B3D]/15 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Direct Humanitarian Logistics Platform
            </span>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E2923] leading-tight tracking-tight">
              Bridging Donors &amp; NGOs <br />
              <span className="text-[#2E5B3D]">One Need at a Time.</span>
            </h1>
            
            <p className="text-xs sm:text-sm lg:text-base text-[#64748B] max-w-xl mx-auto leading-relaxed font-normal">
              Direct physical supply logistics without cash escrow leakages. Vetted verification, real-time spatial mapping, and instant 80G tax invoice generation.
            </p>

            <div className="max-w-xl mx-auto space-y-3 pt-2">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-white border border-[#E8EDE9] rounded-2xl p-1.5 shadow-2xs focus-within:border-[#2E5B3D] transition-all">
                <div className="flex items-center pl-3 pr-2 text-[#64748B] shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <input 
                  type="text"
                  placeholder="Search Registry (e.g. Blankets, Medicine, Textbooks)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm text-[#1E2923] placeholder-[#94A3B8] bg-transparent border-none outline-none focus:outline-none focus:ring-0 !min-h-0 !h-auto !shadow-none !py-2 !px-1"
                />
                <Button
                  type="submit"
                  className="bg-[#2E5B3D] hover:bg-[#1E3B27] text-white font-semibold text-xs py-2 px-5 rounded-xl shrink-0 shadow-2xs transition-all"
                >
                  Search
                </Button>
              </form>

              <div className="flex flex-wrap justify-center gap-3 text-xs text-[#64748B] font-medium">
                <span className="text-[#94A3B8]">Popular:</span>
                {['Blankets', 'Dry Rations', 'Laptops', 'Gloves'].map((tag) => (
                  <button 
                    key={tag} 
                    onClick={() => handleTagClick(tag)}
                    className="hover:text-[#2E5B3D] font-semibold transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Dual Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
            
            {/* Left Dispatch Simulator Console */}
            <div className="lg:col-span-6 bg-white border border-[#E8EDE9] rounded-3xl p-6 lg:p-7 flex flex-col justify-between shadow-2xs text-left space-y-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#E8EDE9]">
                  <h3 className="text-xs font-bold text-[#2E5B3D] uppercase tracking-wider flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#2E5B3D]" /> Donor Dispatch Center
                  </h3>
                  <span className="text-xs bg-[#EBF3EE] text-[#2E5B3D] border border-[#2E5B3D]/15 font-semibold py-0.5 px-2.5 rounded-full">
                    Interactive Simulator
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#64748B]">Item Category</label>
                    <select 
                      value={simCategory}
                      onChange={(e) => setSimCategory(e.target.value)}
                      className="w-full bg-[#F8FAF8] border border-[#E8EDE9] p-2.5 rounded-xl text-xs font-medium text-[#1E2923] focus:border-[#2E5B3D] outline-none"
                    >
                      <option value="Food">Food / Staples</option>
                      <option value="Books">Books / Learning Kits</option>
                      <option value="Clothing">Clothing / Blankets</option>
                      <option value="Medical">Medical Supplies</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#64748B]">Item Condition</label>
                    <select 
                      value={simCondition}
                      onChange={(e) => setSimCondition(e.target.value)}
                      className="w-full bg-[#F8FAF8] border border-[#E8EDE9] p-2.5 rounded-xl text-xs font-medium text-[#1E2923] focus:border-[#2E5B3D] outline-none"
                    >
                      <option value="New">Brand New</option>
                      <option value="Like New">Like New / Cleaned</option>
                      <option value="Good">Gently Used</option>
                    </select>
                  </div>
                </div>

                <div className="text-left bg-[#F8FAF8] p-4 rounded-2xl border border-[#E8EDE9] space-y-2">
                  <label className="text-xs font-semibold text-[#64748B] block">Quantity to Pledge</label>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSimQty(Math.max(1, simQty - 5))}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E8EDE9] flex items-center justify-center hover:bg-[#F3F6F4] transition-colors cursor-pointer shadow-2xs text-[#1E2923]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xl font-bold text-[#1E2923] w-12 text-center">{simQty}</span>
                    <button 
                      onClick={() => setSimQty(simQty + 5)}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E8EDE9] flex items-center justify-center hover:bg-[#F3F6F4] transition-colors cursor-pointer shadow-2xs text-[#1E2923]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-[#64748B] font-medium ml-2">units matching active need</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#EBF3EE] border border-[#2E5B3D]/15 rounded-2xl text-left space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#2E5B3D] uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Live Spatial Match Output
                  </p>
                  <span className="text-[11px] font-bold text-[#2E5B3D] bg-white px-2 py-0.5 rounded-full">
                    Match Rating: {heroSimOutput.score}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Partner NGO</span>
                    <span className="font-bold text-[#1E2923]">{heroSimOutput.ngoName}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Local Proximity</span>
                    <span className="font-bold text-[#1E2923]">{heroSimOutput.distance}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Carbon Offset</span>
                    <span className="font-bold text-[#2E5B3D]">{heroSimOutput.co2} kg CO2</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2E5B3D]/15 flex justify-between items-center text-xs">
                  <span className="text-[#64748B] text-[11px]">Direct handover scheduled</span>
                  <Button
                    className="bg-[#2E5B3D] hover:bg-[#1E3B27] text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-2xs transition-all"
                    onClick={() => navigate(isAuthenticated ? '/donor' : '/auth')}
                  >
                    Pledge Dispatch
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Live Matching Ledger Console */}
            <div className="lg:col-span-6 bg-white border border-[#E8EDE9] rounded-3xl p-6 lg:p-7 flex flex-col justify-between shadow-2xs text-left space-y-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#E8EDE9]">
                  <h3 className="text-xs font-bold text-[#1E2923] uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#2E5B3D]" /> Live Matching Ledger
                  </h3>
                  <span className="w-2.5 h-2.5 bg-[#2E5B3D] rounded-full animate-pulse" />
                </div>

                <div className="space-y-3">
                  {ledgerActivity.length > 0 ? (
                    ledgerActivity.map((donation) => (
                      <div key={donation.id} className="p-3.5 bg-[#F8FAF8] border border-[#E8EDE9] hover:border-[#2E5B3D]/30 rounded-2xl flex items-center justify-between gap-4 text-left transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            donation.status === 'DELIVERED' ? 'bg-[#EBF3EE] text-[#2E5B3D]' :
                            donation.status === 'MATCHED' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {donation.status === 'DELIVERED' ? <Check className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-xs font-bold text-[#1E2923] truncate">{donation.itemName || `${donation.quantity}x ${donation.category}`}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                                donation.status === 'DELIVERED' ? 'bg-[#EBF3EE] text-[#2E5B3D] border border-[#2E5B3D]/15' :
                                donation.status === 'MATCHED' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {donation.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748B] truncate font-medium">
                              Recipient: {donation.matchedNgoId === 'ngo-1' ? 'Hope Foundation' : donation.matchedNgoId === 'ngo-3' ? 'Care Society' : 'Feeding Hand'} &bull; {donation.location?.address || 'Local Hub'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-[#94A3B8] font-semibold block mb-0.5">LEDGER ID</span>
                          <span className="text-xs font-mono font-bold text-[#1E2923] bg-white px-2 py-0.5 rounded-lg border border-[#E8EDE9]">{donation.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-xs text-[#64748B] font-medium bg-[#F8FAF8] rounded-2xl border border-[#E8EDE9]">
                      No live donation dispatches logged yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8EDE9] flex justify-between items-center text-xs font-semibold text-[#64748B]">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-[#2E5B3D]" /> SECURE HANDSHAKES
                </span>
                <span className="text-[#2E5B3D] bg-[#EBF3EE] px-3 py-1 rounded-full border border-[#2E5B3D]/15 font-bold text-[11px]">99.8% DELIVERY SUCCESS RATE</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sandbox Section */}
      <section className="py-16 lg:py-20 bg-[#FAFAF8] border-b border-[#E8EDE9] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF3EE] text-[#2E5B3D] border border-[#2E5B3D]/15 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Sandbox
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E2923] tracking-tight">
              Simulate Match Integrity &amp; Eco-Impact
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal">
              Explore how spatial algorithms coordinate physical deliveries, reduce carbon footprints, and maintain audit trails in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Tab Selectors */}
            <div className="lg:col-span-5 flex flex-col space-y-3">
              <button
                onClick={() => setSandboxTab('match')}
                className={`w-full p-4 rounded-2xl text-left border transition-all duration-150 flex gap-4 items-center cursor-pointer ${
                  sandboxTab === 'match'
                    ? 'bg-white border-[#2E5B3D] shadow-2xs ring-1 ring-[#2E5B3D]/20'
                    : 'bg-white/70 border-[#E8EDE9] hover:bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  sandboxTab === 'match' ? 'bg-[#2E5B3D] text-white' : 'bg-[#EBF3EE] text-[#2E5B3D]'
                }`}>
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E2923]">Smart-Match Engine</h3>
                  <p className="text-xs text-[#64748B] mt-0.5 font-normal leading-relaxed">Select category & locality to calculate spatial fit score.</p>
                </div>
              </button>

              <button
                onClick={() => setSandboxTab('impact')}
                className={`w-full p-4 rounded-2xl text-left border transition-all duration-150 flex gap-4 items-center cursor-pointer ${
                  sandboxTab === 'impact'
                    ? 'bg-white border-[#2E5B3D] shadow-2xs ring-1 ring-[#2E5B3D]/20'
                    : 'bg-white/70 border-[#E8EDE9] hover:bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  sandboxTab === 'impact' ? 'bg-[#2E5B3D] text-white' : 'bg-[#EBF3EE] text-[#2E5B3D]'
                }`}>
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E2923]">Eco-Impact Calculator</h3>
                  <p className="text-xs text-[#64748B] mt-0.5 font-normal leading-relaxed">Estimate beneficiary reach and CO2 carbon offset metrics.</p>
                </div>
              </button>

              <button
                onClick={() => setSandboxTab('tracker')}
                className={`w-full p-4 rounded-2xl text-left border transition-all duration-150 flex gap-4 items-center cursor-pointer ${
                  sandboxTab === 'tracker'
                    ? 'bg-white border-[#2E5B3D] shadow-2xs ring-1 ring-[#2E5B3D]/20'
                    : 'bg-white/70 border-[#E8EDE9] hover:bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  sandboxTab === 'tracker' ? 'bg-[#2E5B3D] text-white' : 'bg-[#EBF3EE] text-[#2E5B3D]'
                }`}>
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E2923]">Logistics Lifecycle Tracker</h3>
                  <p className="text-xs text-[#64748B] mt-0.5 font-normal leading-relaxed">Walkthrough physical audit handshakes step-by-step.</p>
                </div>
              </button>
            </div>

            {/* Widget Container */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-[#E8EDE9] rounded-3xl p-6 sm:p-7 shadow-2xs h-full flex flex-col justify-between text-left relative overflow-hidden">
                
                {/* 1. MATCH SIMULATOR WIDGET */}
                {sandboxTab === 'match' && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 h-full flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-[#E8EDE9]">
                        <h4 className="text-xs font-bold text-[#1E2923] uppercase tracking-wider flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-[#2E5B3D]" /> Smart Match Simulator
                        </h4>
                        <span className="text-[11px] bg-[#EBF3EE] text-[#2E5B3D] px-2.5 py-0.5 rounded-full border border-[#2E5B3D]/15 font-semibold">Category: 40% | Distance: 30%</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#64748B]">Category</label>
                          <select 
                            value={matchCategory} 
                            onChange={(e) => setMatchCategory(e.target.value)}
                            className="w-full p-2.5 bg-[#F8FAF8] border border-[#E8EDE9] rounded-xl text-xs font-medium text-[#1E2923] outline-none"
                          >
                            <option value="Food">Food &amp; Rations</option>
                            <option value="Books">Books &amp; Learning Kits</option>
                            <option value="Clothing">Clothing &amp; Blankets</option>
                            <option value="Medical Equipment">Medical Supplies</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#64748B]">Donor Location</label>
                          <select 
                            value={matchLocation} 
                            onChange={(e) => setMatchLocation(e.target.value)}
                            className="w-full p-2.5 bg-[#F8FAF8] border border-[#E8EDE9] rounded-xl text-xs font-medium text-[#1E2923] outline-none"
                          >
                            <option value="Indiranagar">Indiranagar, Bengaluru</option>
                            <option value="Koramangala">Koramangala, Bengaluru</option>
                            <option value="Jayanagar">Jayanagar, Bengaluru</option>
                            <option value="MG Road">MG Road, Bengaluru</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 my-4 grow overflow-y-auto pr-1">
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Recommended Hub Destinations</p>
                      
                      {simulationResults.length > 0 ? (
                        simulationResults.map((res, i) => (
                          <div key={i} className="p-3.5 bg-[#F8FAF8] border border-[#E8EDE9] rounded-2xl flex items-center justify-between gap-4 hover:border-[#2E5B3D]/30 transition-all">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h5 className="text-xs font-bold text-[#1E2923] truncate">{res.ngo.name}</h5>
                                <span className="text-[10px] bg-[#EBF3EE] text-[#2E5B3D] border border-[#2E5B3D]/15 font-semibold px-2 py-0.5 rounded-full">
                                  {res.distance} km away
                                </span>
                              </div>
                              <p className="text-xs text-[#64748B] truncate font-medium">Need: {res.need.quantity}x {res.need.item}</p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className="text-sm font-bold text-[#2E5B3D]">{res.score}%</span>
                                <p className="text-[9px] text-[#64748B] font-medium uppercase">Score</p>
                              </div>
                              <Button 
                                className="bg-[#2E5B3D] hover:bg-[#1E3B27] text-white font-semibold text-xs py-1.5 px-3.5 rounded-xl shadow-2xs"
                                onClick={() => navigate('/auth')}
                              >
                                Pledge
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-medium">
                          No active demands registered matching {matchCategory} in database.
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] font-medium text-[#64748B] pt-3 border-t border-[#E8EDE9] text-center">
                      Algorithm Weighting: Category Fit (40%) + Distance (30%) + Urgency (20%) + Freshness (10%)
                    </div>
                  </motion.div>
                )}

                {/* 2. ECO-IMPACT ESTIMATOR WIDGET */}
                {sandboxTab === 'impact' && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 h-full flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-[#E8EDE9]">
                        <h4 className="text-xs font-bold text-[#1E2923] uppercase tracking-wider flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-[#2E5B3D]" /> Eco-Impact Estimator
                        </h4>
                        <span className="text-[11px] bg-[#EBF3EE] text-[#2E5B3D] px-2.5 py-0.5 rounded-full border border-[#2E5B3D]/15 font-semibold">100% Non-Monetary</span>
                      </div>

                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4 items-center">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-[#64748B]">Item Category</label>
                            <select 
                              value={impactCategory} 
                              onChange={(e) => setImpactCategory(e.target.value)}
                              className="w-full p-2.5 bg-[#F8FAF8] border border-[#E8EDE9] rounded-xl text-xs font-medium text-[#1E2923] outline-none"
                            >
                              <option value="Food">Staple Rations</option>
                              <option value="Books">Textbooks &amp; Learning Tools</option>
                              <option value="Clothing">Warm Clothes &amp; Bedding</option>
                              <option value="Medical">Medical Disposables</option>
                            </select>
                          </div>
                          <div className="text-right">
                            <label className="text-xs font-semibold text-[#64748B] block">Quantity</label>
                            <p className="text-2xl font-bold text-[#2E5B3D] tracking-tight">{impactQuantity} <span className="text-xs text-[#64748B] font-medium">Units</span></p>
                          </div>
                        </div>

                        <div className="bg-[#F8FAF8] p-4 rounded-2xl border border-[#E8EDE9]">
                          <input 
                            type="range" 
                            min="5" 
                            max="500" 
                            step="5"
                            value={impactQuantity} 
                            onChange={(e) => setImpactQuantity(e.target.value)}
                            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#2E5B3D]"
                          />
                          <div className="flex justify-between text-[10px] text-[#64748B] font-semibold uppercase mt-2">
                            <span>5 min</span>
                            <span>500 max</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 my-4">
                      <div className="p-4 bg-[#F8FAF8] border border-[#E8EDE9] rounded-2xl text-center">
                        <p className="text-[10px] text-[#64748B] font-semibold uppercase mb-1">Beneficiaries</p>
                        <p className="text-xl font-bold text-[#1E2923] tracking-tight">{impactMetrics.beneficiaries}</p>
                        <p className="text-[11px] font-semibold text-[#2E5B3D] mt-0.5">{impactMetrics.beneficiaryLabel}</p>
                      </div>

                      <div className="p-4 bg-[#F8FAF8] border border-[#E8EDE9] rounded-2xl text-center">
                        <p className="text-[10px] text-[#64748B] font-semibold uppercase mb-1">CO2 Offset</p>
                        <p className="text-xl font-bold text-[#1E2923] tracking-tight">{impactMetrics.co2} <span className="text-xs text-[#64748B]">kg</span></p>
                        <p className="text-[11px] font-semibold text-sky-700 mt-0.5">Emissions Avoided</p>
                      </div>

                      <div className="p-4 bg-[#EBF3EE] border border-[#2E5B3D]/15 rounded-2xl text-center">
                        <p className="text-[10px] text-[#2E5B3D] font-semibold uppercase mb-1">Turnaround</p>
                        <p className="text-base font-bold text-[#2E5B3D] tracking-tight mt-0.5">&lt; 3 hrs</p>
                        <p className="text-[11px] font-semibold text-[#2E5B3D] mt-0.5">Local Match</p>
                      </div>
                    </div>

                    <div className="text-[10px] font-medium text-[#64748B] pt-3 border-t border-[#E8EDE9] text-center">
                      Impact metrics computed from local radial courier dispatches. Zero sorting depots reduces packaging waste.
                    </div>
                  </motion.div>
                )}

                {/* 3. LOGISTICS PATHWAY TRACKER WIDGET */}
                {sandboxTab === 'tracker' && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 h-full flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-[#E8EDE9]">
                        <h4 className="text-xs font-bold text-[#1E2923] uppercase tracking-wider flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#2E5B3D]" /> Fulfillment Lifecycle Tracker
                        </h4>
                        <span className="text-[11px] bg-[#EBF3EE] text-[#2E5B3D] px-2.5 py-0.5 rounded-full border border-[#2E5B3D]/15 font-semibold">Audit Ledger</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mt-4">
                        {TRACKER_STAGES.map((st, i) => (
                          <button
                            key={i}
                            onClick={() => setTrackerStep(i)}
                            className={`p-2.5 rounded-xl text-center border transition-all duration-150 flex flex-col items-center gap-1.5 cursor-pointer ${
                              trackerStep === i
                                ? 'bg-[#2E5B3D] border-[#2E5B3D] text-white shadow-2xs'
                                : 'bg-[#F8FAF8] border-[#E8EDE9] text-[#64748B] hover:bg-white'
                            }`}
                          >
                            <p className="text-[11px] font-semibold truncate w-full">{st.title.split(' ')[1] || st.title}</p>
                            <span className={`inline-block w-2 h-2 rounded-full ${
                              st.status === 'COMPLETED' ? 'bg-emerald-400' :
                              st.status === 'ACTIVE' ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'
                            }`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 bg-[#F8FAF8] border border-[#E8EDE9] rounded-2xl text-left my-4 space-y-3 grow flex flex-col justify-center">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-[#E8EDE9]">STAGE ({trackerStep + 1}/4)</span>
                        <span className="text-xs font-semibold text-[#64748B]">{TRACKER_STAGES[trackerStep].time}</span>
                      </div>
                      <h4 className="text-base font-bold text-[#1E2923]">{TRACKER_STAGES[trackerStep].title}</h4>
                      <div className="bg-white p-3.5 rounded-xl border border-[#E8EDE9] relative">
                        <p className="text-xs font-medium text-[#64748B] leading-relaxed font-mono">
                          {TRACKER_STAGES[trackerStep].log}
                        </p>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#64748B] pt-3 border-t border-[#E8EDE9] flex justify-between items-center font-medium">
                      <span>Secure Audit Ledger Signature</span>
                      <span className="text-[#2E5B3D] bg-[#EBF3EE] px-2 py-0.5 rounded font-semibold border border-[#2E5B3D]/15">ECDSA-SHA256 SECURED</span>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Projects and Campaigns Section */}
      <section className="py-16 lg:py-20 bg-white border-b border-[#E8EDE9] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 text-left">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF3EE] text-[#2E5B3D] border border-[#2E5B3D]/15 text-xs font-semibold uppercase tracking-wider">
                <Building className="w-3.5 h-3.5" /> Active Campaigns
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E2923] tracking-tight">
                Featured NGO Projects
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-xl font-normal leading-relaxed">
                 Vetted campaigns posting urgent, specific physical needs. Directly pledge items to fund their completion.
              </p>
            </div>
            <Link 
              to="/discover" 
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAFAF8] border border-[#E8EDE9] text-xs font-semibold text-[#1E2923] hover:bg-[#F3F6F4] transition-all shrink-0"
            >
              Browse all needs <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {needs.length > 0 ? needs.slice(0, 3).map((need) => {
              const target = need.quantity || 1;
              const received = need.fulfilledQuantity || 0;
              const progress = Math.min(100, Math.round((received / target) * 100));
              const image = CATEGORY_IMAGES[need.category] || "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600";
              return (
                <div key={need.id} className="bg-white border border-[#E8EDE9] rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xs hover:border-[#2E5B3D]/30 transition-all group">
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-[#FAFAF8]">
                      <img 
                        src={image} 
                        alt={need.item} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          need.urgency === 'High' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                        }`}>
                          {need.urgency} Priority
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-0.5">{need.category}</p>
                        <h4 className="text-white font-bold text-base truncate">{need.ngoName}</h4>
                      </div>
                    </div>

                    <div className="p-5 text-left space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-[#1E2923] leading-snug line-clamp-1">
                          {need.item} Drive
                        </h3>
                        <p className="text-xs text-[#64748B] font-normal line-clamp-2 leading-relaxed">
                          {need.description || `Providing ${need.item} to support local community members in need.`}
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-[#64748B]">Matching Progress</span>
                          <span className="font-bold text-[#2E5B3D]">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#F3F6F4] rounded-full overflow-hidden border border-[#E8EDE9]">
                          <div 
                            className="h-full bg-[#2E5B3D] rounded-full transition-all duration-700" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-[#64748B]">
                          <span>Received: <strong className="text-[#1E2923]">{received}</strong></span>
                          <span>Target: <strong className="text-[#1E2923]">{target} {need.item}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Button 
                      className="w-full h-10 bg-[#2E5B3D] hover:bg-[#1E3B27] text-white text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5"
                      onClick={() => navigate(`/ngo/${need.ngoId}`)}
                    >
                      Pledge Items <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-3 text-center py-12 bg-[#FAFAF8] rounded-3xl border border-[#E8EDE9] border-dashed text-xs text-[#64748B]">
                No active needs found at the moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Direct Aid Integrity Section */}
      <section className="py-16 lg:py-20 bg-[#FAFAF8] border-b border-[#E8EDE9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 space-y-5 text-left">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF3EE] text-[#2E5B3D] border border-[#2E5B3D]/15 text-xs font-semibold uppercase tracking-wider">
                Audited Logistics
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E2923] leading-tight tracking-tight">
                How We Maintain Direct Aid Integrity
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal">
                By focusing exclusively on physical supplies and eliminating monetary routing, DonateBridge ensures every resource item reaches school classrooms, shelters, and disaster response teams directly.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#E8EDE9] shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-[#EBF3EE] text-[#2E5B3D] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1E2923]">Zero Financial Escrows</h4>
                    <p className="text-xs text-[#64748B] mt-0.5 font-normal">Direct coordinator pickup without platform commission fees.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#E8EDE9] shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-[#EBF3EE] text-[#2E5B3D] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1E2923]">Georadial Optimization</h4>
                    <p className="text-xs text-[#64748B] mt-0.5 font-normal">Matches ranked using physical proximity to reduce local transport costs.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  step: '01', 
                  title: 'Need Registration', 
                  desc: 'Verified NGOs log exact items required with quantities and location coordinates.',
                  icon: Building 
                },
                { 
                  step: '02', 
                  title: 'Donor Submission', 
                  desc: 'Donors upload description tags, item conditions, and photographs of supplies.',
                  icon: Gift 
                },
                { 
                  step: '03', 
                  title: 'Audit Approval', 
                  desc: 'System admins audit conditions to ensure item compliance prior to matching.',
                  icon: ShieldCheck 
                },
                { 
                  step: '04', 
                  title: 'Fulfillment & Invoice', 
                  desc: 'Donor and NGO coordinate pickup. Complete logs emit signed 80G tax forms.',
                  icon: FileInvoice 
                }
              ].map((item, idx) => {
                const IconComponent = item.icon || Award;
                return (
                  <div key={idx} className="p-5 bg-white border border-[#E8EDE9] rounded-2xl text-left flex flex-col justify-between min-h-40 shadow-2xs hover:border-[#2E5B3D]/30 transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#EBF3EE] text-[#2E5B3D] flex items-center justify-center">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-bold text-[#94A3B8]">{item.step}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[#1E2923] mb-1">{item.title}</h3>
                      <p className="text-xs text-[#64748B] leading-relaxed font-normal">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* CTA & Newsletter Section */}
      <section className="py-16 lg:py-20 bg-white relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="w-14 h-14 mx-auto bg-[#EBF3EE] border border-[#2E5B3D]/15 rounded-2xl flex items-center justify-center text-[#2E5B3D] shadow-2xs">
            <Heart className="w-7 h-7" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E2923] tracking-tight">
            Ready to bridge needs in your neighborhood?
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-lg mx-auto leading-relaxed font-normal">
            Create your account today. Log in as a donor to submit item dispatches, or register your NGO credentials to post supply campaign requests.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button
              className="bg-[#2E5B3D] text-white hover:bg-[#1E3B27] px-6 h-11 rounded-xl font-semibold text-xs shadow-2xs transition-all"
              onClick={() => navigate('/auth?tab=register')}
            >
              Register Account
            </Button>
            <Button
              variant="outline"
              className="bg-white text-[#1E2923] hover:bg-[#F3F6F4] border-[#E8EDE9] px-6 h-11 rounded-xl font-semibold text-xs shadow-2xs transition-all"
              onClick={() => navigate('/discover')}
            >
              Browse Active Demands
            </Button>
          </div>

          <div className="pt-8 mt-8 border-t border-[#E8EDE9] max-w-md mx-auto">
            <form onSubmit={handleSubscribe} className="space-y-3">
              <p className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">
                Subscribe to local NGO campaign notifications
              </p>
              <div className="flex bg-[#F8FAF8] border border-[#E8EDE9] rounded-2xl p-1.5 focus-within:border-[#2E5B3D] transition-all">
                <input 
                  type="email"
                  placeholder="Enter your email address"
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  className="bg-transparent border-none text-xs text-[#1E2923] outline-none w-full px-3 py-2 placeholder-[#94A3B8] font-medium"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E5B3D] text-white text-xs font-semibold rounded-xl hover:bg-[#1E3B27] shrink-0 transition-colors cursor-pointer"
                >
                  {subscribed ? 'Subscribed!' : 'Notify Me'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const FileInvoice = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);