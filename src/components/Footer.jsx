import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { Mail, Globe, ShieldCheck, Users, Heart } from 'lucide-react';

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('Successfully subscribed to the DonateBridge impact bulletin!');
    setEmail('');
  };

  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Top Split */}
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          
          {/* Logo & description */}
          <div className="space-y-4 max-w-sm">
            <Logo type="navbar" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Bridging Donors with NGOs, One Donation at a Time. Fostering a sustainable circular economy.
            </p>
            <div className="flex gap-3 text-slate-400">
              <a href="#" className="hover:text-primary transition-colors"><Globe className="w-4 h-4" /></a>
              <a href="#" className="hover:text-primary transition-colors"><ShieldCheck className="w-4 h-4" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Users className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick links columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400">Platform</h4>
              <ul className="space-y-2">
                <li><Link to="/discover" className="text-slate-500 hover:text-primary">Discover Directory</Link></li>
                <li><Link to="/bridge" className="text-slate-500 hover:text-primary">Bridge Workflows</Link></li>
                <li><Link to="/impact" className="text-slate-500 hover:text-primary">Impact Metrics</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-slate-500 hover:text-primary">About Us</Link></li>
                <li><Link to="/contact" className="text-slate-500 hover:text-primary">Contact Support</Link></li>
                <li><Link to="/brand" className="text-slate-500 hover:text-primary">Brand Guidelines</Link></li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400">Subscribe</h4>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none"
                  required
                />
                <Button type="submit" variant="primary" className="w-full text-[10px] font-bold uppercase py-1.5" icon={Mail}>
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400">
          <p>&copy; {new Date().getFullYear()} DonateBridge. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Cookie Settings</a>
          </div>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-primary fill-current" /> for community growth
          </p>
        </div>

      </div>
    </footer>
  );
}
