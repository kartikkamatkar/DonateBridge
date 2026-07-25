import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useRealDB } from '../hooks/useRealDB';
import { authAPI, getApiError } from '../api/index';
import Navbar from '../components/layout/Navbar';
import DonationCard from '../components/ui/DonationCard';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import LeafletMap from '../components/ui/LeafletMap';
import { useToast } from '../components/ui/Toast';
import { MapPin, Box, Calendar, Heart, Download, Upload, Trash2, Award, History, TrendingUp, Sparkles, Filter, Check, Eye, Leaf, AlertCircle, ArrowRight } from 'lucide-react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Clothing', 'Food', 'Books', 'Furniture', 'Electronics', 'Medical', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export default function DonorDashboard() {
  const { user } = useAuth();
  const { myDonations, addDonation, fetchMyDonations, needs, ngos } = useRealDB();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'submit' | 'history' | 'impact'
  
  // Submission Form State
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Clothing');
  const [condition, setCondition] = useState('Good');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [addressSearch, setAddressSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [location, setLocation] = useState({ lat: 21.1458, lng: 79.0882, address: 'Nagpur, Maharashtra' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Filter state for Ledger
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Certificate target element ref for html-to-image
  const certificateRef = useRef(null);
  const [activeReceiptDonation, setActiveReceiptDonation] = useState(null);

  const donorDonations = myDonations;

  // Stats calculation
  const totalDonated = donorDonations.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalDelivered = donorDonations.filter(d => d.status === 'DELIVERED').reduce((acc, curr) => acc + curr.quantity, 0);
  const estimatedPeopleHelped = totalDelivered * 3;
  const carbonSavedKg = totalDelivered * 4.5;

  const urgentNeeds = needs
    .filter(n => n.urgency === 'High' || n.urgency === 'Medium')
    .slice(0, 5)
    .map(n => {
      const ngo = ngos.find(o => String(o.id) === String(n.ngoId));
      return {
        id: n.id,
        ngo: ngo?.name || 'NGO Partner',
        item: n.item || n.category,
        qty: n.quantity,
        urgency: n.urgency,
        category: n.category,
      };
    });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const addr = data.display_name || 'Current Location';
            setLocation({ lat, lng, address: addr });
            setAddressSearch(addr);
          } catch (e) {
            setLocation({ lat, lng, address: 'Current Location' });
          }
        },
        () => {
          setLocation({ lat: 21.1458, lng: 79.0882, address: 'Nagpur, Maharashtra' });
        }
      );
    }
  }, []);

  const handleAddressSearch = async () => {
    if (!addressSearch) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(addressSearch)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error("Nominatim search failed", e);
    }
  };

  const selectAddress = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const addr = item.display_name;
    setLocation({ lat, lng, address: addr });
    setAddressSearch(addr);
    setSearchResults([]);
  };

  const handleMapClick = async (latlng) => {
    const { lat, lng } = latlng;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setLocation({ lat, lng, address: addr });
      setAddressSearch(addr);
    } catch (e) {
      setLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const res = await authAPI.uploadFile(file);
        setPhotos(prev => [...prev, res.data.url]);
        toast.success('Photo uploaded successfully.');
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
        toast.info('Using local photo preview (upload failed).');
      }
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    if (!location.lat || !location.lng || location.lat === 0) {
      toast.error('Please wait for location to load or manually pick an address on the map.');
      return;
    }
    setIsSubmitting(true);
    try {
      const newDnt = await addDonation({
        itemName,
        category,
        condition,
        quantity: parseInt(quantity),
        description,
        photos,
        location,
        preferredPickupTime: 'Flexible',
      });
      setItemName('');
      setDescription('');
      setPhotos([]);
      setQuantity(1);
      setSubmissionSuccess(newDnt);
      await fetchMyDonations();
      toast.success('Donation submitted successfully! Pending admin review.');
    } catch (err) {
      toast.error(err.response?.data ? JSON.stringify(err.response.data) : getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadReceipt = () => {
    if (!certificateRef.current) return;
    toPng(certificateRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `DonateBridge-Receipt-${activeReceiptDonation.id}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Download receipt rendering failed', err);
      });
  };

  const fulfillDemand = (demand) => {
    setItemName(`${demand.qty}x ${demand.item} for ${demand.ngo}`);
    setCategory(CATEGORIES.includes(demand.category) ? demand.category : 'Clothing');
    setQuantity(demand.qty);
    setDescription(`Direct demand fulfillment for ${demand.ngo}. Item requirements match NGO specifications.`);
    setActiveTab('submit');
    toast.info(`Auto-filled submit form for ${demand.ngo}'s request.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#4A7C59]/20">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row gap-8 relative z-10 pt-28">
        
        {/* Left Sidebar Menu */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-500" />
            <img 
              src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=donor&backgroundColor=e2e8f0'} 
              className="w-16 h-16 rounded-full border-2 border-emerald-100 shadow-sm"
              alt="avatar"
            />
            <div className="min-w-0">
              <span className="font-bold text-emerald-500 uppercase tracking-widest text-[10px] block mb-0.5" >Donor Profile</span>
              <h3 className="font-display font-black text-slate-900 truncate text-lg" >{user?.name || 'Sarah Jenkins'}</h3>
              <p className="text-slate-500 truncate text-xs font-medium" >{user?.email || 'sarah@donor.org'}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white p-3 rounded-[2rem] shadow-xl shadow-slate-200/40 flex flex-col gap-2">
            {[
              { id: 'overview', icon: TrendingUp, label: 'Overview' },
              { id: 'submit', icon: Box, label: 'Submit Donation' },
              { id: 'history', icon: History, label: 'Donation History' },
              { id: 'impact', icon: Award, label: 'Tax Certificates' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSubmissionSuccess(null); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] font-bold text-sm transition-all cursor-pointer relative ${
                  activeTab === tab.id
                    ? 'text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div layoutId="sidebarTab" className="absolute inset-0 bg-slate-900 rounded-[1.25rem] shadow-lg shadow-slate-900/20 -z-10" />
                )}
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-400'}`} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Gamified carbon tracker */}
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] space-y-5 shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/40 transition-colors duration-700" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            
            <div className="flex justify-between items-center relative z-10">
              <span className="font-bold tracking-widest font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20" >IMPACT METRICS</span>
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-display font-black tracking-tight text-white">{carbonSavedKg.toFixed(1)} <span className="text-xl text-slate-400">kg</span></p>
              <p className="text-emerald-400 font-bold mt-1 text-sm" >Carbon Emissions Saved</p>
            </div>
            <div className="space-y-2 border-t border-slate-700 pt-5 relative z-10 text-sm font-medium text-slate-300" >
              <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Eqv. to <b className="text-white">{(carbonSavedKg / 22).toFixed(1)}</b> trees planted</p>
              <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Offset <b className="text-white">{(carbonSavedKg * 2.5).toFixed(1)}</b> driving miles</p>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner border border-slate-700 relative z-10 mt-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full relative" style={{ width: `${Math.min(100, (carbonSavedKg / 50) * 100)}%` }}>
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
            <span className="block font-mono text-slate-500 text-xs font-bold relative z-10" >Goal: 50 kg carbon offset</span>
          </div>
        </aside>

        {/* Central Main panel */}
        <main className="flex-grow space-y-8 min-w-0">
          
          <AnimatePresence mode="wait">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Summary Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 hover:-translate-y-1 transition-transform">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-xs block mb-2" >Total Dispatched</span>
                    <span className="text-4xl font-display font-black text-slate-900 block tracking-tight">{totalDonated} <span className="text-lg text-slate-400">units</span></span>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 hover:-translate-y-1 transition-transform relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors" />
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-xs block mb-2 relative z-10" >Delivered</span>
                    <span className="text-4xl font-display font-black text-blue-600 block tracking-tight relative z-10">{totalDelivered} <span className="text-lg text-blue-300">units</span></span>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 hover:-translate-y-1 transition-transform relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-100 transition-colors" />
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-xs block mb-2 relative z-10" >Lives Benefitted</span>
                    <span className="text-4xl font-display font-black text-emerald-600 block tracking-tight relative z-10">{estimatedPeopleHelped} <span className="text-lg text-emerald-300">lives</span></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  
                  {/* Left: Recent Submissions */}
                  <div className="xl:col-span-7 space-y-6">
                    <div className="flex justify-between items-center bg-white p-3 pr-4 pl-6 rounded-2xl shadow-sm border border-slate-200/60">
                      <h2 className="font-display font-black text-slate-900 text-xl tracking-tight" >Recent Submissions</h2>
                      <Button variant="ghost" onClick={() => setActiveTab('submit')} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-none font-bold text-xs h-10 px-4 rounded-xl">
                        + Submit New
                      </Button>
                    </div>

                    {donorDonations.length === 0 ? (
                      <div className="bg-white border border-slate-200 border-dashed rounded-[2rem] p-12 text-center space-y-5 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-300 shadow-inner">
                          <Box className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-display font-black text-slate-900 text-xl tracking-tight" >No donations posted yet</h3>
                          <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium" >Create an item listing so local NGOs can claim and pick them up.</p>
                        </div>
                        <Button variant="primary" onClick={() => setActiveTab('submit')} className="shadow-lg shadow-emerald-500/20 px-8 rounded-xl font-bold">
                          Create Donation Listing
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-5">
                        {donorDonations.slice(0, 3).map((donation) => (
                          <div className="bg-white border border-slate-100 shadow-lg shadow-slate-200/40 rounded-[1.5rem] overflow-hidden hover:border-slate-200 transition-colors">
                            <DonationCard
                              key={donation.id}
                              donation={donation}
                              actions={
                                donation.status === 'DELIVERED' ? (
                                  <button
                                    onClick={() => {
                                      setActiveReceiptDonation(donation);
                                      setActiveTab('impact');
                                    }}
                                    className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-md"
                                  >
                                    <Eye className="w-4 h-4" /> View Certificate
                                  </button>
                                ) : null
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: NGO Urgent Demands Feed */}
                  <div className="xl:col-span-5 space-y-6">
                    <div className="flex items-center justify-between bg-white p-4 px-6 rounded-2xl shadow-sm border border-slate-200/60">
                      <h3 className="font-display font-black text-slate-900 text-xl tracking-tight" >Urgent Needs Feed</h3>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 border border-red-100">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      </div>
                    </div>

                    <div className="space-y-4">
                  {urgentNeeds.map((demand) => (
                      <div
                        key={demand.id}
                        className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 space-y-5 hover:border-red-200 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex justify-between items-start relative z-10">
                          <div>
                            <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg font-mono font-bold text-[10px] uppercase tracking-widest shadow-sm" >
                              {demand.urgency} Urgency
                            </span>
                            <h4 className="font-display font-black text-slate-900 mt-3 text-lg leading-tight" >{demand.item} Required</h4>
                            <p className="text-slate-500 mt-1 font-medium text-sm" >{demand.ngo}</p>
                          </div>
                          <span className="font-mono font-black text-slate-900 text-2xl text-right bg-slate-50 px-3 py-1 rounded-xl border border-slate-100" >{demand.qty}x</span>
                        </div>

                        <button
                          onClick={() => fulfillDemand(demand)}
                          className="w-full py-3 bg-slate-50 hover:bg-slate-900 text-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm shadow-sm hover:shadow-lg hover:shadow-slate-900/20 relative z-10"
                        >
                          Fulfill Need <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 2: WIZARD UPLOAD FORM */}
            {activeTab === 'submit' && (
              <motion.div 
                key="submit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -mr-20 -mt-20 opacity-50 pointer-events-none" />
                
                {submissionSuccess ? (
                  <div className="text-center py-12 space-y-8 max-w-md mx-auto relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
                      <Check className="w-12 h-12 stroke-[3]" />
                    </div>
                    <div>
                      <h2 className="font-display font-black text-slate-900 text-3xl tracking-tight" >Listing Created</h2>
                      <p className="text-slate-500 mt-2 font-medium" >Reference ID: <strong className="text-emerald-600 font-mono bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{submissionSuccess.id}</strong></p>
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 shadow-inner">
                      <p className="font-bold text-slate-900 text-lg" >{submissionSuccess.itemName}</p>
                      <p className="text-slate-500 font-medium" >Category: <span className="text-slate-700">{submissionSuccess.category}</span> &bull; Quantity: <span className="text-slate-700">{submissionSuccess.quantity}</span></p>
                      <p className="text-slate-500 truncate font-medium text-sm mt-2 flex items-center gap-1.5" ><MapPin className="w-4 h-4 text-emerald-500" /> {submissionSuccess.location.address}</p>
                    </div>

                    <p className="text-slate-500 font-medium leading-relaxed" >
                      Your donation has been registered. Our admin team will review details shortly. NGOs can then view and coordinate logistics.
                    </p>

                    <div className="flex gap-4 justify-center pt-4">
                      <Button variant="secondary" onClick={() => setSubmissionSuccess(null)} className="h-12 px-6 rounded-xl font-bold bg-white shadow-sm border border-slate-200 hover:bg-slate-50">
                        Create Another
                      </Button>
                      <Button variant="primary" onClick={() => { setActiveTab('overview'); setSubmissionSuccess(null); }} className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-emerald-500/25">
                        Back to Dashboard
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitDonation} className="space-y-8 relative z-10">
                    <div>
                      <h2 className="font-display font-black text-slate-900 text-3xl tracking-tight" >Submit Donation</h2>
                      <p className="text-slate-500 mt-2 font-medium" >Describe and geolocate non-monetary items for charity distribution.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <InputField
                        label="Item Name / Title"
                        id="item-name"
                        placeholder="e.g. 50 Fleece Blankets, High School Books"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        required
                        className="!bg-slate-50 border-slate-200 rounded-xl"
                      />

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm transition-all"
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Condition</label>
                        <select
                          value={condition}
                          onChange={(e) => setCondition(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm transition-all"
                        >
                          {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                        </select>
                      </div>

                      <InputField
                        label="Quantity"
                        id="qty"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        className="!bg-slate-50 border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Short Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm transition-all placeholder-slate-400"
                        placeholder="Add details, size guides, packaging rules, expiration details..."
                        required
                      />
                    </div>

                    <div className="space-y-3 border-t border-slate-100 pt-6">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Item Photos</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {photos.map((src, i) => (
                          <div key={i} className="relative aspect-square border border-slate-200 rounded-2xl overflow-hidden group bg-slate-50 shadow-sm">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(i)}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        
                        <label className="aspect-square border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all shadow-sm bg-slate-50 group">
                          <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-emerald-500 transition-colors" />
                          <span className="font-bold text-slate-500 text-sm group-hover:text-emerald-600 transition-colors" >Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setPhotos(prev => [...prev, 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400'])}
                          className="aspect-square border border-slate-200 hover:bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer font-bold text-sm shadow-sm transition-all text-slate-600"
                        >
                          <Sparkles className="w-6 h-6 text-emerald-500 mb-2" />
                          <span>Add Sample</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-100 pt-6">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pickup Location Address</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={addressSearch}
                          onChange={(e) => setAddressSearch(e.target.value)}
                          placeholder="Search street, area, city..."
                          className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm placeholder-slate-400 transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleAddressSearch}
                          className="px-8 h-[56px] border border-slate-200 bg-white hover:bg-slate-50 font-bold rounded-xl cursor-pointer transition-all shadow-sm text-slate-700"
                        >
                          Find Address
                        </button>
                      </div>

                      {searchResults.length > 0 && (
                        <ul className="border border-slate-200 rounded-xl bg-white text-sm max-h-48 overflow-y-auto divide-y divide-slate-100 shadow-lg">
                          {searchResults.map((item, i) => (
                            <li
                              key={i}
                              onClick={() => selectAddress(item)}
                              className="p-4 hover:bg-emerald-50 cursor-pointer truncate font-medium text-slate-700 transition-colors"
                            >
                              {item.display_name}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="h-72 rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-sm relative z-0">
                        <LeafletMap
                          center={[location.lat, location.lng]}
                          zoom={13}
                          markers={[{ lat: location.lat, lng: location.lng, popupContent: '<strong>Pickup Point</strong>' }]}
                          onMapClick={handleMapClick}
                          className="h-full w-full border-none"
                        />
                      </div>
                      <span className="font-mono text-slate-500 text-xs block bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner" >
                        <strong>Coordinates:</strong> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}<br />
                        <strong className="mt-1 block">Address:</strong> {location.address}
                      </span>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                      <Button type="button" variant="secondary" onClick={() => setActiveTab('overview')} className="h-12 px-8 rounded-xl font-bold bg-white border border-slate-200 hover:bg-slate-50">
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" loading={isSubmitting} className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/25">
                        Publish Donation
                      </Button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* TAB 3: LEDGER HISTORY */}
            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 space-y-8"
              >
                <div>
                  <h2 className="font-display font-black text-slate-900 text-3xl tracking-tight" >Donation Audit History</h2>
                  <p className="text-slate-500 mt-2 font-medium" >Unified audit trail of dispatched items, NGO claims, and milestone statuses.</p>
                </div>

                <div className="flex flex-wrap gap-4 p-6 bg-slate-50 border border-slate-200 rounded-2xl justify-between items-center shadow-inner">
                  <div className="flex gap-4 flex-wrap">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-white border border-slate-200 px-5 py-3 rounded-xl focus:outline-none font-bold text-slate-700 shadow-sm"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white border border-slate-200 px-5 py-3 rounded-xl focus:outline-none font-bold text-slate-700 shadow-sm"
                    >
                      <option value="All">All Statuses</option>
                      <option value="PENDING">PENDING</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="MATCHED">MATCHED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </div>

                  <div className="font-mono text-slate-500 text-sm font-bold bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm" >
                    Records found: {donorDonations.length}
                  </div>
                </div>

                <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold text-[10px] uppercase tracking-widest" >
                          <th className="p-5">Reference Tag</th>
                          <th className="p-5">Item Details</th>
                          <th className="p-5">Category</th>
                          <th className="p-5 text-center">Quantity</th>
                          <th className="p-5">Fulfillment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100" >
                        {donorDonations
                          .filter(d => categoryFilter === 'All' || d.category === categoryFilter)
                          .filter(d => statusFilter === 'All' || d.status === statusFilter)
                          .map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="p-5 font-mono font-bold text-emerald-600 text-sm group-hover:text-emerald-500">{log.id}</td>
                              <td className="p-5 font-bold text-slate-900">{log.itemName || `${log.quantity}x ${log.category}`}</td>
                              <td className="p-5 text-slate-500 font-medium text-sm">{log.category}</td>
                              <td className="p-5 text-center font-mono font-bold text-slate-800 bg-slate-50/50">{log.quantity}</td>
                              <td className="p-5">
                                <span className={`inline-flex px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider border shadow-sm ${
                                  log.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  log.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                  log.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-sky-50 text-sky-700 border-sky-200'
                                }`} >
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: IMPACT ACHIEVEMENTS & RECEIPTS */}
            {activeTab === 'impact' && (
              <motion.div 
                key="impact"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 space-y-8">
                  <div>
                    <h2 className="font-display font-black text-slate-900 text-3xl tracking-tight" >Tax Exemption Certificates</h2>
                    <p className="text-slate-500 mt-2 font-medium" >Download signed compliance tax receipts for your completed item dispatches.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left Selector list */}
                    <div className="lg:col-span-5 space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Delivered Donations</label>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl max-h-[400px] overflow-y-auto bg-white shadow-inner">
                        {donorDonations.filter(d => d.status === 'DELIVERED').length === 0 ? (
                          <div className="p-10 text-slate-400 text-center font-bold flex flex-col items-center justify-center gap-3">
                            <Box className="w-8 h-8 opacity-50" />
                            <p>No completed donations yet.</p>
                          </div>
                        ) : (
                          donorDonations.filter(d => d.status === 'DELIVERED').map(item => (
                            <div
                              key={item.id}
                              onClick={() => setActiveReceiptDonation(item)}
                              className={`p-5 cursor-pointer transition-all flex justify-between items-center group ${
                                activeReceiptDonation?.id === item.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                              }`}
                            >
                              <div>
                                <p className={`font-mono text-sm font-bold ${activeReceiptDonation?.id === item.id ? 'text-emerald-700' : 'text-slate-500 group-hover:text-emerald-600'}`}>{item.id}</p>
                                <p className={`font-bold mt-1 ${activeReceiptDonation?.id === item.id ? 'text-slate-900' : 'text-slate-700'}`}>{item.itemName}</p>
                              </div>
                              <span className={`text-xs font-bold uppercase tracking-widest ${activeReceiptDonation?.id === item.id ? 'text-emerald-600' : 'text-slate-300 group-hover:text-emerald-400'}`} >View</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Right Preview Card */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-center border border-slate-200 rounded-3xl p-8 bg-slate-50/80 shadow-inner min-h-[460px] relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none" />
                      
                      {activeReceiptDonation ? (
                        <div className="w-full flex flex-col items-center space-y-8 relative z-10">
                          
                          {/* Certificate Box */}
                          <div
                            ref={certificateRef}
                            className="w-full max-w-md bg-white p-10 border border-slate-200 rounded-[2rem] flex flex-col items-center text-center space-y-8 shadow-2xl shadow-slate-200/50 relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 to-teal-500" />
                            
                            <div>
                              <span className="font-mono uppercase tracking-widest text-slate-400 block font-bold text-[10px]" >DONATEBRIDGE NETWORK</span>
                              <h3 className="font-display font-black text-slate-900 text-2xl mt-2 tracking-tight" >Impact Certificate</h3>
                            </div>

                            <div className="border-t border-b border-dashed border-slate-200 py-8 w-full space-y-3 bg-slate-50/50 px-6 rounded-xl">
                              <span className="font-mono text-emerald-500 uppercase block font-bold text-[10px] tracking-widest" >DONOR NAME</span>
                              <p className="font-display font-black text-slate-900 text-xl" >{activeReceiptDonation.donorName || user?.name || user?.username || 'Generous Donor'}</p>
                              <p className="text-slate-600 leading-relaxed font-medium text-sm mt-4" >
                                Successfully delivered <span className="font-black text-slate-900">{activeReceiptDonation.quantity}x {activeReceiptDonation.category}</span> items to an approved NGO partner.
                                <br/><br/>
                                Verification Tag: <strong className="font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 inline-block mt-2">{activeReceiptDonation.id}</strong>
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full text-left font-mono bg-white border border-slate-100 p-4 rounded-xl shadow-sm" >
                              <div>
                                <span className="text-slate-400 block text-[10px] font-bold tracking-widest uppercase">LIVES IMPACTED</span>
                                <span className="font-black text-slate-800 text-lg mt-1 block">{activeReceiptDonation.quantity * 3} lives</span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-400 block text-[10px] font-bold tracking-widest uppercase">EMISSION SAVINGS</span>
                                <span className="font-black text-emerald-600 text-lg mt-1 block">{activeReceiptDonation.quantity * 4.5} kg CO₂</span>
                              </div>
                            </div>

                            <div className="pt-2">
                              <span className="inline-flex px-4 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs uppercase tracking-widest shadow-sm" >
                                DELIVERY COMPLETED
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={downloadReceipt}
                            className="px-8 py-4 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-emerald-500/30 cursor-pointer flex items-center gap-3 transition-all"
                          >
                            <Download className="w-5 h-5" /> Download Certificate PNG
                          </button>
                        </div>
                      ) : (
                        <div className="text-center p-8 space-y-4 relative z-10">
                          <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-300 shadow-sm">
                            <Award className="w-10 h-10" />
                          </div>
                          <h3 className="font-display font-black text-slate-900 text-xl tracking-tight" >Certificate Previewer</h3>
                          <p className="text-slate-500 max-w-xs mx-auto font-medium leading-relaxed text-sm" >Select one of your completed donation entries from the left list to load the receipt details.</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
