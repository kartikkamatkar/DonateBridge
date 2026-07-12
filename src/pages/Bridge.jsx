import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Upload, Globe, Compass, CheckCircle, Clock,
  Truck, BarChart3, ShieldCheck, ChevronRight, ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const STEPS = [
  {
    num: 1,
    title: 'Donor Uploads Items',
    desc: 'The donor registers item details — category, condition, photos, and pickup address — to create a verified listing on the platform.',
    icon: Upload,
    color: 'bg-emerald-500',
    details: [
      'Define item category and condition',
      'Upload photos for verification',
      'Set pickup address coordinates'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="bg-slate-50 border border-border p-4 rounded-xl flex items-center justify-between">
          <span className="text-slate-500 font-medium">Donation Title</span>
          <span className="font-semibold text-slate-800">50 School Textbooks</span>
        </div>
        <div className="bg-slate-50 border border-border p-4 rounded-xl flex items-center justify-between">
          <span className="text-slate-500 font-medium">Verification File</span>
          <span className="font-semibold text-primary">cargo_manifest.pdf</span>
        </div>
        <div className="flex justify-between items-center px-1 text-slate-500">
          <span>Weight: 18 kg</span>
          <span className="text-primary font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Ready for upload
          </span>
        </div>
      </div>
    )
  },
  {
    num: 2,
    title: 'Admin Verifies Listing',
    desc: 'A platform supervisor reviews the item details, verifies authenticity through uploaded documents, and approves the listing.',
    icon: ShieldCheck,
    color: 'bg-emerald-600',
    details: [
      'Cross-reference donor registration',
      'Validate location coordinates',
      'Approve listing for public catalog'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Integrity Audit</span>
          <span className="text-primary font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">PASSED</span>
        </div>
        <div className="bg-slate-50 border border-border p-4 rounded-xl font-mono text-slate-600 space-y-1.5">
          <div>&gt; Matching headquarters coords...</div>
          <div className="text-slate-900 font-bold">MATCH: 12.9716, 77.5946 [OK]</div>
          <div>&gt; Updating trust flags... DONE</div>
        </div>
        <div className="text-slate-400 text-center">Audit signed · SHA-256 block updated</div>
      </div>
    )
  },
  {
    num: 3,
    title: 'Item Goes Public',
    desc: 'The approved donation becomes visible in the public Discover directory, where verified NGOs can browse and filter available items.',
    icon: Globe,
    color: 'bg-emerald-700',
    details: [
      'Published to the active Discover feed',
      'Indexed by category, proximity, and urgency',
      'Open for NGO match requests'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="bg-white border border-border p-4 rounded-xl shadow-premium-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">BK</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 truncate">50 Textbooks & Stationary Kits</h4>
            <p className="text-slate-400">Bengaluru East Hub · Available</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-primary rounded-lg font-bold shrink-0 border border-emerald-100">
            PUBLIC
          </span>
        </div>
        <p className="text-slate-500 text-center italic">Listed on active directories. Ready for NGO matching.</p>
      </div>
    )
  },
  {
    num: 4,
    title: 'NGO Requests Item',
    desc: 'A registered NGO identifies the donation as matching their community needs and submits an allocation request through the platform.',
    icon: Compass,
    color: 'bg-teal-500',
    details: [
      'Identify local community demands',
      'Auto-verify NGO eligibility',
      'Generate proximity match scores'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Suggested NGO Partner</span>
          <span className="text-primary font-bold">98.4% Proximity Match</span>
        </div>
        <div className="bg-slate-50 border border-border p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-primary font-bold">EH</div>
          <div>
            <p className="font-bold text-slate-900">Education Hub NGO</p>
            <p className="text-slate-400">Demands matched: Educational books</p>
          </div>
        </div>
      </div>
    )
  },
  {
    num: 5,
    title: 'Donor Accepts Match',
    desc: 'The donor reviews the NGO match, approves the recipient suggestion, and locks the allocation — triggering the logistics flow.',
    icon: CheckCircle,
    color: 'bg-teal-600',
    details: [
      'Review recipient organization profile',
      'Accept optimized logistics route',
      'Generate electronic manifest'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="border border-emerald-100 bg-emerald-50/30 p-4 rounded-xl space-y-2">
          <p className="font-bold text-slate-900">Route Matching Accepted</p>
          <p className="text-slate-500">Donor approved recipient suggestion. Allocation manifest locked.</p>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Manifest: #M-902-L</span>
          <span className="text-primary bg-emerald-100/50 px-3 py-1 rounded-lg font-bold border border-emerald-200/40">LOCKED</span>
        </div>
      </div>
    )
  },
  {
    num: 6,
    title: 'Pickup Scheduled',
    desc: 'A logistics courier is dispatched to the donor\'s location to collect the items. Real-time tracking is enabled for both parties.',
    icon: Clock,
    color: 'bg-teal-700',
    details: [
      'Deploy regional courier unit',
      'Sync schedule with donor availability',
      'Enable real-time parcel tracking'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="bg-slate-50 border border-border p-4 rounded-xl space-y-2">
          <div className="flex justify-between font-bold">
            <span>Express Unit: DB-LOGISTICS</span>
            <span className="text-primary">En Route</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Driver: Ramesh K.</span>
            <span>ETA: 14 mins</span>
          </div>
        </div>
        <p className="text-slate-400 text-center">GPS tracking active · Transmit rate: 1Hz</p>
      </div>
    )
  },
  {
    num: 7,
    title: 'Delivery Completed',
    desc: 'Items are delivered to the NGO hub and verified through electronic signature. Custody transfer is recorded in the audit log.',
    icon: Truck,
    color: 'bg-green-600',
    details: [
      'Courier delivers items to NGO hub',
      'NGO confirms with digital signature',
      'Release custody transfer logs'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="bg-slate-50 border border-border p-4 rounded-xl flex items-center justify-between">
          <span className="text-slate-500 font-medium">Custody Transfer</span>
          <span className="text-primary font-bold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> SIGNED
          </span>
        </div>
        <div className="bg-slate-50 border border-border p-4 rounded-xl font-mono text-slate-600 space-y-1.5">
          <div>&gt; Matching GPS location logs...</div>
          <div>NGO HQ REGION MATCH: 100% [VALID]</div>
          <div>STATUS: COMPLETED DISPATCH</div>
        </div>
      </div>
    )
  },
  {
    num: 8,
    title: 'Impact Ledger Updated',
    desc: 'CO₂ savings, item metrics, and beneficiary impact data are synced to the transparency ledger — completing the donation lifecycle.',
    icon: BarChart3,
    color: 'bg-green-700',
    details: [
      'Calculate carbon emissions saved',
      'Append data to transparency log',
      'Credit donor profile with impact points'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="bg-emerald-950 text-emerald-100 p-5 rounded-xl text-center space-y-1">
          <p className="font-mono uppercase tracking-wider text-emerald-400">CO₂ Emissions Saved</p>
          <p className="text-2xl font-display font-extrabold">+0.15 Tons Offset</p>
        </div>
        <div className="flex justify-between items-center text-slate-400 px-1">
          <span>Block Index: #5812902</span>
          <span>Status: SYNCED</span>
        </div>
      </div>
    )
  },
];

export default function Bridge() {
  const [activeStep, setActiveStep] = useState(1);

  const currentStep = STEPS.find(s => s.num === activeStep);
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Page Header */}
      <section className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-primary border border-emerald-200/60 font-semibold uppercase tracking-wider">
            How It Works
          </span>
          <h1 className="font-display font-extrabold text-slate-900 tracking-tight">
            The Donation Bridge
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
            From uploading an item to delivering it to an NGO — here's the complete journey of every donation on DonateBridge.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left: Step Navigation */}
            <div className="w-full lg:w-80 shrink-0 space-y-2">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = activeStep === step.num;
                const isPast = activeStep > step.num;
                return (
                  <button
                    key={step.num}
                    onClick={() => setActiveStep(step.num)}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-primary bg-emerald-50/40 shadow-premium-sm'
                        : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-primary text-white' :
                      isPast ? 'bg-emerald-100 text-primary' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-slate-400 font-semibold uppercase tracking-wider ${isActive ? 'text-primary' : ''}`} style={{ fontSize: '11px' }}>
                        Step {step.num}
                      </p>
                      <p className={`font-semibold truncate ${isActive ? 'text-slate-900 font-bold' : 'text-slate-600'}`} style={{ fontSize: '14px' }}>
                        {step.title}
                      </p>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Right: Step Detail Card */}
            <div className="flex-1">
              <div className="bg-white border border-border rounded-2xl shadow-premium-sm overflow-hidden">
                
                {/* Step Header */}
                <div className="p-6 lg:p-8 border-b border-border bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${currentStep.color}`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-primary font-semibold uppercase tracking-wider" style={{ fontSize: '12px' }}>
                        Step {currentStep.num} of {STEPS.length}
                      </p>
                      <h2 className="font-display font-bold text-slate-900" style={{ fontSize: '22px' }}>
                        {currentStep.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-slate-500 mt-3 leading-relaxed max-w-2xl" style={{ fontSize: '15px' }}>
                    {currentStep.desc}
                  </p>
                </div>

                {/* Step Body */}
                <div className="p-6 lg:p-8 space-y-6">
                  
                  {/* Checklist */}
                  <div className="space-y-2.5">
                    <h3 className="font-semibold text-slate-400 uppercase tracking-wider" style={{ fontSize: '12px' }}>
                      What happens at this step
                    </h3>
                    <ul className="space-y-2">
                      {currentStep.details.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-700" style={{ fontSize: '15px' }}>
                          <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Live Preview Mockup */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-400 uppercase tracking-wider" style={{ fontSize: '12px' }}>
                      Preview
                    </h3>
                    <div className="border border-border rounded-xl p-5 bg-slate-50/30" style={{ fontSize: '14px' }}>
                      {currentStep.mockup}
                    </div>
                  </div>
                </div>

                {/* Step Navigation Footer */}
                <div className="p-6 lg:p-8 border-t border-border bg-slate-50/30 flex items-center justify-between">
                  <Button
                    variant="secondary"
                    onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                    isDisabled={activeStep === 1}
                  >
                    Previous Step
                  </Button>
                  
                  {/* Progress indicator */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    {STEPS.map(s => (
                      <div
                        key={s.num}
                        className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                          s.num === activeStep ? 'bg-primary' :
                          s.num < activeStep ? 'bg-emerald-200' :
                          'bg-slate-200'
                        }`}
                        onClick={() => setActiveStep(s.num)}
                      />
                    ))}
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => setActiveStep(Math.min(STEPS.length, activeStep + 1))}
                    isDisabled={activeStep === STEPS.length}
                    icon={ArrowRight}
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
