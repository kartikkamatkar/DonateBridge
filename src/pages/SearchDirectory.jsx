import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, Filter, Heart, ArrowRight,
  TrendingUp, Award, ShieldCheck, Compass, Info
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import Navbar from '../components/Navbar';

export default function SearchDirectory() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxRadius, setMaxRadius] = useState(15);
  const [minTrustScore, setMinTrustScore] = useState(80);

  // Seed NGO data simulated by Spring Boot back-end
  const [ngos] = useState([
    {
      id: 1,
      name: 'Hope Foundation',
      motto: 'Emergency shelter logistics and blankets distribution.',
      categories: ['Blankets', 'Clothes', 'Medical Equipment'],
      trustScore: 98,
      radius: 1.4, // miles
      activeDemands: 3,
    },
    {
      id: 2,
      name: 'Red Cross Depot',
      motto: 'First-aid, disaster response and basic medical tools supply.',
      categories: ['Medical Equipment', 'Daily Essentials', 'Food'],
      trustScore: 95,
      radius: 3.8, // miles
      activeDemands: 5,
    },
    {
      id: 3,
      name: 'Green Life NGO',
      motto: 'Recycling textbooks, notebooks and public classroom supplies.',
      categories: ['School Supplies', 'Books'],
      trustScore: 91,
      radius: 6.2, // miles
      activeDemands: 2,
    },
    {
      id: 4,
      name: 'St. Jude Orphanage',
      motto: 'Child welfare staples, clothes, warm sheets and educational materials.',
      categories: ['Toys', 'Clothes', 'Books'],
      trustScore: 88,
      radius: 9.5, // miles
      activeDemands: 4,
    },
  ]);

  const categories = ['All', 'Blankets', 'Clothes', 'Medical Equipment', 'Daily Essentials', 'School Supplies', 'Books', 'Toys', 'Food'];

  const filteredNgos = ngos.filter(ngo => {
    const matchesSearch = ngo.name.toLowerCase().includes(query.toLowerCase()) ||
                          ngo.motto.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ngo.categories.includes(selectedCategory);
    const matchesRadius = ngo.radius <= maxRadius;
    const matchesTrust = ngo.trustScore >= minTrustScore;
    return matchesSearch && matchesCategory && matchesRadius && matchesTrust;
  });

  return (
    <div className="db-page min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Shared Main Navbar */}
      <Navbar />

      {/* Main split dashboard content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-6">
        {/* Left Column: Filter Sidebar panel */}
        <aside className="w-full lg:w-80 space-y-6 shrink-0">
          <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6 animate-fadeInUp">
            <h3 className="font-sans font-bold text-base mb-4 flex items-center gap-2 text-slate-900">
              <Filter className="w-4 h-4 text-blue-600" /> Faceted Filters
            </h3>

            <div className="space-y-5 text-xs">
              {/* Category selector pills */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Category Segment
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] border transition-all cursor-pointer font-semibold ${
                        selectedCategory === cat
                          ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-blue-600 hover:text-blue-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius Custom Range slider */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between font-mono">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Radius Limit
                  </label>
                  <span className="text-blue-600 font-bold">{maxRadius} miles</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={maxRadius}
                  onChange={(e) => setMaxRadius(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Min Trust Rating slider */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between font-mono">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Min Trust Index
                  </label>
                  <span className="text-blue-600 font-bold">{minTrustScore}% Rating</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="98"
                  value={minTrustScore}
                  onChange={(e) => setMinTrustScore(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Center Main panel: Search & Results Directory */}
        <main className="flex-1 space-y-6">
          {/* Search inputs */}
          <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-4 animate-fadeInUp stagger-1 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search NGOs by name, medical demands, locations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-sm bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-900"
            />
          </div>

          {/* Results Area */}
          <div className="space-y-4">
            {filteredNgos.length === 0 ? (
              <div className="db-card bg-white border border-slate-200 rounded-lg p-16 text-center text-xs text-slate-400 animate-fadeInUp stagger-2">
                <Compass className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                No NGO centers match your selected filters. Try broadening the search radius.
              </div>
            ) : (
              filteredNgos.map((ngo, idx) => (
                <div
                  key={ngo.id}
                  className="db-card bg-white border border-slate-200 rounded-lg p-6 shadow-premium-sm hover:border-blue-600 transition-all duration-200 animate-fadeInUp flex flex-col md:flex-row justify-between items-start gap-4"
                  style={{ animationDelay: `${0.05 * (idx + 2)}s` }}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-sans font-bold text-[16px] text-slate-900">{ngo.name}</h4>
                      <span className="db-badge db-badge-success">
                        Trust rating: {ngo.trustScore}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{ngo.motto}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {ngo.categories.map(cat => (
                        <span key={cat} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end justify-between md:justify-center w-full md:w-auto shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 gap-3">
                    <div className="text-left md:text-right text-xs">
                      <p className="font-semibold text-blue-600 font-mono">{ngo.radius} miles away</p>
                      <p className="text-[10px] text-slate-400">{ngo.activeDemands} urgent necessities listed</p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/ngo/${ngo.id}`)}
                      icon={ArrowRight}
                    >
                      Audit Needs
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
