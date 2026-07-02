import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, ShieldCheck, Check, X, AlertTriangle, Eye, Map,
  FileText, Activity, Users, FileCheck, Search, Filter, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
import { MockMap } from '../components/ui/MockMap';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // NGO Registration validation requests
  const [pendingNgos, setPendingNgos] = useState([
    { id: 'NGO-8821', name: 'Sanctuary Care Center', email: 'reg@sanctuary.org', regNo: '501C3-899120', docs: 'Tax_Exemption_Form.pdf', date: '2026-07-02' },
    { id: 'NGO-8819', name: 'Youth Books Project', email: 'info@ybp.org', regNo: '501C3-441209', docs: 'NGO_Incorporation.pdf', date: '2026-07-01' },
    { id: 'NGO-8804', name: 'Staple Foods for All', email: 'staples@sffa.org', regNo: '501C3-112003', docs: 'Staples_Bylaws.pdf', date: '2026-06-29' },
  ]);

  // Fraud risk logs
  const [fraudFlags, setFraudFlags] = useState([
    { id: 'F-909', type: 'Weight Mismatch', item: 'DB-1042', details: 'Donor declared 22kg; Courier scaled 29kg.', risk: 'Medium', status: 'Pending Review' },
    { id: 'F-904', type: 'IP Location Anomaly', item: 'DB-1011', details: 'NGO signed dispatch from different region IP.', risk: 'High', status: 'Investigating' },
    { id: 'F-881', type: 'Duplicate Items Claim', item: 'DB-9901', details: 'Item photos match exactly with an older post.', risk: 'High', status: 'Flagged' },
  ]);

  // Modal State for Reject Justification
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = (id) => {
    setPendingNgos(prev => prev.filter(ngo => ngo.id !== id));
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason) return;
    setPendingNgos(prev => prev.filter(ngo => ngo.id !== selectedNgo.id));
    setSelectedNgo(null);
    setRejectionReason('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top dashboard nav */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          <span className="font-bold text-lg">System Integrity Hub</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
            SUPER ADMIN CORE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Home</Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>System Config</Button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Metric widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4 border border-slate-200 dark:border-slate-850">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase">Pending Validations</span>
              <FileCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{pendingNgos.length} NGOs</p>
          </Card>
          
          <Card className="p-4 border border-slate-200 dark:border-slate-850">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase">Open Fraud Alerts</span>
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            </div>
            <p className="text-2xl font-bold mt-2 text-red-550 dark:text-red-400">{fraudFlags.length} Flags</p>
          </Card>

          <Card className="p-4 border border-slate-200 dark:border-slate-850">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase">Active Transit Nodes</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold mt-2">128 Shipments</p>
          </Card>

          <Card className="p-4 border border-slate-200 dark:border-slate-850">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase">Security Trust Index</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-emerald-500">99.4% Validated</p>
          </Card>
        </div>

        {/* 2-Pane splits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: NGO Registration verification list */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-base">Pending NGO Credentials Valuations</h3>
                  <p className="text-xs text-slate-500">Review tax exemption records and regulatory certification codes.</p>
                </div>
                <Button variant="secondary" size="sm" icon={Filter}>Filters</Button>
              </div>

              {pendingNgos.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All pending NGO applications validated.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingNgos.map(ngo => (
                    <div key={ngo.id} className="p-4 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{ngo.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[9px] text-slate-500">{ngo.id}</span>
                        </div>
                        <p className="text-slate-550 dark:text-slate-450">Reg ID: <strong className="font-mono">{ngo.regNo}</strong> | Email: {ngo.email}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-450 mt-1">
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="underline hover:text-indigo-400 cursor-pointer">{ngo.docs}</span>
                          <span>&bull; Registered: {ngo.date}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedNgo(ngo)}
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold border border-red-200 dark:border-red-900"
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(ngo.id)}
                          icon={Check}
                          className="text-xs py-1.5"
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Panel: Fraud risk log & Spatial density Map */}
          <div className="space-y-6">
            <Card className="p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-base mb-2">Cross-Platform Fraud Logs</h3>
              <p className="text-xs text-slate-500 mb-4">Anomaly flags generated by weight scale and signature monitors.</p>

              <div className="space-y-3">
                {fraudFlags.map(flag => (
                  <div key={flag.id} className="p-3 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-red-500">{flag.id} &bull; {flag.type}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                        flag.risk === 'High' ? 'bg-red-650 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {flag.risk} Risk
                      </span>
                    </div>
                    <p className="text-slate-500 text-[10px]">{flag.details}</p>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                      <span>Ref ID: {flag.item}</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{flag.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Geographical Density Heatmap teaser */}
            <Card className="p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-xs mb-2 flex items-center gap-1.5">
                <Map className="w-4 h-4 text-emerald-500" /> Geographic Density Risk Map
              </h3>
              <MockMap interactive={false} className="h-44" activeStep={3} />
            </Card>
          </div>

        </div>
      </main>

      {/* Slide Modal/Context Overlay for Reject NGO */}
      {selectedNgo && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-premium-lg">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/80 pb-4 mb-4">
              <h3 className="font-bold text-base text-red-600">Reject Application</h3>
              <button onClick={() => setSelectedNgo(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                Provide the validation failure reason for <strong className="text-slate-800 dark:text-slate-250">{selectedNgo.name}</strong>. This log will be sent via system notification.
              </p>

              <InputField
                label="Rejection Justification Code / Description"
                id="rejectionReason"
                placeholder="e.g. 501(c)3 tax documentation is expired or unreadable."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setSelectedNgo(null)}>Cancel</Button>
                <Button type="submit" variant="danger">Confirm Rejection</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
