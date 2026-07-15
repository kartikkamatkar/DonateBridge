import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, Leaf, ShieldCheck, Heart, ArrowLeft,
  Calendar, Check, Filter, TrendingUp, HelpCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import Navbar from '../components/layout/Navbar';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ImpactAnalytics() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('6M');

  // Chart 1: Categorical Material Breakdown (Pie Chart)
  const pieData = {
    labels: ['Books & School', 'Clothes & Blankets', 'Food Staples', 'Medical Equipment', 'Electronics'],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          '#2E7D32', // Forest green
          '#43A047', // Light green
          '#4CAF50', // Accent green
          '#10B981', // Emerald
          '#E2E8F0', // Border grey
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart 2: Environmental Carbon Savings in kg (Line Graph)
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'CO2 Diverted (kg)',
        data: [120, 240, 480, 720, 1100, 1420],
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.05)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Chart 3: Monthly Logistical Donation Volume (Bar Chart)
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Items Transferred',
        data: [420, 680, 890, 1100, 1450, 1930],
        backgroundColor: '#2E7D32',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-slate-900">Environmental & Logistics Analytics</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Physical items matching logs, carbon reductions, and categories.</p>
          </div>

          <div className="flex gap-1 bg-white p-1 rounded-xl border border-border shadow-premium-sm">
            {['1M', '6M', '1Y'].map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeframe === t ? 'bg-primary text-white font-bold' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Stats metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-border rounded-2xl shadow-premium-sm p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Total Items Routed</span>
              <p className="text-3xl font-display font-extrabold text-primary">14,204</p>
              <span className="text-[9px] text-slate-500 block font-medium">+24% growth since last month</span>
            </div>
            <BarChart2 className="w-8 h-8 text-primary opacity-20" />
          </div>

          <div className="bg-white border border-border rounded-2xl shadow-premium-sm p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Carbon Savings</span>
              <p className="text-3xl font-display font-extrabold text-[#4CAF50]">1,420 kg</p>
              <span className="text-[9px] text-slate-500 block font-medium">CO2 emissions diverted from waste</span>
            </div>
            <Leaf className="w-8 h-8 text-[#4CAF50] opacity-20" />
          </div>

          <div className="bg-white border border-border rounded-2xl shadow-premium-sm p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Verified NGO Hubs</span>
              <p className="text-3xl font-display font-extrabold text-slate-900">340 Hubs</p>
              <span className="text-[9px] text-slate-500 block font-medium">Audit safety scores above 94%</span>
            </div>
            <ShieldCheck className="w-8 h-8 text-primary opacity-20" />
          </div>
        </div>

        {/* Charts area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white border border-border rounded-2xl shadow-premium-sm p-6 flex flex-col justify-between h-80">
            <div className="mb-2">
              <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">Environmental CO2 Savings Log (kg)</h3>
              <p className="text-[10px] text-slate-500">Accumulated carbon footprint diverted via direct courier logistics channels.</p>
            </div>
            <div className="flex-1 min-h-0 pt-4">
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl shadow-premium-sm p-6 flex flex-col justify-between h-80">
            <div className="mb-2">
              <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">Material Categories (Share %)</h3>
              <p className="text-[10px] text-slate-500">Distribution of items delivered by category.</p>
            </div>
            <div className="flex-1 min-h-0 pt-4">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="lg:col-span-3 bg-white border border-border rounded-2xl shadow-premium-sm p-6 flex flex-col justify-between h-80">
            <div className="mb-2">
              <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">Monthly Logistical Donation Volume</h3>
              <p className="text-[10px] text-slate-500">Physical resources transferred and ledger confirmed monthly.</p>
            </div>
            <div className="flex-1 min-h-0 pt-4">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>

        {/* Anti-Fraud Audit Note */}
        <div className="text-[11px] text-slate-600 flex items-start gap-3 bg-[#F1F8F5] border border-emerald-100 p-4 rounded-xl">
          <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-primary">Anti-Fraud & Environmental Audit Process</p>
            <p className="leading-relaxed">
              Donate Bridge carbon saving metrics are calculated by multiplying physical packaging weights by shipping distance, subtracting the standard waste processing footprint, and verified via spatial auditing protocols. Transaction records are strictly non-monetary.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
