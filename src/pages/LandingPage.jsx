import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useMockDB } from '../hooks/useMockDB';
import { Search, ShieldCheck, MapPin, Heart, ArrowRight, Star, Award, Leaf, Users, ChevronRight, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CATEGORIES = [
  { name: 'Books & Learning', count: 124, icon: Award, desc: 'Textbooks, lab kits, and children novels.' },
  { name: 'Warm Blankets & Clothes', count: 480, icon: Heart, desc: 'Winter protection and daily essentials.' },
  { name: 'Staple Foods', count: 910, icon: Leaf, desc: 'Canned meals, dry rations, and baby cereals.' },
  { name: 'Medical Equipment', count: 62, icon: ShieldCheck, desc: 'Wheelchairs, sterile gloves, and monitors.' },
];

const TESTIMONIALS = [
  {
    quote: "DonateBridge turned our chaotic logistics timeline into a predictable, automated process. We request blankets, and local donors dispatch them within hours.",
    author: "Elena Rostova",
    role: "Logistics Director, Hope Foundation",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
  },
  {
    quote: "The direct messaging and transparent tax-exemption receipts make physical corporate donations a breeze. We know exactly which community clinic got our supplies.",
    author: "Marcus Chen",
    role: "CSR Lead, Apex Corp",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
  }
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const db = useMockDB();
  const navigate = useNavigate();
  const [emailSub, setEmailSub] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Take the 3 most recently verified items
  const recentApproved = db.donations
    .filter(d => d.status === 'VERIFIED')
    .slice(0, 3);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailSub) {
      setSubscribed(true);
      setEmailSub('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Hero section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5" /> Physical Need-Matching Platform
              </span>
              <h1 className="text-display-xl text-5xl lg:text-6xl font-display font-extrabold text-ink leading-[1.05] tracking-tight">
                Bridging Donors <br />
                <span className="text-primary">with Verified NGOs</span>,
                One Need at a Time.
              </h1>
              <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
                A streamlined, non-monetary SaaS coordinating item donation logistics, verification approvals, and tax certificates automatically.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="primary"
                  className="h-12 px-6 rounded-xl font-semibold shadow-premium-md text-sm"
                  onClick={() => navigate(isAuthenticated ? '/donor' : '/auth')}
                >
                  Start Donating Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 px-6 rounded-xl font-semibold text-sm bg-slate-50 hover:bg-slate-100"
                  onClick={() => navigate('/discover')}
                >
                  Browse Marketplace
                </Button>
              </div>

              {/* Statistics row */}
              <div className="grid grid-cols-3 gap-6 pt-10 border-t border-border">
                <div>
                  <p className="text-2xl font-bold text-ink">48,920+</p>
                  <p className="text-xs text-slate-400 font-medium">Items Delivered</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink">1,234</p>
                  <p className="text-xs text-slate-400 font-medium">Verified NGOs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink">100%</p>
                  <p className="text-xs text-slate-400 font-medium">Non-Monetary</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-md aspect-square bg-gradient-to-br from-primary/10 to-accent/5 rounded-3xl border border-border p-6 flex flex-col justify-between shadow-premium-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                
                <div className="flex justify-between items-center z-10">
                  <span className="text-[10px] font-mono font-bold text-slate-400">LOGISTICS LEDGER</span>
                  <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
                </div>

                <div className="space-y-4 my-auto z-10">
                  <div className="p-4 bg-white border border-border rounded-2xl shadow-premium-sm flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-primary flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">25 Blankets Dispatched</p>
                      <p className="text-[10px] text-slate-400">Matched with Hope Foundation</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-border rounded-2xl shadow-premium-sm flex gap-3 items-center ml-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">Courier Pick-up Scheduled</p>
                      <p className="text-[10px] text-slate-400">Richmond Town &bull; 1.2 km away</p>
                    </div>
                  </div>
                </div>

                <div className="z-10 pt-4 border-t border-border flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>SYSTEM TRUST RATING</span>
                  <span className="font-bold text-primary">99.8% ACCURACY</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories section */}
      <section className="py-20 bg-slate-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-ink">Urgent Donation Categories</h2>
            <p className="text-sm text-slate-500">We prioritize physical goods categories that verify against local NGO needs registers immediately.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div key={idx} className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm text-left hover:shadow-premium-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-sm text-ink">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.desc}</p>
                  <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs">
                    <span className="text-slate-400">Active requests</span>
                    <span className="font-mono font-bold text-primary">{cat.count} listings</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-3xl font-display font-bold text-ink">Transparent Lifecycle Verification</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Unlike generic charity funds, DonateBridge links every physical item directly to a need listed by a verified NGO.
              </p>
              <div className="space-y-3 pt-4">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-600">Zero monetary transfers - strictly item tracking.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-600">Real-time georadial mapping to select closest dropoffs.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { step: '01', title: 'Need Broadcast', desc: 'Verified NGOs post exact item needs, quantity thresholds, and local coordinate radiuses.' },
                { step: '02', title: 'Donor Upload', desc: 'Donors upload description details, addresses, and images of items matching needs.' },
                { step: '03', title: 'Admin Verification', desc: 'System admins review condition compliance before publishing approved items to the common market.' },
                { step: '04', title: 'Fulfillment & Tax log', desc: 'Direct chat coordination enables local pickup. Delivery generates digitally signed 501(c)(3) tax receipts.' }
              ].map((item, idx) => (
                <div key={idx} className="p-6 bg-slate-50 border border-border rounded-2xl relative">
                  <span className="text-3xl font-display font-bold text-primary/20 absolute right-6 top-6">{item.step}</span>
                  <h3 className="font-display font-bold text-sm text-ink mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest donations / marketplace callout */}
      {recentApproved.length > 0 && (
        <section className="py-20 bg-slate-50 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-ink">Recently Approved Listings</h2>
                <p className="text-sm text-slate-500">Items audited and verified by platform supervisors, ready for NGO pickup claims.</p>
              </div>
              <Link to="/discover" className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                View all approved items <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentApproved.map((donation) => (
                <div key={donation.id} className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{donation.category}</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">VERIFIED</span>
                    </div>
                    <h4 className="font-display font-semibold text-sm text-ink">{donation.itemName || `${donation.quantity}x ${donation.category}`}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{donation.description}</p>
                  </div>
                  <div className="pt-4 border-t border-border mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate">{donation.location.address}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <h2 className="text-3xl font-display font-bold text-ink">Trusted by NGOs & CSR Teams</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="p-8 bg-slate-50 border border-border rounded-2xl text-left space-y-4">
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm text-slate-600 italic leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover border border-border" />
                  <div>
                    <p className="text-xs font-bold text-ink">{t.author}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(76,175,80,0.15),transparent)]" />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-4xl font-display font-extrabold text-white leading-tight">Ready to bridge needs in your neighborhood?</h2>
          <p className="text-sm text-emerald-100 max-w-lg mx-auto">
            Create your account today. Log in as a donor to submit listings, or verify your NGO organization to start posting supply demands.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Button
              variant="secondary"
              className="bg-white text-primary hover:bg-slate-100 border-none px-6 h-12 rounded-xl font-bold text-sm"
              onClick={() => navigate('/auth?tab=register')}
            >
              Get Started Now
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 px-6 h-12 rounded-xl border border-white/20 font-bold text-sm"
              onClick={() => navigate('/discover')}
            >
              Browse Demands
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}