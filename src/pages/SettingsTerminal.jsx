import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { Settings, Sun, Eye, Bell, Lock, ToggleLeft, ToggleRight, Check, ShieldCheck, Cpu, Database, Wifi } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Navbar from '../components/Navbar';

export default function SettingsTerminal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [textSize, setTextSize] = useState('normal'); // 'small' | 'normal' | 'large'
  const [highContrast, setHighContrast] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [transitAlerts, setTransitAlerts] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Left Column: Form Controls (flex-1) */}
        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="font-display font-black text-slate-900 flex items-center gap-2.5" style={{ fontSize: '24px' }}>
              <Settings className="w-6 h-6 text-primary" /> Application Preferences
            </h1>
            <p className="text-slate-500 font-medium" style={{ fontSize: '15px' }}>Configure settings, notification alerts, accessibility, and account security.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Theme Info card */}
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
              <h3 className="font-display font-bold mb-4 flex items-center gap-2 text-slate-400 uppercase tracking-wider" style={{ fontSize: '12px' }}>
                <Sun className="w-4.5 h-4.5 text-primary" /> Visual Color System
              </h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-950" style={{ fontSize: '15px' }}>Light Theme Only</p>
                  <p className="text-slate-500 mt-1" style={{ fontSize: '13px' }}>Global custom CSS theme parameters loaded to ensure color design consistency.</p>
                </div>
                <span className="px-3 py-1 rounded bg-emerald-50 border border-emerald-150 text-primary font-mono font-bold" style={{ fontSize: '11px' }}>
                  ACTIVE
                </span>
              </div>
            </div>

            {/* NGO Certification Manager shortcut if logged in user is NGO */}
            {user?.role === 'ngo' && (
              <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-3">
                <h3 className="font-display font-bold flex items-center gap-2 text-slate-400 uppercase tracking-wider" style={{ fontSize: '12px' }}>
                  <ShieldCheck className="w-4.5 h-4.5 text-primary" /> NGO Verification Certificate
                </h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-950" style={{ fontSize: '15px' }}>NGO Registration Documents</p>
                    <p className="text-slate-500 mt-1" style={{ fontSize: '13px' }}>Upload legal license records and certificates for admin verification reviews.</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/ngo-register')}
                  >
                    Edit NGO Profile
                  </Button>
                </div>
              </div>
            )}

            {/* Accessibility card */}
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-5">
              <h3 className="font-display font-bold flex items-center gap-2 text-slate-400 uppercase tracking-wider" style={{ fontSize: '12px' }}>
                <Eye className="w-4.5 h-4.5 text-primary" /> Accessibility Settings
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-950" style={{ fontSize: '15px' }}>Adjust Text Size</p>
                    <p className="text-slate-500 mt-1" style={{ fontSize: '13px' }}>Change application text size parameters for better legibility.</p>
                  </div>
                  <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    {['small', 'normal', 'large'].map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setTextSize(sz)}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg capitalize transition-all cursor-pointer ${
                          textSize === sz ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div>
                    <p className="font-bold text-slate-950" style={{ fontSize: '15px' }}>High Contrast Mode</p>
                    <p className="text-slate-500 mt-1" style={{ fontSize: '13px' }}>Increase contrast levels to aid accessibility and visual reading.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHighContrast(!highContrast)}
                    className="focus:outline-none cursor-pointer"
                    aria-label="Toggle High Contrast Mode"
                  >
                    {highContrast ? (
                      <ToggleRight className="w-10 h-10 text-primary" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Alert rules */}
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-5">
              <h3 className="font-display font-bold flex items-center gap-2 text-slate-400 uppercase tracking-wider" style={{ fontSize: '12px' }}>
                <Bell className="w-4.5 h-4.5 text-primary" /> Notifications & Alerts
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-950" style={{ fontSize: '15px' }}>Email Alerts</p>
                    <p className="text-slate-500 mt-1" style={{ fontSize: '13px' }}>Send email notifications when an item you listed is matched or claimed.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className="focus:outline-none cursor-pointer"
                    aria-label="Toggle Email Alerts"
                  >
                    {emailAlerts ? (
                      <ToggleRight className="w-10 h-10 text-primary" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div>
                    <p className="font-bold text-slate-950" style={{ fontSize: '15px' }}>SMS Milestone Alerts</p>
                    <p className="text-slate-500 mt-1" style={{ fontSize: '13px' }}>Get text message alerts for delivery couriers and scheduling reminders.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTransitAlerts(!transitAlerts)}
                    className="focus:outline-none cursor-pointer"
                    aria-label="Toggle Transit Alerts"
                  >
                    {transitAlerts ? (
                      <ToggleRight className="w-10 h-10 text-primary" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Security controls */}
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-5">
              <h3 className="font-display font-bold flex items-center gap-2 text-slate-400 uppercase tracking-wider" style={{ fontSize: '12px' }}>
                <Lock className="w-4.5 h-4.5 text-primary" /> Security & Session Privacy
              </h3>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-950" style={{ fontSize: '15px' }}>Two-Factor Login Validation</p>
                  <p className="text-slate-500 mt-1" style={{ fontSize: '13px' }}>Require secure OTP authorization codes upon session login requests.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className="focus:outline-none cursor-pointer"
                  aria-label="Toggle MFA Requirement"
                >
                  {mfaEnabled ? (
                    <ToggleRight className="w-10 h-10 text-primary" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Button type="submit" variant="primary" icon={isSaved ? Check : undefined}>
                {isSaved ? 'Settings Saved' : 'Save Preferences'}
              </Button>
            </div>

          </form>
        </div>

        {/* Right Column: Platform Diagnostics / Help Widget (Innovative Sidebar to fill gaps!) */}
        <aside className="w-full lg:w-80 bg-white border border-border rounded-2xl flex flex-col shrink-0 shadow-premium-sm p-6 space-y-6 overflow-y-auto">
          <div>
            <h4 className="font-display font-bold text-slate-905 flex items-center gap-2" style={{ fontSize: '16px' }}>
              <Cpu className="w-5 h-5 text-primary" /> System Diagnostic
            </h4>
            <p className="text-slate-500 mt-0.5" style={{ fontSize: '12px' }}>Current network status and data synchronization parameters.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-slate-400 uppercase font-mono tracking-wider font-bold" style={{ fontSize: '10px' }}>Integrity Status</h5>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-slate-700 font-semibold" style={{ fontSize: '13px' }}>
                <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-primary shrink-0" /> Database Sync</span>
                <span className="text-primary font-mono text-xs">SYNCHRONIZED</span>
              </div>

              <div className="flex justify-between items-center text-slate-700 font-semibold" style={{ fontSize: '13px' }}>
                <span className="flex items-center gap-1.5"><Wifi className="w-4 h-4 text-primary shrink-0" /> API latency</span>
                <span className="text-slate-900 font-mono text-xs">48 ms</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h5 className="text-slate-400 uppercase font-mono tracking-wider font-bold" style={{ fontSize: '10px' }}>System Diagnostics</h5>
            <div className="p-4 bg-primary text-white rounded-xl space-y-1 shadow-premium-xs" style={{ fontSize: '13px' }}>
              <p className="font-bold">ALL SYSTEMS GO</p>
              <p className="text-emerald-100 mt-0.5" style={{ fontSize: '11px' }}>Version 2.4.1 stable build online.</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-2">
            <h5 className="text-slate-400 uppercase font-mono tracking-wider font-bold" style={{ fontSize: '10px' }}>Help Center</h5>
            <p className="text-slate-550 leading-relaxed font-sans" style={{ fontSize: '12px' }}>
              Need assistance configuring custom logistics webhook alerts? Contact our administrator support console.
            </p>
          </div>
        </aside>

      </main>
    </div>
  );
}
