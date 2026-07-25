import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useRealDB } from '../hooks/useRealDB';
import { 
  Search, ShieldCheck, MapPin, Heart, ArrowRight, Star, Award, Leaf, 
  Users, ChevronRight, Check, BookOpen, Clock, Gift, Activity, ArrowUpRight,
  TrendingUp, Sparkles, Building, Calendar, Info, Sliders, Truck, AlertTriangle,
  Plus, Minus
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
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] selection:bg-emerald-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-16 lg:pt-24 lg:pb-20 bg-[#F5F1E8] text-stone-900 border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-[#E8F3EC] text-[#4A7C59] border border-[#4A7C59]/20 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#4A7C59]" /> National Humanitarian Match Ledger
            </span>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-stone-900 leading-[1.15] tracking-tight">
              Bridging Donors &amp; NGOs <br />
              <span className="text-[#4A7C59]">One Need at a Time.</span>
            </h1>
            
            <p className="text-base lg:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Coordinate physical item donation logistics directly. No cash escrow leakages. Vetted logistics verification, real-time georadial mapping, and instant 80G tax invoice emissions.
            </p>

            <div className="max-w-xl mx-auto space-y-3 pt-2">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-white border border-stone-300 rounded-lg p-1.5 shadow-sm focus-within:border-[#4A7C59] focus-within:ring-2 focus-within:ring-[#4A7C59]/20 transition-all">
                <div className="flex items-center pl-3 pr-2 text-stone-400 shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  placeholder="Search Registry (e.g. Blankets, Medicine, Textbooks)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm text-stone-900 placeholder-stone-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 !min-h-0 !h-auto !bg-transparent !border-none !shadow-none !py-2 !px-1"
                />
                <Button
                  type="submit"
                  className="bg-[#4A7C59] hover:bg-[#3B6647] text-white font-medium text-sm py-2 px-5 rounded-md shrink-0 shadow-xs transition-all"
                >
                  Search
                </Button>
              </form>

              <div className="flex flex-wrap justify-center gap-3 text-xs text-stone-500 font-medium">
                <span className="text-stone-400">Popular:</span>
                {['Blankets', 'Dry Rations', 'Laptops', 'Gloves'].map((tag) => (
                  <button 
                    key={tag} 
                    onClick={() => handleTagClick(tag)}
                    className="hover:text-[#4A7C59] hover:underline transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch pt-4">
            
            {/* Left Console */}
            <div className="lg:col-span-6 bg-white border border-stone-200 rounded-xl p-6 lg:p-7 flex flex-col justify-between shadow-sm text-left">
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-stone-200">
                  <h3 className="text-xs font-semibold text-[#4A7C59] uppercase tracking-wider flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#4A7C59]" /> Donor Dispatch Center
                  </h3>
                  <span className="text-xs bg-[#E8F3EC] text-[#4A7C59] border border-[#4A7C59]/20 font-medium py-0.5 px-2.5 rounded-md">
                    Simulate Input
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="text-xs font-medium text-stone-600 uppercase tracking-wider">Item Category</label>
                    <select 
                      value={simCategory}
                      onChange={(e) => setSimCategory(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 text-stone-900 rounded-md text-sm font-medium focus:outline-none focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59] !min-h-0 !h-auto transition-all"
                    >
                      <option value="Food">Food / Staples</option>
                      <option value="Books">Books / Learning Kits</option>
                      <option value="Clothing">Clothing / Blankets</option>
                      <option value="Medical">Medical Supplies</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-600 uppercase tracking-wider">Item Condition</label>
                    <select 
                      value={simCondition}
                      onChange={(e) => setSimCondition(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 bg-stone-50 border border-stone-300 text-stone-900 rounded-md text-sm font-medium focus:outline-none focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59] !min-h-0 !h-auto transition-all"
                    >
                      <option value="New">Brand New</option>
                      <option value="Like New">Like New / Cleaned</option>
                      <option value="Good">Gently Used</option>
                    </select>
                  </div>
                </div>

                <div className="text-left bg-stone-50 p-3.5 rounded-lg border border-stone-200">
                  <label className="text-xs font-medium text-stone-600 uppercase tracking-wider block mb-2">Quantity to Pledge</label>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSimQty(Math.max(1, simQty - 5))}
                      className="w-9 h-9 rounded-md bg-white border border-stone-300 flex items-center justify-center hover:bg-stone-100 transition-colors cursor-pointer shadow-xs"
                    >
                      <Minus className="w-4 h-4 text-stone-600" />
                    </button>
                    <span className="text-2xl font-bold text-stone-900 w-14 text-center">{simQty}</span>
                    <button 
                      onClick={() => setSimQty(simQty + 5)}
                      className="w-9 h-9 rounded-md bg-white border border-stone-300 flex items-center justify-center hover:bg-stone-100 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4 text-stone-600" />
                    </button>
                    <span className="text-xs text-stone-500 font-medium ml-2">units matching need list</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#E8F3EC] border border-[#4A7C59]/20 rounded-lg text-left space-y-3">
                <p className="text-xs font-semibold text-[#4A7C59] uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Live Match Engine Output
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-stone-500 block font-medium uppercase mb-0.5">Partner NGO</span>
                    <span className="font-semibold text-stone-900">{heroSimOutput.ngoName}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block font-medium uppercase mb-0.5">Radius</span>
                    <span className="font-semibold text-stone-900">{heroSimOutput.distance} (Local Match)</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block font-medium uppercase mb-0.5">Target Need</span>
                    <span className="font-semibold text-stone-900">{simQty}x {heroSimOutput.needItem}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block font-medium uppercase mb-0.5">Match Score</span>
                    <span className="font-bold text-[#4A7C59] text-base">{heroSimOutput.score}%</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#4A7C59]/20 flex justify-between items-center text-xs">
                  <span className="text-stone-700 font-medium">Carbon saved: <strong className="text-[#4A7C59]">{heroSimOutput.co2} kg CO2</strong></span>
                  <Button
                    className="bg-[#4A7C59] hover:bg-[#3B6647] text-white font-medium py-2 px-4 rounded-md shadow-xs transition-all"
                    onClick={() => navigate(isAuthenticated ? '/donor' : '/auth')}
                  >
                    Pledge Dispatch
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Console */}
            <div className="lg:col-span-6 bg-white border border-stone-200 rounded-xl p-6 lg:p-7 flex flex-col justify-between shadow-sm text-left">
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-stone-200">
                  <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#4A7C59]" /> Live Matching Ledger
                  </h3>
                  <span className="w-2.5 h-2.5 bg-[#4A7C59] rounded-full" />
                </div>

                <div className="space-y-3">
                  {ledgerActivity.length > 0 ? (
                    ledgerActivity.map((donation) => (
                      <div key={donation.id} className="p-3.5 bg-stone-50 border border-stone-200 hover:border-stone-300 rounded-lg flex items-center justify-between gap-4 text-left transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                            donation.status === 'DELIVERED' ? 'bg-[#E8F3EC] text-[#4A7C59]' :
                            donation.status === 'MATCHED' ? 'bg-blue-50 text-blue-700' : 'bg-stone-200 text-stone-600'
                          }`}>
                            {donation.status === 'DELIVERED' ? <Check className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-white truncate">{donation.itemName || `${donation.quantity}x ${donation.category}`}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${
                                donation.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                donation.status === 'MATCHED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-700 text-slate-300'
                              }`}>
                                {donation.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate font-medium">
                              Recipient: {donation.matchedNgoId === 'ngo-1' ? 'Hope Foundation' : donation.matchedNgoId === 'ngo-3' ? 'Care Society' : 'Feeding Hand'} &bull; {donation.location.address}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-slate-500 font-bold block mb-1">LEDGER ID</span>
                          <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700">{donation.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-xs text-stone-500 font-medium bg-stone-50 rounded-lg border border-stone-200">
                      No live donation dispatches logged yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-200 flex justify-between items-center text-xs font-semibold text-stone-600">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#4A7C59]" /> SECURE HANDSHAKES
                </span>
                <span className="text-[#4A7C59] bg-[#E8F3EC] px-2.5 py-1 rounded-md border border-[#4A7C59]/20">99.8% DELIVERY SUCCESS RATE</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sandbox Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/50 text-slate-700 text-sm font-bold uppercase tracking-wider backdrop-blur-sm border border-slate-300/50">
              <Sparkles className="w-4 h-4 text-slate-600" /> Interactive Sandbox
            </span>
            <h2 className="text-3xl lg:text-5xl font-display font-black text-slate-900 tracking-tight">
              Simulate Match Integrity &amp; Eco-Impact
            </h2>
            <p className="text-sm lg:text-base text-slate-500 leading-relaxed font-medium">
              Explore how our georadial algorithms coordinate physical deliveries, reduce CO2, and track audit ledgers in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            
            {/* Tab Selectors */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <button
                onClick={() => setSandboxTab('match')}
                className={`w-full p-5 rounded-2xl text-left border transition-all duration-300 flex gap-5 items-center ${
                  sandboxTab === 'match'
                    ? 'bg-white border-emerald-200 shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-500/20 scale-[1.02]'
                    : 'bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-colors ${
                  sandboxTab === 'match' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Smart-Match Matcher</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">Select a category and neighborhood to compute real proximity fit ratings.</p>
                </div>
              </button>

              <button
                onClick={() => setSandboxTab('impact')}
                className={`w-full p-5 rounded-2xl text-left border transition-all duration-300 flex gap-5 items-center ${
                  sandboxTab === 'impact'
                    ? 'bg-white border-emerald-200 shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-500/20 scale-[1.02]'
                    : 'bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-colors ${
                  sandboxTab === 'impact' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Eco-Impact Estimator</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">Measure the beneficiary reach and shipping CO2 carbon offsets saved.</p>
                </div>
              </button>

              <button
                onClick={() => setSandboxTab('tracker')}
                className={`w-full p-5 rounded-2xl text-left border transition-all duration-300 flex gap-5 items-center ${
                  sandboxTab === 'tracker'
                    ? 'bg-white border-emerald-200 shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-500/20 scale-[1.02]'
                    : 'bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-colors ${
                  sandboxTab === 'tracker' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Logistics Pathway Tracker</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">Step through the physical audit compliance lifecycle steps.</p>
                </div>
              </button>
            </div>

            {/* Widget Container */}
            <div className="lg:col-span-7">
              <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-2xl shadow-slate-200/50 h-full flex flex-col justify-between text-left relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
                
                {/* 1. MATCH SIMULATOR WIDGET */}
                {sandboxTab === 'match' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 h-full flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-emerald-500" /> Smart Match Simulator
                        </h4>
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100 font-bold tracking-wide">Category: 40% | Distance: 30%</span>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mt-6">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Category to Donate</label>
                          <select 
                            value={matchCategory} 
                            onChange={(e) => setMatchCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                          >
                            <option value="Food">Food &amp; Staple Rations</option>
                            <option value="Books">Books &amp; Learning Kits</option>
                            <option value="Clothing">Warm Clothes &amp; Blankets</option>
                            <option value="Medical Equipment">Medical Supplies</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Donor Location</label>
                          <select 
                            value={matchLocation} 
                            onChange={(e) => setMatchLocation(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                          >
                            <option value="Indiranagar">Indiranagar, Bengaluru</option>
                            <option value="Koramangala">Koramangala, Bengaluru</option>
                            <option value="Jayanagar">Jayanagar, Bengaluru</option>
                            <option value="MG Road">MG Road, Bengaluru</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 my-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                      <p className="text-xs font-black text-slate-400 tracking-widest uppercase mb-2">Recommended Destinations</p>
                      
                      {simulationResults.length > 0 ? (
                        simulationResults.map((res, i) => (
                          <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4 hover:border-emerald-300 hover:shadow-md transition-all group">
                            <div className="min-w-0">
                              <div className="flex items-center gap-3 mb-1.5">
                                <h5 className="text-base font-black text-slate-900 truncate">{res.ngo.name}</h5>
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {res.distance} km away
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 truncate font-medium">Need: {res.need.quantity}x {res.need.item}</p>
                            </div>

                            <div className="flex items-center gap-5 shrink-0">
                              <div className="text-right">
                                <span className="text-lg font-black text-emerald-600">{res.score}%</span>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Match Score</p>
                              </div>
                              <Button 
                                className="bg-slate-900 hover:bg-emerald-500 text-white font-bold py-2 px-5 rounded-xl transition-all shadow-md group-hover:shadow-emerald-500/20"
                                onClick={() => navigate('/auth')}
                              >
                                Pledge
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-medium">
                          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                          <span>No urgent demands logged in the database matching {matchCategory} currently. Select another category.</span>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] font-bold text-slate-400 pt-4 border-t border-slate-100 uppercase tracking-widest text-center">
                      Dynamic weighting: Category Fit (40%) + Distance (30%) + Urgency (20%) + Freshness (10%)
                    </div>
                  </motion.div>
                )}

                {/* 2. ECO-IMPACT ESTIMATOR WIDGET */}
                {sandboxTab === 'impact' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 h-full flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-emerald-500" /> Eco-Impact Estimator
                        </h4>
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100 font-bold tracking-wide">100% Non-Monetary</span>
                      </div>

                      <div className="space-y-6 mt-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Item Category</label>
                            <select 
                              value={impactCategory} 
                              onChange={(e) => setImpactCategory(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                            >
                              <option value="Food">Staple Rations</option>
                              <option value="Books">Textbooks &amp; Learning Tools</option>
                              <option value="Clothing">Warm Clothes &amp; Bedding</option>
                              <option value="Medical">Medical Disposables</option>
                            </select>
                          </div>
                          <div className="text-right">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Item Quantity</label>
                            <p className="text-3xl font-black text-emerald-500 font-display mt-1 tracking-tight">{impactQuantity} <span className="text-sm text-slate-400 font-bold uppercase tracking-wider ml-1">Units</span></p>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <input 
                            type="range" 
                            min="5" 
                            max="500" 
                            step="5"
                            value={impactQuantity} 
                            onChange={(e) => setImpactQuantity(e.target.value)}
                            className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                          />
                          <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mt-3">
                            <span>5 min</span>
                            <span>500 max</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 my-6">
                      <div className="p-5 bg-white border border-slate-200 rounded-2xl text-center shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Beneficiaries</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{impactMetrics.beneficiaries}</p>
                        <p className="text-xs font-bold text-emerald-600 mt-1">{impactMetrics.beneficiaryLabel}</p>
                      </div>

                      <div className="p-5 bg-white border border-slate-200 rounded-2xl text-center shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">CO2 Offset</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{impactMetrics.co2} <span className="text-lg text-slate-400">kg</span></p>
                        <p className="text-xs font-bold text-blue-600 mt-1">Greenhouse Gas saved</p>
                      </div>

                      <div className="p-5 bg-slate-900 rounded-2xl text-center shadow-lg shadow-slate-900/20">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Process Speed</p>
                        <p className="text-2xl font-black text-white tracking-tight mt-1">Local Match</p>
                        <p className="text-xs font-bold text-emerald-400 mt-2">&lt; 3h pickup window</p>
                      </div>
                    </div>

                    <div className="text-xs font-medium text-slate-500 leading-relaxed border-t border-slate-100 pt-4 text-center px-4">
                      Eco-Impact rates compiled using local radial courier dispatches. Zero packing wrappers and sorting depots reduces carbon waste footprint by 75% per batch.
                    </div>
                  </motion.div>
                )}

                {/* 3. LOGISTICS PATHWAY TRACKER WIDGET */}
                {sandboxTab === 'tracker' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 h-full flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Truck className="w-4 h-4 text-emerald-500" /> Fulfillment Lifecycle Tracker
                        </h4>
                        <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 font-bold tracking-wide">Secure Delivery Ledger</span>
                      </div>

                      <div className="grid grid-cols-4 gap-3 mt-6">
                        {TRACKER_STAGES.map((st, i) => (
                          <button
                            key={i}
                            onClick={() => setTrackerStep(i)}
                            className={`p-3 rounded-xl text-center border transition-all duration-200 flex flex-col items-center gap-2 ${
                              trackerStep === i
                                ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <p className="text-xs font-bold truncate w-full">{st.title.split(' ')[1] || st.title}</p>
                            <span className={`inline-block w-2 h-2 rounded-full ${
                              st.status === 'COMPLETED' ? 'bg-emerald-500' :
                              st.status === 'ACTIVE' ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-slate-300'
                            }`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-white border border-slate-200 rounded-3xl text-left my-6 space-y-4 flex-grow flex flex-col justify-center shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">STAGE DETAILS ({trackerStep + 1}/4)</span>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{TRACKER_STAGES[trackerStep].time}</span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">{TRACKER_STAGES[trackerStep].title}</h4>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                        <p className="text-sm font-medium text-slate-600 leading-relaxed font-mono">
                          {TRACKER_STAGES[trackerStep].log}
                        </p>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 pt-4 border-t border-slate-100 flex justify-between items-center font-bold uppercase tracking-widest">
                      <span>Secure Match Ledger Signature</span>
                      <span className="text-emerald-500 bg-emerald-50/50 px-2 py-1 rounded border border-emerald-100">ECDSA-SHA256 SECURED</span>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Projects and Campaigns Section */}
      <section className="py-24 bg-white border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <Building className="w-3.5 h-3.5" /> Active Campaigns
              </span>
              <h2 className="text-4xl lg:text-5xl font-display font-black text-slate-900 tracking-tight">
                Featured NGO Projects
              </h2>
              <p className="text-base text-slate-500 max-w-xl font-medium leading-relaxed">
                 Vetted campaigns posting urgent, specific physical needs. Directly pledge items to fund their completion.
              </p>
            </div>
            <Link 
              to="/discover" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 transition-all"
            >
              Browse all needs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {needs.length > 0 ? needs.slice(0, 3).map((need) => {
              const target = need.quantity || 1;
              const received = need.fulfilledQuantity || 0;
              const progress = Math.min(100, Math.round((received / target) * 100));
              const image = CATEGORY_IMAGES[need.category] || "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600";
              return (
                <div key={need.id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden flex flex-col justify-between shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group">
                  <div>
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                      <img 
                        src={image} 
                        alt={need.item} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${
                          need.urgency === 'High' ? 'bg-red-500/90 text-white border border-red-400/50' : 'bg-amber-500/90 text-white border border-amber-400/50'
                        }`}>
                          {need.urgency} Priority
                        </span>
                        <span className="px-3 py-1 bg-slate-900/80 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md border border-slate-700/50">
                          <MapPin className="w-3 h-3 text-emerald-400" /> Local Hub
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-left">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 shadow-sm">{need.category}</p>
                        <h4 className="text-white font-display font-black text-xl truncate">{need.ngoName}</h4>
                      </div>
                    </div>

                    <div className="p-6 text-left space-y-5">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-emerald-600 transition-colors">
                          {need.item} Drive
                        </h3>
                        <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                          {need.description || `Providing ${need.item} to support local community members in need.`}
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matching Progress</span>
                          <span className="font-black text-emerald-600 text-sm">{progress}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/60">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative" 
                            style={{ width: `${progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 font-medium pt-1">
                          <span>Received: <strong className="text-slate-800">{received}</strong></span>
                          <span>Target: <strong className="text-slate-800">{target} {need.item}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-2">
                    <Button 
                      className="w-full h-12 bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group-hover:shadow-emerald-500/25"
                      onClick={() => navigate(`/ngo/${need.ngoId}`)}
                    >
                      Pledge Items <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-3 text-center py-16 bg-slate-50 rounded-[2rem] border border-slate-200 border-dashed">
                <p className="text-slate-500 font-medium">No active needs found at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Process Lifecycle Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-5 space-y-8 text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Audited Logistics
              </span>
              <h2 className="text-4xl lg:text-5xl font-display font-black text-white leading-[1.1] tracking-tight">
                How We Maintain Direct Aid Integrity
              </h2>
              <p className="text-base text-slate-400 leading-relaxed font-medium">
                By focusing exclusively on physical supplies and cutting out monetary routing, DonateBridge ensures that every single resource item connects straight to school classrooms, community kitchens, and disaster response teams.
              </p>
              
              <div className="space-y-5 pt-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Zero Financial Escrows</h4>
                    <p className="text-sm text-slate-400 mt-1 font-medium leading-relaxed">Direct coordinator pickup. There are no platform commission fees.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Georadial Optimization</h4>
                    <p className="text-sm text-slate-400 mt-1 font-medium leading-relaxed">Matches are ranked using logistical proximity to minimize local transport costs.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  <div key={idx} className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-3xl relative text-left flex flex-col justify-between min-h-[180px] hover:bg-slate-800/80 hover:border-slate-600 transition-all duration-300 backdrop-blur-sm group">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-4xl font-display font-black text-white/5 group-hover:text-white/10 transition-colors">{item.step}</span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-8">
            <Heart className="w-10 h-10" />
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-display font-black text-slate-900 leading-[1.1] tracking-tight">
            Ready to bridge needs in your neighborhood?
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Create your account today. Log in as a donor to submit item listings, or register your NGO credentials to post supply campaign requests.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Button
              className="bg-slate-900 text-white hover:bg-emerald-600 border-none px-8 h-14 rounded-2xl font-bold text-base shadow-xl shadow-slate-900/10 hover:shadow-emerald-500/25 transition-all"
              onClick={() => navigate('/auth?tab=register')}
            >
              Register Account
            </Button>
            <Button
              variant="outline"
              className="bg-white text-slate-700 hover:bg-slate-50 border-slate-200 px-8 h-14 rounded-2xl font-bold text-base shadow-sm hover:border-slate-300 transition-all"
              onClick={() => navigate('/discover')}
            >
              Browse Active Demands
            </Button>
          </div>

          <div className="pt-12 mt-12 border-t border-slate-200 max-w-md mx-auto">
            <form onSubmit={handleSubscribe} className="space-y-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Subscribe to local NGO campaign notifications
              </p>
              <div className="flex bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all">
                <input 
                  type="email"
                  placeholder="Enter your email address"
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  className="bg-transparent border-none text-sm text-slate-900 outline-none w-full px-4 py-2 placeholder-slate-400 focus:ring-0 focus:outline-none font-medium"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 shrink-0 transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
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