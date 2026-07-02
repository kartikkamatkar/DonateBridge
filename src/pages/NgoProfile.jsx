import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, FileText, CheckCircle, MapPin, AlertCircle, Star,
  MessageSquare, Heart, ArrowLeft, Calendar, FileSpreadsheet, Send
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';

export default function NgoProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('essentials'); // 'essentials' | 'verification' | 'reviews'

  // Review state
  const [reviews, setReviews] = useState([
    { id: 1, author: 'Sarah Jenkins', rating: 5, date: '2026-06-28', comment: 'Superb coordination. The courier picked up my blankets in 40 mins and they logged receipt immediately.' },
    { id: 2, author: 'Marcus Cole', rating: 4, date: '2026-06-15', comment: 'Easy to match items. Handed over school textbooks and they sent the validation ledger PDF quickly.' },
    { id: 3, author: 'TechCorp Social Team', rating: 5, date: '2026-05-19', comment: 'We donated 15 desktop PCs. Excellent transparency, clear route tracking, and audited receipt logs.' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  const handlePostReview = (e) => {
    e.preventDefault();
    if (!newComment) return;
    setReviews(prev => [
      {
        id: Date.now(),
        author: 'Verified Donor',
        rating: newRating,
        date: new Date().toISOString().split('T')[0],
        comment: newComment
      },
      ...prev
    ]);
    setNewComment('');
  };

  const ngoDetails = {
    name: id === '2' ? 'Red Cross Depot' : id === '3' ? 'Green Life NGO' : 'Hope Foundation',
    regNo: '501C3-899120',
    trustScore: id === '2' ? 95 : id === '3' ? 91 : 98,
    joined: 'Jan 2018',
    description: 'Providing food programs, basic apparel, emergency supplies, and educational books to community centers and underprivileged segments.',
    essentials: [
      { item: 'Winter Blankets', category: 'Blankets', status: 'Critical', needed: '45 units', current: '5 units' },
      { item: 'School Textbooks (Grades 1-5)', category: 'Books', status: 'High', needed: '120 books', current: '60 books' },
      { item: 'Canned Staples & Pulses', category: 'Food', status: 'Medium', needed: '80 kg', current: '30 kg' },
      { item: 'First-Aid Dressing Kits', category: 'Medical Equipment', status: 'Critical', needed: '50 packs', current: '2 packs' },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Banner Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate(`/request-wizard?ngo=${id || 1}`)}>
            Donate to this NGO
          </Button>
        </div>
      </nav>

      {/* Main Profile Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-6 overflow-y-auto">
        
        {/* Verification Top High-Contrast Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-primary text-white p-6 rounded-lg shadow-premium-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-emerald-700/30 to-transparent pointer-events-none" />
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">{ngoDetails.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
            <p className="text-xs text-emerald-100 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> District 4 East Main Hub | Reg No: <strong className="font-mono">{ngoDetails.regNo}</strong>
            </p>
          </div>

          <div className="relative z-10 bg-slate-950/20 border border-emerald-600 px-4 py-2.5 rounded text-center shrink-0">
            <span className="text-[10px] text-emerald-200 block font-bold uppercase tracking-wider">Trust Index</span>
            <span className="text-2xl font-extrabold text-white">{ngoDetails.trustScore}%</span>
          </div>
        </div>

        {/* Overview Information */}
        <Card className="p-6">
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2">Organization Overview</h3>
          <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
            {ngoDetails.description}
          </p>
        </Card>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('essentials')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'essentials' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Required Essentials Grid
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'verification' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Verification Timeline
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Donor Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Panel Contents */}
        {activeTab === 'essentials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ngoDetails.essentials.map((need, idx) => (
              <Card key={idx} className="p-4 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">{need.item}</p>
                  <p className="text-slate-500 text-[10px]">Category: {need.category}</p>
                  <div className="w-48 bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden mt-2 flex">
                    {/* Progress representation */}
                    <div className="bg-primary h-full" style={{ width: `${(parseInt(need.current) / parseInt(need.needed)) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-550 dark:text-slate-450 block mt-1">Received {need.current} of {need.needed}</span>
                </div>
                <span className={`px-2.5 py-1 rounded font-bold text-[9px] ${
                  need.status === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300' :
                  need.status === 'High' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                }`}>
                  {need.status} Need
                </span>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'verification' && (
          <Card className="p-6">
            <h3 className="font-bold text-sm mb-4">Official Document Credentials</h3>
            
            {/* Document Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded flex items-center gap-3 text-xs">
                <FileText className="w-6 h-6 text-indigo-500" />
                <div>
                  <p className="font-bold">Tax Exemption</p>
                  <span className="text-[9px] text-emerald-500 font-bold">APPROVED</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded flex items-center gap-3 text-xs">
                <FileSpreadsheet className="w-6 h-6 text-indigo-550" />
                <div>
                  <p className="font-bold">Logistical Audit</p>
                  <span className="text-[9px] text-emerald-500 font-bold">VERIFIED</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded flex items-center gap-3 text-xs">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="font-bold">Incorporation</p>
                  <span className="text-[9px] text-emerald-500 font-bold">REGISTERED</span>
                </div>
              </div>
            </div>

            {/* Vertical Verification Timeline */}
            <h3 className="font-bold text-sm mb-4">Verification Audit Timeline</h3>
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
              <div className="relative text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[25px] top-1" />
                <p className="font-bold text-slate-850 dark:text-slate-200">Regulatory Clearance Completed</p>
                <p className="text-slate-450 text-[10px] flex items-center gap-1 mt-0.5"><Calendar className="w-3.5 h-3.5" /> Jan 12, 2026 &bull; Verified by Super Admin ID #440</p>
              </div>
              <div className="relative text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[25px] top-1" />
                <p className="font-bold text-slate-850 dark:text-slate-200">Physical Facilities Inspected</p>
                <p className="text-slate-450 text-[10px] flex items-center gap-1 mt-0.5"><Calendar className="w-3.5 h-3.5" /> Jan 19, 2026 &bull; On-site inspector check verified</p>
              </div>
              <div className="relative text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[25px] top-1" />
                <p className="font-bold text-slate-850 dark:text-slate-200">Ledger Accountability Audit Passed</p>
                <p className="text-slate-450 text-[10px] flex items-center gap-1 mt-0.5"><Calendar className="w-3.5 h-3.5" /> Feb 02, 2026 &bull; 0% transaction leakage confirmed</p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Reviews Stream */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <Card key={rev.id} className="p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">{rev.author}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <span className="text-slate-400 text-[10px]">{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-slate-650 dark:text-slate-400 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </Card>
              ))}
            </div>

            {/* Write a review form */}
            <Card className="p-4">
              <h4 className="font-bold text-xs mb-3">Leave Verified Donor Feedback</h4>
              <form onSubmit={handlePostReview} className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-500">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-amber-500 focus:outline-none"
                      >
                        <Star className={`w-5 h-5 ${star <= newRating ? 'fill-current' : 'stroke-current text-slate-350'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <InputField
                  label="Review Comments"
                  id="newComment"
                  placeholder="Share details about logistics fulfillment and verification times..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />

                <Button type="submit" variant="primary" size="sm" icon={Send}>
                  Post Feedback
                </Button>
              </form>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}
