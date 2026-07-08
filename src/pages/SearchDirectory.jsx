import React, { useState, useEffect } from 'react';
import { useMockDB, getDistanceInKm } from '../hooks/useMockDB';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeafletMap from '../components/ui/LeafletMap';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useToast } from '../components/ui/Toast';
import {
  Search, Filter, MapPin, Grid, List, Map, Tag, Heart, Share2,
  AlertTriangle, Award, Clock, ArrowRight, BookOpen, Shirt, Utensils,
  Armchair, Laptop, Stethoscope, Scissors, Wind
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

// Center point representing the simulated user (e.g. Bangalore center)
const USER_COORDS = [12.9716, 77.5946];

export default function SearchDirectory() {
  const db = useMockDB();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [distanceRange, setDistanceRange] = useState(15); // max km
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'
  const [isLoading, setIsLoading] = useState(false);
  
  // Local wishlist state synced with localStorage
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('db_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('db_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Simulating loading states on query update
  useEffect(() => {
    Promise.resolve().then(() => setIsLoading(true));
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [query, selectedCategory, distanceRange]);

  // Enforce displaying ONLY approved items
  const approvedDonations = db.donations.filter(d => d.status === 'VERIFIED');

  // Filter items based on search query, category, and radius distance
  const filteredDonations = approvedDonations.filter(d => {
    const matchesQuery = (d.title || d.category || '').toLowerCase().includes(query.toLowerCase()) || 
                         d.description?.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    
    // Distance calculation
    const distance = d.location 
      ? getDistanceInKm(USER_COORDS[0], USER_COORDS[1], d.location.lat, d.location.lng)
      : 999;
    const matchesDistance = distance <= distanceRange;

    return matchesQuery && matchesCategory && matchesDistance;
  });

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(prev => prev.filter(item => item !== id));
      toast.success('Removed item from your wishlist.');
    } else {
      setWishlist(prev => [...prev, id]);
      toast.success('Added item to your wishlist.');
    }
  };

  const handleShare = (id) => {
    const shareUrl = `${window.location.origin}/discover?item=${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Marketplace link copied to clipboard!');
  };

  // Urgent items indicators (e.g. Food or blankets or High priority needs matched)
  const urgentItems = approvedDonations.filter(d => d.category === 'Food' || d.category === 'Blankets' || d.condition === 'New');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-8">
        
        {/* Hero title section */}
        <section className="text-center max-w-2xl mx-auto space-y-2 pt-2">
          <span className="px-3 py-1 bg-[#F1F8F5] text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
            Public Directory
          </span>
          <h1 className="text-3xl font-display font-black tracking-tight text-slate-900 leading-tight">
            DonateBridge Common Marketplace
          </h1>
          <p className="text-sm text-slate-500">
            Browse approved physical logistics parcels awaiting nonprofit matching. Only verified items are listed publicly.
          </p>
        </section>

        {/* Popular Categories bar */}
        <section className="space-y-3">
          <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">Popular Categories</h3>
          <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border shrink-0 transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-primary text-white border-primary shadow-premium-sm'
                  : 'bg-white text-slate-600 border-border hover:bg-slate-50'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat] || Tag;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border shrink-0 flex items-center gap-2 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary text-white border-primary shadow-premium-sm'
                      : 'bg-white text-slate-600 border-border hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            
            {/* Range and location settings */}
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
              <h4 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" /> Distance Filters
              </h4>

              {/* Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <span>Radius limit</span>
                  <span className="text-primary">{distanceRange} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="35"
                  value={distanceRange}
                  onChange={(e) => setDistanceRange(Number(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>2 km</span>
                  <span>35 km</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-border rounded-xl text-[10px] text-slate-500 leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Current Coordinates
                </div>
                <p className="font-mono text-slate-400">Lat: 12.9716, Lng: 77.5946 (Bangalore Hub)</p>
              </div>
            </div>

            {/* Urgent listings alert marquee */}
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
              <h4 className="text-xs font-display font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Urgent Action Needed
              </h4>
              <div className="space-y-3">
                {urgentItems.slice(0, 3).map(item => (
                  <div key={item.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0 space-y-1">
                    <span className="font-bold text-slate-900 block truncate">{item.title || item.category}</span>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>QTY: {item.quantity}</span>
                      <span className="text-red-600 font-bold uppercase">{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </aside>

          {/* Central Marketplace Listings Grid */}
          <section className="flex-grow space-y-6 min-w-0">
            
            {/* Search and Layout views Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 bg-white border border-border p-3 rounded-2xl shadow-premium-sm flex items-center gap-3 w-full">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search marketplace items by title or keywords..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full text-xs bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-900"
                />
              </div>

              <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
                <div className="bg-white border border-border p-1 rounded-xl flex gap-1 shadow-premium-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    title="Grid layout"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    title="List layout"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === 'map' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    title="Map layout"
                  >
                    <Map className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results listing */}
            {isLoading ? (
              <SkeletonLoader type={viewMode === 'list' ? 'list' : 'card'} count={3} />
            ) : viewMode === 'map' ? (
              <div className="space-y-4">
                <div className="h-[450px] w-full border border-border rounded-2xl z-10 overflow-hidden shadow-premium-sm">
                  <LeafletMap
                    center={USER_COORDS}
                    zoom={12}
                    markers={filteredDonations.map(d => ({
                      lat: d.location?.lat,
                      lng: d.location?.lng,
                      popupContent: (
                        <div className="text-xs space-y-1">
                          <span className="font-bold text-primary">{d.category}</span>
                          <p className="font-semibold text-slate-800">{d.title || 'Donation Item'}</p>
                          <p className="text-slate-400">Qty: {d.quantity} &bull; {d.condition}</p>
                        </div>
                      )
                    }))}
                  />
                </div>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="bg-white border border-border p-12 rounded-2xl text-center space-y-3">
                <p className="text-xs font-mono text-slate-400">No approved donations matched your search parameters.</p>
                <p className="text-[10px] text-slate-400">Try widening your distance radius filter in the sidebar.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                {filteredDonations.map((item) => {
                  const isWishlisted = wishlist.includes(item.id);
                  const dist = item.location
                    ? getDistanceInKm(USER_COORDS[0], USER_COORDS[1], item.location.lat, item.location.lng).toFixed(1)
                    : null;

                  return (
                    <div
                      key={item.id}
                      className={`bg-white border border-border rounded-2xl overflow-hidden shadow-premium-sm transition-all hover:-translate-y-1 hover:shadow-premium-md flex ${
                        viewMode === 'list' ? 'flex-row h-52' : 'flex-col'
                      }`}
                    >
                      {/* Image section */}
                      <div className={`relative bg-slate-100 shrink-0 ${viewMode === 'list' ? 'w-48 h-full' : 'w-full aspect-video'}`}>
                        {item.photos?.length > 0 ? (
                          <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xs">No Photo</div>
                        )}
                        <span className={`absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border shadow-premium-sm ${
                          item.condition === 'New' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          item.condition === 'Like New' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {item.condition}
                        </span>
                      </div>

                      {/* Content details */}
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-wider block">{item.category}</span>
                            {dist && (
                              <span className="text-[9px] font-mono text-slate-400 font-bold flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {dist} km away
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-display font-bold text-slate-900 line-clamp-1">{item.title || 'Donation Item'}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>

                        {/* Metadata grid */}
                        <div className="bg-slate-50 p-3 rounded-xl text-[10px] space-y-1 border border-slate-100">
                          <div className="flex justify-between text-slate-500">
                            <span>Posted By:</span>
                            <span className="font-bold text-slate-800">{item.donorName}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Location:</span>
                            <span className="font-bold text-slate-800 truncate max-w-[150px]">{item.location?.address}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Quantity:</span>
                            <span className="font-bold text-slate-800">{item.quantity} units</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Posted Date:</span>
                            <span className="font-bold text-slate-800">{new Date(item.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                          <button
                            onClick={() => toggleWishlist(item.id)}
                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                              isWishlisted
                                ? 'bg-red-50 text-red-500 border-red-100'
                                : 'bg-white text-slate-400 border-border hover:bg-slate-50'
                            }`}
                            title="Add to Wishlist"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                          
                          <button
                            onClick={() => handleShare(item.id)}
                            className="p-2 bg-white hover:bg-slate-50 border border-border rounded-lg text-slate-500 transition-colors cursor-pointer"
                            title="Copy link"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            className="flex-grow py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg transition-colors cursor-pointer text-center"
                          >
                            Claim Interest
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
