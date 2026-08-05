import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';
import { useToast } from '../ui/Toast';
import { 
  Mail, Globe, Heart, ShieldCheck, 
  Sparkles, CheckCircle2, Users, Share2, ArrowUpRight
} from 'lucide-react';

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    toast.success('Subscribed to DonateBridge updates!');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col (2 span on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Logo type="navbar" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              DonateBridge connects donors with verified non-profits in real time. Fostering transparency, efficient surplus redistribution, and sustainable community growth.
            </p>

            {/* Platform Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Systems Operational &bull; Live Sync Active</span>
            </div>

            {/* Platform Trust Icons */}
            <div className="flex gap-3 text-slate-400 pt-1">
              <Link to="/discover" aria-label="Global Directory" className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                <Globe className="w-4 h-4" />
              </Link>
              <Link to="/about" aria-label="Security Assurance" className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                <ShieldCheck className="w-4 h-4" />
              </Link>
              <Link to="/about" aria-label="Community Network" className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                <Users className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Col 1: Platform Core */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/discover" className="hover:text-emerald-400 transition-colors">Discover Directory</Link></li>
              <li><Link to="/bridge" className="hover:text-emerald-400 transition-colors">Bridge Workflows</Link></li>
              <li><Link to="/impact" className="hover:text-emerald-400 transition-colors">Impact Analytics</Link></li>
              <li><Link to="/smart-match" className="hover:text-emerald-400 transition-colors flex items-center gap-1">AI Smart Match <Sparkles className="w-3 h-3 text-amber-400" /></Link></li>
            </ul>
          </div>

          {/* Col 2: Organization */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Organization</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Support</Link></li>
              <li><Link to="/brand" className="hover:text-emerald-400 transition-colors">Brand Identity</Link></li>
              <li><Link to="/ngo-register" className="hover:text-emerald-400 transition-colors">Register NGO</Link></li>
            </ul>
          </div>

          {/* Col 3: Portals & Newsletter */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Newsletter</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Get weekly updates on local NGO demands and carbon metrics.
            </p>

            {subscribed ? (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 rounded-xl text-xs bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" /> Subscribe
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} DonateBridge Platform. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Support</Link>
          </div>

          {/* <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <span>Crafted for community impact</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div> */}
        </div>

      </div>
    </footer>
  );
}
