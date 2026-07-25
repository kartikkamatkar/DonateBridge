import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { Download, ShieldCheck, Lock, Mail, Star, Heart, Leaf, Check, Activity, Sparkles, MapPin, Phone, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import Navbar from '../components/layout/Navbar';
import { authAPI, getApiError } from '../api/index';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('account');
  const [profileName, setProfileName] = useState(user?.name || 'Sarah Jenkins');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+1 (555) 019-2831');
  const [profileLocation, setProfileLocation] = useState(user?.location || 'East End, Sector 4');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileLocation(user.location || '');
    }
  }, [user]);

  const [receipts] = useState([
    { id: 'TX-9901', item: '25 Wool Blankets', date: '2026-06-25', size: '148 KB', code: '501C3-Hope' },
    { id: 'TX-9844', item: '40 School Textbooks', date: '2026-06-18', size: '162 KB', code: '501C3-Green' },
    { id: 'TX-9721', item: '1 Oxygen Concentrator', date: '2026-05-10', size: '135 KB', code: '501C3-Hope' },
  ]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await authAPI.updateMe({
        name: profileName,
        phone: profilePhone,
        location: profileLocation
      });
      setIsSaved(true);
      toast.success('Profile details saved successfully!');
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = (id) => {
    toast.info(`Downloading Receipt: ${id}.pdf`);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const contributionGrid = Array.from({ length: 52 }, (_, i) => {
    const weights = [0, 0, 0, 1, 0, 2, 0, 0, 3, 0, 0, 1, 0, 0, 2, 0, 0, 0, 4, 0, 1];
    return weights[i % weights.length];
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] selection:bg-emerald-500/30">
      <Navbar />

      {/* Hero Header Section */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden bg-slate-900 rounded-b-[3rem] lg:rounded-b-[5rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-900 opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-[800px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-20 -mt-40 md:-mt-48 relative z-10 space-y-8">
        
        {/* Profile Card Overlay */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-2xl shadow-slate-200/50"
        >
          {/* Glassmorphic Shine */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=donor&backgroundColor=e2e8f0'}
              alt="avatar"
              className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-white shadow-xl relative z-10 bg-slate-100 object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="space-y-5 text-center md:text-left flex-1 min-w-0 z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 tracking-tight">{profileName}</h2>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 rounded-full font-bold text-xs uppercase tracking-widest mt-2 md:mt-0">
                <Sparkles className="w-3.5 h-3.5" />
                Level 4 Donor
              </span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-slate-600 font-medium text-sm">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-500" /> {user?.email || 'sarah@donor.org'}</span>
              <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-500" /> {profilePhone}</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> {profileLocation}</span>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 hover:shadow-md hover:border-emerald-200 transition-all">
                <span className="text-3xl font-black text-slate-800">12</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Total<br/>Dispatches</span>
              </div>
              <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 hover:shadow-md hover:border-emerald-200 transition-all">
                <span className="text-3xl font-black text-emerald-600">1.2k</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Eco<br/>Points</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0 z-10">
            {user?.role === 'ngo' && (
              <Button variant="primary" onClick={() => navigate('/ngo-register')} className="shadow-lg shadow-emerald-500/20 h-12 px-6 rounded-xl font-bold">
                Manage NGO License
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate('/settings')} className="bg-white hover:bg-slate-50 h-12 px-6 rounded-xl font-bold border border-slate-200 shadow-sm">
              Account Preferences
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:bg-red-50 hover:text-red-600 h-12 px-6 rounded-xl font-bold flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </motion.div>

        {/* Tab Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex p-2 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-[1.25rem] w-full max-w-2xl mx-auto md:mx-0 overflow-x-auto hide-scrollbar shadow-sm"
        >
          {['account', 'receipts', 'achievements'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[140px] px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 relative ${
                activeTab === tab
                  ? 'text-slate-900 shadow-sm bg-white'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50 -z-10" />
              )}
              {tab === 'account' ? 'Profile Details' : tab === 'receipts' ? 'Tax Receipts' : 'Achievements'}
            </button>
          ))}
        </motion.div>

        {/* Tab Panels */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'account' && (
              <motion.div 
                key="account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                
                <div className="lg:col-span-8 space-y-8">
                  {/* Form Card */}
                  <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <h3 className="text-2xl font-display font-black text-slate-900 mb-8 relative z-10 tracking-tight">Personal Information</h3>
                    
                    <form onSubmit={handleSaveProfile} className="space-y-6 relative z-10">
                      <InputField
                        label="Full Name / Brand Title"
                        id="profileName"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                        className="!bg-slate-50 border-slate-200 rounded-xl"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputField
                          label="Contact Telephone"
                          id="profilePhone"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          required
                          className="!bg-slate-50 border-slate-200 rounded-xl"
                        />
                        <InputField
                          label="Location Area"
                          id="profileLocation"
                          value={profileLocation}
                          onChange={(e) => setProfileLocation(e.target.value)}
                          required
                          className="!bg-slate-50 border-slate-200 rounded-xl"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit" variant="primary" icon={isSaved ? Check : undefined} loading={isSaving} className="px-8 h-12 text-sm font-bold shadow-lg shadow-emerald-500/25 rounded-xl transition-all">
                          {isSaved ? 'Details Saved' : isSaving ? 'Saving…' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Heatmap Card */}
                  <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-50 rounded-full blur-[60px] opacity-60" />
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4 relative z-10">
                      <div>
                        <h4 className="text-xl font-display font-black text-slate-900 flex items-center gap-2 tracking-tight">
                          <Activity className="w-6 h-6 text-emerald-500" /> Dispatch Heatmap
                        </h4>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Your logistics contribution frequency mapped across 52 weeks.</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">12 Active Weeks</span>
                    </div>

                    <div className="border border-slate-100 p-6 rounded-3xl bg-slate-50/50 shadow-inner relative z-10">
                      <div className="grid grid-cols-13 gap-2">
                        {contributionGrid.map((level, idx) => (
                          <div
                            key={idx}
                            className={`aspect-square rounded-md transition-all duration-300 hover:scale-125 cursor-pointer ${
                              level === 0 ? 'bg-slate-200/70 hover:bg-slate-300' :
                              level === 1 ? 'bg-emerald-200' :
                              level === 2 ? 'bg-emerald-400' :
                              level === 3 ? 'bg-emerald-500' : 'bg-emerald-600 shadow-sm shadow-emerald-500/40'
                            }`}
                            title={`Week ${idx + 1}: ${level} donations`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 mt-6 uppercase tracking-widest">
                        <span>1 Year Ago</span>
                        <div className="flex items-center gap-2">
                          <span>Less</span>
                          <span className="w-3.5 h-3.5 bg-slate-200 rounded-[4px]" />
                          <span className="w-3.5 h-3.5 bg-emerald-200 rounded-[4px]" />
                          <span className="w-3.5 h-3.5 bg-emerald-400 rounded-[4px]" />
                          <span className="w-3.5 h-3.5 bg-emerald-500 rounded-[4px]" />
                          <span className="w-3.5 h-3.5 bg-emerald-600 rounded-[4px]" />
                          <span>More</span>
                        </div>
                        <span>Today</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Progression Card */}
                  <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/20 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                    
                    <div className="flex justify-between items-center mb-8 relative z-10">
                      <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest font-mono bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">Tier Progression</span>
                      <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between font-black text-xl tracking-tight">
                        <span>Carbon Hero Lvl 5</span>
                        <span className="text-emerald-400">75%</span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-4 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700 shadow-inner">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full relative w-[75%] transition-all duration-1000 ease-out">
                          <div className="absolute inset-0 bg-white/20 w-full h-full rounded-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', backgroundSize: '200% 100%' }} />
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mt-3 leading-relaxed font-medium">Fulfill <b className="text-white">2 more items</b> to unlock the prestigious Gold Badge milestone!</p>
                    </div>
                  </div>

                  {/* Security Card */}
                  <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                    <h3 className="font-display font-black text-slate-900 mb-6 text-xl tracking-tight">Security & Trust</h3>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-4 hover:border-emerald-200 hover:shadow-md transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Lock className="w-5 h-5 text-slate-700" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900">MFA Login</span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-black tracking-widest uppercase">Active</span>
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed font-medium">OTP verification is securing your account.</p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-4 hover:border-emerald-200 hover:shadow-md transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900">License Badge</span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-black tracking-widest uppercase">Verified</span>
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed font-medium">Identity verified successfully.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {activeTab === 'receipts' && (
              <motion.div 
                key="receipts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/40 border border-slate-100"
              >
                <div className="mb-10 text-center max-w-2xl mx-auto">
                  <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight">Tax Exemption Certificates</h3>
                  <p className="text-slate-500 mt-3 font-medium leading-relaxed">Every successfully claimed and delivered donation triggers a tax receipt token. Download these for your annual 80G deductions.</p>
                </div>

                <div className="overflow-hidden border border-slate-200/80 rounded-3xl shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                          <th className="p-6">Certificate ID</th>
                          <th className="p-6">Items Summary</th>
                          <th className="p-6">Date Approved</th>
                          <th className="p-6">NGO Stamp</th>
                          <th className="p-6">Size</th>
                          <th className="p-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {receipts.map((rec) => (
                          <tr key={rec.id} className="hover:bg-emerald-50/30 transition-colors group">
                            <td className="p-6 font-mono font-bold text-slate-400 text-sm group-hover:text-emerald-500 transition-colors">{rec.id}</td>
                            <td className="p-6 font-bold text-slate-900">{rec.item}</td>
                            <td className="p-6 font-mono text-slate-500 text-sm font-medium">{rec.date}</td>
                            <td className="p-6"><span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-mono font-bold text-xs border border-slate-200">{rec.code}</span></td>
                            <td className="p-6 font-mono text-slate-400 text-sm font-medium">{rec.size}</td>
                            <td className="p-6 text-right">
                              <button
                                onClick={() => handleDownload(rec.id)}
                                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all cursor-pointer"
                                title="Download PDF"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div 
                key="achievements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/40 border border-slate-100"
              >
                <div className="mb-10 text-center max-w-2xl mx-auto">
                  <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight">Eco Achievements</h3>
                  <p className="text-slate-500 mt-3 font-medium leading-relaxed">Gamified eco highlights indicating your environmental contributions and prompt dispatch reflexes.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {[
                    { icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-50', shadow: 'shadow-emerald-500/10', border: 'border-emerald-100', title: 'Carbon Savior', desc: 'Prevented over 50kg of CO₂ from waste streams.' },
                    { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', shadow: 'shadow-rose-500/10', border: 'border-rose-100', title: 'Critical Responder', desc: 'Helped fulfill an urgent medical demand listing under 3 hours.' },
                    { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', shadow: 'shadow-amber-500/10', border: 'border-amber-100', title: 'Fulfillment Star', desc: 'Maintain a perfect 100% completed donation record.' }
                  ].map((badge, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -8 }}
                      className={`p-8 bg-white border border-slate-100 shadow-lg ${badge.shadow} hover:border-slate-200 rounded-3xl text-center space-y-5 transition-all duration-300 group`}
                    >
                      <div className={`w-24 h-24 mx-auto rounded-3xl ${badge.bg} border ${badge.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                        <badge.icon className={`w-12 h-12 ${badge.color}`} />
                      </div>
                      <div>
                        <h4 className="font-display font-black text-slate-900 text-xl tracking-tight">{badge.title}</h4>
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">{badge.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
