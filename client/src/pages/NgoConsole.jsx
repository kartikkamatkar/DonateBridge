import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useRealDB } from '../hooks/useRealDB';
import { getApiError } from '../api/index';
import Navbar from '../components/layout/Navbar';
import DonationCard from '../components/ui/DonationCard';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { useToast } from '../components/ui/Toast';
import LeafletMap from '../components/ui/LeafletMap';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { ShieldCheck, Package, Clock, AlertTriangle, Plus, MapPin, BarChart3, Activity, Heart, Trash2, ArrowRight } from 'lucide-react';

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
 { name: 'Food', value: 30, color: '#4CAF50' },
 { name: 'Books', value: 15, color: '#10B981' },
 { name: 'Medical', value: 10, color: '#059669' },
 { name: 'Other', value: 5, color: '#EF4444' }
];

export default function NgoConsole() {
 const { user } = useAuth();
 const {
  myNgo, needs, donations,
  addNeed, deleteNeed, claimDonation,
  getSmartMatchesForNgo
 } = useRealDB();
 const navigate = useNavigate();
 const { toast } = useToast();

 const [activeTab, setActiveTab] = useState('matches');
 const [smartMatches, setSmartMatches] = useState([]);
 const [loadingMatches, setLoadingMatches] = useState(false);

 // Need posting form states
 const [needCategory, setNeedCategory] = useState('Clothing');
 const [needItem, setNeedItem] = useState('');
 const [needQty, setNeedQty] = useState('');
 const [needUrgency, setNeedUrgency] = useState('Medium');
 const [needDescription, setNeedDescription] = useState('');


 useEffect(() => {
    if (myNgo === false) {
      toast.error('Please complete your NGO profile registration first.');
      navigate('/ngo-register');
    }
  }, [myNgo, navigate, toast]);

  // Active NGO Hub Info (from real API)
 const currentNgo = myNgo || {
  id: null, name: user?.name || 'NGO', lat: 12.9716, lng: 77.5946,
  trustScore: 70, responseTime: '--', successRate: '--',
  verificationStatus: user?.verificationStatus || 'pending',
  rejectionReason: user?.rejectionReason || ''
 };

 // NGO-specific data
 const ngoNeeds = needs.filter(n => n.ngoId === currentNgo.id);
 const activeIncoming = donations.filter(d => String(d.matchedNgoId) === String(currentNgo.id) && d.status === 'MATCHED');
 const deliveredDonations = donations.filter(d => String(d.matchedNgoId) === String(currentNgo.id) && d.status === 'DELIVERED');
 const totalReceived = deliveredDonations.reduce((acc, curr) => acc + curr.quantity, 0);
 const totalInTransit = activeIncoming.reduce((acc, curr) => acc + curr.quantity, 0);
 const activeNeedsCount = ngoNeeds.length;

 // Fetch smart matches when NGO is approved
 useEffect(() => {
  if (currentNgo?.verificationStatus === 'approved') {
   setLoadingMatches(true);
   getSmartMatchesForNgo().then(matches => {
    setSmartMatches(matches);
   }).finally(() => setLoadingMatches(false));
  }
 }, [currentNgo?.id]);

 const handlePostNeed = async (e) => {
  e.preventDefault();
  try {
   await addNeed({
    category: needCategory,
    item: needItem,
    quantity: parseInt(needQty),
    urgency: needUrgency,
    description: needDescription,
    lat: currentNgo.lat || 0,
    lng: currentNgo.lng || 0,
   });
   setNeedItem('');
   setNeedQty('');
   setNeedDescription('');
   toast.success('Need broadcasted successfully!');
   setActiveTab('needs');
  } catch (err) {
   toast.error(getApiError(err));
  }
 };

 const handleClaimDonation = async (donationId, score) => {
  try {
   await claimDonation(donationId);
   // Refresh smart matches
   const matches = await getSmartMatchesForNgo();
   setSmartMatches(matches);
   toast.success('Logistics match claimed! Shipment scheduled.');
  } catch (err) {
   toast.error(getApiError(err));
  }
 };

 const handleDeleteNeed = async (id) => {
  try {
   await deleteNeed(id);
   toast.success('Need broadcast deleted.');
  } catch (err) {
   toast.error(getApiError(err));
  }
 };

 const verStatus = currentNgo?.verificationStatus || 'pending';

 if (verStatus === 'rejected') {
  return (
   <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900">
    <div className="w-full max-w-xl bg-white border border-border p-8 rounded-2xl shadow-premium-lg text-center space-y-6">
     <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold uppercase">
      <AlertTriangle className="w-4 h-4" /> Verification Denied
     </div>
     <h1 className="font-display font-black text-slate-900" style={{ fontSize: '22px' }}>NGO Access Restricted</h1>
     <p className="text-slate-500 max-w-md mx-auto leading-relaxed" style={{ fontSize: '15px' }}>
      Your NGO status requires manual verification of legal filings before you can claim matches.
     </p>
     <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 text-left space-y-2">
      <p className="font-bold text-slate-800" style={{ fontSize: '14px' }}>Rejection Reason:</p>
      <p className="text-slate-600" style={{ fontSize: '13px' }}>
       {currentNgo?.rejectionReason || 'Invalid NGO registration license number. Please verify tax details.'}
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

 // Pre-configured markers array for LeafletMap component
 const incomingMarkers = activeIncoming.map(item => ({
  lat: item.location.lat,
  lng: item.location.lng,
  popupContent: `<strong>${item.id}</strong><br/>${item.itemName || item.category}<br/>Qty: ${item.quantity}`
 }));

 // Hub marker
 const mapMarkers = [
  { lat: currentNgo.lat, lng: currentNgo.lng, popupContent: `<strong>${currentNgo.name} (Hub)</strong>` },
  ...incomingMarkers
 ];

 return (
  <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
   <Navbar />

   <main className="flex-grow p-6 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
    
    {/* NGO Header banner with dynamic verification status */}
    <div className="bg-white border border-border p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 rounded-2xl shadow-premium-sm">
     <div>
      <div className="flex flex-wrap items-center gap-3">
       <h2 className="font-display font-black text-slate-900 leading-tight" style={{ fontSize: '22px' }}>{currentNgo.name}</h2>
       {verStatus === 'approved' ? (
        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase" style={{ fontSize: '11px' }}>
         Approved
        </span>
       ) : (
        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-bold uppercase" style={{ fontSize: '11px' }}>
         Pending Audit
        </span>
       )}
      </div>
      <p className="text-slate-400 font-mono mt-1" style={{ fontSize: '12px' }}>HUB ID: #{currentNgo.id} &bull; VETTED COMPLIANT ORGANISATION</p>
     </div>

     {/* Verification Warning for Pending NGOs */}
     {verStatus === 'pending' && (
      <div className="flex-1 max-w-md bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl leading-relaxed flex gap-3">
       <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
       <div style={{ fontSize: '13px' }}>
        <p className="font-bold">Pending Administrative Review</p>
        <p className="text-amber-750/90 mt-0.5">Your submitted certificates are currently in the audit queue. Complete operations will unlock once approved.</p>
       </div>
      </div>
     )}

     {/* Trust Score stats block */}
     <div className="flex gap-4 shrink-0 w-full lg:w-auto">
      <div className="flex-1 text-center bg-slate-50 border border-border px-5 py-3 rounded-xl min-w-[100px]">
       <span className="font-mono text-slate-400 block font-bold" style={{ fontSize: '10px' }}>TRUST SCORE</span>
       <span className={`text-lg font-black block mt-0.5 ${verStatus === 'approved' ? 'text-emerald-600' : 'text-slate-600'}`}>
        {currentNgo.trustScore || 95}%
       </span>
      </div>
      <div className="flex-1 text-center bg-slate-50 border border-border px-5 py-3 rounded-xl min-w-[100px]">
       <span className="font-mono text-slate-400 block font-bold" style={{ fontSize: '10px' }}>AVG RESPONSE</span>
       <span className="text-lg font-black text-slate-700 block mt-0.5">
        {currentNgo.responseTime || '1.8 hrs'}
       </span>
      </div>
      <div className="flex-1 text-center bg-slate-50 border border-border px-5 py-3 rounded-xl min-w-[100px]">
       <span className="font-mono text-slate-400 block font-bold" style={{ fontSize: '10px' }}>FULFILL RATE</span>
       <span className="text-lg font-black text-slate-700 block mt-0.5">
        {currentNgo.successRate || '99%'}
       </span>
      </div>
     </div>
    </div>

    {/* Inventory Counters Widgets */}
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
     <div className="saas-card flex justify-between items-center">
      <div className="space-y-1">
       <span className="font-mono text-slate-400 font-bold uppercase tracking-wider block" style={{ fontSize: '11px' }}>Items Received</span>
       <span className="text-3xl font-display font-black text-slate-900 block">{totalReceived} units</span>
      </div>
      <div className="w-12 h-12 bg-emerald-50 text-emerald-650 rounded-xl flex items-center justify-center">
       <Package className="w-6 h-6" />
      </div>
     </div>

     <div className="saas-card flex justify-between items-center">
      <div className="space-y-1">
       <span className="font-mono text-slate-400 font-bold uppercase tracking-wider block" style={{ fontSize: '11px' }}>Cargo In Transit</span>
       <span className="text-3xl font-display font-black text-primary block">{totalInTransit} units</span>
      </div>
      <div className="w-12 h-12 bg-sky-50 text-sky-650 rounded-xl flex items-center justify-center">
       <Clock className="w-6 h-6" />
      </div>
     </div>

     <div className="saas-card flex justify-between items-center">
      <div className="space-y-1">
       <span className="font-mono text-slate-400 font-bold uppercase tracking-wider block" style={{ fontSize: '11px' }}>Active Demand Posts</span>
       <span className="text-3xl font-display font-black text-slate-800 block">{activeNeedsCount} requests</span>
      </div>
      <div className="w-12 h-12 bg-rose-50 text-rose-650 rounded-xl flex items-center justify-center">
       <Activity className="w-6 h-6" />
      </div>
     </div>
    </section>

    {/* Dashboard Tabs Navigation */}
    <div className="flex border-b border-slate-200 gap-3">
     <button
      onClick={() => setActiveTab('matches')}
      className={`px-4 py-3 font-semibold border-b-2 transition-all cursor-pointer ${
       activeTab === 'matches'
        ? 'border-primary text-primary font-bold'
        : 'border-transparent text-slate-500 hover:text-slate-900'
      }`}
      style={{ fontSize: '15px' }}
     >
      Smart Matches ({smartMatches.length})
     </button>
     <button
      onClick={() => setActiveTab('needs')}
      className={`px-4 py-3 font-semibold border-b-2 transition-all cursor-pointer ${
       activeTab === 'needs'
        ? 'border-primary text-primary font-bold'
        : 'border-transparent text-slate-500 hover:text-slate-900'
      }`}
      style={{ fontSize: '15px' }}
     >
      Broadcast Demands ({ngoNeeds.length})
     </button>
     <button
      onClick={() => setActiveTab('geo')}
      className={`px-4 py-3 font-semibold border-b-2 transition-all cursor-pointer ${
       activeTab === 'geo'
        ? 'border-primary text-primary font-bold'
        : 'border-transparent text-slate-500 hover:text-slate-900'
      }`}
      style={{ fontSize: '15px' }}
     >
      Coverage Area Map ({activeIncoming.length})
     </button>
     <button
      onClick={() => setActiveTab('analytics')}
      className={`px-4 py-3 font-semibold border-b-2 transition-all cursor-pointer ${
       activeTab === 'analytics'
        ? 'border-primary text-primary font-bold'
        : 'border-transparent text-slate-500 hover:text-slate-900'
      }`}
      style={{ fontSize: '15px' }}
     >
      Analytics &amp; Performance
     </button>
    </div>

    {/* TAB 1: SMART MATCHES */}
    {activeTab === 'matches' && (
     <div className="space-y-6">
      <div className="p-5 bg-white border border-border rounded-2xl shadow-premium-sm flex justify-between items-center text-slate-700">
       <div>
        <p className="font-bold text-slate-900" style={{ fontSize: '15px' }}>Smart Match Queue Suggestions</p>
        <p className="text-slate-500 mt-0.5" style={{ fontSize: '13px' }}>Matching nearby verified donor dispatches with your active demand configurations.</p>
       </div>
       <span className="font-mono bg-primary text-white px-3 py-1 rounded-xl font-bold uppercase tracking-wider" style={{ fontSize: '11px' }}>
        {smartMatches.length} Matches Found
       </span>
      </div>

      {verStatus !== 'approved' && (
       <div className="saas-card text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
        <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Manual Audit Required</h3>
        <p className="text-slate-500 max-w-sm mx-auto" style={{ fontSize: '14px' }}>Only verified NGOs with validated legal registration parameters can execute donor claims.</p>
       </div>
      )}

       {loadingMatches ? (
        <div className="saas-card flex flex-col items-center justify-center space-y-4">
         <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
         <p className="font-bold text-slate-700" style={{ fontSize: '16px' }}>Loading smart matches…</p>
        </div>
       ) : verStatus === 'approved' && smartMatches.length === 0 ? (
       <div className="bg-white border border-border rounded-2xl p-12 text-center space-y-4 shadow-premium-sm">
        <Package className="w-12 h-12 text-slate-350 mx-auto" />
        <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>No matches recommended yet</h3>
        <p className="text-slate-500 max-w-sm mx-auto" style={{ fontSize: '14px' }}>Try broadcasting a new essential need item to allow the algorithm to suggest relevant donations.</p>
        <Button variant="primary" onClick={() => setActiveTab('needs')}>
         Post Broadcaster
        </Button>
       </div>
      ) : verStatus === 'approved' && (
       <div className="grid grid-cols-1 gap-6">
        {smartMatches.map(({ donation, need, scoreBreakdown }) => (
         <DonationCard
          key={donation.id}
          donation={donation}
          matchScoreDetails={scoreBreakdown}
          onClaim={() => handleClaimDonation(donation.id, scoreBreakdown.total)}
          actions={
           <span className="font-mono text-slate-400" style={{ fontSize: '12px' }}>
            Match Basis: <strong className="text-slate-700 font-bold">{need.item}</strong>
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
     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Needs List */}
      <div className="lg:col-span-8 space-y-4">
       <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Active Demand Ledger</h3>
       
       {ngoNeeds.length === 0 ? (
        <p className="p-8 text-slate-500 text-center font-semibold border border-dashed border-slate-200 rounded-xl bg-white shadow-premium-sm" style={{ fontSize: '14px' }}>No active needs registered.</p>
       ) : (
        <div className="overflow-hidden border border-border rounded-xl bg-white shadow-premium-sm">
         <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
           <thead>
            <tr className="border-b border-border bg-slate-50 text-slate-600 font-bold" style={{ fontSize: '13px' }}>
             <th className="p-4">Category</th>
             <th className="p-4">Item Needed</th>
             <th className="p-4 text-center">Quantity</th>
             <th className="p-4">Urgency</th>
             <th className="p-4">Description</th>
             <th className="p-4 text-right">Action</th>
            </tr>
           </thead>
           <tbody className="divide-y divide-border" style={{ fontSize: '14px' }}>
            {ngoNeeds.map(need => (
             <tr key={need.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="p-4 font-bold text-primary font-mono" style={{ fontSize: '11px' }}>{need.category}</td>
              <td className="p-4 font-bold text-slate-900">{need.item}</td>
              <td className="p-4 text-center font-mono font-bold text-slate-800">{need.quantity}</td>
              <td className="p-4">
               <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase ${
                need.urgency === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                need.urgency === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-slate-50 text-slate-700 border-slate-250'
               }`}>
                {need.urgency}
               </span>
              </td>
              <td className="p-4 text-slate-500 max-w-[150px] truncate" title={need.description}>{need.description || '--'}</td>
              <td className="p-4 text-right">
               <button
                onClick={() => handleDeleteNeed(need.id)}
                className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Delete broadcast"
               >
                <Trash2 className="w-4.5 h-4.5" />
               </button>
              </td>
             </tr>
            ))}
           </tbody>
          </table>
         </div>
        </div>
       )}
      </div>

      {/* Quick Add Need Form */}
      <div className="lg:col-span-4 saas-card space-y-6">
       <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Broadcast Essential Need</h3>
       
       <form onSubmit={handlePostNeed} className="space-y-5">
        <div className="space-y-1">
         <label className="text-sm font-semibold text-slate-700 block">Category</label>
         <select
          value={needCategory}
          onChange={(e) => setNeedCategory(e.target.value)}
          className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-slate-900 focus:outline-none focus:border-primary font-medium"
          style={{ fontSize: '16px', minHeight: '48px' }}
         >
          {['Clothing', 'Food', 'Books', 'Furniture', 'Electronics', 'Medical Equipment', 'School Supplies', 'Blankets', 'Sports Equipment'].map(cat => (
           <option key={cat} value={cat}>{cat}</option>
          ))}
         </select>
        </div>

        <InputField
         label="Specific Item Needed"
         id="item-name"
         placeholder="e.g. Winter blankets, Canned food packs"
         value={needItem}
         onChange={(e) => setNeedItem(e.target.value)}
         required
        />

        <div className="grid grid-cols-2 gap-4">
         <InputField
          label="Quantity"
          id="qty"
          type="number"
          min="1"
          placeholder="50"
          value={needQty}
          onChange={(e) => setNeedQty(e.target.value)}
          required
         />

         <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700 block">Urgency</label>
          <select
           value={needUrgency}
           onChange={(e) => setNeedUrgency(e.target.value)}
           className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-slate-900 focus:outline-none focus:border-primary font-medium"
           style={{ fontSize: '16px', minHeight: '48px' }}
          >
           <option value="High">High</option>
           <option value="Medium">Medium</option>
           <option value="Low">Low</option>
          </select>
         </div>
        </div>

        <div className="space-y-1">
         <label className="text-sm font-semibold text-slate-700 block">Special Guidelines / Notes</label>
         <textarea
          rows="3"
          placeholder="Provide compliance details (sizes, shelf lives)..."
          value={needDescription}
          onChange={(e) => setNeedDescription(e.target.value)}
          className="w-full bg-white border border-slate-200 p-4 rounded-xl text-slate-900 focus:outline-none focus:border-primary placeholder-slate-400"
          style={{ fontSize: '16px' }}
         />
        </div>

        <Button type="submit" variant="primary" icon={Plus} className="w-full">
         Post Broadcaster
        </Button>
       </form>
      </div>
     </div>
    )}

    {/* TAB 3: RADIUS MAP */}
    {activeTab === 'geo' && (
     <div className="space-y-4">
      <div className="p-5 bg-white border border-border rounded-2xl shadow-premium-sm text-slate-700">
       <p className="font-bold flex items-center gap-2 text-primary" style={{ fontSize: '15px' }}>
        <MapPin className="w-5 h-5" /> Georadial Logistics Coverage
       </p>
       <p className="text-slate-500 mt-1" style={{ fontSize: '13px' }}>
        Displaying incoming claimed shipments coordinates within your registered 4km matching radius around the NGO Hub location.
       </p>
      </div>

      <div className="h-[480px] w-full border border-border rounded-2xl overflow-hidden shadow-premium-sm">
       <LeafletMap
        center={[currentNgo.lat, currentNgo.lng]}
        zoom={13}
        markers={mapMarkers}
        circles={[{ lat: currentNgo.lat, lng: currentNgo.lng, radius: 4000, color: '#2E7D32', fillColor: '#2E7D32', fillOpacity: 0.05 }]}
        className="h-full w-full border-none"
       />
      </div>
     </div>
    )}

    {/* TAB 4: IMPACT ANALYTICS */}
    {activeTab === 'analytics' && (
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Recharts Line Chart: Monthly Inbound */}
      <div className="saas-card space-y-4">
       <h4 className="font-display font-bold text-slate-400 uppercase tracking-wider" style={{ fontSize: '12px' }}>Monthly Inbound Logistics</h4>
       <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
         <LineChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
          <YAxis tick={{ fontSize: 11, fontFamily: 'monospace' }} />
          <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'Inter' }} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'monospace' }} />
          <Line type="monotone" dataKey="received" stroke="#2E7D32" strokeWidth={2.5} name="Received Units" />
          <Line type="monotone" dataKey="target" stroke="#4CAF50" strokeWidth={1.5} strokeDasharray="3 3" name="Target Demand" />
         </LineChart>
        </ResponsiveContainer>
       </div>
      </div>

      {/* Recharts Pie Chart: Category shares */}
      <div className="saas-card space-y-4">
       <h4 className="font-display font-bold text-slate-400 uppercase tracking-wider" style={{ fontSize: '12px' }}>Donations Share by Category</h4>
       <div className="h-72 flex flex-col sm:flex-row items-center justify-around gap-6">
        <div className="w-48 h-48">
         <ResponsiveContainer width="100%" height="100%">
          <PieChart>
           <Pie
            data={CATEGORY_DATA}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
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
        <div className="space-y-2.5 font-mono" style={{ fontSize: '12px' }}>
         {CATEGORY_DATA.map(item => (
          <div key={item.name} className="flex items-center gap-2">
           <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
           <span className="font-bold text-slate-700">{item.name}:</span>
           <span className="text-slate-500">{item.value}%</span>
          </div>
         ))}
        </div>
       </div>
      </div>
     </div>
    )}

   </main>
  </div>
 );
}
