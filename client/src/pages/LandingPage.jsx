import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useRealDB } from '../hooks/useRealDB';
import { 
  Search, ShieldCheck, MapPin, Heart, HeartHandshake, ArrowRight, Star, Award, Leaf, 
  Users, ChevronRight, Check, BookOpen, Clock, Gift, Activity, ArrowUpRight,
  TrendingUp, Sparkles, Building, Calendar, Info, Sliders, Truck, AlertTriangle,
  Plus, Minus, RefreshCw, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { motion } from 'framer-motion';

const LOCATION_COORDS = {
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

const TRACKER_STAGES = [
  {
    title: '1. Pledged',
    status: 'COMPLETED',
    time: '10:15 AM (Today)',
    log: '[SYSTEM] Item verified by AI inspection & match confirmed for Hope Foundation Hub.'
  },
  {
    title: '2. Dispatched',
    status: 'COMPLETED',
    time: '11:30 AM (Today)',
    log: '[COURIER] Express Partner #DB-990 picked up supplies from donor location.'
  },
  {
    title: '3. In-Transit',
    status: 'ACTIVE',
    time: '12:45 PM (Active)',
    log: '[GPS] Live spatial routing active (4.2km from recipient NGO facility).'
  },
  {
    title: '4. Verified',
    status: 'PENDING',
    time: 'Est. 1:15 PM',
    log: '[DELIVERY] Awaiting QR verification token scan at NGO doorstep.'
  }
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { ngos, donations, needs, loadingNeeds } = useRealDB();
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

  const getImpactMetrics = () => {
    const qty = parseInt(impactQuantity, 10) || 1;
    let beneficiaries = qty;
    let beneficiaryLabel = 'People Fed';
    let co2Factor = 2.5;

    if (impactCategory === 'Food') {
      beneficiaries = qty * 2;
      beneficiaryLabel = 'Meals Served';
      co2Factor = 1.8;
    } else if (impactCategory === 'Clothing') {
      beneficiaries = Math.round(qty * 0.8);
      beneficiaryLabel = 'Families Clothed';
      co2Factor = 5.2;
    } else if (impactCategory === 'Books') {
      beneficiaries = qty;
      beneficiaryLabel = 'Students Educated';
      co2Factor = 3.1;
    } else if (impactCategory === 'Medical') {
      beneficiaries = Math.round(qty * 1.5);
      beneficiaryLabel = 'Patients Supported';
      co2Factor = 4.0;
    } else if (impactCategory === 'Electronics') {
      beneficiaries = Math.round(qty * 0.5);
      beneficiaryLabel = 'Classrooms Connected';
      co2Factor = 12.5;
    }

    return {
      beneficiaries: beneficiaries.toLocaleString(),
      beneficiaryLabel,
      co2: (qty * co2Factor).toFixed(1)
    };
  };

  const impactMetrics = getImpactMetrics();
  
  // Stepper Tracker state
  const [trackerStep, setTrackerStep] = useState(2); 

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
    const matchingNeed = needs.find(n => n.category.toLowerCase() === simCategory.toLowerCase());
    let ngoName = matchingNeed?.ngoName || (ngos.length > 0 ? ngos[0].name : "Community Partner NGO");
    let needItem = matchingNeed?.item || `${simCategory} Requirement`;
    let distance = matchingNeed?.lat ? "1.2 km" : "1.5 km";
    let score = 92;
    let co2 = (simQty * 0.45).toFixed(1);

    if (simCategory === 'Food') {
      score = 95;
    } else if (simCategory === 'Books') {
      score = 88;
    } else if (simCategory === 'Medical') {
      score = 91;
    }

    let finalScore = score;
    if (simCondition === 'Good') finalScore -= 5;
    if (simCondition === 'New') finalScore += 3;
    finalScore = Math.min(100, Math.max(70, finalScore));

    return { ngoName, distance, score: finalScore, co2, needItem };
  };

  const heroSimOutput = getHeroSimMatches();

  const getSimulationMatches = () => {
    const selectedCoord = LOCATION_COORDS[matchLocation] || LOCATION_COORDS.Indiranagar;
    
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
        (categoryFit * 0.35) + 
        (distanceScore * 0.25) + 
        (urgencyScore * 0.20) + 
        (freshnessScore * 0.20)
      );

      return {
        ngo,
        need,
        distance: distance.toFixed(1),
        score: totalScore,
      };
    });

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, 3);
  };

  const simulationResults = getSimulationMatches();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Vision & Action */}
            <div className="lg:col-span-7 space-y-8 text-left">
              
              {/* Value proposition Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Waste Non-Monetary Resource Exchange</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Bridge surplus resources directly to local <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2">non-profit needs.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                Donate Bridge eliminates cash middle-man friction. Connect surplus goods directly to verified NGO requirements with automated AI matching and end-to-end logistics tracking.
              </p>

              {/* Main Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  variant="primary"
                  onClick={() => navigate(isAuthenticated ? '/upload-donation' : '/auth')}
                  className="h-12 px-6 bg-[#2E5B3D] hover:bg-[#1E3B27] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" /> Upload Surplus Item
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => navigate('/discover')}
                  className="h-12 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4 text-slate-500" /> Explore Demand Map
                </Button>
              </div>

              {/* Tag Quick Filters */}
              <div className="pt-4 space-y-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Popular Resource Requests</p>
                <div className="flex flex-wrap gap-2">
                  {['Blankets', 'Dry Rations', 'Laptops', 'Medical Supplies'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 text-xs font-medium rounded-lg transition-all cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Hero Interactive Card */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden text-left">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-bold text-slate-900 text-sm">Live Humanitarian Network</h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    REAL-TIME
                  </span>
                </div>

                {/* Urgent Community Demands Feed */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Urgent Local Non-Profit Requirements</p>
                  
                  {loadingNeeds ? (
                    <div className="py-8 text-center bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">Loading network requirements...</p>
                    </div>
                  ) : needs.filter(n => (n.status === 'ACTIVE' || !n.status) && (n.quantity - (n.fulfilledQuantity || 0)) > 0).length > 0 ? (
                    needs.filter(n => (n.status === 'ACTIVE' || !n.status) && (n.quantity - (n.fulfilledQuantity || 0)) > 0).slice(0, 3).map((need) => (
                      <div key={need.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-emerald-600/30 transition-all flex items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {need.category}
                            </span>
                            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded uppercase">
                              {need.urgency || 'High'} Need
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-xs truncate">{need.item}</h4>
                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" />
                            {need.ngoName || 'Local Partner NGO'} &bull; Qty: {need.quantity}
                          </p>
                        </div>
                        
                        <Button
                          variant="primary"
                          onClick={() => navigate(`/upload-donation?category=${encodeURIComponent(need.category)}&item=${encodeURIComponent(need.item)}&ngo_id=${need.ngoId || need.ngo_id || ''}`)}
                          className="bg-[#2E5B3D] hover:bg-[#1E3B27] text-white text-[11px] h-8 px-3 rounded-lg font-bold shrink-0"
                        >
                          Fulfill
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                      <HeartHandshake className="w-7 h-7 text-slate-400 mx-auto mb-1" />
                      <p className="font-bold text-slate-700 text-xs">No urgent requirements broadcasted yet</p>
                      <p className="text-[11px] text-slate-500">NGO partners will broadcast live requirements here in real time.</p>
                    </div>
                  )}
                </div>

                {/* Quick Simulator Output Strip */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Instant Impact Rating
                    </span>
                    <span className="font-mono font-bold text-emerald-800">96% Accuracy</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-emerald-200/50">
                    <span>Est. Beneficiaries: <strong className="text-slate-900">~{simQty * 2} people</strong></span>
                    <span>CO₂ Saved: <strong className="text-emerald-700">{heroSimOutput.co2} kg</strong></span>
                  </div>
                </div>

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
                                <h5 className="text-xs font-bold text-[#1E2923] truncate">{res.ngo?.name || res.ngoName || 'NGO Partner'}</h5>
                                <span className="text-[10px] bg-[#EBF3EE] text-[#2E5B3D] border border-[#2E5B3D]/15 font-semibold px-2 py-0.5 rounded-full">
                                  {res.distance} km away
                                </span>
                              </div>
                              <p className="text-xs text-[#64748B] truncate font-medium">Need: {res.need?.quantity || 1}x {res.need?.item || 'Items'}</p>
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
            {needs.filter(n => (n.status === 'ACTIVE' || !n.status) && (n.quantity - (n.fulfilledQuantity || 0)) > 0).length > 0 ? needs.filter(n => (n.status === 'ACTIVE' || !n.status) && (n.quantity - (n.fulfilledQuantity || 0)) > 0).slice(0, 3).map((need) => {
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