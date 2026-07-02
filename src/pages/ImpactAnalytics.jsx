import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, Leaf, ShieldCheck, Heart, ArrowLeft,
  Calendar, Check, Filter, TrendingUp, HelpCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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
          '#2E7D32', // primary accent
          '#43A047', // forest green
          '#81C784', // light emerald
          '#3b82f6', // blue
          '#eab308', // yellow
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
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
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
        backgroundColor: '#43A047',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Sticky header */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0 z-10">
        <button onClick={() => navigate('/')} className="hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <span className="font-bold text-sm uppercase text-slate-550 dark:text-slate-350">Platform Impact Dashboard</span>
      </nav>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6 overflow-y-auto">
        
        {/* Intro Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Environmental & Logistical Transparency</h1>
            <p className="text-xs text-slate-500">Live physical item tracking logs, carbon offsets, and categorical distributions.</p>
          </div>

          <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded">
            {['1M', '6M', '1Y'].map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 text-xs font-bold rounded ${timeframe === t ? 'bg-primary text-white' : 'hover:bg-slate-300 dark:hover:bg-slate-700'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Global Impact Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-550 uppercase">Total Items Routed</span>
              <p className="text-2xl font-black text-primary">14,204</p>
              <span className="text-[9px] text-slate-450 block">+24% growth since last month</span>
            </div>
            <BarChart2 className="w-8 h-8 text-primary opacity-60" />
          </Card>

          <Card className="p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-555 uppercase">Carbon Footprint Saved</span>
              <p className="text-2xl font-black text-emerald-555">1,420 kg CO2</p>
              <span className="text-[9px] text-slate-450 block">Diverted from waste burn lines</span>
            </div>
            <Leaf className="w-8 h-8 text-emerald-500 opacity-60" />
          </Card>

          <Card className="p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-550 uppercase">Verified NGO Hubs</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">340 Organizations</p>
              <span className="text-[9px] text-slate-450 block">Audit score rating &gt; 94%</span>
            </div>
            <ShieldCheck className="w-8 h-8 text-indigo-500 opacity-60" />
          </Card>
        </div>

        {/* Data Dense Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Carbon line chart */}
          <Card className="lg:col-span-2 p-5 border border-slate-200 dark:border-slate-750 flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-bold text-sm">Environmental CO2 Savings (kg)</h3>
              <p className="text-[10px] text-slate-500">Accumulated carbon footprint diverted via direct courier logistics channels.</p>
            </div>
            <div className="h-64 flex items-center justify-center">
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </Card>

          {/* Categorical breakdown pie chart */}
          <Card className="p-5 border border-slate-200 dark:border-slate-750 flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-bold text-sm">Material Categories (Share %)</h3>
              <p className="text-[10px] text-slate-500">Distribution of items delivered by category.</p>
            </div>
            <div className="h-64 flex items-center justify-center">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </Card>

          {/* Monthly logistics volume bar chart */}
          <Card className="lg:col-span-3 p-5 border border-slate-200 dark:border-slate-750 flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-bold text-sm">Monthly Logistical Donation Volume</h3>
              <p className="text-[10px] text-slate-500">Physical resources transferred and ledger confirmed monthly.</p>
            </div>
            <div className="h-64 flex items-center justify-center">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </Card>
        </div>

        {/* Accountability Statement Alert */}
        <div className="text-[10px] text-slate-500 flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-200 dark:border-emerald-900 rounded">
          <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-250">Anti-Fraud & Environmental Audit Process</p>
            <p className="leading-relaxed mt-0.5">
              Donate Bridge carbon saving metrics are calculated by multiplying physical packaging weights by shipping distance, subtracting the standard waste processing footprint, and verified via spatial auditing protocols. Transaction records are strictly non-monetary.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
