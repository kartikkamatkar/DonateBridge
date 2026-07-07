import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { Search, ShieldCheck, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Navbar from '../components/Navbar';
import heroImage from '../assets/hero.png';

const CATEGORIES = [
  'Books', 'Clothes', 'Food', 'Toys', 'School Supplies',
  'Blankets', 'Furniture', 'Medicines', 'Daily Essentials',
];

const LEDGER = [
  { label: 'Verified NGOs', value: '1,234' },
  { label: 'Items donated', value: '48,920' },
  { label: 'Lives reached', value: '32,410' },
  { label: 'Cities covered', value: '86' },
];

const FEATURED_NGOS = [
  { id: 'ngo-1', name: 'Hope For All', verified: true, urgency: 'High', distance: '1.8 km', items: ['Blankets', 'Warm Clothes'] },
  { id: 'ngo-2', name: 'Food Relief Org', verified: true, urgency: 'Medium', distance: '3.2 km', items: ['Canned Food', 'Dry Rations'] },
  { id: 'ngo-3', name: 'StudyPlus', verified: true, urgency: 'Low', distance: '0.9 km', items: ['School Supplies', 'Books'] },
];

const STEPS = [
  {
    n: '01',
    title: 'NGO registers & gets verified',
    desc: 'NGO submits registration certificate, PAN, and address proof. Admin verifies before the profile goes live.',
  },
  {
    n: '02',
    title: 'NGO posts a real need',
    desc: 'Item, quantity, and urgency — so donors see exactly what is needed right now, not a generic wishlist.',
  },
  {
    n: '03',
    title: 'Donor finds a matching NGO',
    desc: 'Needs are ranked by urgency, distance, and quantity, so nearby, high-priority requests show up first.',
  },
  {
    n: '04',
    title: 'Chat, hand over, done',
    desc: 'Donor and NGO coordinate pickup directly in chat. The NGO marks the request fulfilled once received.',
  },
];

const URGENCY_DOT = {
  High: 'bg-red-600',
  Medium: 'bg-amber-500',
  Low: 'bg-emerald-600',
};

export default function LandingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${searchQuery}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Dynamic Main Navbar */}
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Verified NGOs — item-only donations
          </div>
          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl leading-tight tracking-tight text-slate-900">
            Turn what you don't need into what someone else does.
          </h1>
          <p className="text-slate-600 text-base leading-relaxed max-w-md">
            No cash, no middlemen. Post an item, find a verified NGO nearby, and hand it over directly — every step tracked from request to delivery.
          </p>
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search an item or need, e.g. 'school books'"
                aria-label="Search items or NGO needs"
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-slate-200 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
            <Button type="submit" variant="primary">Search</Button>
          </form>

          <div className="flex flex-wrap gap-2 pt-1">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat}
                to={`/search?category=${cat}`}
                className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 bg-white hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-lg overflow-hidden border border-slate-200 shadow-premium-md bg-white p-2">
            <img src={heroImage} alt="Volunteers sorting donated items" className="w-full h-[400px] object-cover rounded-md" loading="lazy" />
          </div>
          {/* Signature element: a small proof-of-handover receipt */}
          <div className="absolute -bottom-6 -left-6 hidden sm:block bg-white border border-slate-200 rounded-md px-4 py-3 shadow-premium-lg max-w-[230px]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Handover confirmed</div>
            <div className="text-sm leading-snug text-slate-900">
              12 blankets → <span className="font-semibold text-blue-600">Hope For All</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Delivered · this morning</div>
          </div>
        </div>
      </section>

      {/* Ledger strip */}
      <section className="border-t border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
          {LEDGER.map((s) => (
            <div key={s.label} className="px-6 py-2 md:py-0 text-center md:text-left">
              <div className="font-mono text-2xl font-bold tracking-tight text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Donation categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-sans font-bold text-2xl mb-2 text-slate-900">Donation Categories</h2>
        <p className="text-sm text-slate-500 mb-7 max-w-xl">Common categories to help you find what to give quickly.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to={`/search?category=${c}`}
              className="px-4 py-3.5 rounded-md border border-slate-200 bg-white text-sm text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-colors text-center font-medium"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured NGO needs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="font-sans font-bold text-2xl text-slate-900">Featured Needs</h2>
          <Link to="/search" className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 hover:gap-1.5 transition-all">
            See all <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white rounded-md shadow-premium-sm">
          {FEATURED_NGOS.map((ngo) => (
            <div key={ngo.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 sm:w-48 shrink-0">
                <span className={`w-2 h-2 rounded-full ${URGENCY_DOT[ngo.urgency]}`} aria-hidden="true" />
                <span className="font-semibold text-slate-900 text-sm">{ngo.name}</span>
                {ngo.verified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="flex-1 text-sm text-slate-600">
                Needs {ngo.items.join(', ')}
              </div>
              <div className="text-xs font-mono text-slate-500 sm:w-24 shrink-0">{ngo.distance}</div>
              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={() => navigate(`/search?q=${encodeURIComponent(ngo.items.join(','))}`)}
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  Donate
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="font-sans font-bold text-2xl mb-1 text-slate-900">How It Works</h2>
          <p className="text-sm text-slate-500 mb-12">Four steps, from NGO need to donor handover.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {STEPS.map((step) => (
              <div key={step.n} className="space-y-2.5 pt-4 border-t-2 border-blue-600">
                <div className="font-mono text-xs font-bold text-blue-600">
                  {step.n}
                </div>
                <h3 className="font-bold text-sm text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Donate Bridge */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-sans font-bold text-2xl mb-12 text-slate-900 text-center">Why item donations work better here</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center md:text-left space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto md:mx-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Verified NGOs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every NGO is manually verified with registration documents before their needs go public.
            </p>
          </div>
          <div className="text-center md:text-left space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto md:mx-0">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Need-based matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Requests are ranked by urgency, distance, and quantity — so the most pressing nearby needs surface first.
            </p>
          </div>
          <div className="text-center md:text-left space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto md:mx-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Direct, transparent handover</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Donor and NGO talk directly in-app to coordinate pickup, with status tracked from request to completion.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-sans font-bold text-2xl mb-7 text-slate-900">Frequently Asked Questions</h2>
        <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white rounded-md shadow-premium-sm">
          {[
            { q: 'How does item donation work?', a: 'NGOs post specific needs. Donors search or browse, contact the NGO, and arrange a handover directly.' },
            { q: 'Are NGOs verified?', a: 'Yes — NGOs submit registration and address documents and are reviewed before being allowed to post needs.' },
            { q: 'Can I donate money?', a: 'No. Donate Bridge facilitates item-only donations — no cash is collected or processed on the platform.' },
            { q: 'How do I contact an NGO?', a: 'Open the need, use the in-app chat to coordinate pickup and confirm details.' },
          ].map((item) => (
            <details key={item.q} className="group p-5">
              <summary className="font-semibold text-sm cursor-pointer list-none flex items-center justify-between text-slate-900">
                {item.q}
                <span className="text-slate-400 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
              </summary>
              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed max-w-2xl">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="font-sans font-bold text-2xl mb-1.5 text-slate-900">Your unused items can make someone's life better.</h2>
            <p className="text-sm text-slate-500">Start by browsing current NGO needs or create an account to post what you can give.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="secondary" onClick={() => navigate('/search')}>Browse Needs</Button>
            <Button variant="primary" onClick={() => navigate('/auth?register=true')}>Register</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
          <div className="space-y-3">
            <span className="font-sans font-bold text-base text-slate-900">Donate Bridge</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              An item-only donation platform connecting verified NGOs with nearby donors. No cash is collected or processed on this platform.
            </p>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mb-3 font-semibold">Categories</span>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/search?category=Books" className="hover:text-blue-600">Books & Supplies</Link></li>
              <li><Link to="/search?category=Clothes" className="hover:text-blue-600">Clothes & Blankets</Link></li>
              <li><Link to="/search?category=Food" className="hover:text-blue-600">Food</Link></li>
              <li><Link to="/search?category=Medicines" className="hover:text-blue-600">Medicines</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mb-3 font-semibold">Platform</span>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/impact" className="hover:text-blue-600">Impact</Link></li>
              <li><Link to="/search" className="hover:text-blue-600">NGO Directory</Link></li>
              <li><Link to="/auth?register=true" className="hover:text-blue-600">Register an NGO</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mb-3 font-semibold">Note</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              This platform does not accept, process, or route money. All donations are physical items handed over directly between donor and NGO.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-slate-200 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Donate Bridge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}