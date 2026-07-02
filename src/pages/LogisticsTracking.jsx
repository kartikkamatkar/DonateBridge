import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck, MapPin, CheckCircle, Package, ArrowLeft,
  Calendar, ShieldCheck, User, RefreshCw, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MockMap } from '../components/ui/MockMap';

export default function LogisticsTracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(3); // 1: Requested, 2: Approved, 3: Dispatched, 4: Delivered
  const [pulse, setPulse] = useState(true);

  // Milestones list
  const milestones = [
    { title: 'Donation Request Lodged', time: '10:00 AM, July 2', desc: 'Donor Sarah Jenkins logged 25 Wool Blankets.', done: true },
    { title: 'NGO Match Approval Signed', time: '10:15 AM, July 2', desc: 'Hope Foundation accepted and validated item spec codes.', done: true },
    { title: 'Courier Dispatched', time: '10:45 AM, July 2', desc: 'Express Cargo #DB-990 dispatched to collect cargo.', done: true },
    { title: 'Fulfillment & Scaling', time: 'Pending', desc: 'Cargo scaling and digital signatures confirming receipt at NGO Hub.', done: false },
    { title: 'Impact Ledger Confirmed', time: 'Pending', desc: 'Audit transaction saved to the transparency block ledger.', done: false },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(p => !p);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back to Logs
        </button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase text-slate-400">Shipment Code:</span>
          <span className="font-mono text-xs font-bold text-primary">DB-{id || '1042'}</span>
        </div>
      </header>

      {/* Main split grid */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Left Side: high precision vertical timeline tracker */}
        <aside className="w-full lg:w-[480px] bg-white dark:bg-slate-850 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col min-h-0 overflow-y-auto space-y-6">
          <div>
            <h3 className="font-bold text-base">Cargo Milestone Tracker</h3>
            <p className="text-xs text-slate-500">End-to-End logistics accountability signatures.</p>
          </div>

          {/* Stepper Summary card */}
          <Card className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Transit Status:</span>
              <span className="font-bold text-emerald-500">In Transit to NGO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Estimated Delivery:</span>
              <span className="font-mono font-bold">14 mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Allocated Carrier:</span>
              <span className="font-semibold">Express Cargo (#DB-990)</span>
            </div>
          </Card>

          {/* Vertical milestones path */}
          <div className="relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8 space-y-8 flex-1">
            {milestones.map((m, idx) => {
              const stepNum = idx + 1;
              const isCurrent = stepNum === activeStep;
              const isPassed = stepNum < activeStep;

              return (
                <div key={idx} className="relative text-xs">
                  {/* Bubble marker */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center absolute -left-[38px] -top-1 font-bold text-[10px] border transition-all ${
                    isCurrent ? 'bg-primary text-white border-primary ring-4 ring-emerald-500/20' :
                    isPassed ? 'bg-primary text-white border-primary' :
                    'bg-slate-200 dark:bg-slate-800 text-slate-450 border-slate-300 dark:border-slate-700'
                  }`}>
                    {isPassed ? <CheckCircle className="w-3.5 h-3.5" /> : stepNum}
                  </div>

                  <div className="space-y-0.5">
                    <p className={`font-bold ${isCurrent ? 'text-primary' : 'text-slate-800 dark:text-slate-250'}`}>{m.title}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{m.time}</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <Button
              variant="secondary"
              className="w-full text-xs"
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
            >
              Previous Step
            </Button>
            <Button
              variant="primary"
              className="w-full text-xs"
              onClick={() => setActiveStep(prev => Math.min(5, prev + 1))}
            >
              Advance Delivery
            </Button>
          </div>
        </aside>

        {/* Right Side: Map Coordinates */}
        <main className="flex-1 relative min-h-[300px] lg:min-h-0">
          <MockMap highlightedNgoId={1} activeStep={activeStep} className="w-full h-full border-none rounded-none" />
        </main>

      </div>
    </div>
  );
}
