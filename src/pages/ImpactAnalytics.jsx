import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, Leaf, ShieldCheck, Heart, ArrowLeft,
  Calendar, Check, Filter, TrendingUp, HelpCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import Navbar from '../components/Navbar';

// Import and Register ChartJS
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
          '#2563EB', // Blue primary
          '#3B82F6', // Blue medium
          '#60A5FA', // Blue light
          '#F59E0B', // Warning/Amber
          '#E5E7EB', // Slate gray/Border
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
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
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
        backgroundColor: '#2563EB',
      },
    ],
  };

  return (
    <div className="db-page min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Shared Main Navbar */}
      <Navbar />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-6">
        {/* Header introduction */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-fadeInUp">
          <div>
            <h1 className="font-sans font-bold text-2xl tracking-tight text-slate-900">Environmental & Logistical Ledger</h1>
            <p className="text-xs text-slate-500">Physical items matching coordinates tracking, carbon reductions, and categories.</p>
          </div>

          <div className="flex gap-1 bg-white p-1 rounded-md border border-slate-200 shadow-premium-sm">
            {['1M', '6M', '1Y'].map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 text-[11px] font-bold rounded-md font-mono transition-all cursor-pointer ${
                  timeframe === t ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic ledger metrics badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp stagger-1">
          <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Total Items Routed</span>
              <p className="text-3xl font-bold font-mono text-blue-600">14,204</p>
              <span className="text-[9px] text-slate-500 block font-medium">+24% growth since last month</span>
            </div>
            <BarChart2 className="w-8 h-8 text-blue-600 opacity-40" />
          </div>

          <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Carbon Savings</span>
              <p className="text-3xl font-bold font-mono text-emerald-600">1,420 kg</p>
              <span className="text-[9px] text-slate-500 block font-medium">CO2 emissions diverted from waste</span>
            </div>
            <Leaf className="w-8 h-8 text-emerald-600 opacity-40" />
          </div>

          <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Verified NGO Hubs</span>
              <p className="text-3xl font-bold font-mono text-slate-900">340 Hubs</p>
              <span className="text-[9px] text-slate-500 block font-medium">Audit safety scores above 94%</span>
            </div>
            <ShieldCheck className="w-8 h-8 text-blue-600 opacity-40" />
          </div>
        </div>

        {/* Dense charts area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeInUp stagger-2">
          {/* Carbon savings curve */}
          <div className="lg:col-span-2 db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6 flex flex-col justify-between h-80">
            <div className="mb-2">
              <h3 className="font-sans font-bold text-sm text-slate-900">Environmental CO2 Savings Log (kg)</h3>
              <p className="text-[10px] text-slate-500">Accumulated carbon footprint diverted via direct courier logistics channels.</p>
            </div>
            <div className="flex-1 min-h-0 pt-4">
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>

          {/* Categorical share pie */}
          <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6 flex flex-col justify-between h-80">
            <div className="mb-2">
              <h3 className="font-sans font-bold text-sm text-slate-900">Material Categories (Share %)</h3>
              <p className="text-[10px] text-slate-500">Distribution of items delivered by category.</p>
            </div>
            <div className="flex-1 min-h-0 pt-4">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Monthly logistics volume bar */}
          <div className="lg:col-span-3 db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6 flex flex-col justify-between h-80">
            <div className="mb-2">
              <h3 className="font-sans font-bold text-sm text-slate-900">Monthly Logistical Donation Volume</h3>
              <p className="text-[10px] text-slate-500">Physical resources transferred and ledger confirmed monthly.</p>
            </div>
            <div className="flex-1 min-h-0 pt-4">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>

        {/* Environmental Audit Statement */}
        <div className="text-[11px] text-slate-600 flex items-start gap-3 bg-blue-50 p-4 border border-blue-200 rounded-lg animate-fadeInUp stagger-3">
          <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-blue-900">Anti-Fraud & Environmental Audit Process</p>
            <p className="leading-relaxed">
              Donate Bridge carbon saving metrics are calculated by multiplying physical packaging weights by shipping distance, subtracting the standard waste processing footprint, and verified via spatial auditing protocols. Transaction records are strictly non-monetary.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
