import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useRealDB } from '../hooks/useRealDB';
import { getApiError, ngoAPI } from '../api/index';
import Navbar from '../components/layout/Navbar';
import DonationCard from '../components/ui/DonationCard';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { useToast } from '../components/ui/Toast';
import LeafletMap from '../components/ui/LeafletMap';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { ShieldCheck, Package, Clock, AlertTriangle, Plus, MapPin, BarChart3, Activity, Heart, Trash2, ArrowRight, Zap, Radar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

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

  useEffect(() => {
    if (activeTab === 'analytics' && currentNgo?.id) {
      setLoadingAnalytics(true);
      ngoAPI.getAnalytics()
        .then(res => {
          setMonthlyData(res.data.monthly || []);
          setCategoryData((res.data.categories || []).map((c, i) => ({
            ...c,
            color: ['#10B981', '#34D399', '#059669', '#6EE7B7', '#047857'][i % 5]
          })));
        })
        .catch(err => toast.error('Failed to load analytics'))
        .finally(() => setLoadingAnalytics(false));
    }
  }, [activeTab, currentNgo?.id]);

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
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white selection:bg-red-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1),transparent_50%)]" />
        <div className="w-full max-w-xl bg-slate-800/80 backdrop-blur-xl border border-red-500/20 p-10 rounded-[2rem] shadow-2xl shadow-red-500/10 text-center space-y-8 relative z-10">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 shadow-inner">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl tracking-tight text-white">NGO Access Restricted</h1>
            <p className="text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              Your NGO status requires manual verification of legal filings before you can claim matches.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-700 bg-slate-900/50 text-left space-y-2 shadow-inner">
            <p className="font-bold text-slate-300 uppercase tracking-widest text-xs">Rejection Reason</p>
            <p className="text-slate-400 font-medium">
              {currentNgo?.rejectionReason || 'Invalid NGO registration license number. Please verify tax details.'}
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="secondary" onClick={() => navigate('/settings')} className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600 rounded-xl px-6 h-12 font-bold">
              Update License
            </Button>
            <Button variant="primary" onClick={() => navigate('/chat')} className="bg-red-500 hover:bg-red-600 border-none shadow-lg shadow-red-500/20 rounded-xl px-6 h-12 font-bold">
              Contact Support
            </Button>
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
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 pt-28 space-y-8 relative z-10">
        
        {/* NGO Header banner with dynamic verification status */}
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative z-10 flex gap-6 items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display font-black text-3xl text-slate-900 tracking-tight">{currentNgo.name}</h2>
                {verStatus === 'approved' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-[10px] uppercase tracking-widest shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-black text-[10px] uppercase tracking-widest shadow-sm">
                    <Clock className="w-3.5 h-3.5" /> Pending Audit
                  </span>
                )}
              </div>
              <p className="text-slate-500 font-mono mt-2 text-sm font-bold">HUB ID: #{currentNgo.id} &bull; VETTED COMPLIANT ORG</p>
            </div>
          </div>

          {/* Verification Warning for Pending NGOs */}
          {verStatus === 'pending' && (
            <div className="flex-1 max-w-md bg-amber-50/50 border border-amber-200 text-amber-800 p-5 rounded-2xl leading-relaxed flex gap-4 shadow-inner relative z-10">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-black tracking-tight text-amber-900">Pending Administrative Review</p>
                <p className="text-amber-700 font-medium text-sm mt-1">Your submitted certificates are currently in the audit queue. Complete operations will unlock once approved.</p>
              </div>
            </div>
          )}

          {/* Trust Score stats block */}
          <div className="flex gap-4 shrink-0 w-full lg:w-auto relative z-10">
            <div className="flex-1 text-center bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl min-w-[120px] shadow-sm">
              <span className="font-mono text-slate-400 block font-bold text-xs">TRUST SCORE</span>
              <span className={`text-3xl font-black block mt-1 tracking-tight ${verStatus === 'approved' ? 'text-emerald-500' : 'text-slate-700'}`}>
                {currentNgo.trustScore || 95}%
              </span>
            </div>
            <div className="flex-1 text-center bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl min-w-[120px] shadow-sm">
              <span className="font-mono text-slate-400 block font-bold text-xs">FULFILL RATE</span>
              <span className="text-3xl font-black text-slate-800 block mt-1 tracking-tight">
                {currentNgo.successRate || '99%'}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Counters Widgets */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex justify-between items-center hover:-translate-y-1 transition-transform group">
            <div className="space-y-1 z-10">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs block">Items Received</span>
              <span className="text-4xl font-display font-black text-slate-900 block tracking-tight">{totalReceived} <span className="text-lg text-slate-400">units</span></span>
            </div>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-sm z-10">
              <Package className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex justify-between items-center hover:-translate-y-1 transition-transform group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-sky-100 transition-colors" />
            <div className="space-y-1 z-10">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs block">Cargo In Transit</span>
              <span className="text-4xl font-display font-black text-sky-600 block tracking-tight">{totalInTransit} <span className="text-lg text-sky-300">units</span></span>
            </div>
            <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center border border-sky-100 group-hover:bg-sky-500 group-hover:text-white transition-colors shadow-sm z-10">
              <Clock className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex justify-between items-center hover:-translate-y-1 transition-transform group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-rose-100 transition-colors" />
            <div className="space-y-1 z-10">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs block">Active Postings</span>
              <span className="text-4xl font-display font-black text-rose-600 block tracking-tight">{activeNeedsCount} <span className="text-lg text-rose-300">posts</span></span>
            </div>
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 group-hover:bg-rose-500 group-hover:text-white transition-colors shadow-sm z-10">
              <Activity className="w-8 h-8" />
            </div>
          </div>
        </section>

        {/* Dashboard Tabs Navigation */}
        <div className="flex p-2 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-[1.25rem] w-full overflow-x-auto hide-scrollbar shadow-sm">
          {[
            { id: 'matches', label: `Smart Matches (${smartMatches.length})`, icon: Zap },
            { id: 'needs', label: `Broadcast Demands (${ngoNeeds.length})`, icon: Activity },
            { id: 'geo', label: `Coverage Map (${activeIncoming.length})`, icon: Radar },
            { id: 'analytics', label: `Analytics`, icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 relative ${
                activeTab === tab.id
                  ? 'text-slate-900 shadow-sm bg-white'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabNgo" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50 -z-10" />
              )}
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-500' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* TAB 1: SMART MATCHES */}
          {activeTab === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-slate-900/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none" />
                
                <div className="relative z-10 text-white">
                  <h3 className="font-display font-black text-2xl tracking-tight flex items-center gap-3">
                    <Zap className="w-6 h-6 text-emerald-400" /> Smart Match Queue
                  </h3>
                  <p className="text-slate-400 mt-2 font-medium">AI-driven logistics matching nearby donor dispatches with your active demand configs.</p>
                </div>
                <span className="relative z-10 font-mono bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/30 font-bold uppercase tracking-widest shadow-sm">
                  {smartMatches.length} Found
                </span>
              </div>

              {verStatus !== 'approved' && (
                <div className="bg-amber-50/50 border border-amber-200 p-10 rounded-[2rem] text-center space-y-4 shadow-inner">
                  <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
                  <h3 className="font-display font-black text-amber-900 text-2xl tracking-tight">Manual Audit Required</h3>
                  <p className="text-amber-800 font-medium max-w-md mx-auto">Only verified NGOs with validated legal registration parameters can execute donor claims.</p>
                </div>
              )}

              {loadingMatches ? (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-20 flex flex-col items-center justify-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="font-bold text-slate-500">Scanning matching matrix…</p>
                </div>
              ) : verStatus === 'approved' && smartMatches.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-16 text-center space-y-6 shadow-xl shadow-slate-200/40">
                  <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-3xl mx-auto flex items-center justify-center text-slate-300 shadow-inner">
                    <Package className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-slate-900 text-2xl tracking-tight">No matches recommended yet</h3>
                    <p className="text-slate-500 max-w-md mx-auto mt-2 font-medium">Broadcast a new essential need item to allow the algorithm to suggest relevant donations in your area.</p>
                  </div>
                  <Button variant="primary" onClick={() => setActiveTab('needs')} className="shadow-lg shadow-emerald-500/20 h-12 px-8 rounded-xl font-bold">
                    Create Broadcaster
                  </Button>
                </div>
              ) : verStatus === 'approved' && (
                <div className="grid grid-cols-1 gap-6">
                  {smartMatches.map(({ donation, need, scoreBreakdown }) => (
                    <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden hover:border-emerald-200 transition-colors">
                      <DonationCard
                        key={donation.id}
                        donation={donation}
                        matchScoreDetails={scoreBreakdown}
                        onClaim={() => handleClaimDonation(donation.id, scoreBreakdown.total)}
                        actions={
                          <span className="font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-sm block sm:inline-block">
                            Match Target: <strong className="text-slate-900 font-bold">{need.item}</strong>
                          </span>
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: BROADCAST NEEDS */}
          {activeTab === 'needs' && (
            <motion.div
              key="needs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <div className="lg:col-span-8 space-y-6">
                <div className="flex justify-between items-center bg-white p-4 pr-6 pl-8 rounded-2xl shadow-sm border border-slate-200/60">
                  <h3 className="font-display font-black text-slate-900 text-xl tracking-tight">Active Demand Ledger</h3>
                  <span className="font-mono font-bold text-slate-500 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs">{ngoNeeds.length} items</span>
                </div>
                
                {ngoNeeds.length === 0 ? (
                  <div className="p-16 text-slate-400 text-center font-bold border border-slate-200 border-dashed rounded-[2rem] bg-white shadow-sm flex flex-col items-center justify-center gap-4">
                    <Activity className="w-10 h-10 opacity-50" />
                    <p>No active needs registered.<br/><span className="text-sm font-medium">Use the form to broadcast demands.</span></p>
                  </div>
                ) : (
                  <div className="overflow-hidden border border-slate-200 rounded-[2rem] bg-white shadow-xl shadow-slate-200/40">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                            <th className="p-5">Category</th>
                            <th className="p-5">Item Needed</th>
                            <th className="p-5 text-center">Quantity</th>
                            <th className="p-5">Urgency</th>
                            <th className="p-5">Description</th>
                            <th className="p-5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ngoNeeds.map(need => (
                            <tr key={need.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="p-5 font-bold text-emerald-600 font-mono text-sm">{need.category}</td>
                              <td className="p-5 font-bold text-slate-900">{need.item}</td>
                              <td className="p-5 text-center font-mono font-bold text-slate-800 bg-slate-50/50">{need.quantity}</td>
                              <td className="p-5">
                                <span className={`inline-flex px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border shadow-sm ${
                                  need.urgency === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                  need.urgency === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-slate-50 text-slate-700 border-slate-200'
                                }`}>
                                  {need.urgency}
                                </span>
                              </td>
                              <td className="p-5 text-slate-500 font-medium text-sm max-w-[150px] truncate" title={need.description}>{need.description || '--'}</td>
                              <td className="p-5 text-right">
                                <button
                                  onClick={() => handleDeleteNeed(need.id)}
                                  className="w-10 h-10 inline-flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30 rounded-xl transition-all cursor-pointer"
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

              <div className="lg:col-span-4 bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-[60px] -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="relative z-10">
                  <h3 className="font-display font-black text-slate-900 text-2xl tracking-tight">Broadcast Need</h3>
                  <p className="text-slate-500 mt-2 font-medium text-sm">Add essentials to your local demand ledger.</p>
                </div>
                
                <form onSubmit={handlePostNeed} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                    <select
                      value={needCategory}
                      onChange={(e) => setNeedCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm transition-all"
                    >
                      {['Clothing', 'Food', 'Books', 'Furniture', 'Electronics', 'Medical Equipment', 'School Supplies', 'Blankets', 'Sports Equipment'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <InputField
                    label="Specific Item Needed"
                    id="item-name"
                    placeholder="e.g. Winter blankets"
                    value={needItem}
                    onChange={(e) => setNeedItem(e.target.value)}
                    required
                    className="!bg-slate-50 border-slate-200 rounded-xl"
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
                      className="!bg-slate-50 border-slate-200 rounded-xl"
                    />

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Urgency</label>
                      <select
                        value={needUrgency}
                        onChange={(e) => setNeedUrgency(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm transition-all"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Special Notes</label>
                    <textarea
                      rows="3"
                      placeholder="Compliance details..."
                      value={needDescription}
                      onChange={(e) => setNeedDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm placeholder-slate-400 transition-all"
                    />
                  </div>

                  <Button type="submit" variant="primary" icon={Plus} className="w-full h-14 rounded-xl font-bold shadow-lg shadow-emerald-500/25">
                    Post to Network
                  </Button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 3: RADIUS MAP */}
          {activeTab === 'geo' && (
            <motion.div
              key="geo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none" />
                
                <h3 className="font-display font-black text-2xl tracking-tight flex items-center gap-3 relative z-10">
                  <Radar className="w-6 h-6 text-teal-400" /> Georadial Logistics Coverage
                </h3>
                <p className="text-slate-400 mt-2 font-medium relative z-10 max-w-2xl">
                  Live display of incoming claimed shipments coordinates within your registered 4km matching radius around the NGO Hub location.
                </p>
              </div>

              <div className="h-[600px] w-full border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/40 relative z-0 p-2 bg-white">
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden">
                  <LeafletMap
                    center={[currentNgo.lat, currentNgo.lng]}
                    zoom={13}
                    markers={mapMarkers}
                    circles={[{ lat: currentNgo.lat, lng: currentNgo.lng, radius: 4000, color: '#10B981', fillColor: '#10B981', fillOpacity: 0.1 }]}
                    className="h-full w-full border-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: IMPACT ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 space-y-8">
                <h4 className="font-display font-black text-slate-900 text-xl tracking-tight">Monthly Inbound Trajectory</h4>
                {loadingAnalytics ? (
                  <div className="h-72 flex items-center justify-center text-slate-400 font-bold">Loading Engine...</div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'Inter', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', paddingTop: '20px' }} />
                        <Line type="monotone" dataKey="received" stroke="#10B981" strokeWidth={3} name="Received Units" activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} />
                        <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" name="Target Demand" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 space-y-8">
                <h4 className="font-display font-black text-slate-900 text-xl tracking-tight">Donations Composition</h4>
                {loadingAnalytics ? (
                  <div className="h-72 flex items-center justify-center text-slate-400 font-bold">Loading Engine...</div>
                ) : (
                  <div className="h-72 flex flex-col sm:flex-row items-center justify-around gap-8">
                    <div className="w-56 h-56 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value} units`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-display font-black text-2xl text-slate-900">{totalReceived}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4 font-mono w-full sm:w-auto bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                      {categoryData.map(item => (
                        <div key={item.name} className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-md shadow-sm" style={{ backgroundColor: item.color }} />
                          <span className="font-bold text-slate-800 text-sm flex-1">{item.name}</span>
                          <span className="text-slate-500 text-sm">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
