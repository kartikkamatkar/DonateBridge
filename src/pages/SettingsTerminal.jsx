import React, { useState } from 'react';
import { useTheme } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Moon, Sun, ShieldCheck, Bell, Eye,
  Lock, ArrowLeft, ToggleLeft, ToggleRight, Check, AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import Navbar from '../components/Navbar';

export default function SettingsTerminal() {
  const { theme, toggleTheme } = useTheme();
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
    <div className="db-page min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Shared Main Navbar */}
      <Navbar />

      {/* Main Settings Panel */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6 overflow-y-auto">
        
        <div className="animate-fadeInUp">
          <h1 className="font-sans font-bold text-xl flex items-center gap-2 text-slate-900">
            <Settings className="w-5 h-5 text-blue-600" /> Application Settings
          </h1>
          <p className="text-xs text-slate-500">Configure theme, accessibility scaling, SMS routing, and MFA preferences.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6 animate-fadeInUp stagger-1">
          
          {/* Theme Info card */}
          <div className="db-card bg-white border border-slate-200 rounded-lg p-6 shadow-premium-sm">
            <h3 className="font-sans font-bold text-sm mb-3 flex items-center gap-2 text-slate-900">
              <Sun className="w-4 h-4 text-blue-600" /> Interface Color Mode
            </h3>
            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-900">Light Theme Only</p>
                <p className="text-[10px] text-slate-500">Dark mode support has been decommissioned for absolute ledger visual consistency.</p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Accessibility card */}
          <div className="db-card bg-white border border-slate-200 rounded-lg p-6 shadow-premium-sm space-y-4">
            <h3 className="font-sans font-bold text-sm flex items-center gap-2 text-slate-900 text-amber-600">
              <Eye className="w-4 h-4 text-amber-600" /> Accessibility Layout Overrides
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Scale Text Font Size</p>
                  <p className="text-[10px] text-slate-500">Multiply textual line-height dimensions.</p>
                </div>
                <div className="flex gap-1 bg-slate-50 p-1 rounded-md border border-slate-200 shadow-premium-xs">
                  {['small', 'normal', 'large'].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setTextSize(sz)}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md capitalize transition-all cursor-pointer ${
                        textSize === sz ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">High Contrast Mode</p>
                  <p className="text-[10px] text-slate-500">Increase outline contrast compliance ratio to WCAG AAA anchor.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className="focus:outline-none cursor-pointer"
                  aria-label="Toggle High Contrast Mode"
                >
                  {highContrast ? (
                    <ToggleRight className="w-9 h-9 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Alert rule toggles */}
          <div className="db-card bg-white border border-slate-200 rounded-lg p-6 shadow-premium-sm space-y-4">
            <h3 className="font-sans font-bold text-sm flex items-center gap-2 text-slate-900">
              <Bell className="w-4 h-4 text-blue-600" /> Notification Delivery Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Transit Milestone Alert Emails</p>
                  <p className="text-[10px] text-slate-500">Deliver notifications upon dispatch and signature ledger logs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className="focus:outline-none cursor-pointer"
                  aria-label="Toggle Email Alerts"
                >
                  {emailAlerts ? (
                    <ToggleRight className="w-9 h-9 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">Transit Delay Alerts</p>
                  <p className="text-[10px] text-slate-500">SMS coordinates triggers regarding traffic block delays.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTransitAlerts(!transitAlerts)}
                  className="focus:outline-none cursor-pointer"
                  aria-label="Toggle Transit Alerts"
                >
                  {transitAlerts ? (
                    <ToggleRight className="w-9 h-9 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security details configuration */}
          <div className="db-card bg-white border border-slate-200 rounded-lg p-6 shadow-premium-sm space-y-4">
            <h3 className="font-sans font-bold text-sm flex items-center gap-2 text-slate-900">
              <Lock className="w-4 h-4 text-blue-600" /> Identity Credentials Security
            </h3>

            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-800">Require 6-digit MFA OTP Code</p>
                <p className="text-[10px] text-slate-500">Verify email OTP tokens for every dashboard access session.</p>
              </div>
              <button
                type="button"
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className="focus:outline-none cursor-pointer"
                aria-label="Toggle MFA Requirement"
              >
                {mfaEnabled ? (
                  <ToggleRight className="w-9 h-9 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="submit" variant="primary" icon={isSaved ? Check : undefined}>
              {isSaved ? 'Settings Saved' : 'Confirm Prefs'}
            </Button>
          </div>

        </form>

      </main>
    </div>
  );
}
