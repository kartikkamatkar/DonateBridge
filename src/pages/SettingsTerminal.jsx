import React, { useState } from 'react';
import { useTheme } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Moon, Sun, ShieldCheck, Bell, Eye,
  Lock, ArrowLeft, ToggleLeft, ToggleRight, Check, AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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
    <div className="min-h-screen bg-slate-55 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="font-bold text-sm uppercase text-slate-500">Settings Terminal</span>
      </nav>

      {/* Main Settings Panel */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6 overflow-y-auto">
        
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> Application Settings
          </h1>
          <p className="text-xs text-slate-500">Configure theme, accessibility scaling, SMS routing, and MFA preferences.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Theme Switch card */}
          <Card className="p-5 border border-slate-200 dark:border-slate-750">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Sun className="w-4 h-4 text-primary" /> Interface Color Mode
            </h3>
            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="font-bold">Dark Theme Toggle</p>
                <p className="text-[10px] text-slate-500">Use canvas dark themes for low light coordinates.</p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="focus:outline-none"
                aria-label="Toggle Theme Mode"
              >
                {theme === 'dark' ? (
                  <ToggleRight className="w-9 h-9 text-primary" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-400" />
                )}
              </button>
            </div>
          </Card>

          {/* Accessibility card */}
          <Card className="p-5 border border-slate-200 dark:border-slate-750 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" /> Accessibility Layout Overrides
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">Scale Text Font Size</p>
                  <p className="text-[10px] text-slate-500">Multiply textual line-height dimensions.</p>
                </div>
                <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded">
                  {['small', 'normal', 'large'].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setTextSize(sz)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded capitalize ${
                        textSize === sz ? 'bg-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-bold">High Contrast Mode</p>
                  <p className="text-[10px] text-slate-500">Increase outline contrast compliance ratio to WCAG AAA anchor.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className="focus:outline-none"
                  aria-label="Toggle High Contrast Mode"
                >
                  {highContrast ? (
                    <ToggleRight className="w-9 h-9 text-primary" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </Card>

          {/* Alert rule toggles */}
          <Card className="p-5 border border-slate-200 dark:border-slate-750 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> Notification Delivery Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">Transit Milestone Alert Emails</p>
                  <p className="text-[10px] text-slate-500">Deliver notifications upon dispatch and signature ledger logs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className="focus:outline-none"
                  aria-label="Toggle Email Alerts"
                >
                  {emailAlerts ? (
                    <ToggleRight className="w-9 h-9 text-primary" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-bold">Transit Delay Alerts</p>
                  <p className="text-[10px] text-slate-500">SMS coordinates triggers regarding traffic block delays.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTransitAlerts(!transitAlerts)}
                  className="focus:outline-none"
                  aria-label="Toggle Transit Alerts"
                >
                  {transitAlerts ? (
                    <ToggleRight className="w-9 h-9 text-primary" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </Card>

          {/* Security details configuration */}
          <Card className="p-5 border border-slate-200 dark:border-slate-750 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" /> Identity Credentials Security
            </h3>

            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="font-bold">Require 6-digit MFA OTP Code</p>
                <p className="text-[10px] text-slate-500">Verify email OTP tokens for every dashboard access session.</p>
              </div>
              <button
                type="button"
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className="focus:outline-none"
                aria-label="Toggle MFA Requirement"
              >
                {mfaEnabled ? (
                  <ToggleRight className="w-9 h-9 text-primary" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-400" />
                )}
              </button>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" variant="primary" icon={isSaved ? Check : undefined}>
              {isSaved ? 'Settings Saved' : 'Confirm Prefs'}
            </Button>
          </div>

        </form>

      </main>
    </div>
  );
}
