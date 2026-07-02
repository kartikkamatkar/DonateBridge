import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useTheme } from '../context/GlobalStateContext';
import { Search, Heart, ArrowRight, ShieldCheck, Truck, BarChart2, Star, CheckCircle, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    'Books', 'Clothes', 'Food', 'Toys', 'School Supplies',
    'Blankets', 'Furniture', 'Medical Equipment', 'Electronics', 'Daily Essentials'
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${searchQuery}&category=${selectedCategory}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sticky Header Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-white font-bold text-lg">
              DB
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block">Donate Bridge</span>
              <span className="text-[10px] text-primary dark:text-emerald-400 font-semibold block -mt-1">PHYSICAL ITEM LOGISTICS</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/search" className="text-sm font-medium hover:text-primary transition-colors">Find NGOs</Link>
            <Link to="/impact" className="text-sm font-medium hover:text-primary transition-colors">Impact Analytics</Link>
            <Link to="/chat" className="text-sm font-medium hover:text-primary transition-colors">Direct Portal</Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Hi, <strong className="text-slate-800 dark:text-slate-200">{user.name}</strong> ({user.role})
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(user.role === 'admin' ? '/admin-dashboard' : user.role === 'ngo' ? '/ngo-dashboard' : '/donor-dashboard')}
                >
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Sign In</Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/auth?register=true')}>Register</Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Typography Column */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Strictly Non-Monetary Logistics Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Bridging Donors with NGOs, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
              One Donation at a Time.
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl">
            Donate physical essentials—books, clothes, medical equipment, and food directly to verified NGOs. We take care of logistics tracking, smart route optimization, and ledger accountability.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/auth?register=true')} icon={ArrowRight}>
              Start Donating Physical Items
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/search')}>
              Explore NGO Needs
            </Button>
          </div>
        </div>

        {/* Right Premium custom graphics */}
        <div className="relative flex justify-center items-center">
          <div className="w-full max-w-md h-96 relative bg-gradient-to-br from-emerald-100 to-indigo-100 dark:from-emerald-950/20 dark:to-slate-800 rounded-3xl overflow-hidden shadow-premium-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center p-6">
            {/* Custom SVG Graphics of Logistics and matching dots */}
            <svg viewBox="0 0 400 350" className="w-full h-full text-slate-400">
              {/* Map grid lines */}
              <circle cx="200" cy="175" r="140" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-10 dark:opacity-20" strokeDasharray="5 5" />
              <circle cx="200" cy="175" r="90" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-20" />
              <circle cx="200" cy="175" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-30" />
              
              {/* Connections */}
              <path d="M 60 90 Q 200 60 320 120" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="5 5" className="animate-pulse" />
              <path d="M 90 270 Q 200 300 310 220" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M 200 175 Q 320 120 310 220" fill="none" stroke="#22c55e" strokeWidth="3" />

              {/* Node - Donor */}
              <g transform="translate(60, 90)" className="animate-bounce" style={{ animationDuration: '4s' }}>
                <circle cx="0" cy="0" r="14" fill="#3b82f6" />
                <Heart className="w-4 h-4 text-white -translate-x-2 -translate-y-2" />
              </g>
              {/* Node - NGO */}
              <g transform="translate(310, 220)" className="animate-pulse">
                <circle cx="0" cy="0" r="18" fill="#22c55e" />
                <ShieldCheck className="w-5 h-5 text-white -translate-x-2.5 -translate-y-2.5" />
              </g>
              {/* Courier transit */}
              <g transform="translate(250, 150)" className="animate-pulse">
                <rect x="-12" y="-12" width="24" height="24" rx="6" fill="#eab308" />
                <Truck className="w-3.5 h-3.5 text-slate-950 -translate-x-1.5 -translate-y-1.5" />
              </g>
            </svg>
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-premium-md flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Latest Verified Match</p>
                <p className="text-xs font-bold">10 Winter Blankets → Hope Shelter</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                Dispatched
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Faceted Search Input Filter Row */}
      <section className="bg-white dark:bg-slate-850 border-y border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="text-left w-full md:w-auto">
              <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Faceted Search</h3>
              <p className="text-base font-semibold">Match items with urgent needs</p>
            </div>
            
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Search NGO name, needs, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none w-full sm:w-48"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <Button type="submit" variant="primary" className="w-full sm:w-auto">
                Search Directory
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Live Counter Panels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-premium-sm text-center">
          <p className="text-3xl font-extrabold text-primary">14,204</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold">Physical Items Delivered</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-premium-sm text-center">
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">340</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold">Verified Active NGOs</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-premium-sm text-center">
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-450">2,930</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold">Active Donors Enrolled</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-5 rounded-lg border border-emerald-200 dark:border-emerald-900 text-center">
          <p className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-450">$0.00</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 uppercase font-semibold">Money Donated (Strictly Physical)</p>
        </div>
      </section>

      {/* 4-Step Onboarding Timeline */}
      <section className="bg-slate-100 dark:bg-slate-850/50 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">How Donate Bridge Works</h2>
            <p className="text-slate-500 mt-2">Connecting donors and NGOs in four structured operational phases.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mx-auto shadow-premium-md">1</div>
              <h3 className="font-bold text-base">Select Profile</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Register as either an individual/corporate Donor or a verified NGO organization.</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mx-auto shadow-premium-md">2</div>
              <h3 className="font-bold text-base">List Item Request</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">NGOs log active necessity lists; donors publish item descriptions, weight, and photos.</p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mx-auto shadow-premium-md">3</div>
              <h3 className="font-bold text-base">Smart Match</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Our routing engine evaluates proximity, need urgency, and trust history for immediate matches.</p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mx-auto shadow-premium-md">4</div>
              <h3 className="font-bold text-base">Logistics & Ledger</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Courier dispatches, real-time GPS paths update, and delivery is sealed via digital signature ledger.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Smart Matching Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-emerald-800 to-primary text-white rounded-2xl p-8 md:p-12 shadow-premium-lg flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="px-2.5 py-1 rounded bg-emerald-700/60 border border-emerald-600 text-xs font-bold uppercase tracking-wider">Teaser Simulation</span>
            <h3 className="text-2xl md:text-3xl font-bold">Simulate a Matching Node Right Now</h3>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Wondering where your items will go? Input a category and watch how our spatial database matching parameters weight proximity score, NGO trust factors, and urgency scale in real time.
            </p>
            <div className="flex gap-2">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-900/30 text-emerald-200">No Sign Up Required for Preview</span>
            </div>
          </div>
          <div>
            <Button variant="secondary" size="lg" onClick={() => navigate('/smart-match')} className="bg-white text-primary hover:bg-slate-100 shadow-premium-md">
              Launch Smart Match Teaser
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">What Our Partners Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-premium-sm space-y-4">
              <div className="flex text-amber-500 gap-0.5"><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /></div>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">"Donate Bridge completely resolved our logistics bottlenecks. Instead of having to drive to hand over supplies, their automated courier systems collect items from our corporate warehouse."</p>
              <div>
                <p className="text-xs font-bold">Robert Chen</p>
                <p className="text-[10px] text-slate-500">Corporate Donor Coordinator, TechCorp</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-premium-sm space-y-4">
              <div className="flex text-amber-500 gap-0.5"><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /></div>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">"Our shelter was in critical need of blankets before the cold wave. Within 3 hours of posting, a donor matched, and the delivery arrived directly through the system. Absolute life-saver."</p>
              <div>
                <p className="text-xs font-bold">Dr. Maria Mendez</p>
                <p className="text-[10px] text-slate-500">Executive Director, Hope Shelter</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-premium-sm space-y-4">
              <div className="flex text-amber-500 gap-0.5"><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /></div>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">"As an auditor, the transparency ledger on this platform is incredibly detailed. Every package has weight verification, courier milestones, and NGO receipt confirmation. Zero leakages."</p>
              <div>
                <p className="text-xs font-bold">Leticia Sterling</p>
                <p className="text-[10px] text-slate-500">Logistics Audit Director, TrustScale</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explicit Legal Disclosure Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <span className="font-bold text-white text-sm">Donate Bridge</span>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Donate Bridge is a registered 501(c)(3) logistical network coordinating physical item fulfillment between donors and non-governmental institutions.
            </p>
            <p className="text-[10px] text-emerald-400 font-semibold uppercase">
              Physical Logistics Network Only.
            </p>
          </div>
          <div>
            <span className="font-bold text-white text-sm block mb-3">Categories</span>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/search?category=Books" className="hover:text-white transition-colors">Books & Supplies</Link></li>
              <li><Link to="/search?category=Clothes" className="hover:text-white transition-colors">Clothes & Blankets</Link></li>
              <li><Link to="/search?category=Medical%20Equipment" className="hover:text-white transition-colors">Medical Equipment</Link></li>
              <li><Link to="/search?category=Electronics" className="hover:text-white transition-colors">Electronics & PCs</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-bold text-white text-sm block mb-3">Operations</span>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/impact" className="hover:text-white transition-colors">Transparency Ledger</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">NGO Registry</Link></li>
              <li><Link to="/tracking/101" className="hover:text-white transition-colors">Courier Dispatch Tracks</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-bold text-white text-sm block mb-3">Strict Disclosures</span>
            <p className="text-[10px] leading-relaxed text-slate-500">
              This platform does NOT collect, solicit, process, or route cash donations, transaction processing fees, or monetary credit. All interactions are strictly for logistics coordinates and verified shipping of hardware, materials, and essentials.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} Donate Bridge Inc. All rights reserved.</span>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#terms" className="hover:underline">Terms of Service</a>
            <a href="#privacy" className="hover:underline">Privacy Policy</a>
            <a href="#disclosures" className="hover:underline">Anti-Fraud Compliance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
