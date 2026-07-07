import React, { useState } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Package, Clock, AlertTriangle, Search, Filter,
  Settings, CheckCircle, ArrowUpRight, Plus, RefreshCw, Star
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
import Navbar from '../components/Navbar';

export default function NgoConsole() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // NGO Inventory Needs state
  const [inventoryNeeds, setInventoryNeeds] = useState([
    { id: 1, item: 'Winter Blankets', category: 'Blankets', urgency: 'Critical', minQty: '50 units' },
    { id: 2, item: 'School Notebooks', category: 'School Supplies', urgency: 'High', minQty: '200 books' },
    { id: 3, item: 'Daily Staples (Flour/Rice)', category: 'Food', urgency: 'Medium', minQty: '100 kg' },
    { id: 4, item: 'Children Toy Packs', category: 'Toys', urgency: 'Low', minQty: '30 packs' },
  ]);

  // Inbound logistics requests state
  const [inboundShipments, setInboundShipments] = useState([
    { id: 'DB-2101', donor: 'Sarah Jenkins', material: '25 Wool Blankets', status: 'Dispatched', eta: '12m', date: '2026-07-02' },
    { id: 'DB-2098', donor: 'Microsoft Corp', material: '10 Laptops (Refurbished)', status: 'Approved', eta: '2h', date: '2026-07-01' },
    { id: 'DB-2081', donor: 'Green Valley Grocers', material: '80kg Fresh Produce', status: 'Transit Delay', eta: 'Delayed', date: '2026-06-30' },
    { id: 'DB-2070', donor: 'Dr. Alan Vance', material: '1x Wheelchair', status: 'Delivered', eta: 'Arrived', date: '2026-06-28' },
  ]);

  // Handle urgency level changes
  const handleUrgencyChange = (id, newUrgency) => {
    setInventoryNeeds(prev =>
      prev.map(need => (need.id === id ? { ...need, urgency: newUrgency } : need))
    );
  };

  const handleAddNeed = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const item = data.get('item');
    const category = data.get('category');
    const urgency = data.get('urgency');
    const minQty = data.get('minQty');

    if (!item || !minQty) return;

    setInventoryNeeds(prev => [
      ...prev,
      { id: Date.now(), item, category, urgency, minQty }
    ]);
    e.target.reset();
  };

  const filteredShipments = inboundShipments.filter(ship => {
    const matchesSearch = ship.donor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ship.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ship.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || ship.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (user?.role === 'ngo' && user?.verificationStatus === 'rejected') {
    return (
      <div className="db-page min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <div className="db-card w-full max-w-2xl p-8 bg-white border border-slate-200 rounded-lg shadow-premium-md animate-fadeInUp">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 text-red-600 text-xs font-mono font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              Verification Rejected
            </div>
            <h1 className="font-sans font-bold text-2xl text-slate-900">Your NGO verification was not approved</h1>
            <p className="text-sm text-slate-500">
              Your dashboard access is restricted until your verification documents are accepted.
            </p>
            <div className="p-4 rounded-md border border-slate-200 bg-slate-50 text-sm">
              <p className="font-bold text-slate-800 mb-1">Rejection Reason</p>
              <p className="text-slate-600">
                {user?.rejectionReason || 'No rejection reason was provided by admin.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="primary" onClick={() => navigate('/settings')}>Resubmit Documents</Button>
              <Button variant="secondary" onClick={() => navigate('/chat')}>Contact Support</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="db-page min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Shared Main Navbar */}
      <Navbar />

      {/* Main Grid workspace */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* NGO Info and Trust Banner */}
        <div className="db-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6 animate-fadeInUp">
          <div>
            <h2 className="font-sans font-bold text-lg text-slate-900">Hope Foundation</h2>
            <p className="text-xs text-slate-500">Established 2018 | Primary Hub: District 4 East</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-md">
            <Star className="w-4 h-4 text-blue-600 fill-current" />
            <span className="text-xs font-mono font-bold text-blue-600">Trust Score Rating: 98% (High Tier)</span>
          </div>
        </div>

        {/* Live KPI Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Pending Pickups</span>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold font-mono mt-2 text-slate-900">6 Active</p>
            <span className="text-[10px] text-slate-500 block mt-1">2 scheduled for today</span>
          </div>

          <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Transit Delays</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold font-mono mt-2 text-red-600">1 Alert</p>
            <span className="text-[10px] text-red-500 font-semibold block mt-1">Delayed due to traffic (DB-2081)</span>
          </div>

          <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Fulfilled Items</span>
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono mt-2 text-slate-900">1,248 Units</p>
            <span className="text-[10px] text-slate-500 block mt-1">Cumulative logistics verified</span>
          </div>

          <div className="db-card bg-gradient-to-br from-blue-50 to-white border border-slate-200 rounded-lg shadow-premium-sm p-5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Carbon Saved</span>
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold font-mono mt-2 text-blue-600">492 kg</p>
            <span className="text-[10px] text-blue-600 font-bold block mt-1">Verified Environmental Ledger</span>
          </div>
        </div>

        {/* Searchable Inbound Logistics & Urgent Needs Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Center: Searchable Logistics Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-sans font-bold text-base text-slate-900">Inbound Donation Shipments</h3>
                  <p className="text-xs text-slate-500">Live shipping nodes matches and ETA logs.</p>
                </div>

                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none w-40"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-2 py-1.5 rounded-md border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Transit Delay">Delays</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Table Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                      <th className="p-3 font-mono font-semibold">Shipment ID</th>
                      <th className="p-3 font-semibold">Donor Entity</th>
                      <th className="p-3 font-semibold">Items</th>
                      <th className="p-3 font-mono font-semibold">Est. Arrival</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map((ship) => (
                      <tr key={ship.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-semibold text-blue-600">{ship.id}</td>
                        <td className="p-3 font-bold text-slate-900">{ship.donor}</td>
                        <td className="p-3 text-slate-700">{ship.material}</td>
                        <td className="p-3 font-mono text-slate-600">{ship.eta}</td>
                        <td className="p-3">
                          <span className={`db-badge ${
                            ship.status === 'Delivered' ? 'db-badge-success' :
                            ship.status === 'Transit Delay' ? 'db-badge-critical' :
                            ship.status === 'Dispatched' ? 'db-badge-high' :
                            'db-badge-medium'
                          }`}>
                            {ship.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/tracking/${ship.id.replace('DB-', '')}`)}
                            className="text-blue-600 hover:underline font-semibold text-[11px]"
                          >
                            Track <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 inline" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Active Inventory Needs Manager */}
          <div className="space-y-6">
            <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6">
              <h3 className="font-sans font-bold text-base mb-1 text-slate-900">Inventory Necessity Index</h3>
              <p className="text-xs text-slate-500 mb-4">Set priorities that direct our matchmaking algorithm rankings.</p>

              <div className="space-y-4">
                {inventoryNeeds.map((need) => (
                  <div key={need.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-900">{need.item}</p>
                        <p className="text-slate-500 text-[10px]">Category: {need.category} | Threshold: {need.minQty}</p>
                      </div>
                      <span className={`db-badge ${
                        need.urgency === 'Critical' ? 'db-badge-critical' :
                        need.urgency === 'High' ? 'db-badge-high' :
                        need.urgency === 'Medium' ? 'db-badge-medium' :
                        'db-badge-low'
                      }`}>
                        {need.urgency}
                      </span>
                    </div>

                    {/* Radio Urgency Toggles */}
                    <div className="flex gap-1 pt-1.5 border-t border-slate-200">
                      {['Critical', 'High', 'Medium', 'Low'].map((urg) => (
                        <button
                          key={urg}
                          type="button"
                          onClick={() => handleUrgencyChange(need.id, urg)}
                          className={`flex-1 py-1 text-[9px] font-mono font-bold rounded-md text-center transition-all cursor-pointer ${
                            need.urgency === urg
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {urg[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Add Need Form */}
            <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6">
              <h4 className="font-sans font-bold text-xs mb-3 text-slate-900">Add Urgent Essential Necessity</h4>
              <form onSubmit={handleAddNeed} className="space-y-3">
                <InputField
                  label="Item Name"
                  id="item"
                  name="item"
                  placeholder="e.g. Pediatric Oxygen Monitors"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Urgency
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <InputField
                    label="Min Target Qty"
                    id="minQty"
                    name="minQty"
                    placeholder="e.g. 5 units"
                    required
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full text-xs py-2" icon={Plus}>
                  Register Essential Needs
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
