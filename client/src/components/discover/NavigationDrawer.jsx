import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Car, Footprints, Bike, X, ChevronDown, ChevronUp, MapPin, Sparkles, CheckCircle2, CornerUpRight, ArrowUpRight } from 'lucide-react';
import { calculateCarbonSaved } from '../../utils/routing';

export default function NavigationDrawer({
  selectedItem,
  routeData,
  travelProfile,
  onTravelProfileChange,
  onClearRoute,
  isRoutingLoading
}) {
  const [isStepsOpen, setIsStepsOpen] = useState(false);

  if (!selectedItem) return null;

  const title = selectedItem.title || selectedItem.name || selectedItem.category || 'Target Destination';
  const address = selectedItem.location?.address || selectedItem.address || 'Address provided';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-500 max-w-md w-full px-4 sm:px-0"
      >
        <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-5 text-white shadow-2xl shadow-slate-950/50 space-y-4">
          
          {/* Top Header & Destination Name */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                <Navigation className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  Active Dispatch Route
                </span>
                <h4 className="font-bold text-sm text-white truncate">{title}</h4>
                <p className="text-xs text-slate-400 truncate">{address}</p>
              </div>
            </div>

            <button
              onClick={onClearRoute}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              title="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Travel Mode Toggle & Route Stats */}
          {isRoutingLoading ? (
            <div className="py-6 flex items-center justify-center gap-3 text-xs text-emerald-400 font-medium">
              <span className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              Calculating optimal navigation route...
            </div>
          ) : routeData ? (
            <div className="space-y-4">
              
              {/* Travel Mode Selector */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
                <button
                  onClick={() => onTravelProfileChange('driving')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    travelProfile === 'driving' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" /> Drive
                </button>
                <button
                  onClick={() => onTravelProfileChange('walking')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    travelProfile === 'walking' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" /> Walk
                </button>
                <button
                  onClick={() => onTravelProfileChange('bicycling')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    travelProfile === 'bicycling' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" /> Cycle
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 text-center bg-slate-800/40 p-3 rounded-2xl border border-slate-700/40">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Distance</span>
                  <span className="text-base font-bold text-white font-mono">{routeData.distanceKm} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Est. Time</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">{routeData.durationMins} mins</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Carbon Offset</span>
                  <span className="text-base font-bold text-teal-300 font-mono">
                    {calculateCarbonSaved(routeData.distanceKm, selectedItem.category)} kg CO₂
                  </span>
                </div>
              </div>

              {/* Turn-by-Turn Steps Toggle */}
              {routeData.steps && routeData.steps.length > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={() => setIsStepsOpen(!isStepsOpen)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white py-1 px-2 rounded-lg hover:bg-slate-800/60 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <CornerUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      Turn-by-Turn Steps ({routeData.steps.length})
                    </span>
                    {isStepsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isStepsOpen && (
                    <div className="max-h-48 overflow-y-auto pr-1 space-y-2 text-xs font-mono hide-scrollbar border-t border-slate-800 pt-2">
                      {routeData.steps.map((step, idx) => (
                        <div key={step.id || idx} className="flex items-start gap-2 text-slate-300 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{step.instruction}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
