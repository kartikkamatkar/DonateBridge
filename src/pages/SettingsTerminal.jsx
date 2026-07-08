import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { Settings, Sun, Eye, Bell, Lock, ToggleLeft, ToggleRight, Check, ShieldCheck } from 'lucide-react';
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

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 sm:p-8 space-y-6">
        
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> Application Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Configure system settings, alerts, accessibility parameters, and security credentials.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Theme Info card */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
            <h3 className="text-xs font-display font-bold mb-3 flex items-center gap-2 text-slate-400 uppercase tracking-wider">
              <Sun className="w-4 h-4 text-primary" /> Visual Color System
            </h3>
            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="font-semibold text-slate-900">Light Theme Only</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Custom green theme variables are loaded globally to ensure visual layout structure consistency.</p>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-1 rounded bg-[#F1F8F5] border border-emerald-100 text-primary uppercase">
                ACTIVE
              </span>
            </div>
          </div>

          {/* NGO Certification Manager shortcut if logged in user is NGO */}
          {user?.role === 'ngo' && (
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-3">
              <h3 className="text-xs font-display font-bold flex items-center gap-2 text-slate-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-primary" /> NGO Verification Certificate
              </h3>
              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-slate-900">License & Legal Declarations</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Upload audit logs, registration certificates, and contact signatures.</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/ngo-register')}
                >
                  Edit NGO Info Wizard
                </Button>
              </div>
            </div>
          )}

          {/* Accessibility card */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
            <h3 className="text-xs font-display font-bold flex items-center gap-2 text-slate-400 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-primary" /> Accessibility Configuration
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-900">Scale Text Font Size</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Adapt text sizes for visual comfort.</p>
                </div>
                <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-border">
                  {['small', 'normal', 'large'].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setTextSize(sz)}
                      className={`px-3 py-1 text-[10px] font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                        textSize === sz ? 'bg-primary text-white font-bold' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <div>
                  <p className="font-semibold text-slate-900">High Contrast Mode</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Enforces higher readability parameters.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className="focus:outline-none cursor-pointer"
                  aria-label="Toggle High Contrast Mode"
                >
                  {highContrast ? (
                    <ToggleRight className="w-9 h-9 text-primary" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Alert rules */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
            <h3 className="text-xs font-display font-bold flex items-center gap-2 text-slate-400 uppercase tracking-wider">
              <Bell className="w-4 h-4 text-primary" /> Notifications & Alerts
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-900">Email Dispatch Notifications</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Trigger alerts upon item verification checkpoint updates.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className="focus:outline-none cursor-pointer"
                  aria-label="Toggle Email Alerts"
                >
                  {emailAlerts ? (
                    <ToggleRight className="w-9 h-9 text-primary" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-300" />
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <div>
                  <p className="font-semibold text-slate-900">SMS Milestone Alerts</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">SMS updates for delay warnings and successful drop-offs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTransitAlerts(!transitAlerts)}
                  className="focus:outline-none cursor-pointer"
                  aria-label="Toggle Transit Alerts"
                >
                  {transitAlerts ? (
                    <ToggleRight className="w-9 h-9 text-primary" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security controls */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
            <h3 className="text-xs font-display font-bold flex items-center gap-2 text-slate-400 uppercase tracking-wider">
              <Lock className="w-4 h-4 text-primary" /> Security & Session Privacy
            </h3>

            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="font-semibold text-slate-900">Enforce OTP Verification Code</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Always request email OTP verification tokens during authentication.</p>
              </div>
              <button
                type="button"
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className="focus:outline-none cursor-pointer"
                aria-label="Toggle MFA Requirement"
              >
                {mfaEnabled ? (
                  <ToggleRight className="w-9 h-9 text-primary" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="submit" variant="primary" className="text-xs font-bold" icon={isSaved ? Check : undefined}>
              {isSaved ? 'Settings Saved' : 'Confirm Prefs'}
            </Button>
          </div>

        </form>

      </main>
    </div>
  );
}
