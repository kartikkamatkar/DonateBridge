import React, { useState } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useMockDB } from '../hooks/useMockDB';
import Navbar from '../components/Navbar';
import StatusStamp from '../components/ui/StatusStamp';
import LeafletMap from '../components/ui/LeafletMap';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { useToast } from '../components/ui/Toast';
import {
  ShieldCheck, AlertTriangle, TrendingUp, X, RotateCcw,
  Check, Eye, Download, ZoomIn, ZoomOut, Maximize2, MapPin, Calendar, Heart
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
  const db = useMockDB();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' | 'fraud' | 'metrics'
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedNgo, setSelectedNgo] = useState(null);
  
  // Rejection/Request Changes states
  const [rejectType, setRejectType] = useState(null); // 'donation' | 'ngo' | 'ngo_changes'
  const [rejectItemId, setRejectItemId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Zooming lightboxes
  const [activeLightboxDoc, setActiveLightboxDoc] = useState(null); // { label, urls: [], activeIndex: number }
  const [zoomLevel, setZoomLevel] = useState(1);

  // Undo System states
  const [pendingActions, setPendingActions] = useState({}); // { [id]: { timeoutId, originalStatus, actionType } }
  const [undoBanner, setUndoBanner] = useState(null); // { id, type, name, message }

  // Filter lists from mock DB
  const pendingNgos = db.ngos.filter(n => n.verificationStatus === 'pending');
  const pendingDonations = db.donations.filter(d => d.status === 'PENDING');

  // Trigger action delay system
  const queueAction = (id, type, target, itemName, extraReason = '') => {
    if (pendingActions[id]) {
      clearTimeout(pendingActions[id].timeoutId);
    }

    let originalStatus = '';
    if (target === 'donation') {
      const d = db.donations.find(item => item.id === id);
      originalStatus = d.status;
      db.updateDonationStatus(id, type === 'approve' ? 'VERIFIED' : 'REJECTED', {
        rejectionReason: type === 'reject' ? extraReason : ''
      });
    } else {
      const n = db.ngos.find(ngo => ngo.id === id);
      originalStatus = n.verificationStatus;
      db.updateNgoStatus(id, type === 'approve' ? 'approved' : type === 'request_changes' ? 'changes_requested' : 'rejected', extraReason);
    }

    const timeoutId = setTimeout(() => {
      setPendingActions(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setUndoBanner(null);
    }, 5000);

    setPendingActions(prev => ({
      ...prev,
      [id]: { timeoutId, originalStatus, actionType: type, target }
    }));

    setUndoBanner({
      id,
      type,
      target,
      name: itemName,
      message: `${type === 'approve' ? 'Approved' : type === 'request_changes' ? 'Requested Changes for' : 'Rejected'} ${target === 'donation' ? 'shipment' : 'NGO'} "${itemName}"`
    });

    setRejectType(null);
    setRejectItemId(null);
    setRejectReason('');
    setSelectedDonation(null);
    setSelectedNgo(null);
  };

  const handleUndo = () => {
    if (!undoBanner) return;
    const { id, target, originalStatus } = undoBanner;

    if (pendingActions[id]) {
      clearTimeout(pendingActions[id].timeoutId);
    }

    if (target === 'donation') {
      db.updateDonationStatus(id, originalStatus);
    } else {
      db.updateNgoStatus(id, originalStatus);
    }

    setPendingActions(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setUndoBanner(null);
    toast.info("Action undone successfully!");
  };

  // Fraud risk alerts
  const [fraudLogs, setFraudLogs] = useState([
    { id: 'FL-902', entityName: 'Green Life NGO', trigger: 'Coordinates Discrepancy', riskScore: 'Medium (42%)', date: '2026-07-02' },
    { id: 'FL-899', entityName: 'Sarah Jenkins', trigger: 'High Frequency Requests', riskScore: 'Low (15%)', date: '2026-07-01' },
    { id: 'FL-871', entityName: 'Fake Help Depot', trigger: 'Suspicious Document Hash', riskScore: 'Critical (95%)', date: '2026-06-25' },
  ]);

  const dismissFraudLog = (id) => {
    setFraudLogs(prev => prev.filter(log => log.id !== id));
    toast.success(`Risk alert ${id} dismissed.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider">ADMIN CONTROL</span>
            <h3 className="text-base font-display font-bold text-ink mt-1 truncate">{user?.name || 'Administrator'}</h3>
            <p className="text-xs text-red-600 font-mono font-semibold uppercase tracking-wider mt-0.5">Superuser Console</p>
          </div>

          <div className="bg-white border border-border p-2 rounded-2xl shadow-premium-sm flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('moderation')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'moderation'
                  ? 'bg-primary text-white font-bold'
                  : 'text-slate-600 hover:text-ink hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Moderation Queue
            </button>
            <button
              onClick={() => setActiveTab('fraud')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'fraud'
                  ? 'bg-primary text-white font-bold'
                  : 'text-slate-600 hover:text-ink hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> Fraud Risk Radar
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-primary text-white font-bold'
                  : 'text-slate-600 hover:text-ink hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> System Metrics
            </button>
          </div>
        </aside>

        {/* Central Workspace */}
        <main className="flex-1 space-y-6 min-w-0">
          
          {/* TAB 1: MODERATION QUEUE */}
          {activeTab === 'moderation' && (
            <div className="space-y-6">
              
              {/* Donor Submissions Section */}
              <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
                <h3 className="text-sm font-display font-bold text-ink uppercase tracking-wider">Donor Shipment Verifications</h3>
                <p className="text-xs text-slate-500">Audit geocoded physical shipment tags before they become claimable by NGOs.</p>

                {pendingDonations.length === 0 ? (
                  <p className="p-8 text-xs font-mono text-slate-400 text-center border border-dashed border-border rounded-xl">No submissions pending moderation review.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {pendingDonations.map((donation) => (
                      <div key={donation.id} className="relative bg-slate-50 border border-border p-5 rounded-xl flex flex-col justify-between gap-4 overflow-hidden">
                        
                        {/* Stamp Animation Overlay */}
                        {pendingActions[donation.id] && (
                          <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center pointer-events-none">
                            <StatusStamp
                              status={pendingActions[donation.id].actionType === 'approve' ? 'VERIFIED' : 'REJECTED'}
                              className="text-sm scale-110 font-bold"
                            />
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-primary">{donation.id}</span>
                              <span className="text-[10px] bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded-full font-semibold uppercase">{donation.category}</span>
                            </div>
                            <p className="font-bold text-slate-900 text-sm mt-1">{donation.title || 'Donation Item'}</p>
                            <p className="text-slate-500">Donor: {donation.donorName} ({donation.donorEmail})</p>
                            <p className="text-slate-500">Pickup Address: {donation.location?.address}</p>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-[10px] py-1 h-9"
                              onClick={() => setSelectedDonation(selectedDonation?.id === donation.id ? null : donation)}
                            >
                              {selectedDonation?.id === donation.id ? 'Hide Details' : 'View Audit Details'}
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-[10px] py-1 h-9"
                              onClick={() => queueAction(donation.id, 'approve', 'donation', donation.title || 'Donation Item')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-[10px] py-1 h-9 text-red-600 border-red-100 hover:bg-red-50"
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
                          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="text-xs space-y-1">
                                <span className="font-bold text-slate-700 block">Description:</span>
                                <p className="text-slate-500 leading-relaxed bg-white border border-border p-3 rounded-lg">{donation.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="font-bold text-slate-700">Condition:</span>
                                  <span className="block text-slate-500 mt-0.5">{donation.condition}</span>
                                </div>
                                <div>
                                  <span className="font-bold text-slate-700">Quantity:</span>
                                  <span className="block text-slate-500 mt-0.5">{donation.quantity} units</span>
                                </div>
                              </div>

                              {donation.photos?.length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-xs font-bold text-slate-700 block">Uploaded Photos:</span>
                                  <div className="flex gap-2 overflow-x-auto py-1">
                                    {donation.photos.map((photo, i) => (
                                      <div
                                        key={i}
                                        onClick={() => setActiveLightboxDoc({ label: `Item Photo ${i+1}`, url: photo })}
                                        className="w-16 h-16 border border-border rounded-lg overflow-hidden shrink-0 bg-white cursor-zoom-in"
                                      >
                                        <img src={photo} alt="" className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Map View */}
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-700 block">Pickup Location Map:</span>
                              <div className="h-44 rounded-xl overflow-hidden border border-border">
                                <LeafletMap
                                  center={[donation.location?.lat || 12.9716, donation.location?.lng || 77.5946]}
                                  zoom={13}
                                  markers={[{ lat: donation.location?.lat, lng: donation.location?.lng, popupContent: <div><b>Pickup Point</b></div> }]}
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
              <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
                <h3 className="text-sm font-display font-bold text-ink uppercase tracking-wider">NGO Authority Verification Queue</h3>
                <p className="text-xs text-slate-500">Verify regulatory filings, corporate registrations and legal certificates.</p>

                {pendingNgos.length === 0 ? (
                  <p className="p-8 text-xs font-mono text-slate-400 text-center border border-dashed border-border rounded-xl">No NGO verification requests pending.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {pendingNgos.map((ngo) => (
                      <div key={ngo.id} className="relative bg-slate-50 border border-border p-5 rounded-xl flex flex-col justify-between gap-4 overflow-hidden">
                        
                        {/* Stamp Animation Overlay */}
                        {pendingActions[ngo.id] && (
                          <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center pointer-events-none">
                            <StatusStamp
                              status={pendingActions[ngo.id].actionType === 'approve' ? 'APPROVED' : pendingActions[ngo.id].actionType === 'request_changes' ? 'CHANGES REQ' : 'REJECTED'}
                              className="text-sm scale-110 font-bold"
                            />
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start">
                          <div className="space-y-1 text-xs">
                            <p className="font-bold text-sm text-slate-900">{ngo.name}</p>
                            <p className="text-slate-500">Tax Filing Reference: <strong className="font-mono text-primary">{ngo.registrationNumber}</strong></p>
                            <p className="text-slate-500">Website: <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{ngo.website}</a></p>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-[10px] py-1 h-9"
                              onClick={() => setSelectedNgo(selectedNgo?.id === ngo.id ? null : ngo)}
                            >
                              {selectedNgo?.id === ngo.id ? 'Hide Filings' : 'Audit Filings'}
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-[10px] py-1 h-9"
                              onClick={() => queueAction(ngo.id, 'approve', 'ngo', ngo.name)}
                            >
                              Approve NGO
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-[10px] py-1 h-9 text-amber-700 border-amber-100 hover:bg-amber-50"
                              onClick={() => {
                                setRejectType('ngo_changes');
                                setRejectItemId(ngo.id);
                              }}
                            >
                              Request Changes
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-[10px] py-1 h-9 text-red-600 border-red-100 hover:bg-red-50"
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
                          <div className="mt-4 pt-4 border-t border-border space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="font-bold text-slate-700">Gov ID Registration:</span>
                                    <span className="block text-slate-500 mt-0.5">{ngo.govRegistrationNumber}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-700">NGO Type:</span>
                                    <span className="block text-slate-500 mt-0.5">{ngo.ngoType}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-700">Volunteers Count:</span>
                                    <span className="block text-slate-500 mt-0.5">{ngo.volunteersCount} active</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-700">Operating Since:</span>
                                    <span className="block text-slate-500 mt-0.5">{ngo.operatingSince}</span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-bold text-slate-700">Mission:</span>
                                  <p className="text-slate-500 leading-relaxed bg-white border border-border p-2.5 rounded-lg">{ngo.mission}</p>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-bold text-slate-700">Description:</span>
                                  <p className="text-slate-500 leading-relaxed bg-white border border-border p-2.5 rounded-lg">{ngo.description}</p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="text-xs">
                                  <span className="font-bold text-slate-700">Headquarters Coordinates:</span>
                                  <span className="block text-slate-400 font-mono mt-0.5">{ngo.lat.toFixed(5)}, {ngo.lng.toFixed(5)} ({ngo.address})</span>
                                </div>
                                <div className="h-44 rounded-xl overflow-hidden border border-border">
                                  <LeafletMap
                                    center={[ngo.lat, ngo.lng]}
                                    zoom={13}
                                    markers={[{ lat: ngo.lat, lng: ngo.lng, popupContent: <div><b>NGO Registered Headquarters</b></div> }]}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 11 Document previews grid */}
                            {ngo.documents && (
                              <div className="space-y-2">
                                <span className="text-xs font-bold text-slate-700 block">Uploaded Certification Filings (11 Required Slots):</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
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
                                        className={`border border-border p-2 rounded-xl bg-white flex flex-col items-center justify-between text-center cursor-zoom-in group hover:border-primary transition-all aspect-square ${!hasPages ? 'opacity-40 pointer-events-none' : ''}`}
                                      >
                                        <div className="w-full h-16 rounded overflow-hidden bg-slate-50 border border-border relative">
                                          {hasPages ? (
                                            <>
                                              <img src={firstPageUrl} alt="" className="w-full h-full object-cover" />
                                              {pages.length > 1 && (
                                                <span className="absolute bottom-1 right-1 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-mono shadow-sm">
                                                  {pages.length} pgs
                                                </span>
                                              )}
                                            </>
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-[10px]">No File</div>
                                          )}
                                          {hasPages && (
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                              <Eye className="w-3.5 h-3.5 text-white" />
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-700 leading-tight block truncate w-full mt-1.5">{label}</span>
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
                      <h4 className="font-display font-bold text-sm text-ink">
                        {rejectType === 'donation' ? 'Shipment Rejection Feedback' : rejectType === 'ngo_changes' ? 'Request Changes Filings' : 'NGO Registration Rejection'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">Submit feedback detailing the reasons. This is dispatched to the provider.</p>
                    </div>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const itemTitle = rejectType === 'donation'
                        ? db.donations.find(d => d.id === rejectItemId)?.title || 'Shipment'
                        : db.ngos.find(n => n.id === rejectItemId)?.name || 'NGO';
                      
                      queueAction(
                        rejectItemId,
                        rejectType === 'donation' ? 'reject' : rejectType === 'ngo_changes' ? 'request_changes' : 'reject',
                        rejectType === 'donation' ? 'donation' : 'ngo',
                        itemTitle,
                        rejectReason
                      );
                    }} className="space-y-4">
                      <InputField
                        label="Rationale Explanation / Needed Changes"
                        id="rejReason"
                        placeholder={rejectType === 'ngo_changes' ? 'e.g. Please re-upload PAN copy with visible corner stamps.' : 'e.g. Items show substantial wear.'}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        required
                      />

                      <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        <Button type="button" variant="secondary" onClick={() => {
                          setRejectType(null);
                          setRejectItemId(null);
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary" className={rejectType === 'ngo_changes' ? 'bg-amber-600 hover:bg-amber-700 border-none' : 'bg-red-600 hover:bg-red-700 border-none'}>
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
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
              <h3 className="text-sm font-display font-bold text-ink uppercase tracking-wider">Security Flag Risk Radar</h3>
              <p className="text-xs text-slate-500">Automated system alarms detecting multiple coordinate accounts or list anomalies.</p>

              <div className="overflow-hidden border border-border rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-slate-50 text-slate-600 font-semibold">
                        <th className="p-4">Log Stamp</th>
                        <th className="p-4">Flagged Provider</th>
                        <th className="p-4">Trigger Anomaly</th>
                        <th className="p-4">Calculated Risk</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {fraudLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono font-semibold text-slate-400">{log.id}</td>
                          <td className="p-4 font-bold text-slate-900">{log.entityName}</td>
                          <td className="p-4 text-red-600 font-medium">{log.trigger}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 border text-[9px] font-bold rounded-full uppercase ${
                              log.riskScore.includes('Critical') ? 'bg-red-50 text-red-700 border-red-200' :
                              log.riskScore.includes('Medium') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {log.riskScore}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-500">{log.date}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => dismissFraudLog(log.id)}
                              className="px-3 py-1 bg-white hover:bg-slate-50 border border-border rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                            >
                              Dismiss
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

          {/* TAB 3: PLATFORM KPIS */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">VERIFICATION RATE</span>
                  <span className="text-2xl font-display font-extrabold text-ink mt-1 block">94.2%</span>
                </div>
                <div className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">DISPATCHED CARRIER JOBS</span>
                  <span className="text-2xl font-display font-extrabold text-primary mt-1 block">342 runs</span>
                </div>
                <div className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">TOTAL CARBON SAVED</span>
                  <span className="text-2xl font-display font-extrabold text-secondary mt-1 block">1,492 kg</span>
                </div>
              </div>

              {/* Area chart of platform actions */}
              <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
                <h4 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">Weekly Dispatched Cargo Trends</h4>
                <div className="h-64">
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
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                      <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} />
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
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center animate-spin">
                <RotateCcw className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-xs">
                <p className="font-bold">{undoBanner.message}</p>
                <p className="text-slate-400 font-mono text-[9px] mt-0.5">Committing change in 5 seconds...</p>
              </div>
            </div>

            <button
              onClick={handleUndo}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
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
