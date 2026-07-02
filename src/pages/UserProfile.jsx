import React, { useState } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import {
  User, ShieldCheck, Download, Award, Heart, Leaf, Star,
  Lock, Settings, ArrowLeft, Mail, Phone, MapPin, Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';

export default function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'receipts' | 'achievements'
  const [profileName, setProfileName] = useState(user?.name || 'Sarah Jenkins');
  const [profilePhone, setProfilePhone] = useState('+1 (555) 019-2831');
  const [profileLocation, setProfileLocation] = useState('East End, Sector 4');
  const [isSaved, setIsSaved] = useState(false);

  // Downloadable tax-exempt receipt logs
  const [receipts] = useState([
    { id: 'TX-9901', item: '25 Wool Blankets', date: '2026-06-25', size: '148 KB', code: '501C3-Hope' },
    { id: 'TX-9844', item: '40 School Textbooks', date: '2026-06-18', size: '162 KB', code: '501C3-Green' },
    { id: 'TX-9721', item: '1 Oxygen Concentrator', date: '2026-05-10', size: '135 KB', code: '501C3-Hope' },
  ]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleDownload = (id) => {
    // Mock PDF download trigger
    alert(`Downloading Tax-Exempt Physical Donation Receipt: ${id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-55 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Header Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="font-bold text-sm uppercase text-slate-500">Identity Panel</span>
      </nav>

      {/* Main Profile Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6 overflow-y-auto">
        
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-premium-sm flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=donor'}
            alt="avatar"
            className="w-20 h-20 rounded-full border-2 border-primary bg-slate-50"
          />
          <div className="space-y-1 text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profileName}</h2>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email || 'sarah@donor.org'}
            </p>
            <p className="text-[10px] text-slate-450 uppercase font-semibold">
              ROLE: {user?.role || 'donor'} ACCOUNT &bull; TRUST INDEX: 100%
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/settings')} icon={Settings}>
              System Prefs
            </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'account' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Account Details
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'receipts' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Tax-Exempt Receipts ({receipts.length})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'achievements' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Gamified Achievements
          </button>
        </div>

        {/* Tab Panels */}
        {activeTab === 'account' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account settings forms */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="font-bold text-sm mb-4">Edit Profile details</h3>
                
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <InputField
                    label="Full Name / Display Title"
                    id="profileName"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Contact Telephone"
                      id="profilePhone"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      required
                    />
                    <InputField
                      label="Location Coordinates"
                      id="profileLocation"
                      value={profileLocation}
                      onChange={(e) => setProfileLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="submit" variant="primary" icon={isSaved ? Check : undefined}>
                      {isSaved ? 'Details Saved' : 'Save Profiles'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Security stats right */}
            <div>
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-sm">Security Controls</h3>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold flex items-center gap-1.5"><Lock className="w-4 h-4 text-primary" /> MFA Secure Code</span>
                    <span className="text-[10px] text-emerald-500 font-bold">ENABLED</span>
                  </div>
                  <p className="text-[10px] text-slate-500">MFA verification code requested for all profile updates.</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Identity verification</span>
                    <span className="text-[10px] text-emerald-500 font-bold">VERIFIED</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Tax documentation ID verified on June 01, 2026.</p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'receipts' && (
          <Card className="p-6">
            <h3 className="font-bold text-sm mb-2">Tax-Deductible Donation Certificates</h3>
            <p className="text-xs text-slate-500 mb-6 font-semibold text-emerald-650">
              Only items verified by NGO digital signature ledger generate tax-exemption codes.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-350">
                    <th className="p-3 font-semibold">Certificate ID</th>
                    <th className="p-3 font-semibold">Items</th>
                    <th className="p-3 font-semibold">Fulfillment Date</th>
                    <th className="p-3 font-semibold">NGO Authority</th>
                    <th className="p-3 font-semibold">File Size</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((rec) => (
                    <tr key={rec.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-350">{rec.id}</td>
                      <td className="p-3 font-semibold">{rec.item}</td>
                      <td className="p-3 font-mono">{rec.date}</td>
                      <td className="p-3 font-semibold text-primary">{rec.code}</td>
                      <td className="p-3 font-mono">{rec.size}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(rec.id)}
                          icon={Download}
                          className="text-[10px] py-1 border border-slate-200 dark:border-slate-700"
                        >
                          PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'achievements' && (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="font-bold text-sm">Gamified Milestones & Impact Badges</h3>
              <p className="text-xs text-slate-500">Your physical logistics history mapped to levels.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center space-y-2 text-xs">
                <Leaf className="w-8 h-8 mx-auto text-emerald-500" />
                <h4 className="font-bold">CO2 Offset Bronze</h4>
                <p className="text-slate-500 text-[10px]">Saved over 50kg of waste burn gas emission coordinates.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center space-y-2 text-xs">
                <Heart className="w-8 h-8 mx-auto text-red-500" />
                <h4 className="font-bold">Critical responder</h4>
                <p className="text-slate-500 text-[10px]">Completed a shipment tagged as Critical Need in 3 hours.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center space-y-2 text-xs">
                <Star className="w-8 h-8 mx-auto text-amber-500" />
                <h4 className="font-bold">Veteran Donor</h4>
                <p className="text-slate-500 text-[10px]">Active account with 100% successful pickup logs.</p>
              </div>
            </div>
          </Card>
        )}

      </main>
    </div>
  );
}
