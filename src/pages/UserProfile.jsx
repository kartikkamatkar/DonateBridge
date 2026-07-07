import React, { useState } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { Download, ShieldCheck, Lock, Mail, Star, Heart, Leaf, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 sm:p-8 space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=donor'}
            alt="avatar"
            className="w-20 h-20 rounded-full border border-border bg-slate-50"
          />
          <div className="space-y-1 text-center sm:text-left flex-1">
            <h2 className="text-xl font-display font-bold text-ink">{profileName}</h2>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1 font-mono">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email || 'sarah@donor.org'}
            </p>
            <p className="text-[10px] text-slate-400 uppercase font-mono mt-1 font-bold tracking-wider">
              ROLE: {user?.role || 'donor'} &bull; TRUST VALUE: 100%
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="text-xs font-semibold" onClick={() => navigate('/settings')}>
              System Preferences
            </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border gap-2">
          {['account', 'receipts', 'achievements'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-slate-500 hover:text-ink'
              }`}
            >
              {tab === 'account' ? 'Account details' : tab === 'receipts' ? `Tax Receipts (${receipts.length})` : 'Achievements'}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        {activeTab === 'account' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
                <h3 className="text-sm font-display font-bold mb-4 text-ink">Edit Profile Details</h3>
                
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
                      label="Location Area"
                      id="profileLocation"
                      value={profileLocation}
                      onChange={(e) => setProfileLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button type="submit" variant="primary" className="text-xs font-bold" icon={isSaved ? Check : undefined}>
                      {isSaved ? 'Saved' : 'Save Profile'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Security stats right */}
            <div>
              <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-4">
                <h3 className="text-sm font-display font-bold text-ink">Security Compliance</h3>
                
                <div className="p-4 bg-slate-50 border border-border rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5"><Lock className="w-4 h-4 text-primary" /> OTP Bypass</span>
                    <span className="text-[10px] text-primary font-mono font-bold">ENABLED</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">OTP authentication codes enabled for secure updates validation.</p>
                </div>

                <div className="p-4 bg-slate-50 border border-border rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> ID Verified</span>
                    <span className="text-[10px] text-primary font-mono font-bold">VERIFIED</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">System documentation files validated by Admin on June 01, 2026.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Receipts */}
        {activeTab === 'receipts' && (
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
            <h3 className="text-sm font-display font-bold mb-1 text-ink uppercase tracking-wider">Tax Exemption Certificates</h3>
            <p className="text-xs text-slate-500 mb-6">Only items verified by NGO digital signature ledger generate tax-exemption codes.</p>

            <div className="overflow-hidden border border-border rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-slate-50 text-slate-600 font-semibold">
                      <th className="p-4">Certificate ID</th>
                      <th className="p-4">Items Summary</th>
                      <th className="p-4">Fulfillment Date</th>
                      <th className="p-4">NGO Code</th>
                      <th className="p-4">File Size</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {receipts.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono font-semibold text-slate-500">{rec.id}</td>
                        <td className="p-4 font-bold text-ink">{rec.item}</td>
                        <td className="p-4 font-mono text-slate-500">{rec.date}</td>
                        <td className="p-4 font-mono font-bold text-primary">{rec.code}</td>
                        <td className="p-4 font-mono text-slate-500">{rec.size}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDownload(rec.id)}
                            className="px-3 py-1.5 border border-border bg-white hover:bg-slate-50 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                          >
                            PDF Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Achievements */}
        {activeTab === 'achievements' && (
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-6">
            <div>
              <h3 className="text-sm font-display font-bold text-ink uppercase tracking-wider">Eco Achievements</h3>
              <p className="text-xs text-slate-500">Your physical logistics history mapped to levels.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-50 border border-border rounded-xl text-center space-y-2 text-xs">
                <Leaf className="w-8 h-8 mx-auto text-[#2E7D32]" />
                <h4 className="font-display font-bold text-sm text-slate-800">CO2 Offset Bronze</h4>
                <p className="text-slate-500 text-[10px] leading-relaxed mt-1">Saved over 50kg of carbon gas emission coordinates.</p>
              </div>

              <div className="p-5 bg-slate-50 border border-border rounded-xl text-center space-y-2 text-xs">
                <Heart className="w-8 h-8 mx-auto text-red-500" />
                <h4 className="font-display font-bold text-sm text-slate-800">Critical Responder</h4>
                <p className="text-slate-500 text-[10px] leading-relaxed mt-1">Completed a shipment tagged as Critical Need in 3 hours.</p>
              </div>

              <div className="p-5 bg-slate-50 border border-border rounded-xl text-center space-y-2 text-xs">
                <Star className="w-8 h-8 mx-auto text-amber-500" />
                <h4 className="font-display font-bold text-sm text-slate-800">Veteran Donor</h4>
                <p className="text-slate-500 text-[10px] leading-relaxed mt-1">Active account with 100% successful pickup logs.</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
