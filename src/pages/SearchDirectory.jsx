import React, { useState, useEffect, useRef } from 'react';
import { useMockDB } from '../hooks/useMockDB';
import Navbar from '../components/Navbar';
import DonationCard from '../components/ui/DonationCard';
import { Search, Filter, MapPin, Compass, Grid, Map, Tag } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet marker icons fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CATEGORIES = ['All', 'Clothing', 'Food', 'Books', 'Furniture', 'Electronics', 'Medical', 'Other'];
const CONDITIONS = ['All', 'New', 'Like New', 'Good', 'Fair', 'Poor'];

export default function SearchDirectory() {
  const db = useMockDB();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  // Map references
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);

  // Filter only VERIFIED (admin-approved) items
  const verifiedDonations = db.donations.filter(d => d.status === 'VERIFIED');

  // Apply filters
  const filteredDonations = verifiedDonations.filter(d => {
    const matchesQuery = d.itemName.toLowerCase().includes(query.toLowerCase()) || 
                         d.description.toLowerCase().includes(query.toLowerCase()) ||
                         d.id.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesCondition = selectedCondition === 'All' || d.condition === selectedCondition;
    return matchesQuery && matchesCategory && matchesCondition;
  });

  // Render Leaflet map when viewMode is 'map'
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
      
      filteredDonations.forEach(item => {
        if (item.location && item.location.lat && item.location.lng) {
          L.marker([item.location.lat, item.location.lng])
            .addTo(markersGroup.current)
            .bindPopup(`
              <div style="font-family: Inter, sans-serif; font-size:11px; padding:2px;">
                <b style="color:#2E7D32;">${item.id}</b><br/>
                <b>Item:</b> ${item.itemName}<br/>
                <b>Category:</b> ${item.category}<br/>
                <b>Quantity:</b> ${item.quantity}<br/>
                <b>Location:</b> ${item.location.address}
              </div>
            `);
        }
      });
    }
  }, [viewMode, filteredDonations]);

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

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 sm:p-8 gap-8">
        
        {/* Left Column: Facet Filters */}
        <aside className="w-full lg:w-80 space-y-6 shrink-0">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
            <h3 className="text-sm font-display font-bold mb-4 flex items-center gap-2 text-ink">
              <Filter className="w-4 h-4 text-primary" /> Filter Facets
            </h3>

            <div className="space-y-6 text-xs">
              
              {/* Category selector pills */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Item Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer font-medium ${
                        selectedCategory === cat
                          ? 'bg-primary text-white border-primary shadow-sm font-semibold'
                          : 'border-border bg-white text-slate-600 hover:border-slate-400 hover:text-ink'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Facet */}
              <div className="space-y-2.5 pt-6 border-t border-border">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Material Condition
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CONDITIONS.map(cond => (
                    <button
                      key={cond}
                      onClick={() => setSelectedCondition(cond)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer font-medium ${
                        selectedCondition === cond
                          ? 'bg-primary text-white border-primary shadow-sm font-semibold'
                          : 'border-border bg-white text-slate-600 hover:border-slate-400 hover:text-ink'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </aside>

        {/* Center Main panel: Search & Results Directory */}
        <main className="flex-1 space-y-6">
          
          {/* Search bar and toggle view */}
          <div className="flex gap-3 items-center">
            
            {/* Search Input */}
            <div className="flex-1 bg-white border border-border p-3.5 rounded-2xl shadow-premium-sm flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search verified donation tags, descriptions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-none placeholder-slate-400 text-ink"
              />
            </div>

            {/* Toggle View mode */}
            <div className="bg-white border border-border p-1 rounded-xl flex gap-1 shadow-premium-sm shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                title="List View"
              >
                <Grid className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'map' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                title="Map Pin View"
              >
                <Map className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>

          {/* Results Area */}
          {viewMode === 'map' ? (
            <div className="space-y-4 animate-fadeInUp">
              <div className="p-4 bg-white border border-border rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary animate-pulse" />
                <span>Showing geocoded coordinates of matching verified shipments</span>
              </div>
              <div ref={mapRef} className="h-[450px] w-full border border-border rounded-2xl z-10 shadow-premium-sm" />
            </div>
          ) : (
            <div className="space-y-4 animate-fadeInUp">
              {filteredDonations.length === 0 ? (
                <div className="bg-white border border-border rounded-2xl p-16 text-center text-xs text-slate-400">
                  <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  No verified donations match your search filter criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredDonations.map((donation) => (
                    <DonationCard key={donation.id} donation={donation} />
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
