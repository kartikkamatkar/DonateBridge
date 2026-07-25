import React from 'react';
import { 
  Search, Building, Navigation, Award, RotateCcw, X, Filter, SlidersHorizontal,
  LayoutGrid, Map as MapIcon, Columns, ArrowUpDown
} from 'lucide-react';

const CATEGORIES = [
  'All', 'Books', 'Clothes', 'Food', 'Furniture', 
  'Electronics', 'Medical Equipment', 'School Supplies', 'Blankets', 'Sports Equipment'
];

export default function FilterBar({
  searchType,
  onSearchTypeChange,
  query,
  onQueryChange,
  selectedCategory,
  onCategoryChange,
  distanceRange,
  onDistanceChange,
  minTrustScore,
  onMinTrustScoreChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  activeFiltersCount
}) {
  return (
    <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[2.5rem] p-6 lg:p-8 shadow-2xl shadow-slate-200/60 space-y-6">
      
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F3EC] text-[#4A7C59] border border-[#4A7C59]/20 font-bold text-[10px] uppercase tracking-widest shadow-xs">
            Global Match Radar
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-stone-900 tracking-tight mt-2">
            Resource Directory
          </h1>
          <p className="text-stone-500 mt-1 text-sm font-medium">
            Scan local dispatches, verify verified partner NGOs, and route logistics instantly.
          </p>
        </div>

        {/* View Mode Controls & Radar Mode Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Donations vs NGOs mode tab */}
          <div className="flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200 shadow-inner">
            <button
              onClick={() => onSearchTypeChange('donations')}
              className={`py-2.5 px-5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                searchType === 'donations' ? 'bg-white text-stone-900 shadow-md' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Search className={`w-3.5 h-3.5 ${searchType === 'donations' ? 'text-[#4A7C59]' : ''}`} /> Scan Donations
            </button>
            <button
              onClick={() => onSearchTypeChange('ngos')}
              className={`py-2.5 px-5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                searchType === 'ngos' ? 'bg-white text-stone-900 shadow-md' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Building className={`w-3.5 h-3.5 ${searchType === 'ngos' ? 'text-[#4A7C59]' : ''}`} /> Partner NGOs
            </button>
          </div>

          {/* Desktop Layout Split View Toggle */}
          <div className="hidden sm:flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
            <button
              title="Split View"
              onClick={() => onViewModeChange('split')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'split' ? 'bg-white text-[#4A7C59] shadow-md' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              title="Grid Focus"
              onClick={() => onViewModeChange('grid')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#4A7C59] shadow-md' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              title="Map Focus"
              onClick={() => onViewModeChange('map')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map' ? 'bg-white text-[#4A7C59] shadow-md' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Filter Controls Grid */}
      <div className="flex flex-col xl:flex-row gap-4 pt-4 border-t border-stone-200/80">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchType === 'donations' ? "Search items (e.g. Blankets, Books, Food)..." : "Search NGO names or location..."}
            className="w-full pl-12 pr-10 h-[52px] border border-stone-300 rounded-2xl bg-stone-50 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59] shadow-xs font-medium text-sm transition-all"
          />
          <Search className="w-5 h-5 text-[#4A7C59] absolute left-4 top-1/2 -translate-y-1/2" />
          {query && (
            <button
              onClick={() => onQueryChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Distance Slider */}
        <div className="flex items-center gap-3 bg-stone-50 border border-stone-300 rounded-2xl px-4 h-[52px] shrink-0 shadow-xs">
          <Navigation className="w-4 h-4 text-[#4A7C59] shrink-0" />
          <div className="flex flex-col justify-center min-w-[130px]">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Radius Distance</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="2"
                max="50"
                value={distanceRange}
                onChange={(e) => onDistanceChange(Number(e.target.value))}
                className="w-20 accent-[#4A7C59] cursor-pointer"
              />
              <span className="font-mono font-bold text-stone-900 text-xs">{distanceRange} km</span>
            </div>
          </div>
        </div>

        {/* Trust Score Slider (For NGOs) */}
        {searchType === 'ngos' && (
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-300 rounded-2xl px-4 h-[52px] shrink-0 shadow-xs">
            <Award className="w-4 h-4 text-[#4A7C59] shrink-0" />
            <div className="flex flex-col justify-center min-w-[130px]">
              <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Min Trust Score</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minTrustScore}
                  onChange={(e) => onMinTrustScoreChange(Number(e.target.value))}
                  className="w-20 accent-[#4A7C59] cursor-pointer"
                />
                <span className="font-mono font-bold text-stone-900 text-xs">{minTrustScore}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-300 rounded-2xl px-4 h-[52px] shrink-0 shadow-xs">
          <ArrowUpDown className="w-4 h-4 text-[#4A7C59] shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-xs text-stone-800 cursor-pointer focus:ring-0 !py-0 !px-1"
          >
            <option value="distance">Sort by Distance</option>
            <option value="match">Sort by Match Score</option>
            <option value="date">Sort by Recent</option>
            <option value="qty">Sort by Quantity</option>
          </select>
        </div>

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <button
            onClick={onResetFilters}
            className="h-[52px] px-5 bg-stone-900 text-white font-bold text-xs rounded-2xl flex items-center gap-2 hover:bg-stone-800 shadow-md shrink-0 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Category Pills Carousel (Donations) */}
      {searchType === 'donations' && (
        <div className="flex overflow-x-auto gap-2.5 pb-1 hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`py-2 px-4 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#4A7C59] text-white border-[#4A7C59] shadow-md shadow-[#4A7C59]/20'
                  : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200/80 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
