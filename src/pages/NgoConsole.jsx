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

export default function NgoConsole() {
  const { user } = useAuth();
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Dashboard Top bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">NGO Control Console</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-350 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> VERIFIED ORGANISATION
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Home</Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/chat')}>Direct Messages</Button>
        </div>
      </header>

      {/* Main Grid workspace */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* NGO Info and Trust Banner */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-premium-sm">
          <div>
            <h2 className="text-lg font-bold">Hope Foundation</h2>
            <p className="text-xs text-slate-500">Established 2018 | Primary Hub: District 4 East</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-900 px-3.5 py-1.5 rounded">
            <Star className="w-4 h-4 text-emerald-600 fill-current" />
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-450">Trust Score Rating: 98% (High Tier)</span>
          </div>
        </div>

        {/* Live KPI Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 p-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 uppercase">Pending Pickups</span>
              <Package className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold mt-2">6 Active</p>
            <span className="text-[10px] text-slate-450 block mt-1">2 scheduled for today</span>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 p-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 uppercase">Transit Delays</span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold mt-2">1 Alert</p>
            <span className="text-[10px] text-red-500 font-semibold block mt-1">Delayed due to traffic (DB-2081)</span>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 p-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 uppercase">Fulfilled Items</span>
              <CheckCircle className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold mt-2">1,248 Units</p>
            <span className="text-[10px] text-slate-450 block mt-1">Cumulative logistics verified</span>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-slate-255 p-4 bg-gradient-to-br from-emerald-50 to-white dark:from-slate-800 dark:to-slate-850">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 uppercase">Carbon Saved</span>
              <Star className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-2">492 kg</p>
            <span className="text-[10px] text-emerald-650 font-bold block mt-1">Verified Environmental Ledger</span>
          </Card>
        </div>

        {/* Searchable Inbound Logistics & Urgent Needs Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left/Center: Searchable Logistics Grid */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-base">Inbound Donation Shipments</h3>
                  <p className="text-xs text-slate-500">Live shipping nodes matches and ETA logs.</p>
                </div>

                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-7 pr-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-primary focus:outline-none w-40"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
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
                    <tr className="border-b border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-350">
                      <th className="p-3 font-semibold">Shipment ID</th>
                      <th className="p-3 font-semibold">Donor Entity</th>
                      <th className="p-3 font-semibold">Items</th>
                      <th className="p-3 font-semibold">Est. Arrival</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map((ship) => (
                      <tr key={ship.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold">{ship.id}</td>
                        <td className="p-3 font-semibold">{ship.donor}</td>
                        <td className="p-3">{ship.material}</td>
                        <td className="p-3 font-mono">{ship.eta}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                            ship.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                            ship.status === 'Transit Delay' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300' :
                            ship.status === 'Dispatched' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                          }`}>
                            {ship.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/tracking/${ship.id.replace('DB-', '')}`)}
                            className="text-primary hover:underline font-bold text-[10px]"
                          >
                            Track <ArrowUpRight className="w-3 h-3 ml-1 inline" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Column: Active Inventory Needs Manager */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-base mb-2">Inventory Necessity Index</h3>
              <p className="text-xs text-slate-500 mb-4">Set priorities that direct our matchmaking algorithm rankings.</p>

              <div className="space-y-4">
                {inventoryNeeds.map((need) => (
                  <div key={need.id} className="p-3 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-850 dark:text-slate-200">{need.item}</p>
                        <p className="text-slate-500 text-[10px]">Category: {need.category} | Threshold: {need.minQty}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                        need.urgency === 'Critical' ? 'bg-red-650 text-white' :
                        need.urgency === 'High' ? 'bg-amber-500 text-white' :
                        need.urgency === 'Medium' ? 'bg-blue-500 text-white' :
                        'bg-slate-500 text-white'
                      }`}>
                        {need.urgency}
                      </span>
                    </div>

                    {/* Radio Urgency Toggles */}
                    <div className="flex gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {['Critical', 'High', 'Medium', 'Low'].map((urg) => (
                        <button
                          key={urg}
                          type="button"
                          onClick={() => handleUrgencyChange(need.id, urg)}
                          className={`flex-1 py-1 text-[9px] font-bold rounded text-center transition-all ${
                            need.urgency === urg
                              ? 'bg-slate-800 dark:bg-slate-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {urg[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Add Need Form */}
            <Card className="p-4">
              <h4 className="font-bold text-xs mb-3">Add Urgent Essential Necessity</h4>
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
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                      Urgency
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none"
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
                <Button type="submit" variant="primary" className="w-full text-xs py-1.5" icon={Plus}>
                  Register Essential Needs
                </Button>
              </form>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
