import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck, MapPin, CheckCircle, Package, ArrowLeft,
  Calendar, ShieldCheck, User, RefreshCw, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MockMap } from '../components/ui/MockMap';
import Navbar from '../components/Navbar';

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
    <div className="db-page min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Shared Main Navbar */}
      <Navbar />

      {/* Main split grid */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Left Side: high precision vertical timeline tracker */}
        <aside className="w-full lg:w-[480px] bg-white border-r border-slate-200 p-6 flex flex-col min-h-0 overflow-y-auto space-y-6 shrink-0 shadow-premium-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-sans font-bold text-base text-slate-900">Cargo Milestone Tracker</h3>
              <p className="text-xs text-slate-500">End-to-End logistics accountability signatures.</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs uppercase text-slate-400 font-semibold">Shipment:</span>
              <span className="font-mono text-xs font-bold text-blue-600">DB-{id || '1042'}</span>
            </div>
          </div>

          {/* Stepper Summary card */}
          <div className="db-card p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-500">Transit Status:</span>
              <span className="font-bold text-blue-600">In Transit to NGO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Estimated Delivery:</span>
              <span className="font-mono font-bold text-slate-900">14 mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Allocated Carrier:</span>
              <span className="font-semibold text-slate-900">Express Cargo (#DB-990)</span>
            </div>
          </div>

          {/* Vertical milestones path */}
          <div className="relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-8 space-y-8 flex-1">
            {milestones.map((m, idx) => {
              const stepNum = idx + 1;
              const isCurrent = stepNum === activeStep;
              const isPassed = stepNum < activeStep;

              return (
                <div key={idx} className="relative text-xs">
                  {/* Bubble marker */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center absolute -left-[38px] -top-1 font-bold text-[10px] border transition-all ${
                    isCurrent ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-600/15' :
                    isPassed ? 'bg-blue-50 text-blue-600 border-blue-600' :
                    'bg-white text-slate-400 border-slate-200'
                  }`}>
                    {isPassed ? <CheckCircle className="w-3.5 h-3.5" /> : stepNum}
                  </div>

                  <div className="space-y-0.5">
                    <p className={`font-semibold ${isCurrent ? 'text-blue-600 font-bold' : 'text-slate-900'}`}>{m.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono font-bold">{m.time}</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-2">
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
        <main className="flex-1 relative min-h-[300px] lg:min-h-0 bg-slate-100">
          <MockMap highlightedNgoId={1} activeStep={activeStep} className="w-full h-full border-none rounded-none" />
        </main>

      </div>
    </div>
  );
}
