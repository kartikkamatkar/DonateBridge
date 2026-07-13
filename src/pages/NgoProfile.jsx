import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, Star, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import Navbar from '../components/Navbar';
import { ngoAPI, getApiError } from '../api/index';
import { useToast } from '../components/ui/Toast';

export default function NgoProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('demands'); // 'demands' | 'timeline' | 'reviews'
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchNgo = async () => {
      try {
        setLoading(true);
        const res = await ngoAPI.getById(id);
        if (active) {
          setNgo(res.data);
          setReviews(res.data.reviews || []);
        }
      } catch (err) {
        toast.error(getApiError(err));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchNgo();
    return () => {
      active = false;
    };
  }, [id, toast]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await ngoAPI.createReview(id, newRating, newComment);
      setReviews(prev => [res.data, ...prev]);
      setNewComment('');
      setNewRating(5);
      toast.success('Review published successfully!');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  // Timeline events representing audit trails built dynamically from NGO database state
  const timelineEvents = [];
  if (ngo) {
    const createdDate = new Date(ngo.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const createdTime = new Date(ngo.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    timelineEvents.push({
      title: 'NGO Registration Filed',
      desc: `Registration details and certificate filings successfully submitted for administrative review. License ID: ${ngo.registration_number || 'N/A'}.`,
      date: createdDate,
      time: createdTime
    });

    if (ngo.verification_status === 'approved') {
      const approvedDate = new Date(ngo.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const approvedTime = new Date(ngo.updated_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      timelineEvents.push({
        title: 'NGO Verification Approved',
        desc: 'Government registration document and status verified by admin superuser. Organization verified as compliance-bound.',
        date: approvedDate,
        time: approvedTime
      });
      timelineEvents.push({
        title: 'Trust Score Rating Upgraded',
        desc: `Trust index initialized to ${ngo.trust_score || 95}% based on compliance check.`,
        date: approvedDate,
        time: approvedTime
      });
    } else if (ngo.verification_status === 'rejected') {
      const rejectedDate = new Date(ngo.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const rejectedTime = new Date(ngo.updated_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      timelineEvents.push({
        title: 'NGO Verification Rejected',
        desc: `Registration credentials audit rejected by Admin. Reason: ${ngo.rejection_reason || 'Compliance criteria not met.'}`,
        date: rejectedDate,
        time: rejectedTime
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-semibold">Loading NGO Profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <p className="text-sm font-bold text-slate-800">NGO Profile not found.</p>
            <Button onClick={() => navigate('/discover')}>Back to Directory</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Hero Banner Area */}
      <div className="bg-white border-b border-border py-8 px-6 shadow-premium-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-display font-bold">
            {ngo.name ? ngo.name.charAt(0).toUpperCase() : 'N'}
          </div>
          <div className="space-y-1.5 text-center md:text-left flex-1">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
              <h1 className="text-xl font-display font-bold text-ink">{ngo.name}</h1>
              {ngo.verification_status === 'approved' && (
                <span className="px-2.5 py-0.5 border border-emerald-100 bg-[#F1F8F5] text-primary text-[9px] font-bold rounded-full uppercase">Verified Hub</span>
              )}
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              {ngo.description || ngo.mission || 'No description provided.'}
            </p>
            <p className="text-[10px] text-slate-400 flex items-center justify-center md:justify-start gap-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Address: {ngo.address}, {ngo.city} &bull; Coordinates: {ngo.lat?.toFixed(4)}, {ngo.lng?.toFixed(4)}
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
              {tab === 'demands' ? `Active Needs (${ngo.needs?.length || 0})` : tab === 'timeline' ? 'Verification Ledger' : `Donor Reviews (${reviews.length})`}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {activeTab === 'demands' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(!ngo.needs || ngo.needs.length === 0) ? (
              <div className="md:col-span-3 bg-white border border-border p-8 rounded-2xl text-center text-slate-400 text-xs">
                No active needs currently broadcasted by this organization.
              </div>
            ) : (
              ngo.needs.map(need => {
                const progressPercent = need.quantity > 0 ? Math.min(100, Math.round((need.fulfilled_quantity / need.quantity) * 100)) : 0;
                return (
                  <div key={need.id} className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm flex flex-col justify-between h-44">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-display font-bold text-sm text-slate-900">{need.item}</h4>
                        <span className={`px-2 py-0.5 border text-[8px] font-bold rounded-full uppercase ${
                          need.urgency === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                          need.urgency === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {need.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed truncate-3-lines">{need.description || 'No specific specifications listed.'}</p>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Progress:</span>
                        <span className="font-bold text-slate-700">{need.fulfilled_quantity}/{need.quantity} units</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${progressPercent >= 100 ? 'bg-[#4CAF50]' : need.urgency === 'High' ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab Timeline */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
            <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider mb-6">Government Audit Trails</h3>
            
            {timelineEvents.length === 0 ? (
              <p className="text-xs text-slate-400 text-center">No verification ledger details available.</p>
            ) : (
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
            )}
          </div>
        )}

        {/* Tab Reviews */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <div className="p-8 bg-white border border-border rounded-2xl text-center text-slate-450 text-xs">
                  No donor reviews yet. Be the first to leave a feedback!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-white border border-border rounded-2xl shadow-premium-xs text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-slate-800">{rev.author_name || 'Anonymous Donor'}</p>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
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
                ))
              )}
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

                  <Button type="submit" variant="primary" className="w-full text-xs font-bold" icon={Send} loading={submittingReview}>
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
