import React, { useState, useEffect, useRef } from 'react';
import { useMockDB } from '../hooks/useMockDB';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DonationCard from '../components/ui/DonationCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import {
  Search, Filter, MapPin, Compass, Grid, List, Map, Tag,
  Star, ShieldCheck, Flame, Calendar, Award, AlertTriangle, ArrowUpDown
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet default marker icons fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CATEGORIES = ['All', 'Clothing', 'Food', 'Books', 'Furniture', 'Electronics', 'Medical', 'School Supplies'];

export default function SearchDirectory() {
  const db = useMockDB();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All'); // 'All' | 'High' | 'Medium' | 'Low'
  const [distanceRange, setDistanceRange] = useState(25); // km
  const [minTrustScore, setMinTrustScore] = useState(90); // %
  const [sortOption, setSortOption] = useState('newest'); // 'newest' | 'trust' | 'distance'
  
  const [discoverTab, setDiscoverTab] = useState('donations'); // 'donations' | 'ngos' | 'campaigns'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'
  const [isLoading, setIsLoading] = useState(false);

  // Map references
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);

  // Community Campaigns Mock List
  const campaigns = [
    { id: 'c-1', title: 'Winter Blanket Drive 2026', type: 'Seasonal Campaign', host: 'Hope Foundation', target: '50 Blankets', urgency: 'High', date: 'July 15 - Aug 10' },
    { id: 'c-2', title: 'Monsoon Flood Emergency Relief', type: 'Emergency Relief', host: 'Feeding Hand', target: '200 Meal Packs', urgency: 'Critical', date: 'Ongoing' },
    { id: 'c-3', title: 'Slum Children Study Kit Prep', type: 'Volunteer Event', host: 'Tech Academy', target: '10 Volunteers', urgency: 'Medium', date: 'July 20, 2026' }
  ];

  // Simulating loading states on query update
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [query, selectedCategory, selectedPriority, distanceRange, minTrustScore, discoverTab]);

  // Filters for verified donations
  const verifiedDonations = db.donations.filter(d => d.status === 'VERIFIED');

  const filteredDonations = verifiedDonations.filter(d => {
    const matchesQuery = d.itemName?.toLowerCase().includes(query.toLowerCase()) || 
                         d.description?.toLowerCase().includes(query.toLowerCase()) ||
                         d.id.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  // NGOs with calculated ratings and distance parameters
  const enrichedNgos = db.ngos.map((ngo, idx) => ({
    ...ngo,
    trustScore: idx === 0 ? 99 : idx === 1 ? 97 : 94,
    rating: idx === 0 ? 4.9 : idx === 1 ? 4.8 : 4.6,
    distance: idx === 0 ? 1.4 : idx === 1 ? 3.2 : 5.8,
    urgentNeeds: idx === 0 ? ['Blankets', 'Textbooks'] : ['Groceries']
  }));

  const filteredNgos = enrichedNgos.filter(n => {
    const matchesQuery = n.name.toLowerCase().includes(query.toLowerCase()) || n.address.toLowerCase().includes(query.toLowerCase());
    const matchesTrust = n.trustScore >= minTrustScore;
    const matchesDistance = n.distance <= distanceRange;
    return matchesQuery && matchesTrust && matchesDistance;
  });

  // Map rendering logic
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([12.9716, 77.5946], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      markersGroup.current = L.layerGroup().addTo(mapInstance.current);
    }

    if (mapInstance.current && markersGroup.current) {
      markersGroup.current.clearLayers();
      
      if (discoverTab === 'donations') {
        filteredDonations.forEach(item => {
          if (item.location && item.location.lat && item.location.lng) {
            L.marker([item.location.lat, item.location.lng])
              .addTo(markersGroup.current)
              .bindPopup(`
                <div style="font-family: sans-serif; font-size:11px;">
                  <b style="color:#2E7D32;">${item.id}</b><br/>
                  <b>Item:</b> ${item.itemName || 'Supplies'}<br/>
                  <b>Category:</b> ${item.category}<br/>
                  <b>Location:</b> ${item.location.address}
                </div>
              `);
          }
        });
      } else {
        filteredNgos.forEach(ngo => {
          L.marker([ngo.lat, ngo.lng])
            .addTo(markersGroup.current)
            .bindPopup(`
              <div style="font-family: sans-serif; font-size:11px;">
                <b style="color:#2E7D32;">${ngo.name}</b><br/>
                <b>Trust:</b> ${ngo.trustScore}%<br/>
                <b>Rating:</b> ${ngo.rating} ★<br/>
                <b>Location:</b> ${ngo.address}
              </div>
            `);
        });
      }
    }
  }, [viewMode, discoverTab, filteredDonations, filteredNgos]);

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersGroup.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Filter sidebar */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-6">
            <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" /> Advanced Filters
            </h3>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Categories</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                      selectedCategory === cat ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-border hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Slider */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                <span>Max Distance</span>
                <span className="text-primary">{distanceRange} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={distanceRange}
                onChange={(e) => setDistanceRange(Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Trust Score threshold */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                <span>Min Trust Rating</span>
                <span className="text-primary">{minTrustScore}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="100"
                value={minTrustScore}
                onChange={(e) => setMinTrustScore(Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Need Priority */}
            <div className="space-y-2 pt-4 border-t border-border">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Need Priority</label>
              <div className="flex gap-1.5">
                {['All', 'High', 'Medium', 'Low'].map(prio => (
                  <button
                    key={prio}
                    onClick={() => setSelectedPriority(prio)}
                    className={`px-2 py-1 rounded border text-[10px] font-bold uppercase cursor-pointer ${
                      selectedPriority === prio ? 'bg-[#2E7D32] text-white border-primary' : 'bg-white text-slate-500 border-border hover:bg-slate-50'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Right main panel */}
        <main className="flex-1 space-y-6">
          
          {/* Header search bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 bg-white border border-border p-3 rounded-2xl shadow-premium-sm flex items-center gap-3 w-full">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search verified campaigns, nearby NGOs, or active listings..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-900"
              />
            </div>

            <div className="flex gap-2 shrink-0">
              {/* Grid / List / Map toggle */}
              <div className="bg-white border border-border p-1 rounded-xl flex gap-1 shadow-premium-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === 'map' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  title="Map View"
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Section tab headers */}
          <div className="flex border-b border-border gap-2">
            {['donations', 'ngos', 'campaigns'].map(tab => (
              <button
                key={tab}
                onClick={() => setDiscoverTab(tab)}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer capitalize ${
                  discoverTab === tab
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-slate-500 hover:text-ink'
                }`}
              >
                {tab === 'donations' ? 'Active Listings' : tab === 'ngos' ? 'Verified NGOs' : 'Community Drives'}
              </button>
            ))}
          </div>

          {/* Render content */}
          {isLoading ? (
            <SkeletonLoader type={viewMode === 'list' ? 'list' : 'card'} count={3} />
          ) : viewMode === 'map' ? (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-border rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary animate-pulse" />
                <span>Displaying coordinates for active {discoverTab} elements.</span>
              </div>
              <div ref={mapRef} className="h-[450px] w-full border border-border rounded-2xl z-10 shadow-premium-sm" />
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Tab: Donations */}
              {discoverTab === 'donations' && (
                filteredDonations.length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-400 bg-white border border-border rounded-2xl shadow-premium-sm">
                    <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No active listings match the filters.
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
                    {filteredDonations.map(donation => (
                      <DonationCard key={donation.id} donation={donation} />
                    ))}
                  </div>
                )
              )}

              {/* Tab: NGOs */}
              {discoverTab === 'ngos' && (
                filteredNgos.length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-400 bg-white border border-border rounded-2xl shadow-premium-sm">
                    <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No verified NGOs match the criteria.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredNgos.map(ngo => (
                      <div key={ngo.id} className="p-5 bg-white border border-border rounded-2xl shadow-premium-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-display font-bold text-slate-900 flex items-center gap-1.5">
                              {ngo.name} <ShieldCheck className="w-4 h-4 text-primary" />
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{ngo.address}</p>
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-[#F1F8F5] text-primary px-2 py-0.5 rounded-full border border-emerald-100">
                            TRUST SCORE: {ngo.trustScore}%
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Verified local distribution hub coordinating winter items and school tutoring packets.
                        </p>

                        <div className="flex justify-between items-center pt-3 border-t border-border text-xs">
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" /> {ngo.rating}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Distance: {ngo.distance} km</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tab: Campaigns */}
              {discoverTab === 'campaigns' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaigns.map(c => (
                    <div key={c.id} className="p-5 bg-white border border-border rounded-2xl shadow-premium-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-50 border border-border text-slate-500">
                          {c.type}
                        </span>
                        <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          c.urgency === 'Critical' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {c.urgency} Urgency
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-slate-900 text-sm">{c.title}</h4>
                      <p className="text-[11px] text-slate-500">Hosted by <span className="font-bold">{c.host}</span> &bull; Target: {c.target}</p>

                      <div className="flex justify-between items-center pt-3 border-t border-border text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" /> {c.date}</span>
                        <button className="text-primary font-bold hover:underline">Volunteer</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
}
