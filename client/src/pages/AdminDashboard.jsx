import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useRealDB } from '../hooks/useRealDB';
import { moderationAPI, getApiError } from '../api/index';
import Navbar from '../components/layout/Navbar';
import StatusStamp from '../components/ui/StatusStamp';
import LeafletMap from '../components/ui/LeafletMap';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { useToast } from '../components/ui/Toast';
import {
 ShieldCheck, AlertTriangle, TrendingUp, X, RotateCcw,
 Check, Eye, Download, ZoomIn, ZoomOut, Maximize2, MapPin, Calendar, Heart, ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const DOCUMENT_LABELS = {
 govRegCert: 'Gov Registration Certificate',
 panCard: 'PAN Card Copy',
 trustRegCert: 'Trust Registration Certificate',
 doc80G: '80G Exemption Certificate',
 doc12A: '12A Registration Certificate',
 logo: 'NGO Logo Brand',
 officePhoto: 'Registered Office Photo',
 authPersonPhoto: 'Authorized Person Photo',
 addressProof: 'Office Address Proof',
 idProof: 'Authorized Person ID Proof',
 verificationLetter: 'Verification Request Letter',
};

export default function AdminDashboard() {
 const { user } = useAuth();
 const {
 donations, ngos,
 updateNgoStatus, updateDonationStatus,
 platformMetrics, fetchMetrics
 } = useRealDB();
 const { toast } = useToast();
 
 const [activeTab, setActiveTab] = useState('moderation');
 const [selectedDonation, setSelectedDonation] = useState(null);
 const [selectedNgo, setSelectedNgo] = useState(null);
 
 const [rejectType, setRejectType] = useState(null);
 const [rejectItemId, setRejectItemId] = useState(null);
 const [rejectReason, setRejectReason] = useState('');

 const [activeLightboxDoc, setActiveLightboxDoc] = useState(null);
 const [zoomLevel, setZoomLevel] = useState(1);

 const [pendingActions, setPendingActions] = useState({});
 const [undoBanner, setUndoBanner] = useState(null);

 // Real data from API
 const pendingNgos = ngos.filter(n => n.verificationStatus === 'pending');
 const pendingDonations = donations.filter(d => d.status === 'PENDING');

 // Fraud logs from API
 const [fraudLogs, setFraudLogs] = useState([]);
 useEffect(() => {
 moderationAPI.getFraudLogs()
  .then(res => setFraudLogs(res.data.results || res.data))
  .catch(() => {
  // Fallback seed data for demo
  setFraudLogs([
   { id: 'FL-902', entity_name: 'Green Life NGO', trigger: 'Coordinates Discrepancy', risk_score: 'Medium (42%)', date: '2026-07-02' },
   { id: 'FL-899', entity_name: 'Sarah Jenkins', trigger: 'High Frequency Requests', risk_score: 'Low (15%)', date: '2026-07-01' },
   { id: 'FL-871', entity_name: 'Fake Help Depot', trigger: 'Suspicious Document Hash', risk_score: 'Critical (95%)', date: '2026-06-25' },
  ]);
  });
 }, []);

 useEffect(() => { fetchMetrics(); }, []);

 const queueAction = (id, type, target, itemName, extraReason = '') => {
 if (pendingActions[id]) {
  clearTimeout(pendingActions[id].timeoutId);
 }

 const timeoutId = setTimeout(async () => {
  try {
  if (target === 'donation') {
   const action = type === 'approve' ? 'approve' : 'reject';
   await updateDonationStatus(id, action, extraReason);
  } else {
   const action = type === 'approve' ? 'approve' : type === 'request_changes' ? 'request_changes' : 'reject';
   await updateNgoStatus(id, action, extraReason);
  }
  } catch (err) {
  toast.error(getApiError(err));
  }
  setPendingActions(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
  setUndoBanner(null);
 }, 5000);

 setPendingActions(prev => ({ ...prev, [id]: { timeoutId, actionType: type, target } }));
 setUndoBanner({
  id, type, target, name: itemName,
  message: `${type === 'approve' ? 'Approved' : type === 'request_changes' ? 'Requested Changes for' : 'Rejected'} ${target === 'donation' ? 'shipment' : 'NGO'} "${itemName}"`
 });
 setRejectType(null); setRejectItemId(null); setRejectReason('');
 setSelectedDonation(null); setSelectedNgo(null);
 };

 const handleUndo = () => {
 if (!undoBanner) return;
 const { id } = undoBanner;
 if (pendingActions[id]) clearTimeout(pendingActions[id].timeoutId);
 setPendingActions(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
 setUndoBanner(null);
 toast.info('Action undone successfully!');
 };

 const dismissFraudLog = async (id) => {
 try {
  await moderationAPI.dismissFraudLog(id);
  setFraudLogs(prev => prev.filter(log => log.id !== id));
  toast.success(`Risk alert ${id} dismissed.`);
 } catch {
  // Offline fallback
  setFraudLogs(prev => prev.filter(log => log.id !== id));
  toast.success(`Risk alert ${id} dismissed.`);
 }
 };

 return (
 <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
  <Navbar />

  <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8 items-start">
  
  {/* Navigation Sidebar */}
  <aside className="w-full lg:w-72 shrink-0 space-y-4">
   <div className="saas-card">
   <span className="text-slate-400 font-bold uppercase tracking-wider block font-mono" style={{ fontSize: '10px' }}>ADMIN CONSOLE</span>
   <h3 className="font-display font-black text-slate-900 mt-1 truncate" style={{ fontSize: '18px' }}>{user?.name || 'Administrator'}</h3>
   <span className="inline-flex mt-2 px-2.5 py-0.5 rounded bg-red-50 border border-red-150 text-red-650 font-mono font-bold" style={{ fontSize: '10px' }}>
    SUPERUSER ACCESS
   </span>
   </div>

   <div className="bg-white border border-border p-2.5 rounded-2xl shadow-premium-sm flex flex-col gap-1.5">
   <button
    onClick={() => setActiveTab('moderation')}
    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
    activeTab === 'moderation'
     ? 'bg-primary text-white'
     : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`}
    style={{ fontSize: '14px', minHeight: '46px' }}
   >
    <ShieldCheck className="w-4 h-4" /> Moderation Queue
   </button>
   <button
    onClick={() => setActiveTab('fraud')}
    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
    activeTab === 'fraud'
     ? 'bg-primary text-white'
     : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`}
    style={{ fontSize: '14px', minHeight: '46px' }}
   >
    <ShieldAlert className="w-4 h-4" /> Fraud Risk Radar
   </button>
   <button
    onClick={() => setActiveTab('metrics')}
    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
    activeTab === 'metrics'
     ? 'bg-primary text-white'
     : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`}
    style={{ fontSize: '14px', minHeight: '46px' }}
   >
    <TrendingUp className="w-4 h-4" /> System Metrics
   </button>
   </div>
  </aside>

  {/* Central Workspace */}
  <main className="flex-1 space-y-8 min-w-0 w-full">
   
   {/* TAB 1: MODERATION QUEUE */}
   {activeTab === 'moderation' && (
   <div className="space-y-8">
    
    {/* Donor Submissions Section */}
    <div className="saas-card space-y-6">
    <div>
     <h3 className="font-display font-black text-slate-900 uppercase tracking-wider" style={{ fontSize: '16px' }}>Donor Shipment Verifications</h3>
     <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>Verify geocoded physical donation listings before they are made claimable by local NGOs.</p>
    </div>

    {pendingDonations.length === 0 ? (
     <p className="p-12 text-slate-500 text-center font-semibold border border-dashed border-slate-200 rounded-xl bg-slate-50" style={{ fontSize: '14px' }}>No donations pending review.</p>
    ) : (
     <div className="grid grid-cols-1 gap-6">
     {pendingDonations.map((donation) => (
      <div key={donation.id} className="relative bg-slate-50 border border-border p-6 rounded-2xl flex flex-col gap-5 overflow-hidden">
      
      {/* Stamp Animation Overlay */}
      {pendingActions[donation.id] && (
       <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center pointer-events-none">
       <StatusStamp
        status={pendingActions[donation.id].actionType === 'approve' ? 'VERIFIED' : 'REJECTED'}
        className="scale-110 font-bold"
       />
       </div>
      )}

      <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
       <div className="space-y-1.5 flex-grow">
       <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono font-bold text-primary" style={{ fontSize: '13px' }}>{donation.id}</span>
        <span className="px-2.5 py-0.5 bg-slate-200/70 text-slate-700 rounded-full font-bold uppercase" style={{ fontSize: '10px' }}>{donation.category}</span>
       </div>
       <h4 className="font-bold text-slate-900" style={{ fontSize: '16px' }}>{donation.itemName || donation.title || 'Donation Item'}</h4>
       <p className="text-slate-500" style={{ fontSize: '13px' }}>Donor: <b>{donation.donorName}</b> ({donation.donorEmail})</p>
       <p className="text-slate-500 flex items-center gap-1" style={{ fontSize: '13px' }}>
        <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> {donation.location?.address}
       </p>
       </div>

       <div className="flex flex-wrap gap-2.5 shrink-0 w-full md:w-auto">
       <Button
        variant="secondary"
        onClick={() => setSelectedDonation(selectedDonation?.id === donation.id ? null : donation)}
       >
        {selectedDonation?.id === donation.id ? 'Hide Details' : 'Audit Details'}
       </Button>
       <Button
        variant="primary"
        onClick={() => queueAction(donation.id, 'approve', 'donation', donation.itemName || donation.title || 'Donation Item')}
       >
        Approve
       </Button>
       <Button
        variant="secondary"
        className="text-red-600 border-red-150 hover:bg-red-50 hover:border-red-200"
        onClick={() => {
        setRejectType('donation');
        setRejectItemId(donation.id);
        }}
       >
        Reject
       </Button>
       </div>
      </div>

      {/* Collapsible Details */}
      {selectedDonation?.id === donation.id && (
       <div className="pt-6 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="space-y-4">
        <div className="space-y-1.5">
        <span className="font-bold text-slate-750 block" style={{ fontSize: '14px' }}>Item Description:</span>
        <p className="text-slate-650 leading-relaxed db-card" style={{ fontSize: '14px' }}>{donation.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4" style={{ fontSize: '13px' }}>
        <div>
         <span className="font-bold text-slate-450 block font-mono text-[10px] uppercase">Condition</span>
         <span className="font-bold text-slate-800 block mt-0.5">{donation.condition}</span>
        </div>
        <div>
         <span className="font-bold text-slate-450 block font-mono text-[10px] uppercase">Quantity</span>
         <span className="font-bold text-slate-800 block mt-0.5">{donation.quantity} units</span>
        </div>
        </div>

        {donation.photos?.length > 0 && (
        <div className="space-y-2">
         <span className="font-bold text-slate-750 block" style={{ fontSize: '14px' }}>Uploaded Item Photos:</span>
         <div className="flex gap-3 overflow-x-auto py-1">
         {donation.photos.map((photo, i) => (
          <div
          key={i}
          onClick={() => setActiveLightboxDoc({ label: `Item Photo ${i+1}`, urls: [photo], activeIndex: 0 })}
          className="w-20 h-20 border border-border rounded-xl overflow-hidden shrink-0 bg-white cursor-zoom-in hover:border-primary transition-colors"
          >
          <img src={photo} alt="" className="w-full h-full object-cover" />
          </div>
         ))}
         </div>
        </div>
        )}
       </div>

       {/* Map View */}
       <div className="space-y-2">
        <span className="font-bold text-slate-750 block" style={{ fontSize: '14px' }}>Pickup Coordinates Location:</span>
        <div className="h-56 rounded-xl overflow-hidden border border-border">
        <LeafletMap
         center={[donation.location?.lat || 12.9716, donation.location?.lng || 77.5946]}
         zoom={13}
         markers={[{ lat: donation.location?.lat, lng: donation.location?.lng, popupContent: `<strong>${donation.itemName} Pickup Point</strong>` }]}
        />
        </div>
       </div>
       </div>
      )}

      </div>
     ))}
     </div>
    )}
    </div>

    {/* NGO Authority Applications */}
    <div className="saas-card space-y-6">
    <div>
     <h3 className="font-display font-black text-slate-900 uppercase tracking-wider" style={{ fontSize: '16px' }}>NGO Authority Verification Queue</h3>
     <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>Verify regulatory filings, NGO registration certificate uploads, and legal status.</p>
    </div>

    {pendingNgos.length === 0 ? (
     <p className="p-12 text-slate-500 text-center font-semibold border border-dashed border-slate-200 rounded-xl bg-slate-50" style={{ fontSize: '14px' }}>No NGO registrations pending audit.</p>
    ) : (
     <div className="grid grid-cols-1 gap-6">
     {pendingNgos.map((ngo) => (
      <div key={ngo.id} className="relative bg-slate-50 border border-border p-6 rounded-2xl flex flex-col gap-5 overflow-hidden">
      
      {/* Stamp Animation Overlay */}
      {pendingActions[ngo.id] && (
       <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center pointer-events-none">
       <StatusStamp
        status={pendingActions[ngo.id].actionType === 'approve' ? 'APPROVED' : pendingActions[ngo.id].actionType === 'request_changes' ? 'CHANGES REQ' : 'REJECTED'}
        className="scale-110 font-bold"
       />
       </div>
      )}

      <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
       <div className="space-y-1.5 flex-grow">
       <h4 className="font-bold text-slate-900" style={{ fontSize: '16px' }}>{ngo.name}</h4>
       <p className="text-slate-500" style={{ fontSize: '13px' }}>Tax Filing Code: <strong className="font-mono text-primary">{ngo.registrationNumber}</strong></p>
       <p className="text-slate-550" style={{ fontSize: '13px' }}>Website: <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">{ngo.website}</a></p>
       </div>

       <div className="flex flex-wrap gap-2.5 shrink-0 w-full md:w-auto">
       <Button
        variant="secondary"
        onClick={() => setSelectedNgo(selectedNgo?.id === ngo.id ? null : ngo)}
       >
        {selectedNgo?.id === ngo.id ? 'Hide Documents' : 'Audit Documents'}
       </Button>
       <Button
        variant="primary"
        onClick={() => queueAction(ngo.id, 'approve', 'ngo', ngo.name)}
       >
        Approve NGO
       </Button>
       <Button
        variant="secondary"
        className="text-amber-700 border-amber-150 hover:bg-amber-50 hover:border-amber-200"
        onClick={() => {
        setRejectType('ngo_changes');
        setRejectItemId(ngo.id);
        }}
       >
        Request Changes
       </Button>
       <Button
        variant="secondary"
        className="text-red-600 border-red-150 hover:bg-red-50 hover:border-red-200"
        onClick={() => {
        setRejectType('ngo');
        setRejectItemId(ngo.id);
        }}
       >
        Reject NGO
       </Button>
       </div>
      </div>

      {/* Collapsible NGO Details */}
      {selectedNgo?.id === ngo.id && (
       <div className="pt-6 border-t border-slate-200 space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-slate-700" style={{ fontSize: '13px' }}>
         <div>
         <span className="font-mono text-[10px] text-slate-400 font-bold uppercase block">Gov Registration</span>
         <span className="font-bold text-slate-800 block mt-0.5">{ngo.govRegistrationNumber}</span>
         </div>
         <div>
         <span className="font-mono text-[10px] text-slate-400 font-bold uppercase block">NGO Type</span>
         <span className="font-bold text-slate-800 block mt-0.5">{ngo.ngoType}</span>
         </div>
         <div>
         <span className="font-mono text-[10px] text-slate-400 font-bold uppercase block">Volunteers</span>
         <span className="font-bold text-slate-800 block mt-0.5">{ngo.volunteersCount} active</span>
         </div>
         <div>
         <span className="font-mono text-[10px] text-slate-400 font-bold uppercase block">Active Since</span>
         <span className="font-bold text-slate-800 block mt-0.5">{ngo.operatingSince}</span>
         </div>
        </div>

        <div className="space-y-1">
         <span className="font-bold text-slate-750 block" style={{ fontSize: '14px' }}>NGO Mission Statement:</span>
         <p className="text-slate-650 leading-relaxed db-card" style={{ fontSize: '14px' }}>{ngo.mission}</p>
        </div>

        <div className="space-y-1">
         <span className="font-bold text-slate-750 block" style={{ fontSize: '14px' }}>Core Bio:</span>
         <p className="text-slate-650 leading-relaxed db-card" style={{ fontSize: '14px' }}>{ngo.description}</p>
        </div>
        </div>

        <div className="space-y-3">
        <div className="text-xs">
         <span className="font-bold text-slate-750 block mb-1" style={{ fontSize: '14px' }}>Registered Headquarters Area:</span>
         <span className="font-mono text-slate-500 block bg-white border border-border p-3 rounded-xl">{ngo.lat.toFixed(5)}, {ngo.lng.toFixed(5)} ({ngo.address})</span>
        </div>
        <div className="h-56 rounded-xl overflow-hidden border border-border">
         <LeafletMap
         center={[ngo.lat, ngo.lng]}
         zoom={13}
         markers={[{ lat: ngo.lat, lng: ngo.lng, popupContent: `<strong>${ngo.name} Headquarters</strong>` }]}
         />
        </div>
        </div>
       </div>

       {/* 11 Document previews grid */}
       {ngo.documents && (
        <div className="space-y-3">
        <span className="font-bold text-slate-750 block" style={{ fontSize: '14px' }}>NGO Certificates &amp; Filings (11 Slots Audit Checklist):</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
         {Object.keys(DOCUMENT_LABELS).map((docKey) => {
         const docData = ngo.documents[docKey];
         const pages = Array.isArray(docData) ? docData : docData ? [docData] : [];
         const label = DOCUMENT_LABELS[docKey];
         const hasPages = pages.length > 0;
         const firstPageUrl = hasPages ? pages[0] : '';
         return (
          <div
          key={docKey}
          onClick={() => {
           if (hasPages) {
           setActiveLightboxDoc({ label, urls: pages, activeIndex: 0 });
           setZoomLevel(1);
           }
          }}
          className={`border border-border p-2.5 rounded-xl bg-white flex flex-col items-center justify-between text-center cursor-zoom-in group hover:border-primary transition-all aspect-square ${!hasPages ? 'opacity-40 pointer-events-none' : ''}`}
          >
          <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 relative">
           {hasPages ? (
           <>
            <img src={firstPageUrl} alt="" className="w-full h-full object-cover" />
            {pages.length > 1 && (
            <span className="absolute bottom-1 right-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono shadow-sm">
             {pages.length} pgs
            </span>
            )}
           </>
           ) : (
           <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-[10px]">No File</div>
           )}
           {hasPages && (
           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
            <Eye className="w-5 h-5 text-white" />
           </div>
           )}
          </div>
          <span className="text-[10px] font-bold text-slate-700 leading-tight block truncate w-full mt-2">{label}</span>
          </div>
         );
         })}
        </div>
        </div>
       )}

       </div>
      )}

      </div>
     ))}
     </div>
    )}
    </div>

    {/* Rejection / Changes Request Rationales Modal */}
    {rejectType && (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
     <div className="bg-white border border-border w-full max-w-md p-6 rounded-2xl shadow-premium-xl space-y-4">
     <div>
      <h4 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>
      {rejectType === 'donation' ? 'Shipment Rejection Feedback' : rejectType === 'ngo_changes' ? 'Request Changes Filings' : 'NGO Registration Rejection'}
      </h4>
      <p className="text-slate-500 mt-1" style={{ fontSize: '13px' }}>Submit comments explaining what the NGO must update or correct.</p>
     </div>
     
     <form onSubmit={(e) => {
      e.preventDefault();
      const itemTitle = rejectType === 'donation'
      ? pendingDonations.find(d => d.id === rejectItemId)?.itemName || 'Shipment'
      : pendingNgos.find(n => n.id === rejectItemId)?.name || 'NGO';
      
      queueAction(
      rejectItemId,
      rejectType === 'donation' ? 'reject' : rejectType === 'ngo_changes' ? 'request_changes' : 'reject',
      rejectType === 'donation' ? 'donation' : 'ngo',
      itemTitle,
      rejectReason
      );
     }} className="space-y-4">
      <InputField
      label="Rationale / Needed Corrections"
      id="rejReason"
      placeholder={rejectType === 'ngo_changes' ? 'e.g. Please re-upload PAN copy with visible corner stamps.' : 'e.g. Items show substantial wear.'}
      value={rejectReason}
      onChange={(e) => setRejectReason(e.target.value)}
      required
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
      <Button type="button" variant="secondary" onClick={() => {
       setRejectType(null);
       setRejectItemId(null);
      }}>
       Cancel
      </Button>
      <Button type="submit" variant="primary" className={rejectType === 'ngo_changes' ? 'bg-amber-600 hover:bg-amber-700 border-none' : 'bg-red-650 hover:bg-red-700 border-none'}>
       Confirm Action
      </Button>
      </div>
     </form>
     </div>
    </div>
    )}
   </div>
   )}

   {/* TAB 2: FRAUD RISK RADAR */}
   {activeTab === 'fraud' && (
   <div className="saas-card space-y-6">
    <div>
    <h3 className="font-display font-black text-slate-900 uppercase tracking-wider" style={{ fontSize: '18px' }}>Security Anomaly Detection</h3>
    <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>Automated scans measuring multiple coordinate profiles, location discrepancies, or registration filings.</p>
    </div>

    <div className="overflow-hidden border border-border rounded-xl">
    <div className="overflow-x-auto">
     <table className="w-full text-left border-collapse">
     <thead>
      <tr className="border-b border-border bg-slate-50 text-slate-600 font-bold" style={{ fontSize: '13px' }}>
      <th className="p-4">Alarm ID</th>
      <th className="p-4">Flagged Entity</th>
      <th className="p-4">Trigger Anomaly</th>
      <th className="p-4">Calculated Risk</th>
      <th className="p-4">Logged Date</th>
      <th className="p-4 text-right">Actions</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-border" style={{ fontSize: '14px' }}>
      {fraudLogs.map((log) => (
      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
       <td className="p-4 font-mono font-semibold text-slate-400">{log.id}</td>
       <td className="p-4 font-bold text-slate-900">{log.entity_name || log.entityName}</td>
       <td className="p-4 text-red-650 font-bold">{log.trigger}</td>
       <td className="p-4">
       <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase ${
        (log.risk_score || log.riskScore || '').includes('Critical') ? 'bg-red-50 text-red-700 border-red-200' :
        (log.risk_score || log.riskScore || '').includes('Medium') ? 'bg-amber-50 text-amber-700 border-amber-200' :
        'bg-slate-50 text-slate-705 border-slate-250'
       }`}>
        {log.risk_score || log.riskScore}
       </span>
       </td>
       <td className="p-4 font-mono text-slate-550">{log.date}</td>
       <td className="p-4 text-right">
       <button
        onClick={() => dismissFraudLog(log.id)}
        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
        style={{ minHeight: '36px' }}
       >
        Dismiss Anomaly
       </button>
       </td>
      </tr>
      ))}
     </tbody>
     </table>
    </div>
    </div>
   </div>
   )}

   {/* TAB 3: SYSTEM METRICS */}
   {activeTab === 'metrics' && (
   <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    <div className="saas-card">
     <span className="font-mono text-slate-400 font-bold uppercase block" style={{ fontSize: '10px' }}>VERIFICATION RATE</span>
     <span className="text-3xl font-display font-black text-slate-900 mt-1 block">
     {platformMetrics?.verification_rate ?? '94.2%'}
     </span>
    </div>
    <div className="saas-card">
     <span className="font-mono text-slate-400 font-bold uppercase block" style={{ fontSize: '10px' }}>DISPATCHED RUNS</span>
     <span className="text-3xl font-display font-black text-primary mt-1 block">
     {platformMetrics?.total_deliveries ?? '342'} logs
     </span>
    </div>
    <div className="saas-card">
     <span className="font-mono text-slate-400 font-bold uppercase block" style={{ fontSize: '10px' }}>TOTAL NGOS</span>
     <span className="text-3xl font-display font-black text-emerald-650 mt-1 block">
     {platformMetrics?.total_ngos ?? ngos.length} orgs
     </span>
    </div>
    </div>

    <div className="saas-card space-y-4">
    <h4 className="font-display font-bold text-slate-400 uppercase tracking-wider" style={{ fontSize: '12px' }}>Weekly Dispatched Cargo Trends</h4>
    <div className="h-72">
     <ResponsiveContainer width="100%" height="100%">
     <AreaChart
      data={[
      { name: 'Mon', active: 10, total: 15 },
      { name: 'Tue', active: 18, total: 22 },
      { name: 'Wed', active: 25, total: 30 },
      { name: 'Thu', active: 22, total: 28 },
      { name: 'Fri', active: 30, total: 38 },
      { name: 'Sat', active: 35, total: 45 },
      { name: 'Sun', active: 40, total: 55 }
      ]}
      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
     >
      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
      <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
      <YAxis tick={{ fontSize: 11, fontFamily: 'monospace' }} />
      <Tooltip />
      <Area type="monotone" dataKey="total" stroke="#2E7D32" fill="#2E7D32" fillOpacity={0.1} name="Total Cargo Dispatched" />
      <Area type="monotone" dataKey="active" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.05} name="Active Route Shipments" />
     </AreaChart>
     </ResponsiveContainer>
    </div>
    </div>
   </div>
   )}

  </main>
  </div>

  {/* 5-SECOND UNDO TOAST BANNER */}
  {undoBanner && (
  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
   <div className="bg-slate-900 text-white p-4 rounded-xl shadow-premium-xl flex justify-between items-center gap-4 animate-fadeInUp border border-slate-800">
   <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-spin shrink-0">
    <RotateCcw className="w-4 h-4 text-white" />
    </div>
    <div className="text-xs">
    <p className="font-bold">{undoBanner.message}</p>
    <p className="text-slate-400 font-mono text-[9px] mt-0.5">Committing change in 5 seconds...</p>
    </div>
   </div>

   <button
    onClick={handleUndo}
    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
    style={{ minHeight: '32px' }}
   >
    Undo Action
   </button>
   </div>
  </div>
  )}

  {/* DOCUMENT ZOOM LIGHTBOX MODAL */}
  {activeLightboxDoc && (
  <div className="fixed inset-0 bg-slate-950/80 z-[100] flex items-center justify-center p-4">
   <div className="bg-white border border-border w-full max-w-3xl rounded-2xl shadow-premium-2xl overflow-hidden flex flex-col h-[80vh]">
   
   {/* Modal Header */}
   <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50">
    <div className="text-xs">
    <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">DOCUMENT FILINGS VIEWER</span>
    <div className="flex items-center gap-1.5 mt-0.5">
     <span className="font-bold text-slate-900">{activeLightboxDoc.label}</span>
     {activeLightboxDoc.urls && activeLightboxDoc.urls.length > 1 && (
     <span className="text-[10px] text-slate-500 font-mono bg-slate-200/60 px-1.5 py-0.5 rounded font-bold">
      Page {activeLightboxDoc.activeIndex + 1} of {activeLightboxDoc.urls.length}
     </span>
     )}
    </div>
    </div>
    <div className="flex items-center gap-2">
    {activeLightboxDoc.urls && activeLightboxDoc.urls.length > 1 && (
     <div className="flex items-center gap-1 mr-4 border-r border-border pr-4">
     <button
      onClick={() => setActiveLightboxDoc(prev => ({
      ...prev,
      activeIndex: (prev.activeIndex - 1 + prev.urls.length) % prev.urls.length
      }))}
      className="px-2.5 py-1 text-[10px] font-bold bg-white border border-border hover:bg-slate-50 rounded text-slate-700 cursor-pointer"
     >
      Prev
     </button>
     <button
      onClick={() => setActiveLightboxDoc(prev => ({
      ...prev,
      activeIndex: (prev.activeIndex + 1) % prev.urls.length
      }))}
      className="px-2.5 py-1 text-[10px] font-bold bg-white border border-border hover:bg-slate-50 rounded text-slate-700 cursor-pointer"
     >
      Next
     </button>
     </div>
    )}
    <button
     onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
     className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
     title="Zoom In"
    >
     <ZoomIn className="w-4 h-4" />
    </button>
    <button
     onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
     className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
     title="Zoom Out"
    >
     <ZoomOut className="w-4 h-4" />
    </button>
    <button
     onClick={() => setZoomLevel(1)}
     className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer text-xs font-mono font-bold"
     title="Reset Zoom"
    >
     100%
    </button>
    <a
     href={activeLightboxDoc.urls ? activeLightboxDoc.urls[activeLightboxDoc.activeIndex] : activeLightboxDoc.url}
     download={activeLightboxDoc.label.replace(/\s+/g, '_') + `_page_${(activeLightboxDoc.activeIndex || 0) + 1}.jpg`}
     className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer flex items-center gap-1.5"
     title="Download File"
    >
     <Download className="w-4 h-4" />
    </a>
    <button
     onClick={() => setActiveLightboxDoc(null)}
     className="p-2 hover:bg-slate-200 text-red-600 rounded-lg transition-colors cursor-pointer ml-2 border-l border-border pl-4"
    >
     <X className="w-4 h-4" />
    </button>
    </div>
   </div>

   {/* Document Image Container with zooming transforms */}
   <div className="flex-1 overflow-auto bg-slate-900 p-8 flex items-center justify-center relative">
    <div
    style={{
     transform: `scale(${zoomLevel})`,
     transition: 'transform 0.15s ease-out'
    }}
    className="max-w-full max-h-full flex items-center justify-center shadow-premium-2xl"
    >
    <img
     src={activeLightboxDoc.urls ? activeLightboxDoc.urls[activeLightboxDoc.activeIndex] : activeLightboxDoc.url}
     alt={activeLightboxDoc.label}
     className="max-h-[60vh] object-contain rounded border border-slate-700/60"
    />
    </div>
   </div>

   </div>
  </div>
  )}

 </div>
 );
}
