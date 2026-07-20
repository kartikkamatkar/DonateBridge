import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { Download, ShieldCheck, Lock, Mail, Star, Heart, Leaf, Check, Calendar, Activity, Sparkles, Award } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import Navbar from '../components/layout/Navbar';
import { authAPI, getApiError } from '../api/index';

export default function UserProfile() {
 const { user, loginWithTokens } = useAuth();
 const { toast } = useToast();
 const navigate = useNavigate();

 const [activeTab, setActiveTab] = useState('account'); // 'account' | 'receipts' | 'achievements'
 const [profileName, setProfileName] = useState(user?.name || 'Sarah Jenkins');
 const [profilePhone, setProfilePhone] = useState(user?.phone || '+1 (555) 019-2831');
 const [profileLocation, setProfileLocation] = useState(user?.location || 'East End, Sector 4');
 const [isSaved, setIsSaved] = useState(false);
 const [isSaving, setIsSaving] = useState(false);

 // Sync state if user context updates
 useEffect(() => {
  if (user) {
   setProfileName(user.name || '');
   setProfilePhone(user.phone || '');
   setProfileLocation(user.location || '');
  }
 }, [user]);

 // Downloadable tax-exempt receipt logs
 const [receipts] = useState([
  { id: 'TX-9901', item: '25 Wool Blankets', date: '2026-06-25', size: '148 KB', code: '501C3-Hope' },
  { id: 'TX-9844', item: '40 School Textbooks', date: '2026-06-18', size: '162 KB', code: '501C3-Green' },
  { id: 'TX-9721', item: '1 Oxygen Concentrator', date: '2026-05-10', size: '135 KB', code: '501C3-Hope' },
 ]);

 const handleSaveProfile = async (e) => {
  e.preventDefault();
  setIsSaving(true);
  try {
   const res = await authAPI.updateMe({
    name: profileName,
    phone: profilePhone,
    location: profileLocation
   });
   setIsSaved(true);
   toast.success('Profile details saved successfully!');
   setTimeout(() => {
    setIsSaved(false);
   }, 2000);
  } catch (err) {
   toast.error(getApiError(err));
  } finally {
   setIsSaving(false);
  }
 };

 const handleDownload = (id) => {
  toast.info(`Downloading Tax-Exempt Physical Donation Receipt: ${id}.pdf`);
 };

 // Simulated contributions heatmap grid data (Github style)
 const contributionGrid = Array.from({ length: 52 }, (_, i) => {
  const weights = [0, 0, 0, 1, 0, 2, 0, 0, 3, 0, 0, 1, 0, 0, 2, 0, 0, 0, 4, 0, 1];
  return weights[i % weights.length];
 });

 return (
  <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
   <Navbar />

   <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-8">
    
    {/* Profile Card Header */}
    <div className="saas-card flex flex-col md:flex-row items-center gap-8">
     <img
      src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=donor'}
      alt="avatar"
      className="w-24 h-24 rounded-full border border-border bg-slate-50 shrink-0"
     />
     <div className="space-y-2 text-center md:text-left flex-1 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center gap-2">
       <h2 className="font-display font-black text-slate-900 leading-tight" style={{ fontSize: '24px' }}>{profileName}</h2>
       <span className="inline-flex self-center px-3 py-1 bg-emerald-50 text-primary border border-emerald-100 rounded-full font-bold uppercase" style={{ fontSize: '11px' }}>
        Level 4 Donor
       </span>
      </div>
      <p className="text-slate-500 flex items-center justify-center md:justify-start gap-1.5" style={{ fontSize: '15px' }}>
       <Mail className="w-4 h-4 text-slate-400 shrink-0" /> {user?.email || 'sarah@donor.org'}
      </p>
      <div className="flex flex-wrap justify-center md:justify-start gap-2.5 pt-1 text-slate-550" style={{ fontSize: '13px' }}>
       <span><b>12</b> Dispatches</span>
       <span>&bull;</span>
       <span><b>1.2k</b> Eco-Points</span>
       <span>&bull;</span>
       <span><b>100%</b> Delivery Score</span>
      </div>
     </div>
     <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
      {user?.role === 'ngo' && (
       <Button variant="primary" onClick={() => navigate('/ngo-register')} className="w-full sm:w-auto">
        Manage NGO License
       </Button>
      )}
      <Button variant="secondary" onClick={() => navigate('/settings')} className="w-full sm:w-auto">
       Preferences
      </Button>
     </div>
    </div>

    {/* Tab Selection */}
    <div className="flex border-b border-slate-200 gap-3">
     {['account', 'receipts', 'achievements'].map(tab => (
      <button
       key={tab}
       onClick={() => setActiveTab(tab)}
       className={`px-4 py-3 font-semibold border-b-2 transition-all cursor-pointer ${
        activeTab === tab
         ? 'border-primary text-primary font-bold'
         : 'border-transparent text-slate-500 hover:text-slate-900'
       }`}
       style={{ fontSize: '15px' }}
      >
       {tab === 'account' ? 'Account Profile' : tab === 'receipts' ? `Tax Exemption Receipts (${receipts.length})` : 'Badges & Achievements'}
      </button>
     ))}
    </div>

    {/* Tab Panels */}
    {activeTab === 'account' && (
     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left: Input Details Form */}
      <div className="lg:col-span-8 space-y-8">
       <div className="saas-card">
        <h3 className="font-display font-bold text-slate-900 mb-6" style={{ fontSize: '18px' }}>Edit Profile Details</h3>
        
        <form onSubmit={handleSaveProfile} className="space-y-6">
         <InputField
          label="Full Name / Brand Title"
          id="profileName"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          required
         />

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

         <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button type="submit" variant="primary" icon={isSaved ? Check : undefined} loading={isSaving}>
           {isSaved ? 'Details Saved' : isSaving ? 'Saving…' : 'Update Profile'}
          </Button>
         </div>
        </form>
       </div>

       {/* INNOVATIVE GRAPH: Weekly Dispatch Heatmap Grid */}
       <div className="saas-card space-y-4">
        <div className="flex justify-between items-center">
         <div>
          <h4 className="font-display font-bold text-slate-900 flex items-center gap-2" style={{ fontSize: '16px' }}>
           <Activity className="w-5 h-5 text-primary" /> Donation Dispatch Heatmap
          </h4>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: '13px' }}>Your logistics contribution frequency mapped across the past 52 weeks.</p>
         </div>
         <span className="font-mono text-slate-400" style={{ fontSize: '12px' }}>Total: 12 active weeks</span>
        </div>

        <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50">
         <div className="grid grid-cols-13 gap-2">
          {contributionGrid.map((level, idx) => (
           <div
            key={idx}
            className={`aspect-square rounded-md transition-all ${
             level === 0 ? 'bg-slate-200' :
             level === 1 ? 'bg-emerald-100' :
             level === 2 ? 'bg-emerald-300' :
             level === 3 ? 'bg-emerald-500' : 'bg-primary'
            }`}
            title={`Week ${idx + 1}: ${level} donations`}
           />
          ))}
         </div>
         <div className="flex justify-between items-center text-slate-400 mt-3" style={{ fontSize: '11px' }}>
          <span>52 Weeks Ago</span>
          <div className="flex items-center gap-1">
           <span>Less</span>
           <span className="w-2.5 h-2.5 bg-slate-200 rounded-sm" />
           <span className="w-2.5 h-2.5 bg-emerald-100 rounded-sm" />
           <span className="w-2.5 h-2.5 bg-emerald-300 rounded-sm" />
           <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
           <span className="w-2.5 h-2.5 bg-primary rounded-sm" />
           <span>More</span>
          </div>
          <span>Today</span>
         </div>
        </div>
       </div>
      </div>

      {/* Right: Security & Stats widgets (No more gaps!) */}
      <div className="lg:col-span-4 space-y-6">
       
       {/* Gamified Achievements Progress */}
       <div className="saas-card space-y-4">
        <div className="flex justify-between items-center">
         <span className="text-slate-400 font-bold uppercase tracking-wider font-mono" style={{ fontSize: '10px' }}>Tier Progression</span>
         <Sparkles className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="space-y-2">
         <div className="flex justify-between text-slate-900 font-bold" style={{ fontSize: '14px' }}>
          <span>Carbon Hero Level 5</span>
          <span>75%</span>
         </div>
         <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full" style={{ width: '75%' }} />
         </div>
         <p className="text-slate-500 mt-1" style={{ fontSize: '12px' }}>Fulfill <b>2 more critical items</b> to achieve the Gold Badge milestone!</p>
        </div>
       </div>

       {/* Security Controls */}
       <div className="saas-card space-y-5">
        <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '16px' }}>Credentials</h3>
        
        <div className="space-y-3.5">
         <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <div className="flex justify-between items-center">
           <span className="font-bold text-slate-800 flex items-center gap-1.5" style={{ fontSize: '13px' }}><Lock className="w-4 h-4 text-primary shrink-0" /> MFA Login</span>
           <span className="font-bold text-primary" style={{ fontSize: '11px' }}>ACTIVE</span>
          </div>
          <p className="text-slate-500 leading-relaxed" style={{ fontSize: '12px' }}>OTP validation verification codes enabled.</p>
         </div>

         <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <div className="flex justify-between items-center">
           <span className="font-bold text-slate-800 flex items-center gap-1.5" style={{ fontSize: '13px' }}><ShieldCheck className="w-4 h-4 text-primary shrink-0" /> License Badge</span>
           <span className="font-bold text-primary" style={{ fontSize: '11px' }}>VERIFIED</span>
          </div>
          <p className="text-slate-500 leading-relaxed" style={{ fontSize: '12px' }}>Identity details verified by DonateBridge on June 01, 2026.</p>
         </div>
        </div>
       </div>

      </div>
     </div>
    )}

    {/* Tab Receipts */}
    {activeTab === 'receipts' && (
     <div className="saas-card space-y-6">
      <div>
       <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Tax Exemption Certificates</h3>
       <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>Every successfully claimed and delivered donation triggers a tax receipt token.</p>
      </div>

      <div className="overflow-hidden border border-border rounded-xl">
       <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
         <thead>
          <tr className="border-b border-border bg-slate-50 text-slate-600 font-bold" style={{ fontSize: '13px' }}>
           <th className="p-4">Certificate ID</th>
           <th className="p-4">Items Summary</th>
           <th className="p-4">Date Approved</th>
           <th className="p-4">NGO Stamp</th>
           <th className="p-4">Size</th>
           <th className="p-4 text-right">Action</th>
          </tr>
         </thead>
         <tbody className="divide-y divide-border" style={{ fontSize: '14px' }}>
          {receipts.map((rec) => (
           <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="p-4 font-mono font-semibold text-slate-400">{rec.id}</td>
            <td className="p-4 font-bold text-slate-800">{rec.item}</td>
            <td className="p-4 font-mono text-slate-500">{rec.date}</td>
            <td className="p-4 font-mono font-bold text-primary">{rec.code}</td>
            <td className="p-4 font-mono text-slate-500">{rec.size}</td>
            <td className="p-4 text-right">
             <button
              onClick={() => handleDownload(rec.id)}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              style={{ minHeight: '36px' }}
             >
              Download PDF
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
     <div className="saas-card space-y-6">
      <div>
       <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Eco Achievements</h3>
       <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>Gamified eco highlights indicating your environmental contributions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
       <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
        <Leaf className="w-10 h-10 mx-auto text-[#2E7D32]" />
        <h4 className="font-display font-bold text-slate-800" style={{ fontSize: '15px' }}>Carbon Savior</h4>
        <p className="text-slate-500 leading-relaxed" style={{ fontSize: '12px' }}>Prevented over 50kg of CO₂ from waste streams.</p>
       </div>

       <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
        <Heart className="w-10 h-10 mx-auto text-red-500" />
        <h4 className="font-display font-bold text-slate-800" style={{ fontSize: '15px' }}>Critical Responder</h4>
        <p className="text-slate-500 leading-relaxed" style={{ fontSize: '12px' }}>Helped fulfill an urgent medical demand listing under 3 hours.</p>
       </div>

       <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
        <Star className="w-10 h-10 mx-auto text-amber-500" />
        <h4 className="font-display font-bold text-slate-800" style={{ fontSize: '15px' }}>Fulfillment Star</h4>
        <p className="text-slate-500 leading-relaxed" style={{ fontSize: '12px' }}>Maintain a perfect 100% completed donation record.</p>
       </div>
      </div>
     </div>
    )}

   </main>
  </div>
 );
}
