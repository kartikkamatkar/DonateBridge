import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Truck, RefreshCw } from 'lucide-react';

export const MockMap = ({
  routes = [],
  highlightedNgoId = null,
  activeStep = 2, // 1: Requested, 2: Dispatched, 3: In Transit, 4: Delivered
  interactive = true,
  className = '',
}) => {
  const [courierPos, setCourierPos] = useState({ x: 250, y: 180 });
  const [pulse, setPulse] = useState(true);

  // Sample locations
  const locations = {
    donor: { x: 100, y: 150, name: 'Donor Location (Sarah Jenkins)', type: 'donor' },
    ngo1: { id: 1, x: 400, y: 100, name: 'Hope Foundation (Critical Need)', type: 'ngo', urgency: 'Critical' },
    ngo2: { id: 2, x: 320, y: 280, name: 'Red Cross Depot (High Need)', type: 'ngo', urgency: 'High' },
    ngo3: { id: 3, x: 180, y: 320, name: 'Green Life NGO (Medium Need)', type: 'ngo', urgency: 'Medium' },
  };

  // Animate courier along route from Donor (100, 150) to NGO (based on step/target)
  useEffect(() => {
    let target = locations.ngo1; // default to Hope Foundation
    if (highlightedNgoId === 2) target = locations.ngo2;
    if (highlightedNgoId === 3) target = locations.ngo3;

    let start = locations.donor;
    
    // Simulate motion based on activeStep
    if (activeStep <= 1) {
      setCourierPos({ x: start.x, y: start.y });
    } else if (activeStep === 2) {
      // Dispatched: halfway to donor, or at donor
      setCourierPos({ x: start.x - 20, y: start.y + 10 });
    } else if (activeStep === 3) {
      // In Transit: between donor and ngo
      const dx = target.x - start.x;
      const dy = target.y - start.y;
      setCourierPos({ x: start.x + dx * 0.6, y: start.y + dy * 0.6 });
    } else {
      // Delivered: at NGO
      setCourierPos({ x: target.x, y: target.y });
    }

    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeStep, highlightedNgoId]);

  return (
    <div className={`relative bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex flex-col ${className}`}>
      {/* Header Info Panel */}
      <div className="absolute top-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded px-3 py-2 flex items-center justify-between text-xs z-10 text-slate-800 shadow-premium-sm">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-600 animate-pulse" />
          <div>
            <p className="font-bold text-blue-600">Live Logistics Stream</p>
            <p className="text-slate-500 text-[10px] font-medium">
              {activeStep === 1 && 'Awaiting courier dispatch'}
              {activeStep === 2 && 'Courier dispatched to donor'}
              {activeStep === 3 && 'In transit to NGO Hub'}
              {activeStep === 4 && 'Ledger verified at NGO Hub'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-bold">EST. ARRIVAL</span>
            <span className="font-mono font-bold text-blue-600">
              {activeStep === 3 ? '14 mins' : activeStep === 2 ? '4 mins' : activeStep === 4 ? 'Arrived' : '--'}
            </span>
          </div>
          <RefreshCw className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors" />
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="flex-1 w-full relative min-h-[300px] bg-slate-100/50">
        <svg viewBox="0 0 500 400" className="w-full h-full">
          {/* Defs for grid and gradients */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
            </pattern>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid Layout */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Simulated Roads/Highways */}
          <g stroke="rgba(148, 163, 184, 0.25)" strokeWidth="4" strokeLinecap="round" fill="none">
            {/* Horizontal Road */}
            <line x1="20" y1="150" x2="480" y2="150" />
            {/* Vertical Road */}
            <line x1="250" y1="20" x2="250" y2="380" />
            {/* Diagonal Routes */}
            <path d="M 100 150 L 400 100" />
            <path d="M 100 150 L 320 280" stroke="rgba(37, 99, 235, 0.3)" strokeWidth="3" />
            <path d="M 100 150 L 180 320" />
          </g>

          {/* Route path glow for transit */}
          {activeStep === 3 && (
            <path
              d={`M 100 150 L ${highlightedNgoId === 2 ? '320 280' : highlightedNgoId === 3 ? '180 320' : '400 100'}`}
              stroke="#2563eb"
              strokeWidth="3"
              strokeDasharray="6 4"
              className="animate-[shimmer_2s_infinite_linear]"
              fill="none"
            />
          )}

          {/* Locations & Markers */}
          {/* Donor Pin */}
          <circle cx="100" cy="150" r="15" fill="rgba(37, 99, 235, 0.15)" />
          <circle cx="100" cy="150" r="5" fill="#2563eb" />
          <text x="100" y="130" fill="#2563eb" fontSize="10" textAnchor="middle" fontWeight="bold">Donor</text>

          {/* NGO Pins */}
          {Object.values(locations).filter(l => l.type === 'ngo').map((ngo) => {
            const isHighlighted = highlightedNgoId === ngo.id || (!highlightedNgoId && ngo.id === 1);
            return (
              <g key={ngo.id} className="cursor-pointer">
                {isHighlighted && (
                  <circle cx={ngo.x} cy={ngo.y} r={pulse ? 18 : 22} fill="url(#glow)" className="transition-all duration-500" />
                )}
                <circle cx={ngo.x} cy={ngo.y} r="14" fill={isHighlighted ? '#3b82f6' : '#cbd5e1'} />
                <path
                  d="M 12,2 A 8,8 0 0,0 4,10 c 0,6 8,12 8,12 0,0 8,-6 8,-12 A 8,8 0 0,0 12,2 Z"
                  fill={isHighlighted ? '#2563eb' : '#64748b'}
                  transform={`translate(${ngo.x - 12}, ${ngo.y - 15}) scale(1)`}
                />
                <circle cx={ngo.x} cy={ngo.y} r="3" fill="#ffffff" />
                <text x={ngo.x} y={ngo.y - 20} fill={isHighlighted ? '#1e3a8a' : '#64748b'} fontSize="9" textAnchor="middle" fontWeight="bold">
                  NGO {ngo.id} ({ngo.urgency})
                </text>
              </g>
            );
          })}

          {/* Courier Position Marker */}
          {(activeStep === 2 || activeStep === 3) && (
            <g transform={`translate(${courierPos.x - 10}, ${courierPos.y - 10})`}>
              <circle cx="10" cy="10" r="8" fill="#d97706" className="animate-ping opacity-75" />
              <rect x="2" y="2" width="16" height="16" rx="4" fill="#d97706" />
              <path
                d="M 4 8 L 8 4 L 12 8 M 8 4 L 8 14"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="rotate(90 10 10)"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Footer Details */}
      <div className="bg-white border-t border-slate-200 p-3 flex justify-between items-center text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          <div>
            <span className="text-slate-400 block text-[9px] font-bold">ACTIVE COURIER</span>
            <span className="font-bold text-slate-800">Express Cargo #DB-990</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block text-[9px] font-bold">LOGISTICS HUB</span>
          <span className="font-bold text-slate-800">District Center 4B</span>
        </div>
      </div>
    </div>
  );
};
