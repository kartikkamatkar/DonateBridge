import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useMockDB } from '../hooks/useMockDB';
import Navbar from '../components/Navbar';
import DonationCard from '../components/ui/DonationCard';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { MapPin, Box, Calendar, Heart, Download, Upload, Trash2, Award, History, TrendingUp, Sparkles, Filter, Check, Eye, Leaf } from 'lucide-react';
import { toPng } from 'html-to-image';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet marker icons fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CATEGORIES = ['Clothing', 'Food', 'Books', 'Furniture', 'Electronics', 'Medical', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export default function DonorDashboard() {
  const { user } = useAuth();
  const db = useMockDB();
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

  // Map picker references
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  // Filter donor specific donations
  const donorDonations = db.donations.filter(d => d.donorEmail === (user?.email || 'donor@donatebridge.org'));

  // Stats calculation
  const totalDonated = donorDonations.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalDelivered = donorDonations.filter(d => d.status === 'DELIVERED').reduce((acc, curr) => acc + curr.quantity, 0);
  const estimatedPeopleHelped = totalDelivered * 3;
  const carbonSavedKg = totalDelivered * 4.5;

  // Initialize leaflet map picker on tab change
  useEffect(() => {
    if (activeTab === 'submit' && mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([location.lat, location.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      markerInstance.current = L.marker([location.lat, location.lng], { draggable: true }).addTo(mapInstance.current);
      
      markerInstance.current.on('dragend', async () => {
        const latLng = markerInstance.current.getLatLng();
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latLng.lat}&lon=${latLng.lng}`);
          const data = await res.json();
          const addr = data.display_name || `${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`;
          setLocation({ lat: latLng.lat, lng: latLng.lng, address: addr });
          setAddressSearch(addr);
        } catch (e) {
          setLocation({ lat: latLng.lat, lng: latLng.lng, address: `${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}` });
        }
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [activeTab]);

  // Handle address search
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

    if (mapInstance.current) {
      mapInstance.current.setView([lat, lng], 14);
    }
    if (markerInstance.current) {
      markerInstance.current.setLatLng([lat, lng]);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const simulateCloudinaryUpload = () => {
    const samples = [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=400',
      'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400'
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    setPhotos(prev => [...prev, pick]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDonation = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newDnt = db.addDonation({
        itemName,
        donorName: user?.name || 'Sarah Jenkins',
        donorEmail: user?.email || 'donor@donatebridge.org',
        category,
        condition,
        quantity: parseInt(quantity),
        description,
        photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400'],
        location
      });

      setItemName('');
      setDescription('');
      setPhotos([]);
      setQuantity(1);
      setSubmissionSuccess(newDnt);
      setIsSubmitting(false);
    }, 1000);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Menu */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider">DONOR WORKSPACE</span>
            <h3 className="text-base font-display font-bold text-ink mt-1 truncate">{user?.name}</h3>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>

          <div className="bg-white border border-border p-2 rounded-2xl shadow-premium-sm flex flex-col gap-1">
            <button
              onClick={() => { setActiveTab('overview'); setSubmissionSuccess(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-primary text-white font-bold'
                  : 'text-slate-600 hover:text-ink hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Overview Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('submit'); setSubmissionSuccess(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-primary text-white font-bold'
                  : 'text-slate-600 hover:text-ink hover:bg-slate-50'
              }`}
            >
              <Box className="w-4 h-4" /> Create Need-Listing
            </button>
            <button
              onClick={() => { setActiveTab('history'); setSubmissionSuccess(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-primary text-white font-bold'
                  : 'text-slate-600 hover:text-ink hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4" /> Logistics Ledger
            </button>
            <button
              onClick={() => { setActiveTab('impact'); setSubmissionSuccess(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'impact'
                  ? 'bg-primary text-white font-bold'
                  : 'text-slate-600 hover:text-ink hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4" /> Achievements & Receipts
            </button>
          </div>

          {/* Gamified carbon tracker */}
          <div className="bg-primary text-white p-5 rounded-2xl space-y-4 shadow-premium-md relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase font-mono tracking-wider font-bold">ECO IMPACT</span>
              <Leaf className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <p className="text-2xl font-display font-extrabold tracking-tight">{carbonSavedKg.toFixed(1)} kg</p>
              <p className="text-[10px] text-emerald-100 font-medium">Estimated Carbon Saved</p>
            </div>
            <div className="text-[10px] text-emerald-100 space-y-1">
              <p>&bull; Equivalent to <b>{(carbonSavedKg / 22).toFixed(1)}</b> trees planted</p>
              <p>&bull; Offset <b>{(carbonSavedKg * 2.5).toFixed(1)}</b> driving miles</p>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
              <div className="bg-white h-full" style={{ width: `${Math.min(100, (carbonSavedKg / 50) * 100)}%` }} />
            </div>
            <span className="text-[9px] text-emerald-100 block font-mono">Target: 50 kg carbon saved milestone</span>
          </div>
        </aside>

        {/* Central Main panel */}
        <main className="flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">DISPATCHED UNITS</span>
                  <span className="text-2xl font-display font-extrabold text-ink mt-1 block">{totalDonated} items</span>
                </div>
                <div className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">DELIVERED TO NGOs</span>
                  <span className="text-2xl font-display font-extrabold text-primary mt-1 block">{totalDelivered} items</span>
                </div>
                <div className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">ESTIMATED LIVES TOUCHED</span>
                  <span className="text-2xl font-display font-extrabold text-secondary mt-1 block">{estimatedPeopleHelped} lives</span>
                </div>
              </div>

              {/* Active list */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-display font-bold text-ink">Recent Donation Submissions</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('submit')}>
                    + Submit New
                  </Button>
                </div>

                {donorDonations.length === 0 ? (
                  <div className="bg-white border border-border rounded-2xl p-12 text-center space-y-3">
                    <Box className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-display font-bold text-ink">No active listings</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">Create item listings to allow verified local NGOs to coordinate logistics claims.</p>
                    <Button variant="primary" size="sm" onClick={() => setActiveTab('submit')}>
                      Create Need-Listing
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
                              className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Eye className="w-4 h-4" /> View Tax Receipt
                            </button>
                          ) : null
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WIZARD UPLOAD FORM */}
          {activeTab === 'submit' && (
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
              {submissionSuccess ? (
                <div className="text-center py-8 space-y-6 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-ink">Listing Created Successfully</h2>
                    <p className="text-xs text-slate-500 mt-1">Reference Tag ID: <strong className="text-primary font-mono">{submissionSuccess.id}</strong></p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-border rounded-xl text-left space-y-2">
                    <p className="text-xs font-bold text-ink">{submissionSuccess.itemName}</p>
                    <p className="text-[11px] text-slate-500">Category: {submissionSuccess.category} &bull; Qty: {submissionSuccess.quantity}</p>
                    <p className="text-[11px] text-slate-500 truncate">Pickup: {submissionSuccess.location.address}</p>
                  </div>

                  <p className="text-xs text-slate-500">
                    Your shipment has been logged. Admin reviews usually take under 2 hours, after which NGOs can claims and set courier schedules.
                  </p>

                  <div className="flex gap-3 justify-center">
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
                    <h2 className="text-lg font-display font-bold text-ink">Submit Item Need-Listing</h2>
                    <p className="text-xs text-slate-500">Coordinate and geolocate non-monetary items for NGO collection.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Item Name / Summary Title"
                      id="item-name"
                      placeholder="e.g. 50 Winter Blankets, Science Textbooks"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                    />

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white border border-border p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Item Condition</label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full bg-white border border-border p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none"
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

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Short Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="3"
                      className="w-full bg-white border border-border p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder-slate-400"
                      placeholder="Add details, size guides, packaging rules, expiration details..."
                      required
                    />
                  </div>

                  {/* Photo upload simulated section */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">Item Photos</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                      
                      <label className="aspect-square border border-dashed border-border hover:border-primary rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-slate-50">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] font-semibold text-slate-500">Local Upload</span>
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
                        onClick={simulateCloudinaryUpload}
                        className="aspect-square border border-border hover:bg-slate-50 rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer font-semibold"
                      >
                        <Sparkles className="w-5 h-5 text-primary mb-1 animate-pulse" />
                        <span className="text-[10px]">Cloud Widget Sim</span>
                      </button>
                    </div>
                  </div>

                  {/* Geolocation coord picker */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-700 block">Pickup Address & Coordinate geolocator</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={addressSearch}
                        onChange={(e) => setAddressSearch(e.target.value)}
                        placeholder="Search street, area, city..."
                        className="flex-1 bg-white border border-border p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddressSearch}
                        className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Geocode
                      </button>
                    </div>

                    {searchResults.length > 0 && (
                      <ul className="border border-border rounded-xl bg-white text-xs max-h-36 overflow-y-auto divide-y divide-border">
                        {searchResults.map((item, i) => (
                          <li
                            key={i}
                            onClick={() => selectAddress(item)}
                            className="p-2.5 hover:bg-slate-50 cursor-pointer truncate"
                          >
                            {item.display_name}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div ref={mapRef} className="h-52 w-full border border-border rounded-xl z-10" />
                    <span className="text-[10px] font-mono text-slate-400 block bg-slate-50 p-2 rounded border border-border">
                      Selected Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)} &bull; {location.address}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setActiveTab('overview')}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={isSubmitting}>
                      Publish Need-Listing
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: LEDGER HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-6">
              <div>
                <h2 className="text-lg font-display font-bold text-ink">Donation Audit History Ledger</h2>
                <p className="text-xs text-slate-500">Unified audit trail of dispatched items, courier checkpoints, and receipt hashes.</p>
              </div>

              <div className="flex flex-wrap gap-3 p-4 bg-slate-50 border border-border rounded-xl text-xs justify-between items-center">
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white border border-border px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-border px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="MATCHED">MATCHED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  Total Ledger Records: {donorDonations.length}
                </div>
              </div>

              <div className="overflow-hidden border border-border rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-slate-50 text-slate-600 font-semibold">
                        <th className="p-4">Reference Tag</th>
                        <th className="p-4">Material Summary</th>
                        <th className="p-4">Category</th>
                        <th className="p-4 text-center">Quantity</th>
                        <th className="p-4">Delivery Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {donorDonations
                        .filter(d => categoryFilter === 'All' || d.category === categoryFilter)
                        .filter(d => statusFilter === 'All' || d.status === statusFilter)
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-mono font-semibold text-primary">{log.id}</td>
                            <td className="p-4 font-bold text-ink">{log.itemName || `${log.quantity}x ${log.category}`}</td>
                            <td className="p-4">{log.category}</td>
                            <td className="p-4 text-center font-mono">{log.quantity}</td>
                            <td className="p-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                log.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                log.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                log.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-sky-50 text-sky-700 border-sky-200'
                              }`}>
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
              <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-6">
                <div>
                  <h2 className="text-lg font-display font-bold text-ink">SaaS Tax Receipt & Certificates</h2>
                  <p className="text-xs text-slate-500">Review delivered donations and compile digitally signed PNG tax certificates.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Selector list */}
                  <div className="lg:col-span-5 space-y-3">
                    <label className="text-xs font-semibold text-slate-700 block">Delivered Ledger Entries</label>
                    <div className="divide-y divide-border border border-border rounded-xl max-h-72 overflow-y-auto bg-white">
                      {donorDonations.filter(d => d.status === 'DELIVERED').length === 0 ? (
                        <p className="p-4 text-xs text-slate-400 text-center font-mono">No delivered items logged yet.</p>
                      ) : (
                        donorDonations.filter(d => d.status === 'DELIVERED').map(item => (
                          <div
                            key={item.id}
                            onClick={() => setActiveReceiptDonation(item)}
                            className={`p-4 cursor-pointer text-xs transition-colors flex justify-between items-center ${
                              activeReceiptDonation?.id === item.id ? 'bg-[#F1F5F9] font-bold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <p className="font-mono text-primary font-bold">{item.id}</p>
                              <p className="text-slate-800 font-semibold mt-0.5">{item.itemName}</p>
                            </div>
                            <span className="text-[10px] text-slate-400">Select</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Preview Card */}
                  <div className="lg:col-span-7 flex flex-col items-center justify-center border border-border rounded-2xl p-6 bg-slate-50 min-h-[300px]">
                    {activeReceiptDonation ? (
                      <div className="w-full flex flex-col items-center space-y-6">
                        
                        {/* Certificate Box */}
                        <div
                          ref={certificateRef}
                          className="w-full max-w-sm bg-white p-8 border border-slate-900 rounded-2xl flex flex-col items-center text-center space-y-5 shadow-premium-lg relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                          
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold">DONATEBRIDGE COMPLIANCE</span>
                            <h3 className="font-display font-extrabold text-base text-primary mt-1">Impact Certificate</h3>
                          </div>

                          <div className="border-t border-b border-dashed border-border py-6 w-full space-y-2">
                            <span className="text-[9px] font-mono text-slate-400 uppercase block">DONOR ACKNOWLEDGEMENT</span>
                            <p className="font-display font-bold text-base text-slate-900">{activeReceiptDonation.donorName}</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-sans px-2">
                              Has successfully dispatched <span className="font-bold text-ink">{activeReceiptDonation.quantity}x {activeReceiptDonation.category}</span> items to a verified nonprofit partner. Tracking Stamp ID: <strong className="font-mono text-primary">{activeReceiptDonation.id}</strong>.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 w-full text-left text-[11px] font-mono pt-1">
                            <div>
                              <span className="text-slate-400 block text-[9px]">LIVES HELPFUL</span>
                              <span className="font-bold text-secondary">{activeReceiptDonation.quantity * 3} lives</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 block text-[9px]">CO2 REDUCTION</span>
                              <span className="font-bold text-primary">{activeReceiptDonation.quantity * 4.5} kg</span>
                            </div>
                          </div>

                          <div className="pt-2">
                            <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-bold">
                              STATUS: DELIVERED
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={downloadReceipt}
                          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl shadow-premium-sm cursor-pointer flex items-center gap-2 transition-colors"
                        >
                          <Download className="w-4 h-4" /> Download Certificate PNG
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <Award className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="text-sm font-display font-bold text-ink">Impact Certificate previewer</h3>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">Select a completed delivery entry on the left to render its tax and eco receipt card.</p>
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
