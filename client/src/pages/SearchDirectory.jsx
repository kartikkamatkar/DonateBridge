import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRealDB } from '../hooks/useRealDB';
import { getDistanceInKm, calculateMatchScore } from '../utils/geo';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LeafletMap from '../components/ui/LeafletMap';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/GlobalStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Heart, X, Check, RotateCcw,
  User, Sparkles, Building, Truck, Info, Award, Users, Filter, Navigation
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const CATEGORIES = ['All', 'Books', 'Clothes', 'Food', 'Furniture', 'Electronics', 'Medical Equipment', 'School Supplies', 'Blankets', 'Sports Equipment'];
const DEFAULT_COORDS = [21.1458, 79.0882]; // Nagpur default

export default function SearchDirectory() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const initialQuery = new URLSearchParams(search).get('query') || '';

  const { ngos, needs, donations, claimDonation, fetchDonations, fetchNgos, loadingDonations, loadingNgos } = useRealDB();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const currentNgo = user?.role === 'ngo' ? ngos.find(n => n.email === user?.email) || ngos[0] : null;

  const [searchType, setSearchType] = useState(user?.role === 'ngo' ? 'donations' : 'ngos'); // 'donations' | 'ngos'
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [distanceRange, setDistanceRange] = useState(25);
  const [minTrustScore, setMinTrustScore] = useState(50);
  
  const [selectedItem, setSelectedItem] = useState(null); 
  const [hoveredItemId, setHoveredItemId] = useState(null);
  
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimQty, setClaimQty] = useState(1);
  const [claimLogistics, setClaimLogistics] = useState('courier');
  const [claimUseCase, setClaimUseCase] = useState('');
  
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('db_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [userCoords, setUserCoords] = useState(DEFAULT_COORDS);
  const [coordsLoaded, setCoordsLoaded] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords([position.coords.latitude, position.coords.longitude]);
          setCoordsLoaded(true);
        },
        () => {
          setCoordsLoaded(true); // Fallback
        }
      );
    } else {
      setCoordsLoaded(true);
    }
  }, []);

  useEffect(() => { localStorage.setItem('db_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  
  useEffect(() => { 
    if (selectedItem) { 
      setClaimQty(selectedItem.quantity || 1); 
      setClaimSuccess(false); 
      setClaimUseCase(''); 
      setClaimLogistics('courier'); 
    } 
  }, [selectedItem]);

  // Server-side filtering logic
  useEffect(() => {
    if (!coordsLoaded) return;
    const timeoutId = setTimeout(() => {
      const params = {};
      if (query) params.query = query;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      params.lat = userCoords[0];
      params.lng = userCoords[1];
      params.distance = distanceRange;
      
      if (searchType === 'donations') {
        fetchDonations(params);
      } else {
        if (minTrustScore > 0) params.trust_score = minTrustScore;
        fetchNgos(params);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, selectedCategory, distanceRange, minTrustScore, searchType, userCoords, coordsLoaded, fetchDonations, fetchNgos]);

  const normalizeCategory = (cat) => { if (!cat) return ''; const c = cat.toLowerCase().trim(); if (c === 'clothes' || c === 'clothing') return 'clothes'; if (c === 'medical' || c === 'medical equipment') return 'medical equipment'; return c; };

  const displayDonations = donations.map(d => ({
    ...d, 
    _dist: d.location ? getDistanceInKm(userCoords[0], userCoords[1], d.location.lat, d.location.lng) : 999
  })).sort((a,b) => a._dist - b._dist);
  
  const displayNgos = ngos.map(n => ({
    ...n, 
    _dist: getDistanceInKm(userCoords[0], userCoords[1], n.lat, n.lng)
  })).sort((a,b) => a._dist - b._dist);

  const toggleWishlist = (id, e) => { if (e) e.stopPropagation(); if (wishlist.includes(id)) { setWishlist(prev => prev.filter(i => i !== id)); toast.success('Removed from saved.'); } else { setWishlist(prev => [...prev, id]); toast.success('Saved!'); } };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || user?.role !== 'ngo') { toast.error('Only NGOs can claim.'); return; }
    setIsClaiming(true);
    try {
      await claimDonation(selectedItem.id);
      setIsClaiming(false);
      setClaimSuccess(true);
      toast.success(`Claim submitted for ${selectedItem.title || selectedItem.category}!`);
      setWishlist(prev => prev.filter(id => id !== selectedItem.id));
    } catch (err) {
      setIsClaiming(false);
    }
  };

  const getSmartMatchDetails = (donation) => {
    if (!currentNgo) return null;
    const matchingNeed = needs.find(n => n.ngoId === currentNgo.id && normalizeCategory(n.category) === normalizeCategory(donation.category));
    if (!matchingNeed) return null;
    return calculateMatchScore(donation, { ...matchingNeed, lat: currentNgo.lat, lng: currentNgo.lng });
  };

  const resetFilters = () => { setQuery(''); setSelectedCategory('All'); setDistanceRange(25); setMinTrustScore(50); };
  const activeFiltersCount = (selectedCategory !== 'All' ? 1 : 0) + (distanceRange !== 25 ? 1 : 0) + (query ? 1 : 0) + (searchType === 'ngos' && minTrustScore !== 50 ? 1 : 0);

  const mapCenter = selectedItem ? (selectedItem.location ? [selectedItem.location.lat, selectedItem.location.lng] : [selectedItem.lat, selectedItem.lng]) : userCoords;
  const mapZoom = selectedItem ? 14 : (distanceRange > 30 ? 10 : distanceRange > 15 ? 11 : 12);
  const mapCircles = selectedItem ? [] : [{ lat: userCoords[0], lng: userCoords[1], radius: distanceRange * 1000, color: '#10B981', fillOpacity: 0.05, weight: 1.5 }];
  
  let mapMarkers = [{ lat: userCoords[0], lng: userCoords[1], popupContent: '<strong style="color:#10B981">Your Location</strong>' }];
  if (searchType === 'donations') {
    mapMarkers = [...mapMarkers, ...displayDonations.map(d => ({ lat: d.location?.lat, lng: d.location?.lng, popupContent: `<strong>${d.title || d.category}</strong><br/>${d.quantity} units` }))];
  } else {
    mapMarkers = [...mapMarkers, ...displayNgos.map(n => ({ lat: n.lat, lng: n.lng, popupContent: `<strong>${n.name}</strong>` }))];
  }
  
  const hoveredItem = hoveredItemId ? (searchType === 'donations' ? displayDonations.find(d => d.id === hoveredItemId) : displayNgos.find(n => n.id === hoveredItemId)) : null;
  const hoveredLat = hoveredItem?.location ? hoveredItem.location.lat : hoveredItem?.lat;
  const hoveredLng = hoveredItem?.location ? hoveredItem.location.lng : hoveredItem?.lng;
  const polylines = hoveredLat ? [{ positions: [userCoords, [hoveredLat, hoveredLng]], color: '#10B981', weight: 2, dashArray: '5, 5' }] : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] selection:bg-emerald-500/30">
      <Navbar />

      {/* Hero Header */}
      <div className="relative h-96 w-full overflow-hidden bg-slate-900 rounded-b-[3rem] lg:rounded-b-[5rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-900 opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-[800px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-20 -mt-64 relative z-10 space-y-8">
        
        {/* Advanced Filter Box */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2rem] p-6 md:p-8 shadow-2xl shadow-slate-200/50 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-black text-[10px] uppercase tracking-widest shadow-sm" >
                Global Radar
              </span>
              <h1 className="font-display font-black text-3xl md:text-4xl text-slate-900 tracking-tight mt-3">
                Resource Matrix
              </h1>
              <p className="text-slate-500 mt-2 max-w-xl font-medium" >
                Scan the local network for critical supplies or verify regional logistics partners.
              </p>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200 shrink-0 mx-auto md:mx-0">
              <button
                onClick={() => { setSearchType('donations'); setSelectedItem(null); setHoveredItemId(null); }}
                className={`py-3 px-6 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                  searchType === 'donations' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Search className={`w-4 h-4 ${searchType === 'donations' ? 'text-emerald-500' : ''}`} /> Scan Donations
              </button>
              <button
                onClick={() => { setSearchType('ngos'); setSelectedItem(null); setHoveredItemId(null); }}
                className={`py-3 px-6 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                  searchType === 'ngos' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building className={`w-4 h-4 ${searchType === 'ngos' ? 'text-emerald-500' : ''}`} /> Partner NGOs
              </button>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 pt-4 border-t border-slate-100">
            {/* Search Input */}
            <div className="relative flex-1">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchType === 'donations' ? "Search blankets, books, food..." : "Search NGO names..."} className="w-full pl-12 pr-4 h-[56px] border border-slate-200 rounded-[1.25rem] bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm font-bold transition-all"  />
              <Search className="w-5 h-5 text-emerald-500 absolute left-4 top-1/2 -translate-y-1/2" />
              {query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
            </div>
            
            {/* Range Filters */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] px-5 h-[56px] shrink-0 shadow-sm">
              <Navigation className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Radius Distance</span>
                <div className="flex items-center gap-3">
                  <input type="range" min="2" max="45" value={distanceRange} onChange={(e) => setDistanceRange(Number(e.target.value))} className="w-24 accent-emerald-500 cursor-pointer"  />
                  <span className="font-mono font-bold text-slate-900 text-sm" >{distanceRange} km</span>
                </div>
              </div>
            </div>
            
            {searchType === 'ngos' && (
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] px-5 h-[56px] shrink-0 shadow-sm">
                <Award className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Trust Score</span>
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max="100" step="5" value={minTrustScore} onChange={(e) => setMinTrustScore(Number(e.target.value))} className="w-24 accent-emerald-500 cursor-pointer"  />
                    <span className="font-mono font-bold text-slate-900 text-sm" >{minTrustScore}%</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeFiltersCount > 0 && (
              <button onClick={resetFilters} className="h-[56px] px-6 bg-slate-900 text-white font-bold rounded-[1.25rem] flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 shrink-0 transition-all">
                <RotateCcw className="w-4 h-4" /> Reset Filters
              </button>
            )}
          </div>

          {/* Categories */}
          {searchType === 'donations' && (
            <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)} 
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all shadow-sm ${
                    selectedCategory === cat 
                      ? 'bg-emerald-500 text-white shadow-emerald-500/25 border border-emerald-400' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`} 
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Container */}
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* List View */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center px-2">
              <p className="font-display font-black text-slate-900 text-xl tracking-tight" >
                Live Matches
              </p>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-lg text-xs shadow-sm">
                {searchType === 'donations' ? displayDonations.length : displayNgos.length} results
              </span>
            </div>

            {(searchType === 'donations' ? loadingDonations : loadingNgos) ? (
              <div className="bg-white rounded-[2rem] p-16 flex flex-col items-center justify-center space-y-4 shadow-sm border border-slate-100">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="font-bold text-slate-500" >Scanning the matrix...</p>
              </div>
            ) : (searchType === 'donations' ? displayDonations : displayNgos).length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center space-y-5 shadow-xl shadow-slate-200/40 border border-slate-100">
                <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-[1.5rem] flex items-center justify-center mx-auto text-slate-300 shadow-inner">
                  <Filter className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-2xl tracking-tight" >No records matched</h3>
                  <p className="text-slate-500 mt-2 font-medium max-w-sm mx-auto" >Increase your scan radius or broaden category filters.</p>
                </div>
                <Button variant="primary" onClick={resetFilters} icon={RotateCcw} className="shadow-lg shadow-emerald-500/20 px-8 rounded-xl font-bold mt-2">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {(searchType === 'donations' ? displayDonations : displayNgos).map(item => {
                    if (searchType === 'donations') {
                      const isWishlisted = wishlist.includes(item.id);
                      const dist = item._dist?.toFixed(1) || '0.0';
                      const smartMatch = getSmartMatchDetails(item);
                      
                      return (
                        <motion.div 
                          key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                          onClick={() => setSelectedItem(item)} onMouseEnter={() => setHoveredItemId(item.id)} onMouseLeave={() => setHoveredItemId(null)}
                          className="bg-white border border-slate-100 rounded-[1.75rem] overflow-hidden shadow-xl shadow-slate-200/30 hover:border-emerald-200 hover:shadow-emerald-500/10 transition-all cursor-pointer group flex flex-col"
                        >
                          <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden shrink-0">
                            {item.photos?.length > 0 ? (
                              <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                <Search className="w-8 h-8 mb-2 opacity-50" />
                                <span className="font-bold text-sm">No Preview</span>
                              </div>
                            )}
                            
                            {/* Badges Overlay */}
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                              <span className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-sm backdrop-blur-md ${item.condition === 'New' ? 'bg-emerald-500/90 text-white border border-emerald-400' : item.condition === 'Like New' ? 'bg-sky-500/90 text-white border border-sky-400' : 'bg-amber-500/90 text-white border border-amber-400'}`} >
                                {item.condition}
                              </span>
                              {smartMatch && (
                                <span className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 shadow-sm text-xs" >
                                  <Sparkles className="w-3.5 h-3.5" /> {smartMatch.total}% Fit
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest" >{item.category}</span>
                              <span className="font-mono text-slate-400 text-xs font-bold flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md" ><Navigation className="w-3 h-3 text-emerald-500" /> {dist} km</span>
                            </div>
                            
                            <h3 className="font-display font-black text-slate-900 text-lg group-hover:text-emerald-600 transition-colors tracking-tight line-clamp-1" >{item.title || item.category}</h3>
                            <p className="text-slate-500 text-sm mt-1.5 line-clamp-2 leading-relaxed font-medium flex-1" >{item.description}</p>
                            
                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                                  <User className="w-4 h-4 text-slate-400" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Donor</p>
                                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.donorName}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-black text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
                                  x{item.quantity}
                                </span>
                                <button onClick={(e) => toggleWishlist(item.id, e)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${isWishlisted ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100' : 'bg-white text-slate-400 border border-slate-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50'}`} >
                                  <Heart className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-current' : ''}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    } else {
                      // NGO CARD
                      const dist = item._dist?.toFixed(1) || '0.0';
                      return (
                        <motion.div 
                          key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                          onClick={() => setSelectedItem(item)} onMouseEnter={() => setHoveredItemId(item.id)} onMouseLeave={() => setHoveredItemId(null)}
                          className="bg-white border border-slate-100 rounded-[1.75rem] p-6 shadow-xl shadow-slate-200/30 hover:border-emerald-200 hover:shadow-emerald-500/10 transition-all cursor-pointer group flex flex-col relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[40px] -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="flex items-start gap-5 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-md flex items-center justify-center shrink-0 text-white font-display font-black text-xl tracking-tight">
                              {item.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display font-black text-slate-900 text-lg truncate group-hover:text-emerald-600 transition-colors" >{item.name}</h3>
                              <p className="font-mono text-slate-500 text-xs font-bold mt-1 bg-slate-50 inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200" >
                                <Navigation className="w-3 h-3 text-emerald-500" /> {item.city} ({dist} km)
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Award className="w-3 h-3" /> Trust Score</p>
                              <p className="text-emerald-600 font-black text-lg mt-0.5">{item.trustScore}%</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Building className="w-3 h-3" /> Org Type</p>
                              <p className="text-slate-800 font-bold mt-1 text-sm truncate">{item.ngoType}</p>
                            </div>
                          </div>
                          
                          <p className="mt-5 text-sm text-slate-500 line-clamp-2 font-medium leading-relaxed flex-1 relative z-10">{item.description}</p>
                        </motion.div>
                      );
                    }
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Sticky Map Panel */}
          <div className="w-full xl:w-[480px] shrink-0 xl:sticky xl:top-28 h-[500px] xl:h-[calc(100vh-140px)] rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 bg-white p-2 z-10">
            <div className="w-full h-full rounded-[1.5rem] overflow-hidden">
              <LeafletMap center={mapCenter} zoom={mapZoom} circles={mapCircles} markers={mapMarkers} polylines={polylines} className="h-full w-full border-none" />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Wishlist FAB */}
      {wishlist.length > 0 && searchType === 'donations' && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => { const first = donations.find(d => d.id === wishlist[0]); if (first) setSelectedItem(first); }}
          className="fixed bottom-8 right-8 bg-slate-900 text-white pl-4 pr-6 py-4 rounded-full shadow-2xl shadow-slate-900/30 z-30 cursor-pointer flex items-center gap-3 hover:bg-slate-800 transition-colors border border-slate-700" >
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <span className="font-bold">{wishlist.length} Saved Items</span>
        </motion.button>
      )}

      {/* Detail Slide-Over */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
            
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] opacity-50 pointer-events-none" />
              
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md relative z-10">
                <h2 className="font-display font-black text-xl text-slate-900 tracking-tight" >
                  {searchType === 'donations' ? 'Logistics Details' : 'Partner Profile'}
                </h2>
                <button onClick={() => setSelectedItem(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 cursor-pointer transition-colors shadow-sm"><X className="w-5 h-5" /></button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 hide-scrollbar">
                {searchType === 'donations' ? (
                  /* DONATION DETAILS */
                  claimSuccess ? (
                    <div className="flex flex-col items-center text-center space-y-6 py-12 px-4">
                      <div className="w-24 h-24 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-3xl flex items-center justify-center shadow-inner">
                        <Check className="w-12 h-12 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="font-display font-black text-slate-900 text-3xl tracking-tight" >Claim Verified</h4>
                        <p className="text-slate-500 max-w-sm mt-3 font-medium leading-relaxed" >Your logistics allocation request has been approved. Operations have been notified at <strong className="text-slate-800">{currentNgo?.email || user?.email}</strong>.</p>
                      </div>
                      <div className="flex flex-col gap-3 w-full pt-4">
                        <Button variant="primary" onClick={() => navigate('/ngo')} className="h-14 rounded-xl font-bold shadow-lg shadow-emerald-500/25">Go to NGO Console</Button>
                        <Button variant="secondary" onClick={() => setSelectedItem(null)} className="h-14 rounded-xl font-bold bg-white border border-slate-200">Close Panel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm relative">
                        {selectedItem.photos?.length > 0 ? (
                          <img src={selectedItem.photos[0]} alt={selectedItem.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                            <Search className="w-10 h-10 mb-2 opacity-50" />
                            <span className="font-bold">No Image Provided</span>
                          </div>
                        )}
                        <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg bg-slate-900/80 backdrop-blur-md text-white border border-slate-700" >
                          {selectedItem.category}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display font-black text-3xl text-slate-900 tracking-tight" >{selectedItem.title || selectedItem.category}</h3>
                        <p className="text-slate-500 mt-2 leading-relaxed font-medium" >{selectedItem.description}</p>
                      </div>

                      {/* Smart Match */}
                      {getSmartMatchDetails(selectedItem) && (
                        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3 shadow-inner">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-emerald-900 flex items-center gap-2" ><Sparkles className="w-5 h-5 text-emerald-500" /> AI Compatibility Match</span>
                            <span className="font-black text-emerald-600 text-xl" >{getSmartMatchDetails(selectedItem).total}%</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden flex bg-emerald-200/50">
                            <div style={{ width: `${getSmartMatchDetails(selectedItem).categoryFit}%` }} className="bg-emerald-600 h-full" />
                            <div style={{ width: `${getSmartMatchDetails(selectedItem).distanceScore}%` }} className="bg-emerald-500 h-full" />
                            <div style={{ width: `${getSmartMatchDetails(selectedItem).urgencyScore}%` }} className="bg-emerald-400 h-full" />
                            <div style={{ width: `${getSmartMatchDetails(selectedItem).freshnessScore}%` }} className="bg-emerald-300 h-full" />
                          </div>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block" >Donor</span>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 mt-1" ><User className="w-4 h-4 text-emerald-500" />{selectedItem.donorName}</div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block" >Inventory</span>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 mt-1" ><Package className="w-4 h-4 text-emerald-500" />{selectedItem.quantity} units</div>
                        </div>
                      </div>

                      {/* Mini Map */}
                      <div className="h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        {selectedItem.location ? <LeafletMap center={[selectedItem.location.lat, selectedItem.location.lng]} zoom={14} markers={[{ lat: selectedItem.location.lat, lng: selectedItem.location.lng, popupContent: `<strong>${selectedItem.title || 'Donation'}</strong>` }]} className="h-full w-full border-none" /> : <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 font-medium">No Coordinates</div>}
                      </div>

                      {/* Claim Form */}
                      <form onSubmit={handleClaimSubmit} className="space-y-6 pt-4">
                        {!isAuthenticated ? (
                          <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-4 shadow-inner">
                            <Info className="w-8 h-8 text-amber-500 mx-auto" />
                            <p className="text-amber-800 font-bold" >Authentication required to execute claims.</p>
                            <Button variant="primary" onClick={() => navigate('/auth')} className="w-full h-12 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20">Sign In</Button>
                          </div>
                        ) : user?.role !== 'ngo' ? (
                          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center shadow-inner">
                            <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-600 font-bold" >Operation Restricted</p>
                            <p className="text-slate-500 text-sm mt-1 font-medium">Only verified NGO network partners can claim dispatches.</p>
                          </div>
                        ) : (
                          <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block" >Claim Allocation</span>
                              <div className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
                                <button type="button" disabled={claimQty <= 1} onClick={() => setClaimQty(p => p - 1)} className="w-10 h-10 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold disabled:opacity-40 cursor-pointer transition-colors">-</button>
                                <span className="w-10 text-center font-black text-slate-900 text-lg">{claimQty}</span>
                                <button type="button" disabled={claimQty >= selectedItem.quantity} onClick={() => setClaimQty(p => p + 1)} className="w-10 h-10 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold disabled:opacity-40 cursor-pointer transition-colors">+</button>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3" >Routing Protocol</span>
                              <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setClaimLogistics('courier')} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${claimLogistics === 'courier' ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                  <Truck className={`w-6 h-6 ${claimLogistics === 'courier' ? 'text-emerald-500' : 'text-slate-400'}`} />
                                  <div className="text-center"><span className="font-bold text-slate-900 text-sm block" >Courier Relay</span><span className="text-[10px] text-slate-500 font-bold uppercase" >Automated</span></div>
                                </button>
                                <button type="button" onClick={() => setClaimLogistics('pickup')} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${claimLogistics === 'pickup' ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                  <MapPin className={`w-6 h-6 ${claimLogistics === 'pickup' ? 'text-emerald-500' : 'text-slate-400'}`} />
                                  <div className="text-center"><span className="font-bold text-slate-900 text-sm block" >Self Extract</span><span className="text-[10px] text-slate-500 font-bold uppercase" >Manual</span></div>
                                </button>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2" >Operational Justification</span>
                              <textarea value={claimUseCase} onChange={(e) => setClaimUseCase(e.target.value)} placeholder="State your programmatic requirement for this allocation..." required rows={3} className="w-full p-4 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm font-medium transition-all placeholder-slate-400"  />
                            </div>

                            <Button variant="primary" type="submit" loading={isClaiming} className="w-full h-14 rounded-xl font-bold shadow-lg shadow-emerald-500/25 text-lg">
                              Confirm Extraction
                            </Button>
                          </div>
                        )}
                      </form>
                    </>
                  )
                ) : (
                  /* NGO DETAILS */
                  <>
                    <div className="text-center pt-4">
                      <div className="w-24 h-24 rounded-3xl bg-slate-900 mx-auto shadow-xl flex items-center justify-center font-display font-black text-3xl text-white mb-6">
                        {selectedItem.name.substring(0, 2).toUpperCase()}
                      </div>
                      <h3 className="font-display font-black text-3xl text-slate-900 tracking-tight" >{selectedItem.name}</h3>
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mt-3">
                        <Check className="w-3 h-3" /> Verified Partner
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center shadow-inner mt-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" >Core Mission</p>
                      <p className="text-slate-800 font-bold leading-relaxed italic" >"{selectedItem.mission}"</p>
                    </div>
                    
                    <p className="text-slate-500 leading-relaxed font-medium text-center px-4" >{selectedItem.description}</p>

                    <div className="grid grid-cols-2 gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-white">
                      <div><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block" >Sector</span><div className="font-black text-lg mt-1" >{selectedItem.ngoType}</div></div>
                      <div><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block" >Established</span><div className="font-black text-lg mt-1" >{selectedItem.operatingSince}</div></div>
                      <div><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block" >Network</span><div className="font-black text-lg flex items-center gap-2 mt-1" ><Users className="w-4 h-4 text-slate-400" />{selectedItem.volunteersCount}</div></div>
                      <div><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block" >Trust Rating</span><div className="font-black text-emerald-500 text-lg flex items-center gap-2 mt-1" ><Award className="w-4 h-4" />{selectedItem.trustScore}%</div></div>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block" >HQ Coordinates</span>
                      <p className="text-slate-800 font-bold flex items-start gap-3" ><MapPin className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5"/> {selectedItem.address}</p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex">
                      <Button variant="primary" onClick={() => navigate(`/ngo/${selectedItem.id}`)} className="flex-1 w-full justify-center h-14 rounded-xl font-bold shadow-lg shadow-emerald-500/25">
                        Open Full Dossier
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
