import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useMockDB } from '../hooks/useMockDB';
import Navbar from '../components/Navbar';
import DonationCard from '../components/ui/DonationCard';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { ShieldCheck, Package, Clock, AlertTriangle, Plus, MapPin, BarChart3, Activity, Heart } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Chart mock data
const MONTHLY_DATA = [
  { month: 'Jan', received: 120, target: 100 },
  { month: 'Feb', received: 150, target: 120 },
  { month: 'Mar', received: 220, target: 150 },
  { month: 'Apr', received: 190, target: 150 },
  { month: 'May', received: 310, target: 200 },
  { month: 'Jun', received: 280, target: 200 },
  { month: 'Jul', received: 340, target: 250 }
];

const CATEGORY_DATA = [
  { name: 'Clothing', value: 40, color: '#2E7D32' },
  { name: 'Food', value: 30, color: '#43A047' },
  { name: 'Books', value: 15, color: '#4CAF50' },
  { name: 'Medical', value: 10, color: '#10B981' },
  { name: 'Other', value: 5, color: '#EF4444' }
];

export default function NgoConsole() {
  const { user } = useAuth();
  const db = useMockDB();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'needs' | 'geo' | 'analytics'

  // Need posting form states
  const [needCategory, setNeedCategory] = useState('Clothing');
  const [needItem, setNeedItem] = useState('');
  const [needQty, setNeedQty] = useState('');
  const [needUrgency, setNeedUrgency] = useState('Medium');
  const [needDescription, setNeedDescription] = useState('');

  // Map references
  const geoMapRef = useRef(null);
  const geoMapInstance = useRef(null);
  const geoCircleInstance = useRef(null);
  const geoMarkersGroup = useRef(null);

  // Active NGO Hub Info
  const currentNgo = db.ngos.find(n => n.email === (user?.email || 'ngo@donatebridge.org')) || db.ngos[0];

  // Dynamic Matches
  const rawMatches = db.getSmartMatchesForNgo(currentNgo.id);
  
  // Needs registered by this NGO
  const ngoNeeds = db.needs.filter(n => n.ngoId === currentNgo.id);

  // Pickups/Matched items in transit
  const activeIncoming = db.donations.filter(d => d.matchedNgoId === currentNgo.id && d.status === 'MATCHED');

  // Trigger leaflet map rendering
  useEffect(() => {
    if (activeTab === 'geo' && geoMapRef.current && !geoMapInstance.current) {
      geoMapInstance.current = L.map(geoMapRef.current).setView([currentNgo.lat, currentNgo.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(geoMapInstance.current);

      // NGO Hub Icon marker
      const hubIcon = L.divIcon({
        html: `<div class="w-7 h-7 rounded-full bg-[#2E7D32] border-2 border-white flex items-center justify-center text-white font-extrabold text-[9px] shadow-premium-md">HUB</div>`,
        className: 'custom-hub-icon',
        iconSize: [28, 28]
      });
      L.marker([currentNgo.lat, currentNgo.lng], { icon: hubIcon })
        .addTo(geoMapInstance.current)
        .bindPopup(`<b>${currentNgo.name} (Hub)</b><br/>${currentNgo.address}`)
        .openPopup();

      // Search matching radius circle (4km)
      geoCircleInstance.current = L.circle([currentNgo.lat, currentNgo.lng], {
        radius: 4000,
        color: '#2E7D32',
        fillColor: '#2E7D32',
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '3,3'
      }).addTo(geoMapInstance.current);

      geoMarkersGroup.current = L.layerGroup().addTo(geoMapInstance.current);

      // Render incoming parcels pins
      activeIncoming.forEach(item => {
        if (item.location && item.location.lat && item.location.lng) {
          L.marker([item.location.lat, item.location.lng])
            .addTo(geoMarkersGroup.current)
            .bindPopup(`
              <div style="font-family: Inter, sans-serif; font-size:11px; padding:2px;">
                <b style="color:#2E7D32;">${item.id}</b><br/>
                <b>Item:</b> ${item.itemName || item.category}<br/>
                <b>Qty:</b> ${item.quantity}<br/>
                <b>Status:</b> IN TRANSIT
              </div>
            `);
        }
      });
    }

    return () => {
      if (geoMapInstance.current) {
        geoMapInstance.current.remove();
        geoMapInstance.current = null;
        geoCircleInstance.current = null;
        geoMarkersGroup.current = null;
      }
    };
  }, [activeTab, activeIncoming, currentNgo]);

  const handlePostNeed = (e) => {
    e.preventDefault();
    db.addNeed({
      ngoId: currentNgo.id,
      ngoName: currentNgo.name,
      category: needCategory,
      item: needItem,
      quantity: parseInt(needQty),
      urgency: needUrgency,
      description: needDescription,
      lat: currentNgo.lat,
      lng: currentNgo.lng
    });

    setNeedItem('');
    setNeedQty('');
    setNeedDescription('');
    setActiveTab('matches');
  };

  const handleClaimDonation = (donationId, score) => {
    db.executeMatch(donationId, currentNgo.id, score);
  };

  // Rejection/Restricted state check
  if (user?.role === 'ngo' && user?.verificationStatus === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900">
        <div className="w-full max-w-xl bg-white border border-border p-8 rounded-2xl shadow-premium-lg text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold uppercase">
            <AlertTriangle className="w-4 h-4" /> Verification Denied
          </div>
          <h1 className="text-xl font-display font-bold text-ink">NGO Access Restricted</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your NGO status requires manual verification of legal filings before you can claim matches.
          </p>
          <div className="p-4 rounded-xl border border-border bg-slate-50 text-left text-xs space-y-1">
            <p className="font-bold text-slate-800">Rejection Reason:</p>
            <p className="text-slate-600">
              {user?.rejectionReason || 'Invalid NGO registration license number. Please verify tax details.'}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="primary" onClick={() => navigate('/settings')}>Update Profile License</Button>
            <Button variant="secondary" onClick={() => navigate('/chat')}>Contact Admin Chat</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* NGO Header banner */}
        <div className="bg-white border border-border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl shadow-premium-sm">
          <div>
            <h2 className="text-lg font-display font-bold text-ink">{currentNgo.name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">HUB ID: #{currentNgo.id} &bull; VETTED ORGANISATION</p>
          </div>
          <div className="flex items-center gap-2 bg-[#F1F8F5] border border-emerald-100 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-primary">
            <ShieldCheck className="w-4 h-4" />
            <span>Trust Score: 98% (High Tier)</span>
          </div>
        </div>

        {/* Dashboard Tabs Navigation */}
        <div className="flex border-b border-border gap-2">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'matches'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            Smart Matches ({rawMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('needs')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'needs'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            Broadcast Needs ({ngoNeeds.length})
          </button>
          <button
            onClick={() => setActiveTab('geo')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'geo'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            Dispatch Radius Map ({activeIncoming.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            Analytics & Reports
          </button>
        </div>

        {/* TAB 1: SMART MATCHES */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <div className="p-4 bg-white border border-border rounded-2xl shadow-premium-sm flex justify-between items-center text-xs">
              <div>
                <p className="font-semibold text-ink">Smart Match Algorithm Recommendation Queue</p>
                <p className="text-slate-500">Matching nearby verified shipments with your registered need parameters.</p>
              </div>
              <span className="font-mono bg-primary text-white px-2.5 py-1 rounded-lg font-bold text-[10px]">
                {rawMatches.length} RECOMMENDATIONS
              </span>
            </div>

            {rawMatches.length === 0 ? (
              <div className="bg-white border border-border rounded-2xl p-12 text-center space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-display font-bold text-ink">No Smart Matches Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">No verified donations fit your active inventory needs. Broadcast a new need requirement to trigger matching suggestions.</p>
                <Button variant="primary" size="sm" onClick={() => setActiveTab('needs')}>
                  Broadcast Need Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {rawMatches.map(({ donation, need, scoreBreakdown }) => (
                  <DonationCard
                    key={donation.id}
                    donation={donation}
                    matchScoreDetails={scoreBreakdown}
                    onClaim={() => handleClaimDonation(donation.id, scoreBreakdown.total)}
                    actions={
                      <span className="text-[10px] font-mono text-slate-400">
                        Match Basis: <strong className="text-slate-600">{need.item}</strong>
                      </span>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BROADCAST NEEDS */}
        {activeTab === 'needs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Needs List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-display font-bold text-ink">Current Demand Ledger</h3>
              
              {ngoNeeds.length === 0 ? (
                <p className="p-6 text-xs text-slate-400 text-center font-mono border border-dashed border-border rounded-xl">No active inventory needs posted.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {ngoNeeds.map(need => (
                    <div key={need.id} className="p-5 bg-white border border-border rounded-2xl shadow-premium-sm flex justify-between items-start text-xs">
                      <div>
                        <p className="font-display font-bold text-sm text-ink">{need.item}</p>
                        <p className="text-slate-400 text-[10px] font-mono mt-1 uppercase">
                          Category: {need.category} &bull; Qty Required: {need.quantity} units
                        </p>
                        {need.description && <p className="text-slate-500 mt-2 italic">"{need.description}"</p>}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase ${
                        need.urgency === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                        need.urgency === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {need.urgency} Urgency
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Need Form */}
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm h-fit">
              <h3 className="text-sm font-display font-bold mb-4 text-ink">Broadcast Essential Need</h3>
              
              <form onSubmit={handlePostNeed} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={needCategory}
                    onChange={(e) => setNeedCategory(e.target.value)}
                    className="w-full bg-white border border-border p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {['Clothing', 'Food', 'Books', 'Furniture', 'Electronics', 'Medical', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <InputField
                  label="Specific Item Needed"
                  id="item-name"
                  placeholder="e.g. Winter blankets, Canned beans"
                  value={needItem}
                  onChange={(e) => setNeedItem(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Quantity Needed"
                    id="qty"
                    type="number"
                    min="1"
                    placeholder="50"
                    value={needQty}
                    onChange={(e) => setNeedQty(e.target.value)}
                    required
                  />

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Urgency</label>
                    <select
                      value={needUrgency}
                      onChange={(e) => setNeedUrgency(e.target.value)}
                      className="w-full bg-white border border-border p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Brief Description Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Provide compliance details (sizes, shelf lives)..."
                    value={needDescription}
                    onChange={(e) => setNeedDescription(e.target.value)}
                    className="w-full bg-white border border-border p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder-slate-400"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full py-2.5 font-bold" icon={Plus}>
                  Post Need Broadcaster
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: RADIUS MAP */}
        {activeTab === 'geo' && (
          <div className="space-y-4">
            <div className="p-4 bg-white border border-border rounded-2xl shadow-premium-sm text-xs">
              <p className="font-semibold flex items-center gap-1.5 text-primary">
                <MapPin className="w-4 h-4 text-primary" /> Georadial Logistics coverage
              </p>
              <p className="text-slate-500 mt-1">
                Displaying incoming claimed shipments coordinates within your registered 4km matching radius.
              </p>
            </div>

            <div ref={geoMapRef} className="h-96 w-full border border-border rounded-2xl z-10 shadow-premium-sm" />
          </div>
        )}

        {/* TAB 4: IMPACT ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recharts Line Chart: Monthly Inbound */}
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
              <h4 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">Monthly Inbound Logistics</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ fontSize: 11, fontFamily: 'Inter' }} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <Line type="monotone" dataKey="received" stroke="#2E7D32" strokeWidth={2.5} name="Received Units" />
                    <Line type="monotone" dataKey="target" stroke="#4CAF50" strokeWidth={1.5} strokeDasharray="3 3" name="Target Demand" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recharts Pie Chart: Category shares */}
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
              <h4 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">Donations Share by Category</h4>
              <div className="h-64 flex flex-col sm:flex-row items-center justify-around gap-4">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CATEGORY_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {CATEGORY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend list */}
                <div className="space-y-1.5 text-[11px] font-mono">
                  {CATEGORY_DATA.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-ink">{item.name}:</span>
                      <span className="text-slate-500">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart: Retention metrics */}
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4 lg:col-span-2">
              <h4 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">Donor Retention & Environmental Performance Metrics</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'New Donors', count: 18, co2: 45 },
                      { name: 'Returning Donors', count: 32, co2: 80 },
                      { name: 'Corporate CSR Partners', count: 8, co2: 125 }
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2E7D32" radius={[4, 4, 0, 0]} name="Active Providers Count" />
                    <Bar dataKey="co2" fill="#43A047" radius={[4, 4, 0, 0]} name="CO2 Saved (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
