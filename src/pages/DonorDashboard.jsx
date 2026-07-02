import React, { useState } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Package, MapPin, BadgeCheck, Clock, Award, History, ArrowRight,
  TrendingUp, Leaf, Star, Sparkles, Filter, ChevronDown, Check, Navigation
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MockMap } from '../components/ui/MockMap';
import { InputField } from '../components/ui/InputField';

export default function DonorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'donations' | 'badges'

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [parcelData, setParcelData] = useState({
    category: '',
    description: '',
    weight: '',
    urgencyPreference: 'Medium',
    pickupDate: '',
    pickupTime: '',
  });

  // Highlighted NGO state for Map matching preview
  const [selectedNgoId, setSelectedNgoId] = useState(1);
  const [mapStep, setMapStep] = useState(3); // In transit simulation

  // Historical Log State with Sorting
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [historyLogs, setHistoryLogs] = useState([
    { id: 'DB-1042', item: '20x Winter Jackets', category: 'Clothes', ngo: 'Hope Shelter', date: '2026-06-25', status: 'Fulfilled', weight: '22kg' },
    { id: 'DB-1039', item: '40x School Textbooks', category: 'Books', ngo: 'Green Life NGO', date: '2026-06-18', status: 'In Transit', weight: '15kg' },
    { id: 'DB-1021', item: '1x Medical Oxygen Concentrator', category: 'Medical Equipment', ngo: 'Hope Shelter', date: '2026-05-10', status: 'Fulfilled', weight: '18kg' },
    { id: 'DB-1011', item: '100x Daily Food Packets', category: 'Food', ngo: 'Red Cross Depot', date: '2026-04-29', status: 'Fulfilled', weight: '45kg' },
  ]);

  const categories = [
    'Books', 'Clothes', 'Food', 'Toys', 'School Supplies',
    'Blankets', 'Furniture', 'Medical Equipment', 'Electronics', 'Daily Essentials'
  ];

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);

    const sorted = [...historyLogs].sort((a, b) => {
      if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
      return 0;
    });
    setHistoryLogs(sorted);
  };

  const handleWizardSubmit = (e) => {
    e.preventDefault();
    if (wizardStep < 3) {
      setWizardStep(prev => prev + 1);
    } else {
      // Completed, redirect/simulate
      navigate(`/request-wizard?category=${parcelData.category}&desc=${parcelData.description}&weight=${parcelData.weight}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-55 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top dashboard nav */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">Donor Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Home</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/request-wizard')}>New Request</Button>
        </div>
      </header>

      {/* Main workspace layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-slate-100 dark:bg-slate-850/60 border-r border-slate-250 dark:border-slate-800 p-4 shrink-0 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded text-sm font-semibold transition-all ${
              activeTab === 'overview' ? 'bg-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Overview Dashboard
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded text-sm font-semibold transition-all ${
              activeTab === 'donations' ? 'bg-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" /> Donation History
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded text-sm font-semibold transition-all ${
              activeTab === 'badges' ? 'bg-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" /> Impact & Badges
          </button>

          {/* Gamified metric summary */}
          <div className="mt-auto bg-gradient-to-br from-emerald-800 to-primary text-white p-4 rounded-lg space-y-2.5 shadow-premium-md">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-emerald-250">Level 4 Donor</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            </div>
            <p className="text-xl font-bold">1,420 XP</p>
            <div className="w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-350 h-full w-[70%]" />
            </div>
            <span className="text-[9px] text-emerald-100 block">Next Badge: Carbon Saver Elite (80XP left)</span>
          </div>
        </aside>

        {/* Central & Right Content panels */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left/Center Panel: Multi-step dynamic item-parcel selection wizard */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/80 pb-4 mb-4">
                    <div>
                      <h3 className="font-bold text-base">Quick Parcel Builder</h3>
                      <p className="text-xs text-slate-500">Fast track items for direct matching and dispatch coordinates.</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded text-primary">
                      Step {wizardStep} of 3
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`h-1.5 flex-1 rounded ${wizardStep >= 1 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <div className={`h-1.5 flex-1 rounded ${wizardStep >= 2 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <div className={`h-1.5 flex-1 rounded ${wizardStep >= 3 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  </div>

                  <form onSubmit={handleWizardSubmit} className="space-y-4">
                    {wizardStep === 1 && (
                      <div className="space-y-4">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-350">
                          Select Item Category
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {categories.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setParcelData(prev => ({ ...prev, category: c }))}
                              className={`p-3 text-xs font-bold rounded border text-center transition-all ${
                                parcelData.category === c
                                  ? 'border-primary bg-emerald-50 dark:bg-emerald-950/20 text-primary dark:text-emerald-450 ring-2 ring-primary'
                                  : 'border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-900 hover:border-slate-300'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {wizardStep === 2 && (
                      <div className="space-y-4">
                        <InputField
                          label="Describe Your Parcel Items"
                          id="description"
                          placeholder="e.g. 15 wool blankets, clean and packaged in boxes"
                          value={parcelData.description}
                          onChange={(e) => setParcelData(prev => ({ ...prev, description: e.target.value }))}
                          required
                        />
                        <InputField
                          label="Total Weight Estimate (kg)"
                          id="weight"
                          type="number"
                          placeholder="e.g. 15"
                          value={parcelData.weight}
                          onChange={(e) => setParcelData(prev => ({ ...prev, weight: e.target.value }))}
                          required
                        />
                      </div>
                    )}

                    {wizardStep === 3 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-350 block mb-2">
                            Urgency & Routing Criteria
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Low', 'Medium', 'High'].map((u) => (
                              <button
                                key={u}
                                type="button"
                                onClick={() => setParcelData(prev => ({ ...prev, urgencyPreference: u }))}
                                className={`py-2 text-xs font-bold rounded border text-center transition-all ${
                                  parcelData.urgencyPreference === u
                                    ? 'border-primary bg-emerald-50 dark:bg-emerald-950/20 text-primary dark:text-emerald-450 ring-2 ring-primary'
                                    : 'border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-900'
                                }`}
                              >
                                {u} Need
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <InputField
                            label="Pickup Date"
                            id="pickupDate"
                            type="date"
                            value={parcelData.pickupDate}
                            onChange={(e) => setParcelData(prev => ({ ...prev, pickupDate: e.target.value }))}
                            required
                          />
                          <InputField
                            label="Pickup Time Slot"
                            id="pickupTime"
                            type="time"
                            value={parcelData.pickupTime}
                            onChange={(e) => setParcelData(prev => ({ ...prev, pickupTime: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                      {wizardStep > 1 ? (
                        <Button type="button" variant="secondary" onClick={() => setWizardStep(prev => prev - 1)}>
                          Back
                        </Button>
                      ) : <div />}
                      
                      <Button type="submit" variant="primary" icon={wizardStep === 3 ? Check : ArrowRight}>
                        {wizardStep === 3 ? 'Confirm Request' : 'Next Step'}
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* Logistics History overview list */}
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm">Recent Active Shipments</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('donations')}>View All Logs</Button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-indigo-500" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">DB-1039 - Books Parcel</p>
                          <p className="text-slate-500 text-[10px]">Route: Sarah Jenkins &rarr; Green Life NGO</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300 font-bold text-[9px]">
                          In Transit
                        </span>
                        <p className="text-slate-400 text-[9px] mt-0.5">Est: 14 mins</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: Google Maps Tracking view & Active matching NGO */}
              <div className="space-y-6">
                <Card className="p-4 border border-slate-200 dark:border-slate-700 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500 animate-bounce" /> Matching Visualizer Map
                    </h3>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setSelectedNgoId(1); setMapStep(3); }}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${selectedNgoId === 1 ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-900'}`}
                      >
                        NGO 1
                      </button>
                      <button
                        onClick={() => { setSelectedNgoId(2); setMapStep(3); }}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${selectedNgoId === 2 ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-900'}`}
                      >
                        NGO 2
                      </button>
                    </div>
                  </div>

                  <MockMap highlightedNgoId={selectedNgoId} activeStep={mapStep} className="h-64" />

                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>Matched NGO:</span>
                      <span className="text-emerald-500">{selectedNgoId === 1 ? 'Hope Foundation' : 'Red Cross Depot'}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Proximity Weight:</span>
                      <span>{selectedNgoId === 1 ? '1.4 miles (Excellent)' : '3.8 miles (Good)'}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Need Urgency index:</span>
                      <span className="font-bold text-red-500">{selectedNgoId === 1 ? 'Critical (98/100)' : 'High (82/100)'}</span>
                    </div>
                  </div>
                </Card>

                {/* Premium Gamified Impact Badges */}
                <Card className="p-4 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" /> Earned Impact Badges
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-250 dark:border-slate-800 text-center space-y-1">
                      <Leaf className="w-6 h-6 mx-auto text-emerald-500" />
                      <p className="font-bold text-[10px] leading-tight">Carbon Saver</p>
                      <p className="text-[9px] text-slate-500">Saved 42kg CO2 via direct logistics</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-250 dark:border-slate-800 text-center space-y-1">
                      <Star className="w-6 h-6 mx-auto text-amber-500" />
                      <p className="font-bold text-[10px] leading-tight">Super Supporter</p>
                      <p className="text-[9px] text-slate-500">Donated 10+ items inside 30 days</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'donations' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold">Physical Donation Logistics Ledger</h2>
                  <p className="text-xs text-slate-500">Audit trail, dispatch logs, and validation certificates.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500">Filter/Sort Active</span>
                </div>
              </div>

              {/* Responsive Sorting Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-350">
                      <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('id')}>ID {sortField === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('item')}>Donated Material {sortField === 'item' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('ngo')}>Receiver NGO {sortField === 'ngo' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('date')}>Dispatch Date {sortField === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('weight')}>Net Weight {sortField === 'weight' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('status')}>Ledger Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{log.id}</td>
                        <td className="p-3 font-semibold">{log.item}</td>
                        <td className="p-3">{log.ngo}</td>
                        <td className="p-3 font-mono">{log.date}</td>
                        <td className="p-3 font-mono">{log.weight}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                            log.status === 'Fulfilled'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-350'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'badges' && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold">Gamified Impact Achievements</h2>
                <p className="text-xs text-slate-500">Your contributions mapped to environmental savings and social metrics.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <BadgeCheck className="w-6 h-6 text-emerald-500" />
                    <span className="text-[10px] font-bold text-primary">LVL 4</span>
                  </div>
                  <h4 className="font-bold text-sm">CO2 Reducer Elite</h4>
                  <p className="text-xs text-slate-500">Diverting physical items to direct local channels saved 120kg of CO2 emissions.</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Heart className="w-6 h-6 text-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-primary">LVL 2</span>
                  </div>
                  <h4 className="font-bold text-sm">Life Saver</h4>
                  <p className="text-xs text-slate-500">Assisting medical centers by donating verified high-urgency oxygen packs.</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Award className="w-6 h-6 text-amber-500" />
                    <span className="text-[10px] font-bold text-primary">LVL 5</span>
                  </div>
                  <h4 className="font-bold text-sm">Library Builder</h4>
                  <p className="text-xs text-slate-500">Directly matched and routed over 200 textbooks to public school supplies.</p>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
