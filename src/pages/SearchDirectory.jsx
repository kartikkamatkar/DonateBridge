import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, ShieldCheck, Star, Filter, Heart, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MockMap } from '../components/ui/MockMap';

export default function SearchDirectory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';

  // Faceted Filter States
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory ? [initialCategory] : []
  );
  const [radius, setRadius] = useState(15); // in miles
  const [minTrust, setMinTrust] = useState(90); // minimum trust rating %

  // Map state
  const [selectedNgoId, setSelectedNgoId] = useState(1);

  const categories = [
    'Books', 'Clothes', 'Food', 'Toys', 'School Supplies',
    'Blankets', 'Furniture', 'Medical Equipment', 'Electronics', 'Daily Essentials'
  ];

  // Dummy list of NGOs
  const ngos = [
    {
      id: 1,
      name: 'Hope Foundation',
      distance: '1.4 miles',
      categories: ['Blankets', 'Clothes', 'Food'],
      trust: 98,
      address: '220 Sector 4 East, City Center',
      urgency: 'Critical Need',
      description: 'Fulfilling daily clothing and blanket packages for local shelters.',
    },
    {
      id: 2,
      name: 'Red Cross Depot',
      distance: '3.8 miles',
      categories: ['Medical Equipment', 'Food', 'Daily Essentials'],
      trust: 95,
      address: '104 Boulevard West, Suburb Center',
      urgency: 'High Need',
      description: 'Medical and first-aid supplies storage for regional community assistance.',
    },
    {
      id: 3,
      name: 'Green Life NGO',
      distance: '6.2 miles',
      categories: ['Books', 'School Supplies', 'Furniture'],
      trust: 91,
      address: '89 Oakwood Circle, Southside',
      urgency: 'Medium Need',
      description: 'Recycling educational materials and providing furnishings to underprivileged children.',
    },
    {
      id: 4,
      name: 'Youth Rescue Shelter',
      distance: '12.4 miles',
      categories: ['Toys', 'Daily Essentials', 'Clothes'],
      trust: 89,
      address: '12 Pioneer Avenue, North Sector',
      urgency: 'Low Need',
      description: 'Assisting adolescent orphans with food, toys, and winter garments.',
    },
  ];

  const handleCategoryToggle = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Filter local NGO lists
  const filteredNgos = ngos.filter((ngo) => {
    const matchesSearch = ngo.name.toLowerCase().includes(query.toLowerCase()) ||
                          ngo.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 ||
                            ngo.categories.some(c => selectedCategories.includes(c));
    const distNum = parseFloat(ngo.distance);
    const matchesRadius = distNum <= radius;
    const matchesTrust = ngo.trust >= minTrust;

    return matchesSearch && matchesCategory && matchesRadius && matchesTrust;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top sticky header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <div>
            <span className="font-bold text-base block">NGO Need Directory</span>
            <span className="text-[9px] text-slate-500 block -mt-1">Spatial Matching Coordinates</span>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Home</Button>
      </header>

      {/* Main split grid */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Left Panel: Deep controls + matching cards (scrollable) */}
        <aside className="w-full lg:w-[480px] bg-white dark:bg-slate-850 border-r border-slate-200 dark:border-slate-800 flex flex-col min-h-0 overflow-y-auto">
          
          {/* Filters Form Container */}
          <div className="p-6 border-b border-slate-150 dark:border-slate-800 space-y-5 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search NGO title, mission, or necessity..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Radius Distance slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-350">Search Radius Distance</span>
                <span className="text-primary font-mono">{radius} miles</span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="1"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full accent-primary bg-slate-200 dark:bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Min Trust Rating slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-350">Minimum NGO Trust Rating</span>
                <span className="text-emerald-500 font-mono">{minTrust}% +</span>
              </div>
              <input
                type="range"
                min="80"
                max="98"
                step="1"
                value={minTrust}
                onChange={(e) => setMinTrust(parseInt(e.target.value))}
                className="w-full accent-primary bg-slate-200 dark:bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Category Checks Grid */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 block">Necessity Category Selectors</span>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryToggle(cat)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded border text-left flex justify-between items-center transition-all ${
                        isChecked
                          ? 'border-primary bg-emerald-50/50 dark:bg-emerald-950/20 text-primary dark:text-emerald-450'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                      {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search Result Cards List */}
          <div className="flex-1 p-6 space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
              <span>FOUND {filteredNgos.length} MATCHING AGENCIES</span>
              <button
                onClick={() => { setSelectedCategories([]); setRadius(25); setMinTrust(80); setQuery(''); }}
                className="text-primary hover:underline"
              >
                Reset Filters
              </button>
            </div>

            {filteredNgos.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No NGOs match these filter parameters. Try expanding your search radius.
              </div>
            ) : (
              filteredNgos.map((ngo) => (
                <Card
                  key={ngo.id}
                  isHoverable
                  onClick={() => setSelectedNgoId(ngo.id)}
                  className={`p-4 border transition-all ${
                    selectedNgoId === ngo.id
                      ? 'border-primary ring-1 ring-primary/45 bg-emerald-50/10 dark:bg-slate-800'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ngo.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-300">
                          {ngo.trust}% Trust
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ngo.address} ({ngo.distance})
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-bold text-[8px] ${
                      ngo.urgency === 'Critical Need' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                      ngo.urgency === 'High Need' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {ngo.urgency}
                    </span>
                  </div>

                  <p className="text-xs text-slate-650 dark:text-slate-400 mt-2 line-clamp-2">
                    {ngo.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {ngo.categories.map((c) => (
                      <span key={c} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-500 dark:text-slate-400">
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/ngo/${ngo.id}`); }} className="text-[10px] py-1">
                      Public Portfolio
                    </Button>
                    <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/request-wizard?ngo=${ngo.id}`); }} className="text-[10px] py-1" icon={ArrowRight}>
                      Donate Direct
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </aside>

        {/* Right Panel: Map plot taking full viewport (stretchable) */}
        <main className="flex-1 min-h-[300px] lg:min-h-0 relative">
          <MockMap highlightedNgoId={selectedNgoId} activeStep={3} className="w-full h-full border-none rounded-none" />
        </main>

      </div>
    </div>
  );
}
