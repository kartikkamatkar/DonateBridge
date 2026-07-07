import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, ShieldAlert, Globe, Compass, CheckCircle, Clock,
  Truck, BarChart3, ArrowRight, Heart, Users, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Bridge() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      num: 1,
      title: 'Donor uploads items',
      desc: 'Donor registers item specs, categories, package weights, and verification files.',
      icon: Upload,
      color: 'bg-emerald-500',
    },
    {
      num: 2,
      title: 'Admin verifies listing',
      desc: 'Superuser checks coordinates, files, and updates trust flags to avoid coordinates duplicates.',
      icon: ShieldCheck,
      color: 'bg-[#43A047]',
    },
    {
      num: 3,
      title: 'Item becomes public',
      desc: 'Approved donation becomes visible on the public faceted search marketplace directory.',
      icon: Globe,
      color: 'bg-[#4CAF50]',
    },
    {
      num: 4,
      title: 'NGO requests item',
      desc: 'Registered NGOs match item categories based on local community request demands.',
      icon: Compass,
      color: 'bg-teal-500',
    },
    {
      num: 5,
      title: 'Donor accepts match',
      desc: 'Donor reviews matches and clicks to accept the optimal routing suggestion.',
      icon: CheckCircle,
      color: 'bg-emerald-600',
    },
    {
      num: 6,
      title: 'Pickup scheduled',
      desc: 'Express logistics carrier unit dispatched to retrieve shipment.',
      icon: Clock,
      color: 'bg-[#2E7D32]',
    },
    {
      num: 7,
      title: 'Delivery completed',
      desc: 'Cargo is delivered to the NGO Hub coordinates and verified by electronic signature logs.',
      icon: Truck,
      color: 'bg-green-700',
    },
    {
      num: 8,
      title: 'Impact ledger updated',
      desc: 'Total CO2 emissions saved and item metrics sync to transparency logs.',
      icon: BarChart3,
      color: 'bg-green-800',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-16">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <span className="px-3 py-1 bg-[#F1F8F5] text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
            HOW IT WORKS
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-slate-900 leading-tight">
            Connecting Donors with NGOs, One Donation at a Time
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            DonateBridge simplifies resource sharing, replacing complex shipping processes with verified logs and smart routes.
          </p>
        </section>

        {/* 8-Step Interactive Workflow */}
        <section className="bg-white border border-border p-6 sm:p-8 rounded-2xl shadow-premium-sm space-y-8">
          <div>
            <h2 className="text-sm font-display font-bold text-slate-400 uppercase tracking-wider">The Donation Journey Workflow</h2>
            <p className="text-xs text-slate-500 mt-1">Click steps to visualize the automated transaction lifecycle.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Timeline Steps Sidebar */}
            <div className="w-full lg:w-96 space-y-2">
              {steps.map((st) => {
                const StepIcon = st.icon;
                const isActive = activeStep === st.num;

                return (
                  <button
                    key={st.num}
                    onClick={() => setActiveStep(st.num)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-primary bg-[#F1F8F5]/50 ring-2 ring-primary/5'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0 ${st.color}`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <p className={`font-bold ${isActive ? 'text-primary' : 'text-slate-700'}`}>
                        Step {st.num}: {st.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Visualizer Display Panel */}
            <div className="flex-grow bg-slate-50 border border-border p-6 rounded-xl flex flex-col justify-between min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                      STAGES & LOGISTICS / PHASE {activeStep}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {activeStep}
                    </span>
                  </div>

                  <h3 className="text-lg font-display font-bold text-slate-900">
                    {steps[activeStep - 1].title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                    {steps[activeStep - 1].desc}
                  </p>

                  <div className="bg-white border border-border p-4 rounded-lg flex items-center gap-3 text-xs max-w-sm mt-4">
                    <div className="w-8 h-8 rounded-full bg-[#F1F8F5] flex items-center justify-center text-primary">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Anti-Fraud Protection Enabled</p>
                      <p className="text-[10px] text-slate-400">Ledger details are signed under secure coordinates protocols.</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                  disabled={activeStep === 1}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveStep(prev => Math.min(8, prev + 1))}
                  disabled={activeStep === 8}
                  icon={ChevronRight}
                >
                  Next Stage
                </Button>
              </div>
            </div>

          </div>
        </section>

        {/* Growth Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm text-center space-y-1">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-display font-extrabold text-slate-900">1,240+</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Active Donors</p>
          </div>
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm text-center space-y-1">
            <Heart className="w-6 h-6 text-[#4CAF50] mx-auto mb-2" />
            <p className="text-2xl font-display font-extrabold text-slate-900">340+</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Verified NGO Hubs</p>
          </div>
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm text-center space-y-1">
            <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-display font-extrabold text-slate-900">8,904</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Completed Dispatches</p>
          </div>
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm text-center space-y-1">
            <BarChart3 className="w-6 h-6 text-[#4CAF50] mx-auto mb-2" />
            <p className="text-2xl font-display font-extrabold text-slate-900">1.4 tons</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">CO2 Emissions Saved</p>
          </div>
        </section>

        {/* Success Stories */}
        <section className="space-y-6">
          <div>
            <h2 className="text-sm font-display font-bold text-slate-400 uppercase tracking-wider">Success Stories</h2>
            <p className="text-xs text-slate-500 mt-1">Real impact updates delivered via coordinates routing matching.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
              <p className="text-xs text-slate-500 italic">
                "Our school received 40 books and notebooks within a day. The coordinate matching program saved us days of phone calls."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-primary">
                  ED
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Education Hub</h4>
                  <p className="text-[10px] text-slate-400">NGO Partner &bull; Sector 4</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
              <p className="text-xs text-slate-500 italic">
                "DonateBridge allowed us to clear our store warehouse of extra winter coats and blankets. Direct tracking feels incredibly secure."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-primary">
                  SJ
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sarah Jenkins</h4>
                  <p className="text-[10px] text-slate-400">Platform Donor &bull; Bangalore East</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
