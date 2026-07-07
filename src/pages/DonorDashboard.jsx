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
import Navbar from '../components/Navbar';

export default function DonorDashboard() {
  const { user, logout } = useAuth();
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
      navigate(`/request-wizard?category=${parcelData.category}&desc=${parcelData.description}&weight=${parcelData.weight}`);
    }
  };

  return (
    <div className="db-page min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Shared Main Navbar */}
      <Navbar />

      {/* Main workspace layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white border border-slate-200 rounded-lg p-5 shrink-0 flex flex-col gap-2 shadow-premium-sm">
          <div className="mb-4 pb-4 border-b border-slate-100">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Authenticated as</span>
            <span className="text-sm font-bold text-slate-900">{user?.name || 'Sarah Jenkins'}</span>
            <span className="text-xs text-slate-500 block capitalize mt-0.5">{user?.role || 'donor'}</span>
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Overview Dashboard
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'donations'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" /> Donation History
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" /> Impact & Badges
          </button>

          {/* Gamified metric summary */}
          <div className="mt-6 md:mt-auto bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-md space-y-3 shadow-premium-md">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Level 4 Donor</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            </div>
            <p className="text-xl font-bold font-mono">1,420 XP</p>
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div className="bg-white h-full w-[70%]" />
            </div>
            <span className="text-[9px] text-white/80 block">Next Badge: Carbon Saver Elite (80XP left)</span>
          </div>
        </aside>

        {/* Central & Right Content panels */}
        <main className="flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* Left/Center Panel: Multi-step dynamic item-parcel selection wizard */}
              <div className="lg:col-span-2 space-y-6">
                <div className="db-card shadow-premium-sm bg-white border border-slate-200 rounded-lg p-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <h3 className="font-sans font-bold text-base text-slate-900">Quick Parcel Builder</h3>
                      <p className="text-xs text-slate-500">Fast track items for direct matching and dispatch coordinates.</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-blue-600">
                      Step {wizardStep} of 3
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`h-1 flex-1 rounded-full ${wizardStep >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    <div className={`h-1 flex-1 rounded-full ${wizardStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    <div className={`h-1 flex-1 rounded-full ${wizardStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                  </div>

                  <form onSubmit={handleWizardSubmit} className="space-y-4">
                    {wizardStep === 1 && (
                      <div className="space-y-3">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                          Select Item Category
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {categories.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setParcelData(prev => ({ ...prev, category: c }))}
                              className={`p-3 text-xs rounded-md border text-center transition-all cursor-pointer font-medium ${
                                parcelData.category === c
                                  ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-600 hover:text-blue-600'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {wizardStep === 2 && (
                      <div className="space-y-4 animate-fadeIn">
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
                      <div className="space-y-4 animate-fadeIn">
                        <div>
                          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                            Urgency & Routing Criteria
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Low', 'Medium', 'High'].map((u) => (
                              <button
                                key={u}
                                type="button"
                                onClick={() => setParcelData(prev => ({ ...prev, urgencyPreference: u }))}
                                className={`py-2 text-xs rounded-md border text-center transition-all cursor-pointer font-medium ${
                                  parcelData.urgencyPreference === u
                                    ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-600'
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

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      {wizardStep > 1 ? (
                        <Button type="button" variant="secondary" onClick={() => setWizardStep(prev => prev - 1)}>
                          Back
                        </Button>
                      ) : <div />}
                      
                      <Button type="submit" variant="primary">
                        {wizardStep === 3 ? 'Confirm Request' : 'Next Step'}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Logistics History overview list */}
                <div className="db-card shadow-premium-sm bg-white border border-slate-200 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-sans font-bold text-sm text-slate-900">Recent Active Shipments</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('donations')}>View All Logs</Button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-slate-900">DB-1039 - Books Parcel</p>
                          <p className="text-slate-500 text-[10px]">Route: Sarah Jenkins &rarr; Green Life NGO</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="db-badge db-badge-high">
                          In Transit
                        </span>
                        <p className="text-slate-500 text-[9px] mt-1 font-mono">Est: 14 mins</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Google Maps Tracking view & Active matching NGO */}
              <div className="space-y-6">
                <div className="db-card shadow-premium-sm bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-sans font-bold text-sm flex items-center gap-2 text-slate-900">
                      <MapPin className="w-4 h-4 text-blue-600 animate-bounce" /> Matching Map
                    </h3>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setSelectedNgoId(1); setMapStep(3); }}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border cursor-pointer font-semibold ${selectedNgoId === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
                      >
                        NGO 1
                      </button>
                      <button
                        onClick={() => { setSelectedNgoId(2); setMapStep(3); }}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border cursor-pointer font-semibold ${selectedNgoId === 2 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
                      >
                        NGO 2
                      </button>
                    </div>
                  </div>

                  <MockMap highlightedNgoId={selectedNgoId} activeStep={mapStep} className="h-64 rounded-md overflow-hidden" />

                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Matched NGO:</span>
                      <span className="text-blue-600">{selectedNgoId === 1 ? 'Hope Foundation' : 'Red Cross Depot'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Proximity Weight:</span>
                      <span>{selectedNgoId === 1 ? '1.4 miles (Excellent)' : '3.8 miles (Good)'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Need Urgency Index:</span>
                      <span className="font-semibold text-red-600">{selectedNgoId === 1 ? 'Critical (98/100)' : 'High (82/100)'}</span>
                    </div>
                  </div>
                </div>

                {/* Premium Gamified Impact Badges */}
                <div className="db-card shadow-premium-sm bg-white border border-slate-200 rounded-lg p-6">
                  <h3 className="font-sans font-bold text-sm mb-3 flex items-center gap-2 text-slate-900">
                    <Award className="w-4 h-4 text-amber-500" /> Earned Impact Badges
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-center space-y-1">
                      <Leaf className="w-6 h-6 mx-auto text-emerald-600" />
                      <p className="font-bold text-[11px] leading-tight text-slate-900">Carbon Saver</p>
                      <p className="text-[9px] text-slate-500">Saved 42kg CO2 via direct logistics</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-center space-y-1">
                      <Star className="w-6 h-6 mx-auto text-amber-500" />
                      <p className="font-bold text-[11px] leading-tight text-slate-900">Super Supporter</p>
                      <p className="text-[9px] text-slate-500">Donated 10+ items inside 30 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="db-card shadow-premium-sm bg-white border border-slate-200 rounded-lg p-6 animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-sans font-bold text-lg text-slate-900">Physical Donation Logistics Ledger</h2>
                  <p className="text-xs text-slate-500">Audit trail, dispatch logs, and validation certificates.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Filter className="w-4 h-4" />
                  <span className="font-semibold">Filter/Sort Active</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                      <th className="p-3 font-semibold cursor-pointer font-mono" onClick={() => handleSort('id')}>ID {sortField === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('item')}>Donated Material {sortField === 'item' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('ngo')}>Receiver NGO {sortField === 'ngo' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-3 font-semibold cursor-pointer font-mono" onClick={() => handleSort('date')}>Dispatch Date {sortField === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-3 font-semibold cursor-pointer font-mono" onClick={() => handleSort('weight')}>Net Weight {sortField === 'weight' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('status')}>Ledger Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-semibold text-blue-600">{log.id}</td>
                        <td className="p-3 font-bold text-slate-900">{log.item}</td>
                        <td className="p-3 text-slate-700">{log.ngo}</td>
                        <td className="p-3 font-mono text-slate-600">{log.date}</td>
                        <td className="p-3 font-mono text-slate-600">{log.weight}</td>
                        <td className="p-3">
                          <span className={`db-badge ${log.status === 'Fulfilled' ? 'db-badge-success' : 'db-badge-high'}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="db-card shadow-premium-sm bg-white border border-slate-200 rounded-lg p-6 animate-fadeIn space-y-6">
              <div>
                <h2 className="font-sans font-bold text-lg text-slate-900">Gamified Impact Achievements</h2>
                <p className="text-xs text-slate-500">Your contributions mapped to environmental savings and social metrics.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <BadgeCheck className="w-6 h-6 text-blue-600" />
                    <span className="text-[10px] font-mono font-bold text-blue-600">LVL 4</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">CO2 Reducer Elite</h4>
                  <p className="text-xs text-slate-500">Diverting physical items to direct local channels saved 120kg of CO2 emissions.</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Heart className="w-6 h-6 text-red-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-blue-600">LVL 2</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Life Saver</h4>
                  <p className="text-xs text-slate-500">Assisting medical centers by donating verified high-urgency oxygen packs.</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Award className="w-6 h-6 text-amber-500" />
                    <span className="text-[10px] font-mono font-bold text-blue-600">LVL 5</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Library Builder</h4>
                  <p className="text-xs text-slate-500">Directly matched and routed over 200 textbooks to public school supplies.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
