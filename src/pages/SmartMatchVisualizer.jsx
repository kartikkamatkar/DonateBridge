import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, RefreshCw, MapPin, Star, AlertTriangle, ArrowRight,
  TrendingUp, Award, ShieldCheck, Heart, Info, Navigation
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MockMap } from '../components/ui/MockMap';

export default function SmartMatchVisualizer() {
  const navigate = useNavigate();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(1);
  const [mapStep, setMapStep] = useState(3);

  // Recommendations calculated by Spring Boot simulator
  const [matches, setMatches] = useState([
    {
      id: 1,
      ngo: 'Hope Foundation',
      score: 97.4,
      proximity: 1.4, // miles
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
      proximity: 3.8, // miles
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
      proximity: 6.2, // miles
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
    // Simulate API delay
    setTimeout(() => {
      setIsOptimizing(false);
      // Randomize scores slightly to show calculations are dynamic
      setMatches(prev =>
        prev.map(m => {
          const delta = (Math.random() - 0.5) * 4;
          const newScore = Math.min(100, Math.max(50, parseFloat((m.score + delta).toFixed(1))));
          return { ...m, score: newScore };
        }).sort((a, b) => b.score - a.score)
      );
    }, 1500);
  };

  const currentMatch = matches.find(m => m.id === selectedMatch) || matches[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top sticky nav */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
          <div>
            <span className="font-bold text-base block">Smart Match Optimizer</span>
            <span className="text-[9px] text-slate-500 block -mt-1">Spring Boot Dispatch Calculus</span>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>Back</Button>
      </header>

      {/* Main Workspace split */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Left Side: Calculations list */}
        <aside className="w-full lg:w-[460px] bg-white dark:bg-slate-850 border-r border-slate-200 dark:border-slate-800 flex flex-col min-h-0 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm">Matching Rankings</h3>
              <p className="text-xs text-slate-500">Ranked by logistics proximity and urgency indices.</p>
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

          {/* Matches List */}
          <div className="space-y-4">
            {matches.map((match, idx) => (
              <Card
                key={match.id}
                isHoverable
                onClick={() => setSelectedMatch(match.id)}
                className={`p-4 border transition-all ${
                  selectedMatch === match.id
                    ? 'border-primary ring-1 ring-primary/45 bg-emerald-50/10 dark:bg-slate-800'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Rank #{idx + 1} Recommendation</span>
                    <h4 className="font-bold text-sm">{match.ngo}</h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-450" /> {match.proximity} miles away &bull; ETA {match.eta}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-primary block">{match.score}</span>
                    <span className="text-[9px] text-slate-400 block -mt-1 font-semibold uppercase">Match Score</span>
                  </div>
                </div>

                {/* Score Breakdown weights visualizer */}
                <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-semibold">Proximity Weight (40%):</span>
                    <span className="font-mono font-bold text-slate-850 dark:text-slate-200">{match.proximityScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${match.proximityScore}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-semibold">Urgency priority Index (35%):</span>
                    <span className="font-mono font-bold text-red-500">{match.urgencyScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${match.urgencyScore}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-semibold">NGO Trust Rating (25%):</span>
                    <span className="font-mono font-bold text-emerald-500">{match.trustScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${match.trustScore}%` }} />
                  </div>
                </div>

                <div className="flex justify-end pt-3 mt-3 border-t border-slate-100 dark:border-slate-850">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-[10px] py-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/request-wizard?ngo=${match.id}&category=${match.item}`);
                    }}
                    icon={ArrowRight}
                  >
                    Confirm Dispatch Route
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </aside>

        {/* Right Side: Map showing computed route */}
        <main className="flex-1 relative min-h-[350px] lg:min-h-0">
          <MockMap highlightedNgoId={currentMatch.id} activeStep={mapStep} className="w-full h-full border-none rounded-none" />

          {/* floating detailed overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-4 rounded-lg text-white max-w-md space-y-3 z-10 text-xs">
            <div className="flex justify-between items-center font-bold">
              <span className="flex items-center gap-1.5"><Navigation className="w-4 h-4 text-emerald-400 animate-pulse" /> Computed Optimization Route</span>
              <span className="font-mono text-emerald-400">ETA {currentMatch.eta}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              The routing engine selected <strong className="text-slate-200">{currentMatch.ngo}</strong> due to a high urgency need for <strong className="text-slate-200">{currentMatch.item}</strong> and close coordinates proximity.
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-center pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-500 block">DISTANCE</span>
                <span className="font-bold">{currentMatch.proximity} miles</span>
              </div>
              <div>
                <span className="text-slate-500 block">FUEL USAGE</span>
                <span className="font-bold text-emerald-400">0.2 gal equivalent</span>
              </div>
              <div>
                <span className="text-slate-500 block">CO2 REDUCTION</span>
                <span className="font-bold text-emerald-400">4.2 kg saved</span>
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
