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
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946, address: 'MG Road, Bengaluru' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Filter state for Ledger
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Certificate target element ref for html-to-image
  const certificateRef = useRef(null);
  const [activeReceiptDonation, setActiveReceiptDonation] = useState(null);

  // Filter donor specific donations from real API
  const donorDonations = myDonations;

  // Stats calculation
  const totalDonated = donorDonations.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalDelivered = donorDonations.filter(d => d.status === 'DELIVERED').reduce((acc, curr) => acc + curr.quantity, 0);
  const estimatedPeopleHelped = totalDelivered * 3;
  const carbonSavedKg = totalDelivered * 4.5;

  // NGO urgent demands feed — derived from real needs API
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

  // Handle address geocoding search
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
        // Fallback: use local preview
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
      toast.success('Donation submitted successfully! Pending admin review.');
    } catch (err) {
      toast.error(getApiError(err));
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Menu */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-2">
            <span className="font-semibold text-slate-400 uppercase tracking-wider block" style={{ fontSize: '11px' }}>Donor Profile</span>
            <h3 className="font-display font-bold text-slate-900 truncate" style={{ fontSize: '18px' }}>{user?.name || 'Sarah Jenkins'}</h3>
            <p className="text-slate-500 truncate" style={{ fontSize: '14px' }}>{user?.email || 'sarah@donor.org'}</p>
          </div>

          <div className="bg-white border border-border p-2.5 rounded-2xl shadow-premium-sm flex flex-col gap-1.5">
            <button
              onClick={() => { setActiveTab('overview'); setSubmissionSuccess(null); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              style={{ fontSize: '14px', minHeight: '46px' }}
            >
              <TrendingUp className="w-4 h-4" /> Overview
            </button>
            <button
              onClick={() => { setActiveTab('submit'); setSubmissionSuccess(null); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              style={{ fontSize: '14px', minHeight: '46px' }}
            >
              <Box className="w-4 h-4" /> Submit Donation
            </button>
            <button
              onClick={() => { setActiveTab('history'); setSubmissionSuccess(null); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              style={{ fontSize: '14px', minHeight: '46px' }}
            >
              <History className="w-4 h-4" /> Donation History
            </button>
            <button
              onClick={() => { setActiveTab('impact'); setSubmissionSuccess(null); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'impact'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              style={{ fontSize: '14px', minHeight: '46px' }}
            >
              <Award className="w-4 h-4" /> Tax Certificates
            </button>
          </div>

          {/* Gamified carbon tracker */}
          <div className="bg-primary text-white p-6 rounded-2xl space-y-4 shadow-premium-md relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
            <div className="flex justify-between items-center">
              <span className="font-semibold tracking-wider font-mono" style={{ fontSize: '10px' }}>ENVIRONMENTAL IMPACT</span>
              <Leaf className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <p className="text-3xl font-display font-black tracking-tight">{carbonSavedKg.toFixed(1)} kg</p>
              <p className="text-emerald-100 font-semibold mt-0.5" style={{ fontSize: '12px' }}>Carbon Emissions Saved</p>
            </div>
            <div className="space-y-1.5 border-t border-white/10 pt-4" style={{ fontSize: '12px' }}>
              <p>&bull; Equivalent to <b>{(carbonSavedKg / 22).toFixed(1)}</b> trees planted</p>
              <p>&bull; Offset <b>{(carbonSavedKg * 2.5).toFixed(1)}</b> driving miles</p>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div className="bg-white h-full" style={{ width: `${Math.min(100, (carbonSavedKg / 50) * 100)}%` }} />
            </div>
            <span className="block font-mono text-emerald-100/80" style={{ fontSize: '10px' }}>Goal: 50 kg carbon offset</span>
          </div>
        </aside>

        {/* Central Main panel */}
        <main className="flex-grow space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block" style={{ fontSize: '11px' }}>Total Items Dispatched</span>
                  <span className="text-3xl font-display font-black text-slate-900 mt-2 block">{totalDonated} units</span>
                </div>
                <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block" style={{ fontSize: '11px' }}>Delivered to NGOs</span>
                  <span className="text-3xl font-display font-black text-primary mt-2 block">{totalDelivered} units</span>
                </div>
                <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block" style={{ fontSize: '11px' }}>Lives Benefitted</span>
                  <span className="text-3xl font-display font-black text-emerald-600 mt-2 block">{estimatedPeopleHelped} lives</span>
                </div>
              </div>

              {/* 2-Column Overview Grid (No more gaps, highly interactive!) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Left: Recent Submissions */}
                <div className="xl:col-span-7 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-display font-bold text-slate-900" style={{ fontSize: '20px' }}>Recent Submissions</h2>
                    <Button variant="ghost" onClick={() => setActiveTab('submit')}>
                      + Submit New
                    </Button>
                  </div>

                  {donorDonations.length === 0 ? (
                    <div className="bg-white border border-border rounded-2xl p-12 text-center space-y-4 shadow-premium-sm">
                      <Box className="w-12 h-12 text-slate-350 mx-auto" />
                      <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>No donations posted yet</h3>
                      <p className="text-slate-500 max-w-sm mx-auto" style={{ fontSize: '14px' }}>Create an item listing so local NGOs can claim and pick them up.</p>
                      <Button variant="primary" onClick={() => setActiveTab('submit')}>
                        Create Donation Listing
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {donorDonations.slice(0, 3).map((donation) => (
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
                                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                                style={{ fontSize: '13px' }}
                              >
                                <Eye className="w-4 h-4" /> View Certificate
                              </button>
                            ) : null
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: NGO Urgent Demands Feed (Innovative Concept!) */}
                <div className="xl:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '20px' }}>Urgent Needs Feed</h3>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  </div>

                  <div className="space-y-3">
                {urgentNeeds.map((demand) => (
                      <div
                        key={demand.id}
                        className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm space-y-3.5 hover:border-red-200 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2.5 py-0.5 bg-red-550 text-white rounded-lg font-mono font-bold uppercase tracking-wider" style={{ fontSize: '9px' }}>
                              {demand.urgency} Urgency
                            </span>
                            <h4 className="font-bold text-slate-905 mt-2" style={{ fontSize: '15px' }}>{demand.item} Required</h4>
                            <p className="text-slate-550 mt-0.5" style={{ fontSize: '13px' }}>{demand.ngo}</p>
                          </div>
                          <span className="font-mono font-bold text-slate-900 text-right" style={{ fontSize: '16px' }}>{demand.qty}x</span>
                        </div>

                        <button
                          onClick={() => fulfillDemand(demand)}
                          className="w-full py-2.5 bg-emerald-50 hover:bg-primary hover:text-white border border-emerald-150 text-primary font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          style={{ fontSize: '13px', minHeight: '40px' }}
                        >
                          Fulfill Need <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: WIZARD UPLOAD FORM */}
          {activeTab === 'submit' && (
            <div className="bg-white border border-border p-8 rounded-2xl shadow-premium-sm">
              {submissionSuccess ? (
                <div className="text-center py-8 space-y-6 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary mx-auto">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-slate-900" style={{ fontSize: '20px' }}>Listing Created</h2>
                    <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>Reference ID: <strong className="text-primary font-mono">{submissionSuccess.id}</strong></p>
                  </div>

                  <div className="p-5 bg-slate-50 border border-border rounded-xl text-left space-y-2">
                    <p className="font-bold text-slate-800" style={{ fontSize: '15px' }}>{submissionSuccess.itemName}</p>
                    <p className="text-slate-500" style={{ fontSize: '13px' }}>Category: {submissionSuccess.category} &bull; Quantity: {submissionSuccess.quantity}</p>
                    <p className="text-slate-500 truncate" style={{ fontSize: '13px' }}>Address: {submissionSuccess.location.address}</p>
                  </div>

                  <p className="text-slate-500" style={{ fontSize: '14px' }}>
                    Your donation has been registered. Our admin team will review details shortly. NGOs can then view and coordinate logistics.
                  </p>

                  <div className="flex gap-3 justify-center pt-2">
                    <Button variant="secondary" onClick={() => setSubmissionSuccess(null)}>
                      Create Another
                    </Button>
                    <Button variant="primary" onClick={() => { setActiveTab('overview'); setSubmissionSuccess(null); }}>
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitDonation} className="space-y-6">
                  <div>
                    <h2 className="font-display font-bold text-slate-900" style={{ fontSize: '20px' }}>Submit Donation</h2>
                    <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>Describe and geolocate non-monetary items for charity distribution.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputField
                      label="Item Name / Title"
                      id="item-name"
                      placeholder="e.g. 50 Fleece Blankets, High School Books"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                    />

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 block">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-slate-900 focus:outline-none focus:border-primary"
                        style={{ fontSize: '16px', minHeight: '48px' }}
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 block">Condition</label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-slate-900 focus:outline-none focus:border-primary"
                        style={{ fontSize: '16px', minHeight: '48px' }}
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
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 block">Short Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="3"
                      className="w-full bg-white border border-slate-200 p-4 rounded-xl text-slate-900 focus:outline-none focus:border-primary placeholder-slate-400"
                      placeholder="Add details, size guides, packaging rules, expiration details..."
                      style={{ fontSize: '16px' }}
                      required
                    />
                  </div>

                  {/* Photo upload simulated section */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Item Photos</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {photos.map((src, i) => (
                        <div key={i} className="relative aspect-square border border-border rounded-xl overflow-hidden group bg-slate-50">
                          <img src={src} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      
                      <label className="aspect-square border border-dashed border-slate-200 hover:border-primary rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-slate-50">
                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="font-semibold text-slate-500" style={{ fontSize: '11px' }}>Local Upload</span>
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
                        className="aspect-square border border-slate-200 hover:bg-slate-50 rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer font-semibold"
                      >
                        <Sparkles className="w-6 h-6 text-primary mb-1" />
                        <span style={{ fontSize: '11px' }}>Add Sample</span>
                      </button>
                    </div>
                  </div>

                  {/* Geolocation coord picker */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 block">Pickup Location Address</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={addressSearch}
                        onChange={(e) => setAddressSearch(e.target.value)}
                        placeholder="Search street, area, city..."
                        className="flex-1 bg-white border border-slate-200 p-3 rounded-xl text-slate-900 focus:outline-none focus:border-primary placeholder-slate-400"
                        style={{ fontSize: '15px' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddressSearch}
                        className="px-5 py-3 border border-slate-200 hover:bg-slate-50 font-bold rounded-xl cursor-pointer transition-colors"
                        style={{ fontSize: '14px', minHeight: '48px' }}
                      >
                        Find Address
                      </button>
                    </div>

                    {searchResults.length > 0 && (
                      <ul className="border border-border rounded-xl bg-white text-xs max-h-36 overflow-y-auto divide-y divide-border">
                        {searchResults.map((item, i) => (
                          <li
                            key={i}
                            onClick={() => selectAddress(item)}
                            className="p-3 hover:bg-slate-50 cursor-pointer truncate"
                            style={{ fontSize: '13px' }}
                          >
                            {item.display_name}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="h-64 rounded-xl overflow-hidden border border-border">
                      <LeafletMap
                        center={[location.lat, location.lng]}
                        zoom={13}
                        markers={[{ lat: location.lat, lng: location.lng, popupContent: '<strong>Pickup Point</strong>' }]}
                        onMapClick={handleMapClick}
                        className="h-full w-full border-none"
                      />
                    </div>
                    <span className="font-mono text-slate-500 block bg-slate-50 p-3 rounded-xl border border-border" style={{ fontSize: '12px' }}>
                      Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}<br />
                      Address: {location.address}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={() => setActiveTab('overview')}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={isSubmitting}>
                      Publish Donation
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: LEDGER HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-white border border-border p-8 rounded-2xl shadow-premium-sm space-y-6">
              <div>
                <h2 className="font-display font-bold text-slate-900" style={{ fontSize: '20px' }}>Donation Audit History</h2>
                <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>Unified audit trail of dispatched items, NGO claims, and milestone statuses.</p>
              </div>

              <div className="flex flex-wrap gap-4 p-5 bg-slate-50 border border-border rounded-xl justify-between items-center">
                <div className="flex gap-3 flex-wrap">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none font-semibold text-slate-700"
                    style={{ fontSize: '14px', minHeight: '44px' }}
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none font-semibold text-slate-700"
                    style={{ fontSize: '14px', minHeight: '44px' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="MATCHED">MATCHED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>

                <div className="font-mono text-slate-500" style={{ fontSize: '13px' }}>
                  Records found: {donorDonations.length}
                </div>
              </div>

              <div className="overflow-hidden border border-border rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-slate-50 text-slate-600 font-bold" style={{ fontSize: '13px' }}>
                        <th className="p-4">Reference Tag</th>
                        <th className="p-4">Item Details</th>
                        <th className="p-4">Category</th>
                        <th className="p-4 text-center">Quantity</th>
                        <th className="p-4">Fulfillment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border" style={{ fontSize: '14px' }}>
                      {donorDonations
                        .filter(d => categoryFilter === 'All' || d.category === categoryFilter)
                        .filter(d => statusFilter === 'All' || d.status === statusFilter)
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-mono font-semibold text-primary">{log.id}</td>
                            <td className="p-4 font-bold text-slate-800">{log.itemName || `${log.quantity}x ${log.category}`}</td>
                            <td className="p-4 text-slate-500">{log.category}</td>
                            <td className="p-4 text-center font-mono font-semibold text-slate-800">{log.quantity}</td>
                            <td className="p-4">
                              <span className={`inline-flex px-3 py-1 rounded-full font-semibold border ${
                                log.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                log.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                log.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-sky-50 text-sky-700 border-sky-200'
                              }`} style={{ fontSize: '11px' }}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IMPACT ACHIEVEMENTS & RECEIPTS */}
          {activeTab === 'impact' && (
            <div className="space-y-6">
              <div className="bg-white border border-border p-8 rounded-2xl shadow-premium-sm space-y-6">
                <div>
                  <h2 className="font-display font-bold text-slate-900" style={{ fontSize: '20px' }}>Tax Exemption Certificates</h2>
                  <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>Download signed compliance tax receipts for your completed item dispatches.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Selector list */}
                  <div className="lg:col-span-5 space-y-3">
                    <label className="text-sm font-semibold text-slate-700 block">Delivered Donations</label>
                    <div className="divide-y divide-border border border-border rounded-xl max-h-80 overflow-y-auto bg-white shadow-premium-sm">
                      {donorDonations.filter(d => d.status === 'DELIVERED').length === 0 ? (
                        <p className="p-6 text-slate-400 text-center font-semibold" style={{ fontSize: '14px' }}>No completed donations yet.</p>
                      ) : (
                        donorDonations.filter(d => d.status === 'DELIVERED').map(item => (
                          <div
                            key={item.id}
                            onClick={() => setActiveReceiptDonation(item)}
                            className={`p-4 cursor-pointer transition-colors flex justify-between items-center ${
                              activeReceiptDonation?.id === item.id ? 'bg-slate-50 font-bold' : 'hover:bg-slate-50/50'
                            }`}
                            style={{ fontSize: '14px' }}
                          >
                            <div>
                              <p className="font-mono text-primary font-bold">{item.id}</p>
                              <p className="text-slate-800 font-semibold mt-0.5">{item.itemName}</p>
                            </div>
                            <span className="text-slate-400 font-medium" style={{ fontSize: '12px' }}>View</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Preview Card */}
                  <div className="lg:col-span-7 flex flex-col items-center justify-center border border-border rounded-2xl p-6 bg-slate-50 min-h-[360px]">
                    {activeReceiptDonation ? (
                      <div className="w-full flex flex-col items-center space-y-6">
                        
                        {/* Certificate Box */}
                        <div
                          ref={certificateRef}
                          className="w-full max-w-sm bg-white p-8 border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-6 shadow-premium-md relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                          
                          <div>
                            <span className="font-mono uppercase tracking-wider text-slate-450 block font-bold" style={{ fontSize: '9px' }}>DONATEBRIDGE NETWORK</span>
                            <h3 className="font-display font-extrabold text-primary mt-1" style={{ fontSize: '18px' }}>Impact Certificate</h3>
                          </div>

                          <div className="border-t border-b border-dashed border-slate-200 py-6 w-full space-y-2.5">
                            <span className="font-mono text-slate-400 uppercase block font-bold" style={{ fontSize: '9px' }}>DONOR NAME</span>
                            <p className="font-display font-bold text-slate-900" style={{ fontSize: '16px' }}>{activeReceiptDonation.donorName}</p>
                            <p className="text-slate-500 leading-relaxed font-sans px-2" style={{ fontSize: '13px' }}>
                              Successfully delivered <span className="font-bold text-slate-900">{activeReceiptDonation.quantity}x {activeReceiptDonation.category}</span> items to an approved NGO partner.<br />
                              Verification Tag: <strong className="font-mono text-primary">{activeReceiptDonation.id}</strong>.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 w-full text-left font-mono" style={{ fontSize: '12px' }}>
                            <div>
                              <span className="text-slate-400 block text-[9px] font-bold">LIVES IMPACTED</span>
                              <span className="font-bold text-slate-800">{activeReceiptDonation.quantity * 3} lives</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 block text-[9px] font-bold">EMISSION SAVINGS</span>
                              <span className="font-bold text-primary">{activeReceiptDonation.quantity * 4.5} kg CO₂</span>
                            </div>
                          </div>

                          <div className="pt-2">
                            <span className="inline-flex px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-250 text-primary font-semibold" style={{ fontSize: '12px' }}>
                              DELIVERY COMPLETED
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={downloadReceipt}
                          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-premium-sm cursor-pointer flex items-center gap-2 transition-colors"
                          style={{ fontSize: '14px', minHeight: '48px' }}
                        >
                          <Download className="w-4 h-4" /> Download Certificate PNG
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <Award className="w-12 h-12 text-slate-350 mx-auto" />
                        <h3 className="font-display font-bold text-slate-800" style={{ fontSize: '16px' }}>Certificate Previewer</h3>
                        <p className="text-slate-500 max-w-xs mx-auto" style={{ fontSize: '14px' }}>Select one of your completed donation entries from the left list to load the receipt details.</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
