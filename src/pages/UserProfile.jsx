import React, { useState } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import {
  User, ShieldCheck, Download, Award, Heart, Leaf, Star,
  Lock, Settings, ArrowLeft, Mail, Phone, MapPin, Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
import Navbar from '../components/Navbar';

export default function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
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
    toast.success('Profile details saved successfully!');
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleDownload = (id) => {
    toast.info(`Downloading Tax-Exempt Physical Donation Receipt: ${id}.pdf`);
  };

  return (
    <div className="db-page min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Shared Main Navbar */}
      <Navbar />

      {/* Main Profile Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6">
        
        {/* Profile Card Header */}
        <div className="db-card bg-white border border-slate-200 rounded-lg p-6 shadow-premium-sm flex flex-col sm:flex-row items-center gap-6 animate-fadeInUp">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=donor'}
            alt="avatar"
            className="w-20 h-20 rounded-full border-2 border-blue-600 bg-white"
          />
          <div className="space-y-1 text-center sm:text-left flex-1">
            <h2 className="font-sans font-bold text-xl text-slate-900">{profileName}</h2>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1 font-mono">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email || 'sarah@donor.org'}
            </p>
            <p className="text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wider">
              ROLE: {user?.role || 'donor'} &bull; TRUST INDEX: 100%
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/settings')} icon={Settings}>
              System Prefs
            </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="db-tabs animate-fadeInUp stagger-1">
          <button
            onClick={() => setActiveTab('account')}
            className={`db-tab ${activeTab === 'account' ? 'active' : ''}`}
          >
            Account Details
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`db-tab ${activeTab === 'receipts' ? 'active' : ''}`}
          >
            Tax-Exempt Receipts ({receipts.length})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`db-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          >
            Gamified Achievements
          </button>
        </div>

        {/* Tab Panels */}
        {activeTab === 'account' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeInUp stagger-2">
            {/* Account settings forms */}
            <div className="lg:col-span-2">
              <div className="db-card bg-white border border-slate-200 rounded-lg p-6 shadow-premium-sm">
                <h3 className="font-sans font-bold text-sm mb-4 text-slate-900">Edit Profile Details</h3>
                
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

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button type="submit" variant="primary" icon={isSaved ? Check : undefined}>
                      {isSaved ? 'Details Saved' : 'Save Profile'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Security stats right */}
            <div>
              <div className="db-card bg-white border border-slate-200 rounded-lg p-6 shadow-premium-sm space-y-4">
                <h3 className="font-sans font-bold text-sm text-slate-900">Security Controls</h3>
                
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5"><Lock className="w-4 h-4 text-blue-600" /> MFA OTP</span>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold">ENABLED</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">MFA verification code requested for all profile updates.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-blue-600" /> Identity Validation</span>
                    <span className="text-[10px] text-blue-600 font-mono font-bold">VERIFIED</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Tax documentation ID verified on June 01, 2026.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="db-card bg-white border border-slate-200 rounded-lg p-6 shadow-premium-sm animate-fadeInUp stagger-2">
            <h3 className="font-sans font-bold text-sm mb-1 text-slate-900">Tax-Deductible Donation Certificates</h3>
            <p className="text-xs text-slate-500 mb-6">Only items verified by NGO digital signature ledger generate tax-exemption codes.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="p-3 font-mono font-semibold">Certificate ID</th>
                    <th className="p-3 font-semibold">Items</th>
                    <th className="p-3 font-mono font-semibold">Fulfillment Date</th>
                    <th className="p-3 font-semibold font-mono">NGO Code</th>
                    <th className="p-3 font-mono font-semibold">File Size</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((rec) => (
                    <tr key={rec.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-semibold text-slate-500">{rec.id}</td>
                      <td className="p-3 font-bold text-slate-900">{rec.item}</td>
                      <td className="p-3 font-mono text-slate-600">{rec.date}</td>
                      <td className="p-3 font-mono font-semibold text-blue-600">{rec.code}</td>
                      <td className="p-3 font-mono text-slate-500">{rec.size}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(rec.id)}
                          icon={Download}
                          className="text-[10px] py-1 border border-slate-200"
                        >
                          PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="db-card bg-white border border-slate-200 rounded-lg p-6 shadow-premium-sm space-y-6 animate-fadeInUp stagger-2">
            <div>
              <h3 className="font-sans font-bold text-sm text-slate-900">Gamified Milestones & Impact Badges</h3>
              <p className="text-xs text-slate-500">Your physical logistics history mapped to levels.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-center space-y-2 text-xs">
                <Leaf className="w-8 h-8 mx-auto text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">CO2 Offset Bronze</h4>
                <p className="text-slate-500 text-[10px] leading-relaxed">Saved over 50kg of waste burn gas emission coordinates.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-center space-y-2 text-xs">
                <Heart className="w-8 h-8 mx-auto text-red-500 animate-pulse" />
                <h4 className="font-bold text-sm text-slate-900">Critical Responder</h4>
                <p className="text-slate-500 text-[10px] leading-relaxed">Completed a shipment tagged as Critical Need in 3 hours.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-center space-y-2 text-xs">
                <Star className="w-8 h-8 mx-auto text-amber-500" />
                <h4 className="font-bold text-sm text-slate-900">Veteran Donor</h4>
                <p className="text-slate-500 text-[10px] leading-relaxed">Active account with 100% successful pickup logs.</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
