import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useMockDB } from '../hooks/useMockDB';
import Navbar from '../components/Navbar';
import StatusStamp from '../components/ui/StatusStamp';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { useToast } from '../components/ui/Toast';
import { ShieldCheck, AlertTriangle, TrendingUp, RefreshCw, X, RotateCcw, Box, Check, Eye } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const db = useMockDB();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' | 'fraud' | 'metrics'
  const [rejectingNgoId, setRejectingNgoId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Undo System states
  const [pendingActions, setPendingActions] = useState({}); // { [id]: { timeoutId, originalStatus, actionType } }
  const [undoBanner, setUndoBanner] = useState(null); // { id, type, name, message }

  // Filter lists from mock DB
  const pendingNgos = db.ngos.filter(n => n.verificationStatus === 'pending');
  const pendingDonations = db.donations.filter(d => d.status === 'PENDING');

  // Trigger action delay system
  const queueAction = (id, type, target, itemName) => {
    if (pendingActions[id]) {
      clearTimeout(pendingActions[id].timeoutId);
    }

    let originalStatus = '';
    if (target === 'donation') {
      const d = db.donations.find(item => item.id === id);
      originalStatus = d.status;
      db.updateDonationStatus(id, type === 'approve' ? 'VERIFIED' : 'REJECTED');
    } else {
      const n = db.ngos.find(ngo => ngo.id === id);
      originalStatus = n.verificationStatus;
      db.updateNgoStatus(id, type === 'approve' ? 'approved' : 'rejected', type === 'reject' ? rejectionReason : '');
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
      message: `${type === 'approve' ? 'Approved' : 'Rejected'} ${target === 'donation' ? 'shipment' : 'NGO'} "${itemName}"`
    });

    if (type === 'reject') {
      setRejectingNgoId(null);
      setRejectionReason('');
    }
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
        <main className="flex-1 space-y-6">
          
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
                      <div key={donation.id} className="relative bg-slate-50 border border-border p-5 rounded-xl flex flex-col sm:flex-row justify-between gap-4 overflow-hidden">
                        
                        {/* Stamp Animation Overlay */}
                        {pendingActions[donation.id] && (
                          <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center pointer-events-none">
                            <StatusStamp
                              status={pendingActions[donation.id].actionType === 'approve' ? 'VERIFIED' : 'REJECTED'}
                              className="text-sm scale-110 font-bold"
                            />
                          </div>
                        )}

                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary">{donation.id}</span>
                            <span className="text-[10px] bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded-full font-semibold uppercase">{donation.category}</span>
                          </div>
                          <p className="font-bold text-slate-900 text-sm mt-1">{donation.itemName}</p>
                          <p className="text-slate-500 mt-1">Location: {donation.location.address}</p>
                          <p className="text-slate-500 italic mt-1">"{donation.description}"</p>
                        </div>

                        <div className="flex gap-2 items-center sm:self-center shrink-0">
                          <button
                            onClick={() => queueAction(donation.id, 'approve', 'donation', donation.itemName)}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => queueAction(donation.id, 'reject', 'donation', donation.itemName)}
                            className="px-4 py-2 bg-white hover:bg-slate-100 text-red-600 border border-border text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                        </div>

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
                      <div key={ngo.id} className="relative bg-slate-50 border border-border p-5 rounded-xl flex flex-col sm:flex-row justify-between gap-4 overflow-hidden">
                        
                        {/* Stamp Animation Overlay */}
                        {pendingActions[ngo.id] && (
                          <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center pointer-events-none">
                            <StatusStamp
                              status={pendingActions[ngo.id].actionType === 'approve' ? 'APPROVED' : 'REJECTED'}
                              className="text-sm scale-110 font-bold"
                            />
                          </div>
                        )}

                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-sm text-slate-900">{ngo.name}</p>
                          <p className="text-slate-500 mt-1">Tax Filing Reference: <strong className="font-mono text-primary">{ngo.registrationNumber}</strong></p>
                          <p className="text-slate-500">Center Coordinates Address: {ngo.address}</p>
                        </div>

                        <div className="flex gap-2 items-center sm:self-center shrink-0">
                          <button
                            onClick={() => queueAction(ngo.id, 'approve', 'ngo', ngo.name)}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors"
                          >
                            Verify NGO
                          </button>
                          <button
                            onClick={() => setRejectingNgoId(ngo.id)}
                            className="px-4 py-2 bg-white hover:bg-slate-100 text-red-600 border border-border text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                          >
                            Reject NGO
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rejection Rationale Modal */}
              {rejectingNgoId && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white border border-border w-full max-w-md p-6 rounded-2xl shadow-premium-xl space-y-4">
                    <div>
                      <h4 className="font-display font-bold text-sm text-ink">NGO Rejection Feedback</h4>
                      <p className="text-xs text-slate-500 mt-1">Submit rejection details for this organization.</p>
                    </div>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const ngo = db.ngos.find(n => n.id === rejectingNgoId);
                      queueAction(rejectingNgoId, 'reject', 'ngo', ngo.name);
                    }} className="space-y-4">
                      <InputField
                        label="Rationale Explanation"
                        id="rejReason"
                        placeholder="e.g. NGO document filing certificate is expired."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                      />

                      <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        <Button type="button" variant="secondary" onClick={() => setRejectingNgoId(null)}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="bg-red-600 hover:bg-red-700 border-none">
                          Confirm Rejection
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

    </div>
  );
}
