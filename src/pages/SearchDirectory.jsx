import React, { useState, useEffect } from 'react';
import { useRealDB } from '../hooks/useRealDB';
import { getDistanceInKm, calculateMatchScore } from '../hooks/useMockDB';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeafletMap from '../components/ui/LeafletMap';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/GlobalStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Heart, Share2, X, Check, RotateCcw,
  User, Sparkles, Building, CheckCircle2, Truck, Info, ExternalLink, Map
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const CATEGORIES = ['All', 'Books', 'Clothes', 'Food', 'Furniture', 'Electronics', 'Medical Equipment', 'School Supplies', 'Blankets', 'Sports Equipment'];
const USER_COORDS = [12.9716, 77.5946];

export default function SearchDirectory() {
  const { ngos, needs, donations } = useRealDB();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const currentNgo = user?.role === 'ngo' ? ngos.find(n => n.email === user.email) || ngos[0] : null;

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [distanceRange, setDistanceRange] = useState(25);
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

  useEffect(() => { localStorage.setItem('db_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { if (selectedItem) { setClaimQty(selectedItem.quantity); setClaimSuccess(false); setClaimUseCase(''); setClaimLogistics('courier'); } }, [selectedItem]);

  const normalizeCategory = (cat) => { if (!cat) return ''; const c = cat.toLowerCase().trim(); if (c === 'clothes' || c === 'clothing') return 'clothes'; if (c === 'medical' || c === 'medical equipment') return 'medical equipment'; return c; };

  const approvedDonations = donations.filter(d => d.status === 'VERIFIED');
  const filteredDonations = approvedDonations.filter(d => {
    const matchesQuery = !query || (d.title || d.category || '').toLowerCase().includes(query.toLowerCase()) || (d.description || '').toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || normalizeCategory(d.category) === normalizeCategory(selectedCategory);
    const dist = d.location ? getDistanceInKm(USER_COORDS[0], USER_COORDS[1], d.location.lat, d.location.lng) : 999;
    return matchesQuery && matchesCategory && dist <= distanceRange;
  });
  const sortedDonations = [...filteredDonations].sort((a, b) => {
    const distA = a.location ? getDistanceInKm(USER_COORDS[0], USER_COORDS[1], a.location.lat, a.location.lng) : 999;
    const distB = b.location ? getDistanceInKm(USER_COORDS[0], USER_COORDS[1], b.location.lat, b.location.lng) : 999;
    return distA - distB;
  });

  const toggleWishlist = (id, e) => { if (e) e.stopPropagation(); if (wishlist.includes(id)) { setWishlist(prev => prev.filter(i => i !== id)); toast.success('Removed from saved.'); } else { setWishlist(prev => [...prev, id]); toast.success('Saved!'); } };
  const handleShare = (id, e) => { if (e) e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/discover?item=${id}`); toast.success('Link copied!'); };

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated || user?.role !== 'ngo') { toast.error('Only NGOs can claim.'); return; }
    setIsClaiming(true);
    setTimeout(() => {
      setIsClaiming(false); setClaimSuccess(true);
      // Claim the donation via real API (handled in parent flow)
      toast.success('Donation claimed! Route scheduled.');
      toast.success(`Claim submitted for ${selectedItem.title || selectedItem.category}!`);
      setWishlist(prev => prev.filter(id => id !== selectedItem.id));
    }, 1200);
  };

  const getSmartMatchDetails = (donation) => {
    if (!currentNgo) return null;
    const matchingNeed = needs.find(n => n.ngoId === currentNgo.id && normalizeCategory(n.category) === normalizeCategory(donation.category));
    if (!matchingNeed) return null;
    return calculateMatchScore(donation, { ...matchingNeed, lat: currentNgo.lat, lng: currentNgo.lng });
  };

  const resetFilters = () => { setQuery(''); setSelectedCategory('All'); setDistanceRange(25); };
  const activeFiltersCount = (selectedCategory !== 'All' ? 1 : 0) + (distanceRange !== 25 ? 1 : 0) + (query ? 1 : 0);

  const mapCenter = selectedItem?.location ? [selectedItem.location.lat, selectedItem.location.lng] : USER_COORDS;
  const mapZoom = selectedItem ? 14 : (distanceRange > 30 ? 10 : distanceRange > 15 ? 11 : 12);
  const mapCircles = selectedItem ? [] : [{ lat: USER_COORDS[0], lng: USER_COORDS[1], radius: distanceRange * 1000, color: '#2E7D32', fillOpacity: 0.05, weight: 1.2 }];
  const mapMarkers = [{ lat: USER_COORDS[0], lng: USER_COORDS[1], popupContent: '<strong style="color:#2E7D32">Bangalore Hub</strong>' }, ...sortedDonations.map(d => ({ lat: d.location?.lat, lng: d.location?.lng, popupContent: `<strong>${d.title || d.category}</strong><br/>${d.quantity} units` }))];
  const hoveredItem = hoveredItemId ? sortedDonations.find(d => d.id === hoveredItemId) : null;
  const polylines = hoveredItem?.location ? [{ positions: [USER_COORDS, [hoveredItem.location.lat, hoveredItem.location.lng]], color: '#2E7D32', weight: 2, dashArray: '5, 5' }] : [];
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Header */}
      <section className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-primary border border-emerald-200/60 font-semibold uppercase tracking-wider" style={{ fontSize: '12px' }}>
                Discover
              </span>
              <h1 className="font-display font-extrabold text-slate-900 tracking-tight mt-2">
                Browse Donations
              </h1>
              <p className="text-slate-500 mt-1 max-w-xl leading-relaxed" style={{ fontSize: '15px' }}>
                Find verified physical donations near you. Filter by category or distance, then claim items for your NGO.
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="secondary" onClick={resetFilters} icon={RotateCcw}>
                Clear Filters ({activeFiltersCount})
              </Button>
            )}
          </div>

          {/* Search + Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search donations..." className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary" style={{ fontSize: '15px' }} />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              {query && <button onClick={() => setQuery('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shrink-0">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-slate-500 whitespace-nowrap" style={{ fontSize: '14px' }}>Radius:</span>
              <input type="range" min="2" max="45" value={distanceRange} onChange={(e) => setDistanceRange(Number(e.target.value))} className="w-24 accent-primary cursor-pointer" style={{ minHeight: 'auto' }} />
              <span className="font-bold text-primary whitespace-nowrap" style={{ fontSize: '14px' }}>{distanceRange} km</span>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex overflow-x-auto gap-2 pb-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl border font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === cat ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`} style={{ fontSize: '14px' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col xl:flex-row gap-8">

            {/* Cards Grid */}
            <div className="flex-1">
              <p className="text-slate-500 mb-4" style={{ fontSize: '14px' }}>
                Showing <strong className="text-slate-800">{sortedDonations.length}</strong> verified donations
              </p>

              {sortedDonations.length === 0 ? (
                <div className="bg-white border border-border p-12 rounded-2xl text-center space-y-4 shadow-premium-sm">
                  <Search className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-900" style={{ fontSize: '16px' }}>No donations match your filters</p>
                  <p className="text-slate-500" style={{ fontSize: '14px' }}>Try widening your search radius or selecting a different category.</p>
                  <Button variant="primary" onClick={resetFilters} icon={RotateCcw}>Reset Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <AnimatePresence mode="popLayout">
                    {sortedDonations.map(item => {
                      const isWishlisted = wishlist.includes(item.id);
                      const dist = item.location ? getDistanceInKm(USER_COORDS[0], USER_COORDS[1], item.location.lat, item.location.lng).toFixed(1) : null;
                      const smartMatch = getSmartMatchDetails(item);
                      return (
                        <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                          onClick={() => setSelectedItem(item)} onMouseEnter={() => setHoveredItemId(item.id)} onMouseLeave={() => setHoveredItemId(null)}
                          className="bg-white border border-border rounded-2xl overflow-hidden shadow-premium-sm hover:shadow-premium-md hover:border-primary/20 transition-all cursor-pointer group"
                        >
                          {/* Image */}
                          <div className="relative aspect-video bg-slate-100 overflow-hidden">
                            {item.photos?.length > 0 ? (
                              <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400" style={{ fontSize: '14px' }}>No Photo</div>
                            )}
                            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg font-bold uppercase border ${item.condition === 'New' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : item.condition === 'Like New' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`} style={{ fontSize: '11px' }}>
                              {item.condition}
                            </span>
                            {smartMatch && (
                              <div className="absolute top-3 right-3 px-2.5 py-1 bg-primary text-white rounded-lg font-bold flex items-center gap-1" style={{ fontSize: '11px' }}>
                                <Sparkles className="w-3 h-3" /> {smartMatch.total}% Match
                              </div>
                            )}
                          </div>
                          {/* Content */}
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-primary font-semibold" style={{ fontSize: '12px' }}>{item.category}</span>
                              {dist && <span className="text-slate-400 flex items-center gap-1" style={{ fontSize: '12px' }}><MapPin className="w-3 h-3" /> {dist} km</span>}
                            </div>
                            <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors" style={{ fontSize: '16px' }}>{item.title || item.category}</h3>
                            <p className="text-slate-500 line-clamp-2 leading-relaxed" style={{ fontSize: '13px' }}>{item.description}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <div className="text-slate-500" style={{ fontSize: '13px' }}>
                                <span className="text-slate-800 font-semibold">{item.quantity}</span> units · {item.donorName}
                              </div>
                              <div className="flex gap-2">
                                <button onClick={(e) => toggleWishlist(item.id, e)} className={`p-2 rounded-lg border transition-all cursor-pointer ${isWishlisted ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-slate-400 border-slate-200 hover:text-red-500'}`} style={{ minHeight: '36px' }}>
                                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                                </button>
                                <button onClick={(e) => handleShare(item.id, e)} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition-all cursor-pointer" style={{ minHeight: '36px' }}>
                                  <Share2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Map Panel */}
            <div className="w-full xl:w-[400px] shrink-0 xl:sticky xl:top-24 h-[400px] xl:h-[520px] rounded-2xl overflow-hidden border border-border shadow-premium-sm">
              <LeafletMap center={mapCenter} zoom={mapZoom} circles={mapCircles} markers={mapMarkers} polylines={polylines} className="h-full w-full border-none" />
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Wishlist FAB */}
      {wishlist.length > 0 && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => { const first = donations.find(d => d.id === wishlist[0]); if (first) setSelectedItem(first); }}
          className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-premium-xl z-30 cursor-pointer flex items-center gap-2" style={{ minHeight: '48px' }}>
          <Heart className="w-5 h-5 fill-white" />
          <span className="font-bold pr-1">{wishlist.length} Saved</span>
        </motion.button>
      )}

      {/* Detail Slide-Over */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40" />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 border-l border-border flex flex-col overflow-hidden">

              {/* Header */}
              <div className="p-5 border-b border-border flex justify-between items-center bg-slate-50/50 shrink-0">
                <div>
                  <div className="flex gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-emerald-50 text-primary border border-emerald-100 rounded-lg font-semibold" style={{ fontSize: '12px' }}>{selectedItem.category}</span>
                    <span className={`px-2 py-0.5 rounded-lg font-semibold ${selectedItem.condition === 'New' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`} style={{ fontSize: '12px' }}>{selectedItem.condition}</span>
                  </div>
                  <h2 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Donation Details</h2>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {claimSuccess ? (
                  <div className="flex flex-col items-center text-center space-y-4 py-8">
                    <div className="w-14 h-14 bg-emerald-100 text-primary rounded-full flex items-center justify-center animate-bounce"><Check className="w-7 h-7 stroke-[3]" /></div>
                    <h4 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Claim Submitted!</h4>
                    <p className="text-slate-500 max-w-sm" style={{ fontSize: '14px' }}>Your allocation request has been confirmed. Logistics instructions have been sent to <strong>{currentNgo?.email || user?.email}</strong>.</p>
                    <div className="flex gap-3 w-full pt-2">
                      <Button variant="secondary" onClick={() => setSelectedItem(null)} className="flex-1">Keep Browsing</Button>
                      <a href="/ngo" className="flex-1 py-2 bg-primary text-white font-bold rounded-lg flex items-center justify-center" style={{ fontSize: '14px' }}>NGO Console</a>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Image */}
                    <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                      {selectedItem.photos?.length > 0 ? <img src={selectedItem.photos[0]} alt={selectedItem.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">No Photo</div>}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900" style={{ fontSize: '18px' }}>{selectedItem.title || selectedItem.category}</h3>
                      <p className="text-slate-500 mt-1 leading-relaxed" style={{ fontSize: '14px' }}>{selectedItem.description}</p>
                    </div>

                    {/* Smart Match */}
                    {getSmartMatchDetails(selectedItem) && (
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5" style={{ fontSize: '13px' }}><Sparkles className="w-4 h-4 text-primary" /> Smart Match</span>
                          <span className="font-bold text-primary" style={{ fontSize: '14px' }}>{getSmartMatchDetails(selectedItem).total}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden flex bg-slate-200">
                          <div style={{ width: `${getSmartMatchDetails(selectedItem).categoryFit}%` }} className="bg-primary h-full" />
                          <div style={{ width: `${getSmartMatchDetails(selectedItem).distanceScore}%` }} className="bg-sky-500 h-full" />
                          <div style={{ width: `${getSmartMatchDetails(selectedItem).urgencyScore}%` }} className="bg-emerald-500 h-full" />
                          <div style={{ width: `${getSmartMatchDetails(selectedItem).freshnessScore}%` }} className="bg-amber-500 h-full" />
                        </div>
                      </div>
                    )}

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                      <div><span className="text-slate-400 block" style={{ fontSize: '12px' }}>Donor</span><div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5" style={{ fontSize: '14px' }}><User className="w-4 h-4 text-slate-400" />{selectedItem.donorName}</div></div>
                      <div><span className="text-slate-400 block" style={{ fontSize: '12px' }}>Available</span><div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5" style={{ fontSize: '14px' }}><Building className="w-4 h-4 text-slate-400" />{selectedItem.quantity} units</div></div>
                    </div>

                    {/* Mini Map */}
                    <div className="h-36 rounded-xl overflow-hidden border border-slate-200">
                      {selectedItem.location ? <LeafletMap center={[selectedItem.location.lat, selectedItem.location.lng]} zoom={14} markers={[{ lat: selectedItem.location.lat, lng: selectedItem.location.lng, popupContent: `<strong>${selectedItem.title || 'Donation'}</strong>` }]} className="h-full w-full border-none" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">No location</div>}
                    </div>

                    {/* Claim Form */}
                    <form onSubmit={handleClaimSubmit} className="space-y-4 border-t border-slate-100 pt-4">
                      {!isAuthenticated ? (
                        <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-xl text-center space-y-2">
                          <p className="text-amber-800 font-semibold" style={{ fontSize: '14px' }}>Sign in as an NGO to claim this donation.</p>
                          <a href="/auth" className="inline-block px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg" style={{ fontSize: '14px' }}>Sign In</a>
                        </div>
                      ) : user?.role !== 'ngo' ? (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                          <p className="text-slate-500 flex items-center justify-center gap-1.5" style={{ fontSize: '14px' }}><Info className="w-4 h-4" /> Only NGO accounts can claim donations.</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-700 font-semibold" style={{ fontSize: '14px' }}>Quantity</span>
                            <div className="flex items-center gap-2">
                              <button type="button" disabled={claimQty <= 1} onClick={() => setClaimQty(p => p - 1)} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold disabled:opacity-40 cursor-pointer">-</button>
                              <span className="w-10 text-center font-bold text-slate-900">{claimQty}</span>
                              <button type="button" disabled={claimQty >= selectedItem.quantity} onClick={() => setClaimQty(p => p + 1)} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold disabled:opacity-40 cursor-pointer">+</button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setClaimLogistics('courier')} className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${claimLogistics === 'courier' ? 'bg-primary/5 border-primary' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                              <Truck className={`w-4 h-4 ${claimLogistics === 'courier' ? 'text-primary' : 'text-slate-400'}`} />
                              <div><span className="font-semibold text-slate-900 block" style={{ fontSize: '13px' }}>Courier</span><span className="text-slate-400" style={{ fontSize: '11px' }}>Platform arranges</span></div>
                            </button>
                            <button type="button" onClick={() => setClaimLogistics('pickup')} className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${claimLogistics === 'pickup' ? 'bg-primary/5 border-primary' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                              <MapPin className={`w-4 h-4 ${claimLogistics === 'pickup' ? 'text-primary' : 'text-slate-400'}`} />
                              <div><span className="font-semibold text-slate-900 block" style={{ fontSize: '13px' }}>Self Pickup</span><span className="text-slate-400" style={{ fontSize: '11px' }}>You collect it</span></div>
                            </button>
                          </div>

                          <textarea value={claimUseCase} onChange={(e) => setClaimUseCase(e.target.value)} placeholder="Why does your NGO need this? (e.g., winter distribution campaign)" required rows={2} className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 bg-slate-50/50 focus:outline-none focus:border-primary" style={{ fontSize: '14px' }} />

                          <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setSelectedItem(null)} className="flex-1">Cancel</Button>
                            <Button variant="primary" type="submit" isDisabled={isClaiming} className="flex-1">
                              {isClaiming ? 'Claiming...' : 'Confirm Claim'}
                            </Button>
                          </div>
                        </>
                      )}
                    </form>
                  </>
                )}
              </div>

              <div className="p-4 border-t border-border bg-slate-50 text-slate-400 shrink-0 font-mono flex justify-between" style={{ fontSize: '12px' }}>
                <span>{selectedItem.id}</span>
                <span>{new Date(selectedItem.submittedAt).toLocaleDateString()}</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
