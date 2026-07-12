import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Heart, Users, Target, HelpCircle, Code, ChevronDown, ChevronUp, Sparkles, Sprout } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'How does DonateBridge ensure items reach the right people?',
      a: 'We verify all participating NGOs through government registration checks and perform location audits. Every donation handover requires direct GPS custody signatures, providing full transparency and accountability.'
    },
    {
      q: 'Are there any platform fees or hidden charges?',
      a: 'No. DonateBridge is a completely non-monetary system built to support the circular economy and local communities. There are no fees for donors or NGOs.'
    },
    {
      q: 'How does the Smart Match system pair donors with NGOs?',
      a: 'Our algorithm analyzes distance, real-time demand urgency, item suitability, and NGO response rates to suggest the most optimal and impactful matches instantly.'
    },
    {
      q: 'What kind of items can I donate?',
      a: 'You can donate physical assets including textbooks, clothing, winter blankets, food staples, sports kits, learning electronics, and medical equipment.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 space-y-16">
        
        {/* Mission & Vision Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 bg-emerald-50 text-primary rounded-full font-bold uppercase tracking-wider border border-emerald-100" style={{ fontSize: '11px' }}>
            About Our Initiative
          </span>
          <h1 className="font-display font-black text-slate-900 tracking-tight leading-tight">
            Connecting surplus items with real community needs
          </h1>
          <p className="text-slate-500 leading-relaxed max-w-xl mx-auto" style={{ fontSize: '16px' }}>
            DonateBridge is a transparent, non-monetary network matching verified surplus resources to local non-profits.
          </p>
        </section>

        {/* Mission Card Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-border p-8 rounded-2xl shadow-premium-sm space-y-4 hover:border-primary/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-primary">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Our Mission</h3>
            <p className="text-slate-500 leading-relaxed" style={{ fontSize: '14px' }}>
              Redirect valid physical items from landfills directly to those who need them most, promoting circularity.
            </p>
          </div>

          <div className="bg-white border border-border p-8 rounded-2xl shadow-premium-sm space-y-4 hover:border-primary/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Trust & Safety</h3>
            <p className="text-slate-500 leading-relaxed" style={{ fontSize: '14px' }}>
              Strict administrative onboarding audits and GPS-verified custody signatures ensure donations reach their exact destination.
            </p>
          </div>

          <div className="bg-white border border-border p-8 rounded-2xl shadow-premium-sm space-y-4 hover:border-primary/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-primary">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Eco Impact</h3>
            <p className="text-slate-500 leading-relaxed" style={{ fontSize: '14px' }}>
              Every local match calculation tracks and aggregates CO₂ emission offsets, proving the carbon savings of local donation pathways.
            </p>
          </div>
        </section>

        {/* Technology architecture */}
        <section className="bg-white border border-border p-8 rounded-2xl shadow-premium-sm space-y-6">
          <div className="flex items-center gap-3">
            <Code className="w-6 h-6 text-primary" />
            <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Our Technology Stack</h3>
          </div>
          <p className="text-slate-500 leading-relaxed" style={{ fontSize: '14px' }}>
            Built using modern, robust frontend technologies to guarantee smooth interaction, geographic accuracy, and responsive animations.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-5 border border-border rounded-xl bg-[#F8FAFC] space-y-1">
              <p className="font-bold text-slate-800" style={{ fontSize: '15px' }}>React 19 & Vite</p>
              <p className="text-slate-400" style={{ fontSize: '12px' }}>Fast UI Rendering</p>
            </div>
            <div className="p-5 border border-border rounded-xl bg-[#F8FAFC] space-y-1">
              <p className="font-bold text-slate-800" style={{ fontSize: '15px' }}>Leaflet Maps</p>
              <p className="text-slate-400" style={{ fontSize: '12px' }}>Geo-Location Verification</p>
            </div>
            <div className="p-5 border border-border rounded-xl bg-[#F8FAFC] space-y-1">
              <p className="font-bold text-slate-800" style={{ fontSize: '15px' }}>Tailwind CSS</p>
              <p className="text-slate-400" style={{ fontSize: '12px' }}>Premium Styles</p>
            </div>
            <div className="p-5 border border-border rounded-xl bg-[#F8FAFC] space-y-1">
              <p className="font-bold text-slate-800" style={{ fontSize: '15px' }}>Framer Motion</p>
              <p className="text-slate-400" style={{ fontSize: '12px' }}>Fluid Transitions</p>
            </div>
          </div>
        </section>

        {/* Platform Core Team */}
        <section className="space-y-6">
          <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Initiative Founders</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-border bg-white rounded-2xl shadow-premium-sm text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-primary flex items-center justify-center font-bold text-lg mx-auto border border-emerald-100">
                KK
              </div>
              <div>
                <h4 className="font-bold text-slate-900" style={{ fontSize: '16px' }}>Kartik Kamatkar</h4>
                <p className="text-slate-400" style={{ fontSize: '13px' }}>Lead Architect</p>
              </div>
            </div>

            <div className="p-6 border border-border bg-white rounded-2xl shadow-premium-sm text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-primary flex items-center justify-center font-bold text-lg mx-auto border border-emerald-100">
                AS
              </div>
              <div>
                <h4 className="font-bold text-slate-900" style={{ fontSize: '16px' }}>Aditya S.</h4>
                <p className="text-slate-400" style={{ fontSize: '13px' }}>Logistics Coordinator</p>
              </div>
            </div>

            <div className="p-6 border border-border bg-white rounded-2xl shadow-premium-sm text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-primary flex items-center justify-center font-bold text-lg mx-auto border border-emerald-100">
                RN
              </div>
              <div>
                <h4 className="font-bold text-slate-900" style={{ fontSize: '16px' }}>Rohit N.</h4>
                <p className="text-slate-400" style={{ fontSize: '13px' }}>Operations Lead</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white border border-border p-8 rounded-2xl shadow-premium-sm space-y-6">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Frequently Asked Questions</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center text-left font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer"
                    style={{ fontSize: '15px' }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <p className="text-slate-500 mt-3 leading-relaxed animate-fadeInUp" style={{ fontSize: '14px' }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Help Banner */}
        <section className="p-8 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-slate-900" style={{ fontSize: '16px' }}>Have questions or want to register as an NGO?</p>
            <p className="text-slate-500" style={{ fontSize: '14px' }}>Get in touch with our team for guidance or validation reviews.</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/contact')}>
            Contact Support
          </Button>
        </section>

      </main>

      <Footer />
    </div>
  );
}
