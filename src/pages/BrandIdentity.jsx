import React from 'react';
import Navbar from '../components/layout/Navbar';
import Logo from '../components/Logo';
import { Copy, ShieldCheck, ArrowRight, Download, Info } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export default function BrandIdentity() {
  const { toast } = useToast();

  const handleCopy = (txt) => {
    navigator.clipboard.writeText(txt);
    toast.success(`Copied: ${txt}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-8 space-y-8">
        
        {/* Header summary */}
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900">Brand Identity & Visual System</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Design tokens, spacing structures, and svg assets for DonateBridge.</p>
        </div>

        {/* Logo variants container */}
        <section className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-6">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Logo Family System</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Navbar Logo */}
            <div className="p-5 border border-border rounded-xl flex flex-col items-center justify-between min-h-[160px] bg-slate-50">
              <Logo type="navbar" />
              <div className="text-center mt-4">
                <span className="text-[10px] font-mono text-slate-400 block font-bold">NAVBAR LOGO</span>
                <button
                  onClick={() => handleCopy('<Logo type="navbar" />')}
                  className="text-[9px] font-mono text-primary font-bold hover:underline mt-1 block"
                >
                  Copy Component
                </button>
              </div>
            </div>

            {/* Icon Only Logo */}
            <div className="p-5 border border-border rounded-xl flex flex-col items-center justify-between min-h-[160px] bg-slate-50">
              <Logo type="icon" size="lg" />
              <div className="text-center mt-4">
                <span className="text-[10px] font-mono text-slate-400 block font-bold">ICON ONLY</span>
                <button
                  onClick={() => handleCopy('<Logo type="icon" size="lg" />')}
                  className="text-[9px] font-mono text-primary font-bold hover:underline mt-1 block"
                >
                  Copy Component
                </button>
              </div>
            </div>

            {/* Horizontal Logo */}
            <div className="p-5 border border-border rounded-xl flex flex-col items-center justify-between min-h-[160px] bg-slate-50">
              <Logo type="horizontal" size="md" />
              <div className="text-center mt-4">
                <span className="text-[10px] font-mono text-slate-400 block font-bold">HORIZONTAL LOGO</span>
                <button
                  onClick={() => handleCopy('<Logo type="horizontal" size="md" />')}
                  className="text-[9px] font-mono text-primary font-bold hover:underline mt-1 block"
                >
                  Copy Component
                </button>
              </div>
            </div>

            {/* Vertical Logo */}
            <div className="p-5 border border-border rounded-xl flex flex-col items-center justify-between min-h-[160px] bg-slate-50">
              <Logo type="vertical" size="sm" />
              <div className="text-center mt-4">
                <span className="text-[10px] font-mono text-slate-400 block font-bold">VERTICAL LOGO</span>
                <button
                  onClick={() => handleCopy('<Logo type="vertical" size="sm" />')}
                  className="text-[9px] font-mono text-primary font-bold hover:underline mt-1 block"
                >
                  Copy Component
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Color Palette Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Brand Color Tokens</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Primary Green</p>
                    <p className="text-[10px] text-slate-400 font-mono">#2E7D32</p>
                  </div>
                </div>
                <button onClick={() => handleCopy('#2E7D32')} className="p-2 hover:bg-slate-50 rounded-lg">
                  <Copy className="w-4 h-4 text-slate-400 hover:text-ink" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#43A047] shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Secondary Green</p>
                    <p className="text-[10px] text-slate-400 font-mono">#43A047</p>
                  </div>
                </div>
                <button onClick={() => handleCopy('#43A047')} className="p-2 hover:bg-slate-50 rounded-lg">
                  <Copy className="w-4 h-4 text-slate-400 hover:text-ink" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#4CAF50] shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Accent Green</p>
                    <p className="text-[10px] text-slate-400 font-mono">#4CAF50</p>
                  </div>
                </div>
                <button onClick={() => handleCopy('#4CAF50')} className="p-2 hover:bg-slate-50 rounded-lg">
                  <Copy className="w-4 h-4 text-slate-400 hover:text-ink" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Typography Stack Hierarchy</h2>
            
            <div className="space-y-4 text-xs">
              <div className="border-b border-border pb-3">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Font Family</span>
                <p className="text-sm font-semibold text-slate-900 mt-1">Inter, Geist, Manrope, SF Pro Display</p>
              </div>
              <div className="border-b border-border pb-3">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Display Titles</span>
                <p className="text-xl font-display font-bold text-slate-900 mt-1">Large Display Heading</p>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Monospace/Labels</span>
                <p className="text-[10px] font-mono text-slate-500 font-bold uppercase mt-1">TRACKING_CODE_REF_9902</p>
              </div>
            </div>
          </div>

        </section>

        {/* Brand Spacing & Usage Guidelines */}
        <section className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-6">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Brand Usage Rules & Spacing Guidelines</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800">Clear Space Minimum</h4>
              <p>Maintain a margin of at least 25% of the logo symbol's height around all four sides of the vector mark to ensure optimal visibility and layout balance.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800">Visual Restrictions</h4>
              <p>Do not skew, stretch, or alter the color parameters of the icon elements. The interior heart/leaf components must remain aligned with the base coordinate bridge.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800">System Spacing</h4>
              <p>Follow an strict 8px grid alignment (1/2rem, 1rem, 1.5rem spacing) for surrounding containers, keeping the user interfaces clean and aligned like Stripe or Linear.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
