import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AlertCircle, Home, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-grow max-w-xl mx-auto w-full p-6 flex flex-col justify-center text-center space-y-6">
        
        {/* Custom graphic symbol */}
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display font-black tracking-tight text-slate-900">404: Node Missing</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            The path coordinate you requested is either moved, deprecated, or does not exist on the DonateBridge ledger index.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center max-w-xs mx-auto w-full">
          <Button variant="primary" className="w-full text-xs font-bold" onClick={() => navigate('/')} icon={Home}>
            Return Home
          </Button>
          <Button variant="secondary" className="w-full text-xs font-bold" onClick={() => navigate('/discover')} icon={Search}>
            Browse Marketplace
          </Button>
        </div>

      </main>

      <Footer />
    </div>
  );
}
