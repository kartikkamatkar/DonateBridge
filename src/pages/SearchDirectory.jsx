import React, { useState, useEffect } from 'react';
import { useMockDB, getDistanceInKm, calculateMatchScore } from '../hooks/useMockDB';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeafletMap from '../components/ui/LeafletMap';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/GlobalStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MapPin, Grid, List, Map, Tag, Heart, Share2,
  AlertTriangle, Award, Clock, ArrowRight, BookOpen, Shirt, Utensils,
  Armchair, Laptop, Stethoscope, Scissors, Wind, X, Check, RotateCcw,
  Calendar, User, Eye, Sparkles, Building, CheckCircle2, ChevronRight,
  Truck, Info, HeartOff, SlidersHorizontal, ArrowUpDown, ExternalLink
} from 'lucide-react';

const CATEGORIES = [
  'Books', 'Clothes', 'Food', 'Furniture', 'Electronics',
  'Medical Equipment', 'School Supplies', 'Blankets', 'Sports Equipment'
];

const CATEGORY_ICONS = {
  'Books': BookOpen,
  'Clothes': Shirt,
  'Food': Utensils,
  'Furniture': Armchair,
  'Electronics': Laptop,
  'Medical Equipment': Stethoscope,
  'School Supplies': Scissors,
  'Blankets': Wind,
  'Sports Equipment': Award
};

const CONDITIONS = ['New', 'Like New', 'Good', 'Poor'];

// Bangalore hub simulated location coordinates
const USER_COORDS = [12.9716, 77.5946];

// Inline Confetti celebration animation helper
const Confetti = ({ active }) => {
  if (!active) return null;
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {Array.from({ length: 45 }).map((_, i) => {
        const left = Math.random() * 100;
        const size = Math.random() * 8 + 6;
        const delay = Math.random() * 1.5;
        const duration = Math.random() * 2 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = Math.random() > 0.5 ? 'rounded-full' : 'rounded-sm';
        return (
          <div
            key={i}
            className={`absolute top-0 ${shape}`}
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              opacity: 0.85,
              animation: `fall ${duration}s linear ${delay}s infinite`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(450px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default function SearchDirectory() {
  const db = useMockDB();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // NGO Specific contextual data
  const currentNgo = user?.role === 'ngo'
    ? db.ngos.find(n => n.email === user.email) || db.ngos[0]
    : null;

  // Search & Filters state
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [distanceRange, setDistanceRange] = useState(20);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'date' | 'quantity' | 'alphabetical'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Panels State
  const [selectedItem, setSelectedItem] = useState(null);
  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // Claim Form State
  const [claimQty, setClaimQty] = useState(1);
  const [claimLogistics, setClaimLogistics] = useState('courier'); // 'pickup' | 'courier'
  const [claimUseCase, setClaimUseCase] = useState('');

  // Wishlist State (synced with localStorage)
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('db_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('db_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Simulating small loading indicators on query and filter updates
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, [query, selectedCategory, distanceRange, selectedConditions, sortBy]);

  // Sync claim quantity default when opening an item modal
  useEffect(() => {
    if (selectedItem) {
      setClaimQty(selectedItem.quantity);
      setClaimSuccess(false);
      setClaimUseCase('');
      setClaimLogistics('courier');
    }
  }, [selectedItem]);

  // Filters out only verified (approved) donations
  const approvedDonations = db.donations.filter(d => d.status === 'VERIFIED');

  // Normalization logic for matching categories
  const normalizeCategory = (cat) => {
    if (!cat) return '';
    const c = cat.toLowerCase().trim();
    if (c === 'clothes' || c === 'clothing') return 'clothes';
    if (c === 'medical' || c === 'medical equipment') return 'medical equipment';
    return c;
  };

  // Condition toggle helper
  const handleConditionToggle = (cond) => {
    setSelectedConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  // Filter listings
  const filteredDonations = approvedDonations.filter(d => {
    const matchesQuery = !query ||
      (d.title || d.category || '').toLowerCase().includes(query.toLowerCase()) ||
      (d.description || '').toLowerCase().includes(query.toLowerCase());

    const matchesCategory = selectedCategory === 'All' ||
      normalizeCategory(d.category) === normalizeCategory(selectedCategory);

    const dist = d.location
      ? getDistanceInKm(USER_COORDS[0], USER_COORDS[1], d.location.lat, d.location.lng)
      : 999;
    const matchesDistance = dist <= distanceRange;

    const matchesCondition = selectedConditions.length === 0 || selectedConditions.includes(d.condition);

    return matchesQuery && matchesCategory && matchesDistance && matchesCondition;
  });

  // Sort listings
  const sortedDonations = [...filteredDonations].sort((a, b) => {
    if (sortBy === 'distance') {
      const distA = a.location ? getDistanceInKm(USER_COORDS[0], USER_COORDS[1], a.location.lat, a.location.lng) : 999;
      const distB = b.location ? getDistanceInKm(USER_COORDS[0], USER_COORDS[1], b.location.lat, b.location.lng) : 999;
      return distA - distB;
    }
    if (sortBy === 'date') {
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    }
    if (sortBy === 'quantity') {
      return b.quantity - a.quantity;
    }
    if (sortBy === 'alphabetical') {
      return (a.title || a.category).localeCompare(b.title || b.category);
    }
    return 0;
  });

  const toggleWishlist = (id, e) => {
    if (e) e.stopPropagation();
    if (wishlist.includes(id)) {
      setWishlist(prev => prev.filter(item => item !== id));
      toast.success('Removed item from saved wishlist.');
    } else {
      setWishlist(prev => [...prev, id]);
      toast.success('Saved to wishlist. View them anytime!');
    }
  };

  const handleShare = (id, e) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/discover?item=${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Marketplace item link copied to clipboard!');
  };

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('NGO credentials required to claim. Please sign in.');
      return;
    }
    if (user?.role !== 'ngo') {
      toast.error('Only registered NGOs can claim donations on the dispatch board.');
      return;
    }

    setIsClaiming(true);

    // Simulate database update delay
    setTimeout(() => {
      setIsClaiming(false);
      setClaimSuccess(true);
      
      // Update mock database state
      db.updateDonationStatus(selectedItem.id, 'MATCHED', {
        matchedNgoId: currentNgo?.id || 'ngo-1',
        matchScore: getSmartMatchDetails(selectedItem)?.total || 90,
        matchedAt: new Date().toISOString()
      });

      toast.success(`Claim interest registered for ${selectedItem.title || selectedItem.category}!`);
      
      // Auto close wishlist drawer item if it was there
      setWishlist(prev => prev.filter(id => id !== selectedItem.id));
    }, 1500);
  };

  // Get NGO Smart Match details
  const getSmartMatchDetails = (donation) => {
    if (!currentNgo) return null;
    const matchingNeed = db.needs.find(n =>
      n.ngoId === currentNgo.id &&
      normalizeCategory(n.category) === normalizeCategory(donation.category)
    );
    if (!matchingNeed) return null;

    return calculateMatchScore(donation, {
      ...matchingNeed,
      lat: currentNgo.lat,
      lng: currentNgo.lng
    });
  };

  const activeFiltersCount = (selectedCategory !== 'All' ? 1 : 0) +
    (distanceRange !== 20 ? 1 : 0) +
    selectedConditions.length +
    (query ? 1 : 0);

  const resetFilters = () => {
    setQuery('');
    setSelectedCategory('All');
    setDistanceRange(20);
    setSelectedConditions([]);
    setSortBy('distance');
    toast.info('All search filters reset to defaults.');
  };

  const urgentItems = approvedDonations.filter(d =>
    d.category === 'Food' || d.category === 'Blankets' || d.condition === 'New'
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">

        {/* 1. Glassmorphic Hero Banner Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#1b4e20] to-[#2E7D32] text-white p-6 sm:p-8 lg:p-10 rounded-3xl shadow-premium-lg">
          {/* Ambient glowing circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl -mb-12 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                Live Logistics Exchange
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white leading-tight">
                DonateBridge Common Marketplace
              </h1>
              <p className="text-sm sm:text-base text-slate-200/90 max-w-xl font-light leading-relaxed">
                Connect with verified local physical donations. Browse real-time available stock, view automated smart recommendations, and claim logistical parcels.
              </p>
            </div>

            {/* Quick stats board */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 shrink-0 lg:w-96">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center">
                <span className="text-2xl font-bold text-white block">{approvedDonations.length}</span>
                <span className="text-[10px] text-slate-300 uppercase font-mono tracking-wider font-semibold">Active Parcels</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center">
                <span className="text-2xl font-bold text-emerald-400 block">{urgentItems.length}</span>
                <span className="text-[10px] text-slate-300 uppercase font-mono tracking-wider font-semibold">High Priority</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center col-span-2 sm:col-span-1">
                <span className="text-2xl font-bold text-teal-400 block">15 km</span>
                <span className="text-[10px] text-slate-300 uppercase font-mono tracking-wider font-semibold">Default Radius</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Interactive Popular Categories Bar */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" /> Popular Categories
            </h3>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Clear Category Filter <X className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2.5 text-xs font-semibold rounded-xl border shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategory === 'All'
                  ? 'bg-primary text-white border-primary shadow-premium-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span>All Categories</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategory === 'All' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {approvedDonations.length}
              </span>
            </button>

            {CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat] || Tag;
              const count = approvedDonations.filter(d => normalizeCategory(d.category) === normalizeCategory(cat)).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-xl border shrink-0 flex items-center gap-2 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary text-white border-primary shadow-premium-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Core Page Content (Double-Sidebar Grid) */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Filter Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl shadow-premium-sm space-y-6 sticky top-24">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h4 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" /> Filter Board
                </h4>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-[10px] text-red-500 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Keyword Search */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Search keywords</label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by keywords..."
                    className="w-full px-4 py-2.5 pl-10 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-slate-900 bg-slate-50/50"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort By Dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-slate-400" /> Sort listings
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="distance">Nearest Distance First</option>
                  <option value="date">Most Recent Posted</option>
                  <option value="quantity">Highest Quantity</option>
                  <option value="alphabetical">Alphabetical Name</option>
                </select>
              </div>

              {/* Distance radius slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <span>Radius limit</span>
                  <span className="text-primary font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full">{distanceRange} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="45"
                  value={distanceRange}
                  onChange={(e) => setDistanceRange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>2 km</span>
                  <span>45 km</span>
                </div>
                
                {/* Active user coordination node */}
                <div className="p-3 bg-slate-50/80 border border-slate-100 rounded-xl text-[10px] text-slate-500 leading-normal space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Active Location Node
                  </div>
                  <p className="font-mono text-[9px] text-slate-400">
                    Lat: 12.9716, Lng: 77.5946<br />
                    Bangalore Logistics Center
                  </p>
                </div>
              </div>

              {/* Condition checklist filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Item Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map(cond => {
                    const isChecked = selectedConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        onClick={() => handleConditionToggle(cond)}
                        className={`px-2.5 py-1.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-primary/5 text-primary border-primary'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-primary' : 'bg-slate-300'}`} />
                          {cond}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Urgent listings alert board */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <h5 className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Dispatch Alerts
                </h5>
                <div className="space-y-2">
                  {urgentItems.slice(0, 2).map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="p-2.5 rounded-xl border border-red-50 bg-red-50/20 hover:bg-red-50/40 transition-colors cursor-pointer text-left space-y-1 block"
                    >
                      <span className="text-xs font-bold text-slate-900 block truncate">{item.title || item.category}</span>
                      <div className="flex justify-between text-[9px] font-mono text-red-600 font-semibold uppercase">
                        <span>Qty: {item.quantity}</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Central Marketplace Listings */}
          <section className="flex-grow space-y-6 min-w-0">

            {/* Results counts & View Options Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-premium-sm">
              <div className="text-xs text-slate-500 font-medium text-left w-full sm:w-auto">
                Showing <strong className="text-slate-800">{sortedDonations.length}</strong> of{' '}
                <strong className="text-slate-800">{approvedDonations.length}</strong> verified listings
              </div>

              <div className="flex gap-4 shrink-0 w-full sm:w-auto justify-end items-center">
                <div className="bg-slate-100 p-0.5 rounded-lg flex gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md cursor-pointer transition-all ${
                      viewMode === 'grid' ? 'bg-white text-primary shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md cursor-pointer transition-all ${
                      viewMode === 'list' ? 'bg-white text-primary shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-1.5 rounded-md cursor-pointer transition-all ${
                      viewMode === 'map' ? 'bg-white text-primary shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="Map View"
                  >
                    <Map className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main content viewport */}
            {isLoading ? (
              <SkeletonLoader type={viewMode === 'list' ? 'list' : 'card'} count={6} />
            ) : viewMode === 'map' ? (
              <div className="h-[550px] w-full border border-slate-200 rounded-3xl overflow-hidden shadow-premium-md relative z-10">
                <LeafletMap
                  center={USER_COORDS}
                  zoom={12}
                  markers={sortedDonations.map(d => ({
                    lat: d.location?.lat,
                    lng: d.location?.lng,
                    popupContent: (
                      <div className="text-left space-y-2 min-w-[200px]">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            {d.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold">{d.condition}</span>
                        </div>
                        <h5 className="font-bold text-slate-800 text-xs leading-snug">{d.title || d.category}</h5>
                        <div className="flex justify-between items-center text-[10px] border-t border-slate-100 pt-1.5">
                          <span className="font-mono font-semibold text-slate-500">Qty: {d.quantity}</span>
                          <button
                            onClick={() => setSelectedItem(d)}
                            className="text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer text-[10px]"
                          >
                            Details <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  }))}
                />
              </div>
            ) : sortedDonations.length === 0 ? (
              <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-4 shadow-premium-sm flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-200 text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-slate-900">No matching donations found</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Try adjusting search query keywords, choosing another category, or expanding your km search radius.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Reset All Filters
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}
              >
                <AnimatePresence mode="popLayout">
                  {sortedDonations.map((item) => {
                    const isWishlisted = wishlist.includes(item.id);
                    const dist = item.location
                      ? getDistanceInKm(USER_COORDS[0], USER_COORDS[1], item.location.lat, item.location.lng).toFixed(1)
                      : null;
                    const smartMatch = getSmartMatchDetails(item);

                    return (
                      <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        onClick={() => setSelectedItem(item)}
                        className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-premium-sm transition-all hover:-translate-y-1 hover:shadow-premium-md flex cursor-pointer group relative ${
                          viewMode === 'list' ? 'flex-row h-52' : 'flex-col'
                        }`}
                      >
                        {/* Image section */}
                        <div className={`relative bg-slate-100 shrink-0 overflow-hidden ${
                          viewMode === 'list' ? 'w-48 h-full border-r border-slate-100' : 'w-full aspect-video border-b border-slate-50'
                        }`}>
                          {item.photos?.length > 0 ? (
                            <img
                              src={item.photos[0]}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xs bg-slate-50">
                              No Photo
                            </div>
                          )}

                          {/* Condition stamp */}
                          <span className={`absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border shadow-premium-sm z-10 ${
                            item.condition === 'New' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            item.condition === 'Like New' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            item.condition === 'Good' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {item.condition}
                          </span>

                          {/* Smart Match score indicator on top of image */}
                          {smartMatch && (
                            <div className="absolute top-3 right-3 px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-bold rounded-full uppercase shadow-premium-sm flex items-center gap-1 z-10 animate-pulse">
                              <Sparkles className="w-3 h-3" />
                              <span>{smartMatch.total}% Match</span>
                            </div>
                          )}
                        </div>

                        {/* Content details */}
                        <div className="p-4 flex-grow flex flex-col justify-between space-y-3 min-w-0">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-wider block">
                                {item.category}
                              </span>
                              {dist && (
                                <span className="text-[9px] font-mono text-slate-400 font-bold flex items-center gap-0.5 shrink-0">
                                  <MapPin className="w-3 h-3 text-primary" /> {dist} km away
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-display font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
                              {item.title || item.category}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          {/* Mini metadata tags */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="truncate">
                              <span className="text-slate-400 block font-mono text-[8px] uppercase">Donor</span>
                              <strong className="text-slate-700 font-semibold">{item.donorName}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-mono text-[8px] uppercase">Quantity</span>
                              <strong className="text-slate-700 font-semibold">{item.quantity} units</strong>
                            </div>
                          </div>

                          {/* Interactive Buttons */}
                          <div className="flex items-center gap-2 border-t border-slate-100 pt-2.5">
                            <button
                              onClick={(e) => toggleWishlist(item.id, e)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer hover:scale-105 shrink-0 ${
                                isWishlisted
                                  ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100'
                                  : 'bg-white text-slate-400 border-slate-200 hover:text-red-500 hover:border-red-200'
                              }`}
                              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            >
                              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                            </button>

                            <button
                              onClick={(e) => handleShare(item.id, e)}
                              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all hover:scale-105 shrink-0 cursor-pointer"
                              title="Copy marketplace link"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>

                            <button
                              className="flex-grow py-1.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg transition-colors cursor-pointer text-center"
                            >
                              Claim Interest
                            </button>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </section>
        </div>
      </main>

      {/* 4. Floating Wishlist Trigger Button */}
      {wishlist.length > 0 && (
        <motion.button
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowWishlistDrawer(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-primary to-emerald-600 text-white p-4 rounded-full shadow-premium-xl z-30 cursor-pointer flex items-center gap-2"
        >
          <div className="relative">
            <Heart className="w-5 h-5 fill-white" />
            <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white border-2 border-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {wishlist.length}
            </span>
          </div>
          <span className="text-xs font-bold pr-1 hidden sm:inline">Saved Wishlist</span>
        </motion.button>
      )}

      {/* 5. Wishlist Slide-Out Drawer */}
      <AnimatePresence>
        {showWishlistDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWishlistDrawer(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 p-6 border-l border-slate-200 flex flex-col justify-between"
            >
              <div className="space-y-6 flex-grow overflow-y-auto pr-1">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h4 className="font-display font-bold text-slate-900 flex items-center gap-2 text-base">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Saved Wishlist ({wishlist.length})
                  </h4>
                  <button
                    onClick={() => setShowWishlistDrawer(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-200 border-dashed rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <HeartOff className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-400">Your saved wishlist is currently empty.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wishlist.map(id => {
                      const item = db.donations.find(d => d.id === id);
                      if (!item) return null;
                      const dist = item.location
                        ? getDistanceInKm(USER_COORDS[0], USER_COORDS[1], item.location.lat, item.location.lng).toFixed(1)
                        : null;

                      return (
                        <div
                          key={id}
                          className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer group"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowWishlistDrawer(false);
                          }}
                        >
                          <div className="w-14 h-14 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                            {item.photos?.length > 0 ? (
                              <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold">No img</div>
                            )}
                          </div>

                          <div className="flex-grow min-w-0 space-y-1">
                            <span className="text-[8px] font-mono text-primary font-bold uppercase tracking-wider block">
                              {item.category}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                              {item.title || item.category}
                            </h5>
                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                              <span>Qty: {item.quantity}</span>
                              {dist && <span>{dist} km</span>}
                            </div>
                          </div>

                          <button
                            onClick={(e) => toggleWishlist(item.id, e)}
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 shrink-0 cursor-pointer"
                            title="Remove from saved"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {wishlist.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-2 mt-4">
                  <button
                    onClick={() => {
                      setWishlist([]);
                      toast.info('Wishlist cleared.');
                    }}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Clear All Saved
                  </button>
                  <button
                    onClick={() => {
                      // Claim the first item as simulation
                      const firstItem = db.donations.find(d => d.id === wishlist[0]);
                      if (firstItem) {
                        setSelectedItem(firstItem);
                        setShowWishlistDrawer(false);
                      }
                    }}
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center shadow-sm"
                  >
                    Claim First Saved Item
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 6. Expandable Detail & Claim Request Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-premium-xl z-10 flex flex-col md:flex-row relative"
            >
              {/* Confetti celebrate */}
              <Confetti active={claimSuccess} />

              {/* Left Side: Photo Carousel & Map */}
              <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col justify-between border-r border-slate-100 overflow-y-auto">
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-primary font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {selectedItem.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      selectedItem.condition === 'New' ? 'bg-emerald-50 text-emerald-700' :
                      selectedItem.condition === 'Like New' ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {selectedItem.condition} Condition
                    </span>
                  </div>

                  {/* Photo container */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-200 border border-slate-100 shadow-premium-sm">
                    {selectedItem.photos?.length > 0 ? (
                      <img src={selectedItem.photos[0]} alt={selectedItem.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                        No Photo Available
                      </div>
                    )}
                  </div>

                  {/* Map view of item */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Map className="w-3.5 h-3.5" /> Pickup Location Coordinates
                    </span>
                    <div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-200 z-10">
                      {selectedItem.location ? (
                        <LeafletMap
                          center={[selectedItem.location.lat, selectedItem.location.lng]}
                          zoom={14}
                          markers={[{
                            lat: selectedItem.location.lat,
                            lng: selectedItem.location.lng,
                            popupContent: `<strong>${selectedItem.title || 'Donation'}</strong><br/>${selectedItem.location.address}`
                          }]}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-medium">
                          No map location provided
                        </div>
                      )}
                    </div>
                    {selectedItem.location && (
                      <p className="text-[10px] text-slate-400 italic text-center truncate">
                        {selectedItem.location.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/60 mt-4 text-[10px] text-slate-400 space-y-1 font-mono">
                  <div>Reference ID: <strong className="text-slate-700 font-bold">{selectedItem.id}</strong></div>
                  <div>Submitted Date: <strong className="text-slate-700 font-bold">{new Date(selectedItem.submittedAt).toLocaleString()}</strong></div>
                </div>
              </div>

              {/* Right Side: Claim Board Form */}
              <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors z-10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {claimSuccess ? (
                  /* Success View */
                  <div className="flex-grow flex flex-col items-center justify-center text-center space-y-5 py-8">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-display font-black text-slate-900">Donation Successfully Claimed!</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Your request interest is locked. We have dispatched automated logistics instructions to your registered email dashboard: <strong className="text-slate-700 font-semibold">{currentNgo?.email || user?.email}</strong>.
                      </p>
                    </div>

                    <div className="w-full p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-[10px] text-slate-500 text-left font-mono space-y-1">
                      <div>Status: <span className="text-emerald-600 font-bold uppercase">MATCHED &bull; COMMITTED</span></div>
                      <div>Assigned NGO: <span className="text-slate-800 font-bold">{currentNgo?.name || 'Hope Foundation'}</span></div>
                      <div>Requested Quantity: <span className="text-slate-800 font-bold">{claimQty} units</span></div>
                      <div>Logistics Mode: <span className="text-slate-800 font-bold">{claimLogistics === 'courier' ? 'Courier Dispatch' : 'Self Pickup'}</span></div>
                    </div>

                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => {
                          setSelectedItem(null);
                        }}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Keep Browsing
                      </button>
                      <a
                        href="/ngo"
                        className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center shadow-sm"
                      >
                        Go to Console
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Main Info / Form View */
                  <div className="flex-grow flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <h2 className="text-xl font-display font-black text-slate-900 leading-tight">
                        {selectedItem.title || selectedItem.category}
                      </h2>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {selectedItem.description}
                      </p>
                      
                      {/* NGO Smart Recommendation Panel */}
                      {getSmartMatchDetails(selectedItem) && (
                        <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                              DonateBridge Smart Match Score
                            </span>
                            <span className="font-mono font-bold text-emerald-700 text-xs">{getSmartMatchDetails(selectedItem).total}%</span>
                          </div>
                          
                          <div className="h-1.5 rounded-full overflow-hidden flex bg-slate-200">
                            <div style={{ width: `${getSmartMatchDetails(selectedItem).categoryFit}%` }} className="bg-primary h-full" />
                            <div style={{ width: `${getSmartMatchDetails(selectedItem).distanceScore}%` }} className="bg-sky-500 h-full" />
                            <div style={{ width: `${getSmartMatchDetails(selectedItem).urgencyScore}%` }} className="bg-emerald-500 h-full" />
                            <div style={{ width: `${getSmartMatchDetails(selectedItem).freshnessScore}%` }} className="bg-amber-500 h-full" />
                          </div>
                          
                          <div className="grid grid-cols-4 gap-1 text-[8px] text-slate-400 font-mono uppercase tracking-wider">
                            <span>Category ({getSmartMatchDetails(selectedItem).categoryFit}%)</span>
                            <span>Distance ({getSmartMatchDetails(selectedItem).distanceScore}%)</span>
                            <span>Urgency ({getSmartMatchDetails(selectedItem).urgencyScore}%)</span>
                            <span>Recency ({getSmartMatchDetails(selectedItem).freshnessScore}%)</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata summary */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block font-mono text-[8px] uppercase">Contributed By</span>
                        <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {selectedItem.donorName}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-mono text-[8px] uppercase">Available Stock</span>
                        <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {selectedItem.quantity} units
                        </div>
                      </div>
                    </div>

                    {/* Claim Interest Form */}
                    <form onSubmit={handleClaimSubmit} className="space-y-4">
                      {/* Check if authenticated / role validation */}
                      {!isAuthenticated ? (
                        <div className="p-3.5 bg-amber-50 border border-amber-200/60 rounded-xl text-center space-y-2">
                          <p className="text-xs text-amber-800 leading-normal">
                            You are browsing as a guest. Register or sign in to request and claim this physical donation.
                          </p>
                          <a
                            href="/auth"
                            className="inline-block px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Sign In to System
                          </a>
                        </div>
                      ) : user?.role !== 'ngo' ? (
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                          <p className="text-xs text-slate-500 leading-normal flex items-center justify-center gap-1.5">
                            <Info className="w-4 h-4 text-slate-400" /> Signed in as standard: <strong>{user?.role}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 italic">
                            Only registered NGO profiles have permission to claim common marketplace inventory.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3 border-t border-slate-100 pt-3">
                            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Claim Details</h4>

                            {/* Quantity selection */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-600 font-semibold">Quantity to claim</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={claimQty <= 1}
                                  onClick={() => setClaimQty(prev => prev - 1)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs disabled:opacity-40 cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-10 text-center font-bold text-slate-900 text-xs">{claimQty}</span>
                                <button
                                  type="button"
                                  disabled={claimQty >= selectedItem.quantity}
                                  onClick={() => setClaimQty(prev => prev + 1)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs disabled:opacity-40 cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Logistics pick cards */}
                            <div className="space-y-2">
                              <span className="text-[10px] text-slate-500 font-medium block">Logistical arrangement preference:</span>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => setClaimLogistics('courier')}
                                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                                    claimLogistics === 'courier'
                                      ? 'bg-primary/5 border-primary shadow-premium-sm'
                                      : 'bg-white border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <Truck className={`w-4 h-4 shrink-0 mt-0.5 ${claimLogistics === 'courier' ? 'text-primary' : 'text-slate-400'}`} />
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-slate-950 block leading-tight">DonateBridge Hub</span>
                                    <span className="text-[9px] text-slate-400 leading-tight block mt-0.5">Automated courier matching</span>
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setClaimLogistics('pickup')}
                                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                                    claimLogistics === 'pickup'
                                      ? 'bg-primary/5 border-primary shadow-premium-sm'
                                      : 'bg-white border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${claimLogistics === 'pickup' ? 'text-primary' : 'text-slate-400'}`} />
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-slate-955 block leading-tight">Self-pickup</span>
                                    <span className="text-[9px] text-slate-400 leading-tight block mt-0.5">We will pick it up directly</span>
                                  </div>
                                </button>
                              </div>
                            </div>

                            {/* Intended Use case message */}
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-500 font-medium block">Request message / Intended Use case:</span>
                              <textarea
                                value={claimUseCase}
                                onChange={(e) => setClaimUseCase(e.target.value)}
                                placeholder="Explain briefly why your NGO needs this, e.g., for local distribution, winter campaign..."
                                required
                                rows={2}
                                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-900 bg-slate-50/50"
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 pt-3">
                            <button
                              type="button"
                              onClick={() => setSelectedItem(null)}
                              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isClaiming}
                              className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center shadow-sm flex items-center justify-center gap-1.5"
                            >
                              {isClaiming ? (
                                <>
                                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Claiming...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  Claim Interest
                                </>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </form>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
