import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useMockDB } from '../hooks/useMockDB';
import { 
  Search, ShieldCheck, MapPin, Heart, ArrowRight, Star, Award, Leaf, 
  Users, ChevronRight, Check, BookOpen, Clock, Gift, Activity, ArrowUpRight,
  TrendingUp, Sparkles, Building, Calendar, Info, Sliders, Truck, AlertTriangle,
  Plus, Minus
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CAMPAIGNS = [
  {
    id: "camp-1",
    title: "Monsoon Shelter & Fleece Blanket Drive",
    ngoName: "Hope Foundation",
    ngoId: "ngo-1",
    category: "Clothing",
    item: "Blankets",
    target: 50,
    received: 38,
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600",
    description: "Providing high-thermal blankets and warm clothing for families in temporary settlement camps.",
    urgency: "High",
    location: "Richmond Town, Bengaluru",
    distance: "1.2 km"
  },
  {
    id: "camp-2",
    title: "Rural High School Science Kits & Books",
    ngoName: "Tech Academy",
    ngoId: "ngo-4",
    category: "Books",
    item: "Chemistry Lab Kits",
    target: 30,
    received: 13,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600",
    description: "Supplying physics and chemistry lab modules for class 8-10 students in government schools.",
    urgency: "Medium",
    location: "Koramangala, Bengaluru",
    distance: "4.5 km"
  },
  {
    id: "camp-3",
    title: "Staple Foods & Nutrition Relief Packets",
    ngoName: "Feeding Hand",
    ngoId: "ngo-2",
    category: "Food",
    item: "Canned Food",
    target: 200,
    received: 180,
    image: "https://images.unsplash.com/photo-1599059813005-11265ba4b2e9?auto=format&fit=crop&q=80&w=600",
    description: "Distributing dry rations, canned meals, and infant cereals to local community shelter kitchens.",
    urgency: "High",
    location: "Indiranagar, Bengaluru",
    distance: "0.8 km"
  }
];

const MOCK_COORDS = {
  Koramangala: { lat: 12.9340, lng: 77.6100, address: "Koramangala, Bengaluru" },
  Indiranagar: { lat: 12.9801, lng: 77.6012, address: "Indiranagar, Bengaluru" },
  Jayanagar: { lat: 12.9634, lng: 77.5878, address: "Jayanagar, Bengaluru" },
  'MG Road': { lat: 12.9716, lng: 77.5946, address: "MG Road, Bengaluru" }
};

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const db = useMockDB();
  const navigate = useNavigate();
  const [emailSub, setEmailSub] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Immersive Hero Simulator States
  const [simCategory, setSimCategory] = useState('Food');
  const [simQty, setSimQty] = useState(25);
  const [simCondition, setSimCondition] = useState('Like New');

  // Interactive Sandbox state
  const [sandboxTab, setSandboxTab] = useState('match'); // 'match', 'impact', 'tracker'
  
  // Match Simulator state
  const [matchCategory, setMatchCategory] = useState('Books');
  const [matchLocation, setMatchLocation] = useState('Indiranagar');
  
  // Impact Estimator state
  const [impactCategory, setImpactCategory] = useState('Food');
  const [impactQuantity, setImpactQuantity] = useState(100);
  
  // Stepper Tracker state
  const [trackerStep, setTrackerStep] = useState(2); // 0, 1, 2, 3

  // Dynamic Ledger feed
  const ledgerActivity = db.donations
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

  // Live dynamic routing output for the hero simulator
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

    // Modify score slightly based on condition
    let finalScore = score;
    if (simCondition === 'Good') finalScore -= 5;
    if (simCondition === 'New') finalScore += 3;
    finalScore = Math.min(100, finalScore);

    return { ngoName, distance, score: finalScore, co2, needItem };
  };

  const heroSimOutput = getHeroSimMatches();

  // Smart Match simulation calculation using Haversine formula
  const getSimulationMatches = () => {
    const selectedCoord = MOCK_COORDS[matchLocation] || MOCK_COORDS.Indiranagar;
    
    // Normalize user categories to database categories
    let dbCategory = matchCategory;
    if (matchCategory === 'Medical Equipment') dbCategory = 'Medical';
    if (matchCategory === 'Clothes') dbCategory = 'Clothing';

    const candidateNeeds = db.needs.filter(n => n.category.toLowerCase() === dbCategory.toLowerCase());
    
    const matches = candidateNeeds.map(need => {
      const ngo = db.ngos.find(o => o.id === need.ngoId) || { 
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
        breakdown: {
          category: Math.round(categoryFit * 0.40),
          distance: Math.round(distanceScore * 0.30),
          urgency: Math.round(urgencyScore * 0.20),
          freshness: Math.round(freshnessScore * 0.10)
        }
      };
    });
    
    return matches.sort((a, b) => b.score - a.score);
  };

  const simulationResults = getSimulationMatches();

  // Dynamic Impact values
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

  // Tracker stages
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* TOTALLY COMPLETED NEW HERO DESIGN: Integrated Command Center Console (LIGHT THEME) */}
      <section className="relative py-12 lg:py-16 bg-[#F8FAFC] text-slate-900 overflow-hidden border-b border-slate-200/80">
        {/* Modern Grid & Soft Ambient Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          
          {/* Top Headline and Wide Search Bar (Centered, no cramp/overlaps) */}
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" /> Official National Humanitarian Match Ledger
            </span>
            <h1 className="text-4xl lg:text-6xl font-display font-extrabold text-slate-900 leading-tight tracking-tight">
              Bridging Donors &amp; NGOs <br />
              <span className="text-primary">One Need at a Time.</span>
            </h1>
            <p className="text-sm lg:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Coordinate physical item donation logistics directly. No cash escrow leakages. Vetted logistics verification, real-time georadial mapping, and instant 80G tax invoice emissions.
            </p>

            {/* Immersive Wide Search Console */}
            <div className="max-w-xl mx-auto space-y-3">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-premium-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <div className="flex items-center pl-3.5 pr-2.5 text-slate-400 shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  placeholder="Search Registry (e.g. Blankets, Medicine, Textbooks)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none focus:outline-none !min-h-0 !h-auto !bg-transparent !border-none !shadow-none !py-2 !px-0 !focus:ring-0"
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-primary hover:bg-primary-hover text-white font-bold text-xs py-2 px-5 rounded-xl shrink-0 shadow-none border-none"
                >
                  Search Registry
                </Button>
              </form>

              {/* Popular Tags */}
              <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider text-[10px] mt-0.5 mr-1 text-slate-400">Popular:</span>
                {['Blankets', 'Dry Rations', 'Laptops', 'Gloves'].map((tag) => (
                  <button 
                    key={tag} 
                    onClick={() => handleTagClick(tag)}
                    className="hover:text-primary hover:underline transition-colors font-medium cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Immersive Bridge Match Consoles (Side-by-Side Application Workspace) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
            
            {/* Left Console: Donor Dispatch Simulator (Interactive Input Hub) */}
            <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between shadow-premium-md text-left">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-primary" /> Donor Dispatch Center
                  </h3>
                  <span className="text-[9px] bg-slate-50 text-slate-500 border border-slate-200/50 font-mono font-bold py-0.5 px-2 rounded">
                    Simulate Input
                  </span>
                </div>

                {/* Form Simulation Inputs */}
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Category</label>
                    <select 
                      value={simCategory}
                      onChange={(e) => setSimCategory(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary !min-h-0 !h-auto !bg-slate-50"
                    >
                      <option value="Food">Food / Staples</option>
                      <option value="Books">Books / Learning Kits</option>
                      <option value="Clothing">Clothing / Blankets</option>
                      <option value="Medical">Medical Supplies</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Condition</label>
                    <select 
                      value={simCondition}
                      onChange={(e) => setSimCondition(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary !min-h-0 !h-auto !bg-slate-50"
                    >
                      <option value="New">Brand New</option>
                      <option value="Like New">Like New / Cleaned</option>
                      <option value="Good">Gently Used</option>
                    </select>
                  </div>
                </div>

                {/* Quantity Counter */}
                <div className="text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quantity to Pledge</label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button 
                      onClick={() => setSimQty(Math.max(1, simQty - 5))}
                      className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <span className="text-lg font-mono font-extrabold text-slate-800 w-12 text-center">{simQty}</span>
                    <button 
                      onClick={() => setSimQty(simQty + 5)}
                      className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-medium">units matching need list</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Matching Routing Output */}
              <div className="mt-6 p-4 bg-emerald-50/40 border border-emerald-150 rounded-2xl text-left space-y-3">
                <p className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">Live Match Engine Output:</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Recommended Partner NGO</span>
                    <span className="font-bold text-slate-800">{heroSimOutput.ngoName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Logistics Radius</span>
                    <span className="font-bold text-slate-800">{heroSimOutput.distance} (Local Match)</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[9px] uppercase font-bold">Target Need Registry</span>
                    <span className="font-bold text-slate-800">{simQty}x {heroSimOutput.needItem}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[9px] uppercase font-bold">Match Score Probability</span>
                    <span className="font-bold text-emerald-700 font-mono">{heroSimOutput.score}% Confidence</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-100/50 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Carbon saved: <strong>{heroSimOutput.co2} kg CO2</strong></span>
                  <Button
                    variant="primary"
                    className="bg-primary hover:bg-primary-hover text-white py-1.5 px-3 min-h-0 h-7 text-[10px] rounded-lg shadow-none border-none"
                    onClick={() => navigate(isAuthenticated ? '/donor' : '/auth')}
                  >
                    Pledge Dispatch
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Console: Live Matching Ledger Stream (Light theme display) */}
            <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between shadow-premium-md text-left">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-primary animate-pulse" /> Live Matching Ledger
                  </h3>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>

                {/* Ledger activities stream */}
                <div className="space-y-3">
                  {ledgerActivity.length > 0 ? (
                    ledgerActivity.map((donation, idx) => (
                      <div key={donation.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            donation.status === 'DELIVERED' ? 'bg-emerald-50 text-primary border border-emerald-100' :
                            donation.status === 'MATCHED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {donation.status === 'DELIVERED' ? <Check className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-800 truncate">{donation.itemName || `${donation.quantity}x ${donation.category}`}</p>
                              <span className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase tracking-wider ${
                                donation.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/40' :
                                donation.status === 'MATCHED' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200/40' : 'bg-slate-150 text-slate-500'
                              }`}>
                                {donation.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">
                              NGO Recipient: {donation.matchedNgoId === 'ngo-1' ? 'Hope Foundation' : donation.matchedNgoId === 'ngo-3' ? 'Care Society' : 'Feeding Hand'} &bull; {donation.location.address}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-mono text-slate-400 block">LEDGER ID</span>
                          <span className="text-[10px] font-mono font-bold text-slate-500">{donation.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No live donation dispatches logged yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Secure status bar */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> SECURE HANDSHAKES
                </span>
                <span className="font-bold text-emerald-700">99.8% DELIVERY SUCCESS RATE</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* INNOVATIVE AID SANDBOX SECTION: Interactive Matching, Impact Calculator, and Stepper Tracker */}
      <section className="py-16 bg-[#F1F5F9] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Section Header */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Sandbox
            </span>
            <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-ink">
              Simulate Match Integrity &amp; Eco-Impact
            </h2>
            <p className="text-xs lg:text-sm text-slate-500 leading-relaxed">
              Explore how our georadial algorithms coordinate physical deliveries, reduce CO2, and track audit ledgers in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Tab Selectors & Features explanation */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3 text-left">
                <button
                  onClick={() => setSandboxTab('match')}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex gap-4 items-start ${
                    sandboxTab === 'match'
                      ? 'bg-white border-primary/50 shadow-premium-md ring-2 ring-primary/5'
                      : 'bg-transparent border-slate-250 hover:bg-slate-100 hover:border-slate-350'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    sandboxTab === 'match' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-650'
                  }`}>
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs lg:text-sm font-bold text-ink">1. Smart-Match Matcher</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Select a category and neighborhood to compute real proximity fit ratings.</p>
                  </div>
                </button>

                <button
                  onClick={() => setSandboxTab('impact')}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex gap-4 items-start ${
                    sandboxTab === 'impact'
                      ? 'bg-white border-primary/50 shadow-premium-md ring-2 ring-primary/5'
                      : 'bg-transparent border-slate-250 hover:bg-slate-100 hover:border-slate-350'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    sandboxTab === 'impact' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-650'
                  }`}>
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs lg:text-sm font-bold text-ink">2. Eco-Impact Estimator</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Measure the beneficiary reach and shipping CO2 carbon offsets saved.</p>
                  </div>
                </button>

                <button
                  onClick={() => setSandboxTab('tracker')}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex gap-4 items-start ${
                    sandboxTab === 'tracker'
                      ? 'bg-white border-primary/50 shadow-premium-md ring-2 ring-primary/5'
                      : 'bg-transparent border-slate-250 hover:bg-slate-100 hover:border-slate-350'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    sandboxTab === 'tracker' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-650'
                  }`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs lg:text-sm font-bold text-ink">3. Logistics Pathway Tracker</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Step through the physical audit compliance lifecycle steps.</p>
                  </div>
                </button>
              </div>

              {/* Bottom Tip Callout (Prevents vertical spacing gap) */}
              <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl text-left flex gap-3 items-start">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  <strong>Did you know?</strong> By grouping dispatches georadially, we minimize courier carbon burn rates by up to 64% compared to long-distance postage.
                </p>
              </div>
            </div>

            {/* Right Column: Dynamic Interactive Widget Container (Styled like iPad interface) */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-premium-lg h-full flex flex-col justify-between text-left">
                
                {/* 1. MATCH SIMULATOR WIDGET */}
                {sandboxTab === 'match' && (
                  <div className="space-y-5 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Smart Match Simulator</h4>
                        <span className="text-[10px] text-primary font-bold">Category Weight: 40% | Distance: 30%</span>
                      </div>

                      {/* Select Grid */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Category to Donate</label>
                          <select 
                            value={matchCategory} 
                            onChange={(e) => setMatchCategory(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-ink focus:outline-none focus:border-primary !min-h-0 !h-auto !bg-slate-50"
                          >
                            <option value="Food">Food &amp; Staple Rations</option>
                            <option value="Books">Books &amp; Learning Kits</option>
                            <option value="Clothing">Warm Clothes &amp; Blankets</option>
                            <option value="Medical Equipment">Medical Supplies</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Donor Location</label>
                          <select 
                            value={matchLocation} 
                            onChange={(e) => setMatchLocation(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-ink focus:outline-none focus:border-primary !min-h-0 !h-auto !bg-slate-50"
                          >
                            <option value="Indiranagar">Indiranagar, Bengaluru</option>
                            <option value="Koramangala">Koramangala, Bengaluru</option>
                            <option value="Jayanagar">Jayanagar, Bengaluru</option>
                            <option value="MG Road">MG Road, Bengaluru</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Results lists */}
                    <div className="space-y-3 my-4 flex-grow overflow-y-auto max-h-[220px] pr-1">
                      <p className="text-[10px] font-mono text-slate-400 font-bold">RECOMMENDED NGO DESTINATIONS</p>
                      
                      {simulationResults.length > 0 ? (
                        simulationResults.map((res, i) => (
                          <div key={i} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h5 className="text-xs font-bold text-ink truncate">{res.ngo.name}</h5>
                                <span className="text-[8px] bg-emerald-50 text-primary border border-emerald-250 font-bold px-1 rounded">
                                  {res.distance} km away
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">Need: {res.need.quantity}x {res.need.item}</p>
                            </div>

                            {/* Score Ring indicator */}
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className="text-xs font-mono font-bold text-emerald-600">{res.score}%</span>
                                <p className="text-[8px] text-slate-400 font-medium font-mono uppercase tracking-wider">Match Score</p>
                              </div>
                              <Button 
                                variant="primary" 
                                className="px-3 py-1.5 min-h-0 h-7 text-[10px] font-bold rounded-md shadow-none"
                                onClick={() => navigate('/auth')}
                              >
                                Pledge
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-[11px]">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>No urgent demands logged in the database matching {matchCategory} currently. Select another category.</span>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                      Matches dynamically weighted based on: Category Fit (40%) + Distance (30%) + Urgency (20%) + Freshness (10%).
                    </div>
                  </div>
                )}

                {/* 2. ECO-IMPACT ESTIMATOR WIDGET */}
                {sandboxTab === 'impact' && (
                  <div className="space-y-5 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eco-Impact &amp; Beneficiary Estimator</h4>
                        <span className="text-[10px] text-primary font-bold">100% Non-Monetary Benefit</span>
                      </div>

                      {/* Inputs */}
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Item Category</label>
                            <select 
                              value={impactCategory} 
                              onChange={(e) => setImpactCategory(e.target.value)}
                              className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-ink focus:outline-none focus:border-primary !min-h-0 !h-auto !bg-slate-50"
                            >
                              <option value="Food">Staple Rations</option>
                              <option value="Books">Textbooks &amp; Learning Tools</option>
                              <option value="Clothing">Warm Clothes &amp; Bedding</option>
                              <option value="Medical">Medical Disposables</option>
                            </select>
                          </div>
                          <div className="text-right">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Item Quantity</label>
                            <p className="text-xl font-extrabold text-primary font-mono mt-1">{impactQuantity} <span className="text-xs text-slate-400 font-sans font-bold">Units</span></p>
                          </div>
                        </div>

                        {/* Slider */}
                        <div>
                          <input 
                            type="range" 
                            min="5" 
                            max="500" 
                            step="5"
                            value={impactQuantity} 
                            onChange={(e) => setImpactQuantity(e.target.value)}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
                            <span>5 min</span>
                            <span>500 max</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calculator stats card */}
                    <div className="grid grid-cols-3 gap-3 my-4">
                      <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center">
                        <p className="text-[9px] text-emerald-800 font-semibold uppercase tracking-wider">Beneficiaries</p>
                        <p className="text-lg font-black text-emerald-700 font-mono mt-1">{impactMetrics.beneficiaries}</p>
                        <p className="text-[9px] text-emerald-600 mt-0.5">{impactMetrics.beneficiaryLabel}</p>
                      </div>

                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-center">
                        <p className="text-[9px] text-blue-800 font-semibold uppercase tracking-wider">CO2 Offset</p>
                        <p className="text-lg font-black text-blue-700 font-mono mt-1">{impactMetrics.co2} kg</p>
                        <p className="text-[9px] text-blue-600 mt-0.5">Greenhouse Gas saved</p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center">
                        <p className="text-[9px] text-slate-800 font-semibold uppercase tracking-wider">Process Speed</p>
                        <p className="text-lg font-black text-ink font-mono mt-1">Local Match</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">&lt; 3h pickup window</p>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-2">
                      Eco-Impact rates compiled using local radial courier dispatches. Zero packing wrappers and sorting depots reduces carbon waste footprint by 75% per batch.
                    </div>
                  </div>
                )}

                {/* 3. LOGISTICS PATHWAY TRACKER WIDGET */}
                {sandboxTab === 'tracker' && (
                  <div className="space-y-4 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fulfillment Lifecycle Tracker</h4>
                        <span className="text-[10px] text-primary font-bold">Secure Delivery Ledger</span>
                      </div>

                      {/* Interactive Horizontal Steps */}
                      <div className="grid grid-cols-4 gap-2 mt-4">
                        {TRACKER_STAGES.map((st, i) => (
                          <button
                            key={i}
                            onClick={() => setTrackerStep(i)}
                            className={`p-2 rounded-lg text-center border transition-all ${
                              trackerStep === i
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
                            }`}
                          >
                            <p className="text-[9px] font-bold truncate">{st.title.split(' ')[1] || st.title}</p>
                            <span className={`inline-block mt-1 w-1.5 h-1.5 rounded-full ${
                              st.status === 'COMPLETED' ? 'bg-emerald-500' :
                              st.status === 'ACTIVE' ? 'bg-indigo-400 animate-pulse' : 'bg-slate-350'
                            }`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step details panel */}
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-left my-3 space-y-2 flex-grow flex flex-col justify-center">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">STAGE DETAILS ({trackerStep + 1}/4)</span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{TRACKER_STAGES[trackerStep].time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-ink">{TRACKER_STAGES[trackerStep].title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-mono bg-white p-2.5 rounded-xl border border-slate-150 shadow-inner">
                        &gt; {TRACKER_STAGES[trackerStep].log}
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between items-center">
                      <span>Secure Match Ledger Signature</span>
                      <span className="font-mono font-bold text-ink">ECDSA-SHA256 SECURED</span>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Projects and Campaigns Section: Real NGO Style with Progress Bars */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 text-left">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Active Campaigns
              </span>
              <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-ink">
                Featured NGO Projects &amp; Drives
              </h2>
              <p className="text-sm text-slate-500 max-w-xl">
                 Vetted campaigns posting urgent, specific physical needs. Directly pledge items to fund their completion.
              </p>
            </div>
            <Link 
              to="/discover" 
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover tracking-wide shrink-0 transition-colors"
            >
              Browse all 1,234 active needs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cards Grid: Filled layout, gorgeous borders, no vertical gaps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CAMPAIGNS.map((camp) => {
              const progress = Math.min(100, Math.round((camp.received / camp.target) * 100));
              return (
                <div key={camp.id} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden flex flex-col justify-between shadow-premium-sm hover:shadow-premium-md hover:border-slate-300 transition-all duration-200 group">
                  <div>
                    {/* Campaign Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img 
                        src={camp.image} 
                        alt={camp.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                          camp.urgency === 'High' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {camp.urgency} Priority
                        </span>
                        <span className="px-2 py-0.5 bg-slate-900/80 text-white rounded text-[10px] font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" /> {camp.distance}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <p className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider font-bold">{camp.category}</p>
                        <h4 className="text-white font-bold text-sm truncate mt-0.5">{camp.ngoName}</h4>
                      </div>
                    </div>

                    {/* Campaign Info */}
                    <div className="p-5 text-left space-y-3.5">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-ink leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                          {camp.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {camp.description}
                        </p>
                      </div>

                      {/* Progress Bar Component */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-medium">Matching Progress</span>
                          <span className="font-mono font-bold text-ink">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-0.5">
                          <span>Received: <strong>{camp.received}</strong></span>
                          <span>Target: <strong>{camp.target} {camp.item}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Updated 2h ago
                    </span>
                    <Button 
                      variant="primary" 
                      className="px-4 py-2 min-h-0 h-9 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1.5 shadow-none"
                      onClick={() => navigate(`/ngo/${camp.ngoId}`)}
                    >
                      Pledge Items <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Lifecycle & Timeline Section: Clean, dense layout, no gaps */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Audited Logistics
              </span>
              <h2 className="text-3xl font-display font-extrabold text-ink leading-tight">
                How We Maintain Direct Aid Integrity
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                By focusing exclusively on physical supplies and cutting out monetary routing, DonateBridge ensures that every single resource item connects straight to school classrooms, community kitchens, and disaster response teams.
              </p>
              
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Zero Financial Escrows</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Direct coordinator pickup. There are no platform commission fees.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Georadial Optimization</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Matches are ranked using logistical proximity to minimize local transport costs.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Path Column */}
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
                  title: 'Physical Audit Approval', 
                  desc: 'System admins audit conditions to ensure item compliance prior to matching.',
                  icon: ShieldCheck 
                },
                { 
                  step: '04', 
                  title: 'Fulfillment & Invoice', 
                  desc: 'Donor and NGO coordinate pickup via direct chat. Complete logs emit signed 80G tax forms.',
                  icon: FileInvoice 
                }
              ].map((item, idx) => {
                const IconComponent = item.icon || Award;
                return (
                  <div key={idx} className="p-5 bg-white border border-slate-200/60 rounded-2xl relative text-left flex flex-col justify-between min-h-[140px] hover:border-slate-300 transition-all shadow-premium-sm">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-primary flex items-center justify-center">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-2xl font-display font-extrabold text-primary/15">{item.step}</span>
                      </div>
                      <h3 className="font-display font-bold text-xs text-ink mt-3 mb-1">{item.title}</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Spotlighting Top Vetted NGOs - Essential "Real NGO" Community aspect */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Partner Organizations
            </span>
            <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-ink">
              Top Vetted Partner NGOs
            </h2>
            <p className="text-xs lg:text-sm text-slate-500">
              Our matching algorithms evaluate response rate, fulfillment verification success, and community ratings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {db.ngos.slice(0, 4).map((ngo) => (
              <div key={ngo.id} className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl text-left flex flex-col justify-between shadow-premium-sm hover:shadow-premium-md hover:border-slate-300 transition-all">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-slate-200/60 flex items-center justify-center shrink-0 font-bold text-primary font-mono text-sm uppercase">
                      {ngo.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-ink truncate">{ngo.name}</h3>
                      <p className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {ngo.address.split(',')[0]}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Trust Score</p>
                      <p className="text-xs font-bold text-emerald-600 font-mono mt-0.5">{ngo.trustScore || '85'}%</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Success Rate</p>
                      <p className="text-xs font-bold text-ink font-mono mt-0.5">{ngo.successRate || '90%'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Response: <strong>{ngo.responseTime || '24m'}</strong></span>
                  <Link 
                    to={`/ngo/${ngo.id}`} 
                    className="text-primary font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    View Needs <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Corporate Social Responsibility feedback */}
      <section className="py-16 bg-[#F8FAFC] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-2 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-ink">
              Trusted by Social Initiatives &amp; CSR Units
            </h2>
            <p className="text-xs lg:text-sm text-slate-500">
              Hear from regional logistics operators and corporate philanthropy leads.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                quote: "DonateBridge turned our chaotic blankets logistics timeline into a predictable, automated process. We coordinate requirements, and local donor matches handle dispatch within 24 hours.",
                author: "Elena Rostova",
                role: "Logistics Director, Hope Foundation",
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
              },
              {
                quote: "The direct chat matching and automated 80G tax certificates make physical CSR supply matching a breeze. We know exactly which municipal clinic received our gloves and monitors.",
                author: "Marcus Chen",
                role: "CSR Manager, Apex Corp",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-6 bg-white border border-slate-200/60 rounded-2xl text-left flex flex-col justify-between shadow-premium-sm hover:border-slate-350 transition-colors">
                <div className="space-y-3">
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-100">
                  <img 
                    src={t.avatar} 
                    alt={t.author} 
                    className="w-9 h-9 rounded-full object-cover border border-slate-200" 
                  />
                  <div>
                    <p className="text-xs font-bold text-ink">{t.author}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA & Campaign Subscriptions: Completely filled, beautiful visual accent */}
      <section className="py-16 bg-primary text-white relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.15),transparent_60%)]" />
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-white leading-tight">
            Ready to bridge needs in your neighborhood?
          </h2>
          <p className="text-xs lg:text-sm text-emerald-100 max-w-lg mx-auto leading-relaxed">
            Create your account today. Log in as a donor to submit item listings, or register your NGO credentials to post supply campaign requests.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button
              variant="secondary"
              className="bg-white text-primary hover:bg-slate-100 border-none px-6 h-12 rounded-xl font-bold text-sm shadow-premium-md"
              onClick={() => navigate('/auth?tab=register')}
            >
              Register Account
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 px-6 h-12 rounded-xl border border-white/20 font-bold text-sm"
              onClick={() => navigate('/discover')}
            >
              Browse Active Demands
            </Button>
          </div>

          {/* Subscriptions inline form */}
          <div className="pt-8 border-t border-emerald-600 max-w-md mx-auto">
            <form onSubmit={handleSubscribe} className="space-y-3">
              <p className="text-[11px] text-emerald-200 font-bold uppercase tracking-wider">
                Subscribe to local NGO campaign notifications
              </p>
              <div className="flex bg-white/10 border border-white/20 rounded-xl p-1 focus-within:border-white focus-within:ring-2 focus-within:ring-white/15">
                <input 
                  type="email"
                  placeholder="Enter your email address"
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  className="bg-transparent border-none text-xs text-white outline-none w-full px-3 py-2 placeholder-emerald-250 focus:ring-0 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-primary text-xs font-bold rounded-lg hover:bg-slate-100 shrink-0 transition-colors cursor-pointer"
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

// Simple fallback mock icons for FileInvoice if needed
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