import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Heart, Users, Target, HelpCircle, Code, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'How is physical item location security guaranteed?',
      a: 'We leverage Leaflet coordinates validation to audit both donor pickup points and NGO hub centers, preventing coordinates duplicate accounts.'
    },
    {
      q: 'Is there any transaction fee for donors or NGOs?',
      a: 'No. DonateBridge is a completely non-monetary resource matching portal designed to foster sustainability and circular economy.'
    },
    {
      q: 'How does the AI smart matching rating system work?',
      a: 'Our matching algorithm calculates coefficients based on direct driving distance, item category urgency index, and NGO verification trust status.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full p-6 sm:p-8 space-y-12">
        
        {/* Mission & Vision Hero */}
        <section className="text-center space-y-4 pt-4">
          <span className="px-3 py-1 bg-[#F1F8F5] text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
            OUR MISSION & VISION
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-slate-900 leading-tight">
            Bridging Donors with NGOs, One Donation at a Time
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            DonateBridge is a direct resource logistics network designed to match surplus supplies with immediate local needs.
          </p>
        </section>

        {/* Mission Card Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-3">
            <Target className="w-8 h-8 text-primary" />
            <h3 className="font-display font-bold text-sm text-slate-900">Our Core Mission</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Divert valid resource materials from waste streams by providing absolute traceability and coordination pathways between validated organizations and individual donors.
            </p>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-3">
            <ShieldCheck className="w-8 h-8 text-[#4CAF50]" />
            <h3 className="font-display font-bold text-sm text-slate-900">Our Trust Integrity</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enforce strict administrative auditing, coordinate tracking, and digital signature ledgers to eliminate leakage, fraud, and duplication of listings.
            </p>
          </div>
        </section>

        {/* Core technology stack */}
        <section className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-6">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-display font-bold text-slate-400 uppercase tracking-wider">Technology Architecture</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-center">
            <div className="p-4 border border-border rounded-xl bg-slate-50">
              <p className="font-bold text-slate-800">React 19 & Vite</p>
              <p className="text-[10px] text-slate-400 mt-1">Component UI Rendering</p>
            </div>
            <div className="p-4 border border-border rounded-xl bg-slate-50">
              <p className="font-bold text-slate-800">Leaflet Maps</p>
              <p className="text-[10px] text-slate-400 mt-1">Coordinates Picker</p>
            </div>
            <div className="p-4 border border-border rounded-xl bg-slate-50">
              <p className="font-bold text-slate-800">Tailwind CSS</p>
              <p className="text-[10px] text-slate-400 mt-1">SaaS Design Tokens</p>
            </div>
            <div className="p-4 border border-border rounded-xl bg-slate-50">
              <p className="font-bold text-slate-800">Framer Motion</p>
              <p className="text-[10px] text-slate-400 mt-1">Workflow Animations</p>
            </div>
          </div>
        </section>

        {/* Meet the team section */}
        <section className="space-y-6">
          <h3 className="text-sm font-display font-bold text-slate-400 uppercase tracking-wider">Platform Core Team</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 border border-border bg-white rounded-2xl shadow-premium-sm text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-primary mx-auto">
                KK
              </div>
              <h4 className="text-xs font-bold text-slate-900">Kartik Kamatkar</h4>
              <p className="text-[10px] text-slate-400">Chief Architect</p>
            </div>

            <div className="p-5 border border-border bg-white rounded-2xl shadow-premium-sm text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-primary mx-auto">
                AS
              </div>
              <h4 className="text-xs font-bold text-slate-900">Aditya S.</h4>
              <p className="text-[10px] text-slate-400">Logistics Director</p>
            </div>

            <div className="p-5 border border-border bg-white rounded-2xl shadow-premium-sm text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-primary mx-auto">
                RN
              </div>
              <h4 className="text-xs font-bold text-slate-900">Rohit N.</h4>
              <p className="text-[10px] text-slate-400">Operations Lead</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-display font-bold text-slate-400 uppercase tracking-wider">Frequently Asked Questions</h3>
          </div>

          <div className="divide-y divide-border text-xs">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center text-left font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <p className="text-slate-500 mt-2 leading-relaxed animate-fadeInUp">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact shortcuts banner */}
        <section className="p-6 bg-[#F1F8F5] border border-emerald-100 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold text-slate-900">Have questions or want to partner with us?</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Reach out to our support channel for onboarding coordination.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/contact')}>
            Contact Support
          </Button>
        </section>

      </main>

      <Footer />
    </div>
  );
}
