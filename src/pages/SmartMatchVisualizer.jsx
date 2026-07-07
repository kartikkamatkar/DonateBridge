import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, RefreshCw, MapPin, Star, AlertTriangle, ArrowRight,
  TrendingUp, Award, ShieldCheck, Heart, Info, Navigation
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MockMap } from '../components/ui/MockMap';
import Navbar from '../components/Navbar';

export default function SmartMatchVisualizer() {
  const navigate = useNavigate();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(1);
  const [mapStep, setMapStep] = useState(3);

  // Recommendations calculated simulator
  const [matches, setMatches] = useState([
    {
      id: 1,
      ngo: 'Hope Foundation',
      score: 97.4,
      proximity: 1.4,
      proximityScore: 98,
      urgency: 'Critical',
      urgencyScore: 99,
      trust: 98,
      trustScore: 96,
      item: 'Winter Blankets',
      eta: '14 mins',
    },
    {
      id: 2,
      ngo: 'Red Cross Depot',
      score: 86.8,
      proximity: 3.8,
      proximityScore: 88,
      urgency: 'High',
      urgencyScore: 84,
      trust: 95,
      trustScore: 90,
      item: 'First-Aid kits',
      eta: '25 mins',
    },
    {
      id: 3,
      ngo: 'Green Life NGO',
      score: 74.2,
      proximity: 6.2,
      proximityScore: 78,
      urgency: 'Medium',
      urgencyScore: 68,
      trust: 91,
      trustScore: 82,
      item: 'School notebooks',
      eta: '45 mins',
    },
  ]);

  const handleReoptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setMatches(prev =>
        prev.map(m => {
          const delta = (Math.random() - 0.5) * 4;
          const newScore = Math.min(100, Math.max(50, parseFloat((m.score + delta).toFixed(1))));
          return { ...m, score: newScore };
        }).sort((a, b) => b.score - a.score)
      );
    }, 1200);
  };

  const currentMatch = matches.find(m => m.id === selectedMatch) || matches[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Left Side: Rankings */}
        <aside className="w-full lg:w-[460px] bg-white border-r border-border flex flex-col min-h-0 overflow-y-auto p-6 space-y-6 shrink-0 shadow-premium-sm">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <h3 className="text-sm font-display font-bold text-slate-900">Computed NGO Match Rankings</h3>
              <p className="text-xs text-slate-500">Sorted by geolocation proximity and urgency ratings.</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              isLoading={isOptimizing}
              onClick={handleReoptimize}
              icon={RefreshCw}
            >
              Recalculate
            </Button>
          </div>

          <div className="space-y-4">
            {matches.map((match, idx) => (
              <div
                key={match.id}
                onClick={() => setSelectedMatch(match.id)}
                className={`border rounded-2xl p-5 shadow-premium-sm transition-all duration-200 cursor-pointer bg-white ${
                  selectedMatch === match.id
                    ? 'border-primary ring-2 ring-primary/5 bg-[#F1F8F5]/30'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-primary block">Rank #{idx + 1} Match Option</span>
                    <h4 className="font-display font-bold text-sm text-slate-950">{match.ngo}</h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {match.proximity} miles &bull; ETA {match.eta}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-primary block">{match.score}%</span>
                    <span className="text-[8px] text-slate-400 block -mt-1 font-bold uppercase font-mono">Affinity Score</span>
                  </div>
                </div>

                {/* Score weights */}
                <div className="space-y-2.5 mt-4 pt-3 border-t border-border">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-semibold">Proximity Index (40%):</span>
                    <span className="font-mono font-bold text-slate-900">{match.proximityScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${match.proximityScore}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-semibold">Need Urgency Index (35%):</span>
                    <span className="font-mono font-bold text-red-600">{match.urgencyScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${match.urgencyScore}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-semibold">Trust Integrity Index (25%):</span>
                    <span className="font-mono font-bold text-secondary">{match.trustScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full" style={{ width: `${match.trustScore}%` }} />
                  </div>
                </div>

                <div className="flex justify-end pt-3 mt-4 border-t border-border">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-[10px] py-1.5 font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/request-wizard?ngo=${match.id}&category=${match.item}`);
                    }}
                    icon={ArrowRight}
                  >
                    Select Match Route
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Side Map */}
        <main className="flex-1 relative min-h-[350px] lg:min-h-0 bg-slate-50">
          <MockMap highlightedNgoId={currentMatch.id} activeStep={mapStep} className="w-full h-full border-none rounded-none" />

          {/* Floating Detailed Overlay */}
          <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md border border-border p-5 rounded-2xl text-slate-900 max-w-md space-y-3.5 z-10 text-xs shadow-premium-lg">
            <div className="flex justify-between items-center font-bold">
              <span className="flex items-center gap-1.5 text-primary"><Navigation className="w-4 h-4 text-primary animate-pulse" /> Computed Optimization Route</span>
              <span className="font-mono text-primary bg-[#F1F8F5] px-2 py-0.5 rounded text-[10px]">ETA {currentMatch.eta}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Routing engine suggests dispatching to <strong className="text-slate-800">{currentMatch.ngo}</strong> due to critical demand for <strong className="text-slate-800">{currentMatch.item}</strong> and close coordinates mapping.
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-center pt-2 border-t border-border font-mono">
              <div>
                <span className="text-slate-400 block">TOTAL DISTANCE</span>
                <span className="font-bold text-slate-900">{currentMatch.proximity} miles</span>
              </div>
              <div>
                <span className="text-slate-400 block">FUEL EQUIVALENT</span>
                <span className="font-bold text-emerald-600">0.2 gal eq</span>
              </div>
              <div>
                <span className="text-slate-400 block">CO2 REDUCTION</span>
                <span className="font-bold text-primary">4.2 kg saved</span>
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
