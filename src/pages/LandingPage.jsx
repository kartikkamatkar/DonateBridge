import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useTheme } from '../context/GlobalStateContext';
import { Search, ShieldCheck, MapPin, MessageCircle, Moon, Sun, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import heroImage from '../assets/hero.png';

/*
  Design notes for this page
  ---------------------------
  Palette (define once, e.g. in index.html <style> or tailwind.config):
    paper       #FAF8F4   paper-dark   #1C1B19
    ink         #2A2823   ink-dark     #EDEAE3
    moss        #4A6B4E   moss-tint    #E9EDE7
    stone       #DED6C8   stone-dark   #34322C
    muted       #8A8577
    clay        #B5653A   (urgency accent only — used sparingly, never as a fill)

  Type: Fraunces for headlines (add via Google Fonts), Inter for body,
  IBM Plex Mono for figures/labels — gives stats a "ledger" feel rather
  than a dashboard feel. Add to <head>:
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
*/

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
  High: 'bg-[#B5653A]',
  Medium: 'bg-[#C79A4B]',
  Low: 'bg-[#4A6B4E]',
};

export default function LandingPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${searchQuery}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#1C1B19] text-[#2A2823] dark:text-[#EDEAE3] font-[Inter,sans-serif] selection:bg-[#4A6B4E] selection:text-[#FAF8F4]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FAF8F4]/90 dark:bg-[#1C1B19]/90 backdrop-blur border-b border-[#DED6C8] dark:border-[#34322C]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[3px] bg-[#4A6B4E] flex items-center justify-center text-[#FAF8F4] font-[500] text-[11px] font-[IBM_Plex_Mono,monospace]">
              DB
            </div>
            <span className="font-[Fraunces,serif] font-[500] text-[17px] tracking-tight">Donate Bridge</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <Link to="/search" className="text-[13.5px] text-[#5C584F] dark:text-[#B5B0A5] hover:text-[#4A6B4E] dark:hover:text-[#8FB593] transition-colors">Find NGOs</Link>
            <Link to="/impact" className="text-[13.5px] text-[#5C584F] dark:text-[#B5B0A5] hover:text-[#4A6B4E] dark:hover:text-[#8FB593] transition-colors">Impact</Link>
            <Link to="/chat" className="text-[13.5px] text-[#5C584F] dark:text-[#B5B0A5] hover:text-[#4A6B4E] dark:hover:text-[#8FB593] transition-colors">Messages</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-[3px] text-[#8A8577] hover:bg-[#F0ECE3] dark:hover:bg-[#26241F] transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-[13px] text-[#8A8577]">
                  Hi, <strong className="text-[#2A2823] dark:text-[#EDEAE3] font-[500]">{user.name}</strong>
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(user.role === 'admin' ? '/admin-dashboard' : user.role === 'ngo' ? '/ngo-dashboard' : '/donor-dashboard')}
                >
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>Log out</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Sign in</Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/auth?register=true')}>Register</Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 text-[12px] font-[500] text-[#4A6B4E] dark:text-[#8FB593] font-[IBM_Plex_Mono,monospace] uppercase tracking-[0.06em]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified NGOs — item-only donations
          </div>
          <h1 className="font-[Fraunces,serif] font-[500] text-[2.6rem] sm:text-[3.1rem] leading-[1.06] tracking-[-0.01em]">
            Turn what you don't need into what someone else does.
          </h1>
          <p className="text-[#5C584F] dark:text-[#B5B0A5] text-[15.5px] leading-relaxed max-w-md">
            No cash, no middlemen. Post an item, find a verified NGO nearby, and hand it over directly — every step tracked from request to delivery.
          </p>
          <form onSubmit={handleSearchSubmit} className="flex gap-2.5 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8577]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search an item or need, e.g. 'school books'"
                aria-label="Search items or NGO needs"
                className="w-full pl-10 pr-3 py-3 rounded-[4px] border border-[#DED6C8] dark:border-[#34322C] bg-white dark:bg-[#26241F] text-[13.5px] placeholder-[#A9A398] focus:outline-none focus:ring-1 focus:ring-[#4A6B4E] focus:border-[#4A6B4E] transition-colors"
              />
            </div>
            <Button type="submit" variant="primary">Search</Button>
          </form>

          <div className="flex flex-wrap gap-2 pt-1">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat}
                to={`/search?category=${cat}`}
                className="text-[12px] px-3 py-1.5 rounded-[3px] border border-[#DED6C8] dark:border-[#34322C] text-[#5C584F] dark:text-[#B5B0A5] hover:border-[#4A6B4E] hover:text-[#4A6B4E] dark:hover:text-[#8FB593] transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[4px] overflow-hidden border border-[#DED6C8] dark:border-[#34322C]">
            <img src={heroImage} alt="Volunteers sorting donated items" className="w-full h-[400px] object-cover" loading="lazy" />
          </div>
          {/* Signature element: a small proof-of-handover receipt, echoing the ledger motif */}
          <div className="absolute -bottom-6 -left-6 hidden sm:block bg-[#FAF8F4] dark:bg-[#1C1B19] border border-[#DED6C8] dark:border-[#34322C] rounded-[4px] px-4 py-3 shadow-[0_4px_20px_rgba(42,40,35,0.08)] max-w-[230px]">
            <div className="text-[10px] font-[IBM_Plex_Mono,monospace] uppercase tracking-[0.08em] text-[#8A8577] mb-1.5">Handover confirmed</div>
            <div className="text-[13px] leading-snug">
              12 blankets → <span className="font-[500]">Hope For All</span>
            </div>
            <div className="text-[11px] text-[#8A8577] mt-1">Delivered · this morning</div>
          </div>
        </div>
      </section>

      {/* Ledger strip — replaces generic stat cards */}
      <section className="border-t border-b border-[#DED6C8] dark:border-[#34322C] bg-[#F3EFE7] dark:bg-[#201E19]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-[#DED6C8] dark:divide-[#34322C]">
          {LEDGER.map((s) => (
            <div key={s.label} className="px-4 first:pl-0 py-2 md:py-0">
              <div className="font-[IBM_Plex_Mono,monospace] text-[1.6rem] font-[500] tracking-tight">{s.value}</div>
              <div className="text-[11.5px] text-[#8A8577] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Donation categories */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
        <h2 className="font-[Fraunces,serif] font-[500] text-[1.4rem] mb-2">Donation categories</h2>
        <p className="text-[13.5px] text-[#8A8577] mb-7 max-w-xl">Common categories to help you find what to give quickly.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to={`/search?category=${c}`}
              className="px-4 py-3.5 rounded-[4px] border border-[#DED6C8] dark:border-[#34322C] bg-white dark:bg-[#201E19] text-[13.5px] text-[#5C584F] dark:text-[#B5B0A5] hover:border-[#4A6B4E] hover:text-[#2A2823] dark:hover:text-[#EDEAE3] transition-colors"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured NGO needs — receipt-row style */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="font-[Fraunces,serif] font-[500] text-[1.4rem]">Featured needs</h2>
          <Link to="/search" className="text-[13px] text-[#4A6B4E] dark:text-[#8FB593] inline-flex items-center gap-1 hover:gap-1.5 transition-all">
            See all <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-[#DED6C8] dark:divide-[#34322C] border-y border-[#DED6C8] dark:border-[#34322C]">
          {FEATURED_NGOS.map((ngo) => (
            <div key={ngo.id} className="py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 sm:w-48 shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full ${URGENCY_DOT[ngo.urgency]}`} aria-hidden="true" />
                <span className="font-[500] text-[14.5px]">{ngo.name}</span>
                {ngo.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#4A6B4E] dark:text-[#8FB593]" />}
              </div>
              <div className="flex-1 text-[13.5px] text-[#5C584F] dark:text-[#B5B0A5]">
                Needs {ngo.items.join(', ')}
              </div>
              <div className="text-[12px] font-[IBM_Plex_Mono,monospace] text-[#8A8577] sm:w-24 shrink-0">{ngo.distance}</div>
              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={() => navigate(`/search?q=${encodeURIComponent(ngo.items.join(','))}`)}
                  className="text-[13px] font-[500] text-[#4A6B4E] dark:text-[#8FB593] hover:underline underline-offset-2"
                >
                  Donate
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[#DED6C8] dark:border-[#34322C] bg-[#F3EFE7] dark:bg-[#201E19]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20">
          <h2 className="font-[Fraunces,serif] font-[500] text-[1.6rem] mb-1">How it works</h2>
          <p className="text-[13.5px] text-[#8A8577] mb-12">Four steps, from NGO need to donor handover.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {STEPS.map((step) => (
              <div key={step.n} className="space-y-2.5 pt-4 border-t border-[#4A6B4E]/30">
                <div className="font-[IBM_Plex_Mono,monospace] text-[12px] text-[#4A6B4E] dark:text-[#8FB593]">
                  {step.n}
                </div>
                <h3 className="font-[500] text-[14.5px]">{step.title}</h3>
                <p className="text-[13px] text-[#8A8577] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Donate Bridge */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-20">
        <h2 className="font-[Fraunces,serif] font-[500] text-[1.6rem] mb-12">Why item donations work better here</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <ShieldCheck className="w-4.5 h-4.5 text-[#4A6B4E] dark:text-[#8FB593] mb-3" />
            <h3 className="font-[500] text-[14.5px] mb-1.5">Verified NGOs</h3>
            <p className="text-[13px] text-[#8A8577] leading-relaxed">
              Every NGO is manually verified with registration documents before their needs go public.
            </p>
          </div>
          <div>
            <MapPin className="w-4.5 h-4.5 text-[#4A6B4E] dark:text-[#8FB593] mb-3" />
            <h3 className="font-[500] text-[14.5px] mb-1.5">Need-based matching</h3>
            <p className="text-[13px] text-[#8A8577] leading-relaxed">
              Requests are ranked by urgency, distance, and quantity — so the most pressing nearby needs surface first.
            </p>
          </div>
          <div>
            <MessageCircle className="w-4.5 h-4.5 text-[#4A6B4E] dark:text-[#8FB593] mb-3" />
            <h3 className="font-[500] text-[14.5px] mb-1.5">Direct, transparent handover</h3>
            <p className="text-[13px] text-[#8A8577] leading-relaxed">
              Donor and NGO talk directly in-app to coordinate pickup, with status tracked from request to completion.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
        <h2 className="font-[Fraunces,serif] font-[500] text-[1.4rem] mb-7">Frequently asked questions</h2>
        <div className="divide-y divide-[#DED6C8] dark:divide-[#34322C] border-y border-[#DED6C8] dark:border-[#34322C]">
          {[
            { q: 'How does item donation work?', a: 'NGOs post specific needs. Donors search or browse, contact the NGO, and arrange a handover directly.' },
            { q: 'Are NGOs verified?', a: 'Yes — NGOs submit registration and address documents and are reviewed before being allowed to post needs.' },
            { q: 'Can I donate money?', a: 'No. Donate Bridge facilitates item-only donations — no cash is collected or processed on the platform.' },
            { q: 'How do I contact an NGO?', a: 'Open the need, use the in-app chat to coordinate pickup and confirm details.' },
          ].map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="font-[500] text-[14px] cursor-pointer list-none flex items-center justify-between">
                {item.q}
                <span className="text-[#8A8577] group-open:rotate-45 transition-transform text-lg leading-none">+</span>
              </summary>
              <p className="mt-2.5 text-[13.5px] text-[#8A8577] leading-relaxed max-w-2xl">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[#DED6C8] dark:border-[#34322C]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="font-[Fraunces,serif] font-[500] text-[1.6rem] mb-1.5">Your unused items can make someone's life better.</h2>
            <p className="text-[13.5px] text-[#8A8577]">Start by browsing current NGO needs or create an account to post what you can give.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="secondary" onClick={() => navigate('/search')}>Browse needs</Button>
            <Button variant="primary" onClick={() => navigate('/auth?register=true')}>Register</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DED6C8] dark:border-[#34322C] bg-[#F3EFE7] dark:bg-[#201E19]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
          <div className="space-y-2.5">
            <span className="font-[Fraunces,serif] font-[500] text-[15px]">Donate Bridge</span>
            <p className="text-[12.5px] text-[#8A8577] leading-relaxed">
              An item-only donation platform connecting verified NGOs with nearby donors. No cash is collected or processed on this platform.
            </p>
          </div>
          <div>
            <span className="font-[IBM_Plex_Mono,monospace] text-[10.5px] uppercase tracking-[0.08em] text-[#8A8577] block mb-3">Categories</span>
            <ul className="space-y-2 text-[12.5px] text-[#5C584F] dark:text-[#B5B0A5]">
              <li><Link to="/search?category=Books" className="hover:text-[#4A6B4E] dark:hover:text-[#8FB593]">Books & Supplies</Link></li>
              <li><Link to="/search?category=Clothes" className="hover:text-[#4A6B4E] dark:hover:text-[#8FB593]">Clothes & Blankets</Link></li>
              <li><Link to="/search?category=Food" className="hover:text-[#4A6B4E] dark:hover:text-[#8FB593]">Food</Link></li>
              <li><Link to="/search?category=Medicines" className="hover:text-[#4A6B4E] dark:hover:text-[#8FB593]">Medicines</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-[IBM_Plex_Mono,monospace] text-[10.5px] uppercase tracking-[0.08em] text-[#8A8577] block mb-3">Platform</span>
            <ul className="space-y-2 text-[12.5px] text-[#5C584F] dark:text-[#B5B0A5]">
              <li><Link to="/impact" className="hover:text-[#4A6B4E] dark:hover:text-[#8FB593]">Impact</Link></li>
              <li><Link to="/search" className="hover:text-[#4A6B4E] dark:hover:text-[#8FB593]">NGO directory</Link></li>
              <li><Link to="/auth?register=true" className="hover:text-[#4A6B4E] dark:hover:text-[#8FB593]">Register an NGO</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-[IBM_Plex_Mono,monospace] text-[10.5px] uppercase tracking-[0.08em] text-[#8A8577] block mb-3">Note</span>
            <p className="text-[12.5px] text-[#8A8577] leading-relaxed">
              This platform does not accept, process, or route money. All donations are physical items handed over directly between donor and NGO.
            </p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-5 border-t border-[#DED6C8] dark:border-[#34322C] text-[11.5px] text-[#A9A398]">
          &copy; {new Date().getFullYear()} Donate Bridge.
        </div>
      </footer>
    </div>
  );
}