import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, Star, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import Navbar from '../components/Navbar';

export default function NgoProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('demands'); // 'demands' | 'timeline' | 'reviews'

  // Review submission state
  const [reviews, setReviews] = useState([
    { author: 'Sarah Jenkins', rating: 5, comment: 'Quick collection dispatched. Excellent coordinates matching for winter blankets.', date: '2026-06-28' },
    { author: 'Microsoft logistics', rating: 5, comment: 'Laptops audit ledger processed immediately. Fully transparent.', date: '2026-06-25' },
    { author: 'Green Foods Inc', rating: 4, comment: 'Daily staples reached target community within 2 hours of pickup.', date: '2026-06-12' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setReviews(prev => [
      { author: 'You (Anonymous)', rating: newRating, comment: newComment, date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);
    setNewComment('');
    setNewRating(5);
  };

  // Timeline events representing audit trails
  const timelineEvents = [
    { title: 'NGO Verification Signed', desc: 'Government registration document approved by admin superuser.', date: 'June 01, 2026', time: '10:00 AM' },
    { title: 'Tax-Exempt Code Issued', desc: 'Verified 501c3 exemption status synced to dispatch logs.', date: 'June 02, 2026', time: '11:15 AM' },
    { title: 'First Logistics Route Fulfilled', desc: 'Shipped 40 items under coordinates supervision.', date: 'June 10, 2026', time: '04:30 PM' },
    { title: 'Trust Score Rating Upgraded', desc: 'Trust index moved to 98% based on zero delay reports.', date: 'June 25, 2026', time: '09:00 AM' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Hero Banner Area */}
      <div className="bg-white border-b border-border py-8 px-6 shadow-premium-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-display font-bold">
            H
          </div>
          <div className="space-y-1.5 text-center md:text-left flex-1">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
              <h1 className="text-xl font-display font-bold text-ink">Hope Foundation</h1>
              <span className="px-2.5 py-0.5 border border-emerald-100 bg-[#F1F8F5] text-primary text-[9px] font-bold rounded-full uppercase">Verified Hub</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Focusing on physical blankets, winter apparel, daily groceries, and medical equipment matching routes.
            </p>
            <p className="text-[10px] text-slate-400 flex items-center justify-center md:justify-start gap-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Coordinates: East End Sector 4 &bull; 1.4 miles away
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" className="text-xs font-bold" onClick={() => navigate('/discover')}>Donate Now</Button>
            <Button variant="secondary" className="text-xs font-bold" onClick={() => navigate('/chat')}>Chat</Button>
          </div>
        </div>
      </div>

      {/* Profile workspace */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 sm:p-8 space-y-6">
        
        {/* Tab selection */}
        <div className="flex border-b border-border gap-2">
          {['demands', 'timeline', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-slate-500 hover:text-ink'
              }`}
            >
              {tab === 'demands' ? 'Active Needs (3)' : tab === 'timeline' ? 'Verification Ledger' : `Donor Reviews (${reviews.length})`}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {activeTab === 'demands' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm flex flex-col justify-between h-44">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-display font-bold text-sm text-slate-900">Winter Blankets</h4>
                  <span className="px-2 py-0.5 border border-red-100 bg-red-50 text-red-700 text-[8px] font-bold rounded-full uppercase">Critical</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">Estimated necessity: 50 units for shelter bedding kits.</p>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Progress:</span>
                  <span className="font-bold text-slate-700">14/50 blankets</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[28%]" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm flex flex-col justify-between h-44">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-display font-bold text-sm text-slate-900">School Notebooks</h4>
                  <span className="px-2 py-0.5 border border-amber-100 bg-amber-50 text-amber-700 text-[8px] font-bold rounded-full uppercase">High</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">Educational materials matching for public community tutoring centers.</p>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Progress:</span>
                  <span className="font-bold text-slate-700">120/200 books</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#4CAF50] h-full w-[60%]" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm flex flex-col justify-between h-44">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-display font-bold text-sm text-slate-900">First-Aid Kits</h4>
                  <span className="px-2 py-0.5 border border-slate-200 bg-slate-50 text-slate-600 text-[8px] font-bold rounded-full uppercase">Medium</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">General medical equipment packaging for primary care response units.</p>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Progress:</span>
                  <span className="font-bold text-slate-700">45/50 kits</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[90%]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Timeline */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
            <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider mb-6">Government Audit Trails</h3>
            
            <div className="relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 pl-8 space-y-6">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="relative text-xs">
                  <div className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center absolute -left-[38px] -top-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900">{evt.title}</p>
                    <p className="text-[9px] text-slate-400 font-mono">{evt.date} &bull; {evt.time}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{evt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Reviews */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {reviews.map((rev, idx) => (
                <div key={idx} className="p-4 bg-white border border-border rounded-2xl shadow-premium-xs text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-800">{rev.author}</p>
                    <span className="text-[9px] text-slate-400 font-mono">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-500 leading-relaxed mt-1">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Leave Review form */}
            <div>
              <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm sticky top-24 space-y-4">
                <h4 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider">Add Donor Experience</h4>
                
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Rating
                    </label>
                    <div className="flex gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${star <= newRating ? 'fill-current' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Share Feedback
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Comment on receipt validation speed..."
                      rows={4}
                      className="w-full p-3 text-xs rounded-xl border border-border bg-white text-slate-900 focus:outline-none placeholder-slate-400"
                      required
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full text-xs font-bold" icon={Send}>
                    Publish Review
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
