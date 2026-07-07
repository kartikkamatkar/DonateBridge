import React, { useState } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, Info,
  TrendingUp, Award, User, RefreshCw, Star, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
import Navbar from '../components/Navbar';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('ngos'); // 'ngos' | 'fraud' | 'metrics'
  const [rejectingNgoId, setRejectingNgoId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Simulated NGO Registrations state
  const [pendingNgos, setPendingNgos] = useState([
    { id: 1, name: 'Mercy Corp', registrationNumber: 'NGO-88019', location: 'Metropolis West', taxExemptId: '501c3-mercy' },
    { id: 2, name: 'Sustain Earth Foundation', registrationNumber: 'NGO-77102', location: 'Coastal Sector B', taxExemptId: '501c3-earth' },
    { id: 3, name: 'Community Care Hub', registrationNumber: 'NGO-66014', location: 'District 4 Heights', taxExemptId: '501c3-care' },
  ]);

  // Fraud risk flags state
  const [fraudLogs, setFraudLogs] = useState([
    { id: 'FL-902', entityName: 'Green Life NGO', trigger: 'Coordinates Discrepancy', riskScore: 'Medium (42%)', date: '2026-07-02' },
    { id: 'FL-899', entityName: 'Sarah Jenkins', trigger: 'High Frequency Requests', riskScore: 'Low (15%)', date: '2026-07-01' },
    { id: 'FL-871', entityName: 'Fake Help Depot', trigger: 'Suspicious Document Hash', riskScore: 'Critical (95%)', date: '2026-06-25' },
  ]);

  const handleApproveNgo = (id, name) => {
    // Simulated approval
    setPendingNgos(prev => prev.filter(ngo => ngo.id !== id));
    alert(`Approved NGO Organization: ${name}`);
  };

  const handleRejectNgoSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setPendingNgos(prev => prev.filter(ngo => ngo.id !== rejectingNgoId));
    alert(`Rejected NGO organization ID ${rejectingNgoId} for reason: ${rejectionReason}`);
    setRejectingNgoId(null);
    setRejectionReason('');
  };

  const handleDeleteFraudLog = (id) => {
    setFraudLogs(prev => prev.filter(log => log.id !== id));
  };

  return (
    <div className="db-page min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Shared Main Navbar */}
      <Navbar />

      {/* Main Grid workspace */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white border border-slate-200 rounded-lg p-5 shrink-0 flex flex-col gap-2 shadow-premium-sm">
          <div className="mb-4 pb-4 border-b border-slate-100">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Active User</span>
            <span className="text-sm font-bold text-slate-900">{user?.name || 'Admin Officer'}</span>
            <span className="text-xs text-red-600 block capitalize font-mono mt-0.5">Superuser Mode</span>
          </div>

          <button
            onClick={() => setActiveTab('ngos')}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'ngos'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Pending Registrations
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'fraud'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Fraud Risk Flags
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'metrics'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Global Platform KPIs
          </button>
        </aside>

        {/* Central Workspace area */}
        <main className="flex-1 space-y-6">
          {activeTab === 'ngos' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6">
                <h3 className="font-sans font-bold text-base mb-1 text-slate-900">Verify Pending NGO Authorities</h3>
                <p className="text-xs text-slate-500 mb-6">Review legal documents, physical addresses, and tax-exempt status registration certificates.</p>

                {pendingNgos.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-500 border border-slate-200 rounded-md bg-slate-50">
                    All NGO queues are currently clear and audited.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingNgos.map((ngo) => (
                      <div key={ngo.id} className="p-4 bg-slate-50 border border-slate-200 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-slate-900">{ngo.name}</p>
                          <p className="text-slate-600">Reg Number: <span className="font-mono">{ngo.registrationNumber}</span> | Location: {ngo.location}</p>
                          <p className="text-[10px] text-blue-600 font-mono font-semibold">Tax Exempt ID: {ngo.taxExemptId}</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1 md:flex-initial"
                            onClick={() => handleApproveNgo(ngo.id, ngo.name)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 md:flex-initial text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setRejectingNgoId(ngo.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rejection Modal overlay logic */}
              {rejectingNgoId && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="db-card w-full max-w-md p-6 bg-white border border-slate-200 rounded-lg shadow-premium-lg animate-scaleIn space-y-4">
                    <h4 className="font-sans font-bold text-base text-slate-900">Provide Rejection Rationale</h4>
                    <p className="text-xs text-slate-500">This feedback will be shown directly on the NGO Console dashboard restricting access.</p>
                    
                    <form onSubmit={handleRejectNgoSubmit} className="space-y-4">
                      <InputField
                        label="Reason for Rejection"
                        id="rejectionReason"
                        placeholder="e.g. Invalid Registration Certificate, Tax Exempt ID verification failed."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                      />

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={() => setRejectingNgoId(null)}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="bg-red-600 hover:bg-red-700 text-white border-red-600">
                          Confirm Rejection
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fraud' && (
            <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6 animate-fadeIn">
              <h3 className="font-sans font-bold text-base mb-1 text-slate-900">System Fraud Risk Radar</h3>
              <p className="text-xs text-slate-500 mb-6">Real-time heuristics analysis and coordinates mismatch alerts.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                      <th className="p-3 font-mono font-semibold">Log ID</th>
                      <th className="p-3 font-semibold">Entity Name</th>
                      <th className="p-3 font-semibold">Trigger Warning</th>
                      <th className="p-3 font-mono font-semibold">Risk Index</th>
                      <th className="p-3 font-mono font-semibold">Date</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-semibold text-slate-500">{log.id}</td>
                        <td className="p-3 font-bold text-slate-900">{log.entityName}</td>
                        <td className="p-3 text-red-600 font-bold">{log.trigger}</td>
                        <td className="p-3 font-mono">
                          <span className={`db-badge ${
                            log.riskScore.includes('Critical') ? 'db-badge-critical' :
                            log.riskScore.includes('Medium') ? 'db-badge-high' :
                            'db-badge-low'
                          }`}>
                            {log.riskScore}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{log.date}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteFraudLog(log.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                            title="Dismiss Flag"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
              <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Active Donors</span>
                <p className="text-3xl font-bold font-mono mt-2 text-slate-900">1,024</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4">
                  <div className="bg-blue-600 h-full w-[78%]" />
                </div>
                <span className="text-[9px] text-slate-500 block mt-2">+12% growth over 30 days</span>
              </div>

              <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Fulfilled Shipments</span>
                <p className="text-3xl font-bold font-mono mt-2 text-slate-900">342</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4">
                  <div className="bg-blue-600 h-full w-[65%]" />
                </div>
                <span className="text-[9px] text-slate-500 block mt-2">98.4% delivery success rating</span>
              </div>

              <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Carbon Saved</span>
                <p className="text-3xl font-bold font-mono mt-2 text-emerald-600">1.4 Tons</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4">
                  <div className="bg-emerald-600 h-full w-[90%]" />
                </div>
                <span className="text-[9px] text-emerald-600 font-semibold block mt-2">Equivalent to 64 trees planted</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
