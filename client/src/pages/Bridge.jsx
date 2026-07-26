import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useRealDB } from '../hooks/useRealDB';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import {
  Upload, ShieldCheck, Globe, Compass, CheckCircle, Clock,
  Truck, BarChart3, ChevronRight, ArrowRight, Sparkles,
  HeartHandshake, Building2, Package, MapPin, AlertCircle,
  RefreshCw, Zap, CheckCircle2, Lock, ArrowUpRight, Filter
} from 'lucide-react';

const STEPS = [
  {
    num: 1,
    title: 'Donor Uploads Items',
    desc: 'The donor registers item details — category, condition, photos, and pickup address — to create a verified listing on the platform.',
    icon: Upload,
    color: 'bg-emerald-500',
    details: [
      'Define item category and condition',
      'Upload photos for verification',
      'Set pickup address coordinates'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="bg-slate-50 border border-border p-4 rounded-xl flex items-center justify-between">
          <span className="text-slate-500 font-medium">Donation Title</span>
          <span className="font-semibold text-slate-800">50 School Textbooks</span>
        </div>
        <div className="bg-slate-50 border border-border p-4 rounded-xl flex items-center justify-between">
          <span className="text-slate-500 font-medium">Verification File</span>
          <span className="font-semibold text-primary">cargo_manifest.pdf</span>
        </div>
        <div className="flex justify-between items-center px-1 text-slate-500">
          <span>Weight: 18 kg</span>
          <span className="text-primary font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Ready for upload
          </span>
        </div>
      </div>
    )
  },
  {
    num: 2,
    title: 'Admin Verifies Listing',
    desc: 'A platform supervisor reviews the item details, verifies authenticity through uploaded documents, and approves the listing.',
    icon: ShieldCheck,
    color: 'bg-emerald-600',
    details: [
      'Cross-reference donor registration',
      'Validate location coordinates',
      'Approve listing for public catalog'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Integrity Audit</span>
          <span className="text-primary font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">PASSED</span>
        </div>
        <div className="bg-slate-50 border border-border p-4 rounded-xl font-mono text-slate-600 space-y-1.5 text-xs">
          <div>&gt; Matching headquarters coords...</div>
          <div className="text-slate-900 font-bold">MATCH: 19.076, 72.8777 [OK]</div>
          <div>&gt; Updating trust flags... DONE</div>
        </div>
        <div className="text-slate-400 text-center text-xs">Audit signed · SHA-256 block updated</div>
      </div>
    )
  },
  {
    num: 3,
    title: 'Item Goes Public',
    desc: 'The approved donation becomes visible in the public Discover directory, where verified NGOs can browse and filter available items.',
    icon: Globe,
    color: 'bg-emerald-700',
    details: [
      'Published to the active Discover feed',
      'Indexed by category, proximity, and urgency',
      'Open for NGO match requests'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="bg-white border border-border p-3.5 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">BK</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 truncate">50 Textbooks & Stationary Kits</h4>
            <p className="text-slate-400 text-xs">Mumbai Central Hub · Available</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-primary rounded-lg font-bold shrink-0 text-xs border border-emerald-100">
            PUBLIC
          </span>
        </div>
        <p className="text-slate-500 text-center italic text-xs">Listed on active directories. Ready for NGO matching.</p>
      </div>
    )
  },
  {
    num: 4,
    title: 'NGO Requests Item',
    desc: 'A registered NGO identifies the donation as matching their community needs and submits an allocation request through the platform.',
    icon: Compass,
    color: 'bg-teal-500',
    details: [
      'Identify local community demands',
      'Auto-verify NGO eligibility',
      'Generate proximity match scores'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">Suggested NGO Partner</span>
          <span className="text-primary font-bold">98.4% Proximity Match</span>
        </div>
        <div className="bg-slate-50 border border-border p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-primary font-bold">EH</div>
          <div>
            <p className="font-bold text-slate-900">Education Hub NGO</p>
            <p className="text-slate-400 text-xs">Demands matched: Educational books</p>
          </div>
        </div>
      </div>
    )
  },
  {
    num: 5,
    title: 'Donor Accepts Match',
    desc: 'The donor reviews the NGO match, approves the recipient suggestion, and locks the allocation — triggering the logistics flow.',
    icon: CheckCircle,
    color: 'bg-teal-600',
    details: [
      'Review recipient organization profile',
      'Accept optimized logistics route',
      'Generate electronic manifest'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="border border-emerald-100 bg-emerald-50/30 p-4 rounded-xl space-y-2">
          <p className="font-bold text-slate-900">Route Matching Accepted</p>
          <p className="text-slate-500 text-xs">Donor approved recipient suggestion. Allocation manifest locked.</p>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Manifest: #M-902-L</span>
          <span className="text-primary bg-emerald-100/50 px-3 py-1 rounded-lg font-bold border border-emerald-200/40">LOCKED</span>
        </div>
      </div>
    )
  },
  {
    num: 6,
    title: 'Pickup Scheduled',
    desc: 'A logistics courier is dispatched to the donor\'s location to collect the items. Real-time tracking is enabled for both parties.',
    icon: Clock,
    color: 'bg-teal-700',
    details: [
      'Deploy regional courier unit',
      'Sync schedule with donor availability',
      'Enable real-time parcel tracking'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="bg-slate-50 border border-border p-4 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between font-bold">
            <span>Express Unit: DB-LOGISTICS</span>
            <span className="text-primary">En Route</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Driver: Ramesh K.</span>
            <span>ETA: 14 mins</span>
          </div>
        </div>
        <p className="text-slate-400 text-center text-xs">GPS tracking active · Transmit rate: 1Hz</p>
      </div>
    )
  },
  {
    num: 7,
    title: 'Delivery Completed',
    desc: 'Items are delivered to the NGO hub and verified through electronic signature. Custody transfer is recorded in the audit log.',
    icon: Truck,
    color: 'bg-green-600',
    details: [
      'Courier delivers items to NGO hub',
      'NGO confirms with digital signature',
      'Release custody transfer logs'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="bg-slate-50 border border-border p-4 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Custody Transfer</span>
          <span className="text-primary font-bold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> SIGNED
          </span>
        </div>
        <div className="bg-slate-50 border border-border p-4 rounded-xl font-mono text-slate-600 space-y-1.5 text-xs">
          <div>&gt; Matching GPS location logs...</div>
          <div>NGO HQ REGION MATCH: 100% [VALID]</div>
          <div>STATUS: COMPLETED DISPATCH</div>
        </div>
      </div>
    )
  },
  {
    num: 8,
    title: 'Impact Ledger Updated',
    desc: 'CO₂ savings, item metrics, and beneficiary impact data are synced to the transparency ledger — completing the donation lifecycle.',
    icon: BarChart3,
    color: 'bg-green-700',
    details: [
      'Calculate carbon emissions saved',
      'Append data to transparency log',
      'Credit donor profile with impact points'
    ],
    mockup: (
      <div className="space-y-3">
        <div className="bg-emerald-950 text-emerald-100 p-5 rounded-xl text-center space-y-1">
          <p className="font-mono uppercase tracking-wider text-emerald-400 text-xs">CO₂ Emissions Saved</p>
          <p className="text-2xl font-display font-extrabold">+0.15 Tons Offset</p>
        </div>
        <div className="flex justify-between items-center text-slate-400 px-1 text-xs">
          <span>Block Index: #5812902</span>
          <span>Status: SYNCED</span>
        </div>
      </div>
    )
  }
];

export default function Bridge() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { donations, needs, claimDonation, loadingDonations } = useRealDB();

  const [activeTab, setActiveTab] = useState('hub'); // 'hub' | 'workflow'
  const [activeStep, setActiveStep] = useState(1);
  const [claimingId, setClaimingId] = useState(null);

  const role = user?.role || 'guest';
  const currentStep = STEPS.find(s => s.num === activeStep);
  const StepIcon = currentStep.icon;

  const handleClaimSupply = async (donationId) => {
    if (!isAuthenticated) {
      toast.info('Please sign in as an NGO to claim this donation.');
      navigate('/login?role=ngo');
      return;
    }
    if (role !== 'ngo') {
      toast.error('Only registered NGOs can claim surplus supplies.');
      return;
    }

    setClaimingId(donationId);
    try {
      await claimDonation(donationId);
      toast.success('Donation claimed! Tracking and logistics manifest generated.');
    } catch (err) {
      // Error handled by useRealDB
    } finally {
      setClaimingId(null);
    }
  };

  const handleFulfillNeed = (need) => {
    if (!isAuthenticated) {
      toast.info('Please sign in as a Donor to fulfill this NGO requirement.');
      navigate('/login?role=donor');
      return;
    }
    navigate(`/upload-donation?category=${encodeURIComponent(need.category)}&item=${encodeURIComponent(need.item)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Light Hero Banner */}
      <section className="bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  Community Supply Bridge
                </span>

                {/* Role Pill */}
                {role === 'donor' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" /> Donor Workspace
                  </span>
                )}
                {role === 'ngo' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" /> NGO Console
                  </span>
                )}
                {role === 'admin' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600" /> Moderator Audit Mode
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                The Donation <span className="text-primary">Bridge</span>
              </h1>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {role === 'donor' && "Find urgent NGO needs matching your surplus items and bridge resources directly to local non-profits."}
                {role === 'ngo' && "Browse verified surplus donations uploaded by local donors and claim items for your community programs."}
                {role === 'guest' && "Discover how DonateBridge connects donors with verified NGOs to deliver non-monetary supply aid."}
              </p>
            </div>

            {/* Quick Action Box */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl shrink-0 flex flex-col gap-2.5 sm:min-w-[220px]">
              {role === 'donor' && (
                <>
                  <Button variant="primary" onClick={() => navigate('/upload-donation')} icon={Upload} className="w-full justify-center text-xs">
                    Upload Donation
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/donor')} icon={Package} className="w-full justify-center text-xs">
                    My Deliveries
                  </Button>
                </>
              )}
              {role === 'ngo' && (
                <>
                  <Button variant="primary" onClick={() => navigate('/post-need')} icon={Zap} className="w-full justify-center text-xs">
                    Post Emergency Need
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/ngo')} icon={Building2} className="w-full justify-center text-xs">
                    NGO Console
                  </Button>
                </>
              )}
              {role === 'guest' && (
                <>
                  <Button variant="primary" onClick={() => navigate('/login?register=true&role=donor')} icon={HeartHandshake} className="w-full justify-center text-xs">
                    Join as Donor
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/login?register=true&role=ngo')} icon={Building2} className="w-full justify-center text-xs">
                    Register NGO
                  </Button>
                </>
              )}
            </div>

          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 mt-8 border-b border-slate-200 pb-0">
            <button
              onClick={() => setActiveTab('hub')}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-t-xl transition-all cursor-pointer ${
                activeTab === 'hub'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeTab === 'hub' ? 'text-emerald-400' : 'text-slate-500'}`} />
              Live Matching Hub
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'hub' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {role === 'donor' ? `${needs.length} Needs` : `${donations.length} Supplies`}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('workflow')}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-t-xl transition-all cursor-pointer ${
                activeTab === 'workflow'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Compass className={`w-4 h-4 ${activeTab === 'workflow' ? 'text-emerald-400' : 'text-slate-500'}`} />
              How The Bridge Works (8-Step Journey)
            </button>
          </div>

        </div>
      </section>

      {/* Main Tab Content */}
      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ──────────────────────────────────────────────── */}
          {/* TAB 1: LIVE MATCHING HUB (ROLE-AWARE)            */}
          {/* ──────────────────────────────────────────────── */}
          {activeTab === 'hub' && (
            <div className="space-y-8">
              
              {/* DONOR ROLE VIEW */}
              {(role === 'donor' || (role === 'guest' && activeTab === 'hub')) && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="w-5 h-5 text-emerald-600" />
                        <h2 className="font-display text-xl font-bold text-slate-900">
                          {role === 'donor' ? 'Urgent NGO Needs Waiting for Supplies' : 'Community NGO Needs Preview'}
                        </h2>
                      </div>
                      <p className="text-slate-500 text-sm mt-1">
                        Select any requirement below to fulfill it with your surplus items.
                      </p>
                    </div>

                    <Link to="/discover" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                      Browse All Needs <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {needs.length === 0 ? (
                    <div className="bg-white border border-border p-8 rounded-2xl text-center space-y-3">
                      <Package className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-slate-600 font-semibold">No urgent NGO needs listed at the moment.</p>
                      <Button variant="primary" onClick={() => navigate('/upload-donation')} icon={Upload}>
                        Upload Surplus Donation
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {needs.map((need) => (
                        <div key={need.id} className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold text-xs">
                                {need.category}
                              </span>
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${
                                need.urgency === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                                need.urgency === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {need.urgency} Urgency
                              </span>
                            </div>

                            <div>
                              <h3 className="font-bold text-slate-900 text-base">{need.item}</h3>
                              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                {need.ngo_name || 'Verified NGO'}
                              </p>
                              {need.description && (
                                <p className="text-slate-600 text-xs mt-2 line-clamp-2">{need.description}</p>
                              )}
                            </div>

                            {/* Quantity progress */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-500">Target Demand</span>
                                <span className="text-slate-900 font-bold">{need.fulfilled_quantity || 0} / {need.quantity} units</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, (((need.fulfilled_quantity || 0) / need.quantity) * 100))}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            onClick={() => handleFulfillNeed(need)}
                            icon={HeartHandshake}
                            className="w-full justify-center text-xs py-2.5"
                          >
                            Bridge & Fulfill Need
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NGO ROLE VIEW */}
              {(role === 'ngo' || (role === 'guest' && activeTab === 'hub')) && (
                <div className="space-y-6 pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <h2 className="font-display text-xl font-bold text-slate-900">
                          {role === 'ngo' ? 'Available Surplus Donations For Claim' : 'Donor Surplus Supplies Preview'}
                        </h2>
                      </div>
                      <p className="text-slate-500 text-sm mt-1">
                        Verified items uploaded by local donors. Claim to allocate to your NGO.
                      </p>
                    </div>

                    <Link to="/discover" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                      Browse All Supplies <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {donations.length === 0 ? (
                    <div className="bg-white border border-border p-8 rounded-2xl text-center space-y-3">
                      <Package className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-slate-600 font-semibold">No unclaimed surplus items available right now.</p>
                      <Button variant="primary" onClick={() => navigate('/post-need')} icon={Zap}>
                        Post Emergency Need
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {donations.filter(d => d.status === 'VERIFIED' || d.status === 'PENDING').slice(0, 6).map((donation) => (
                        <div key={donation.id} className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 font-bold text-xs">
                                {donation.category}
                              </span>
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 uppercase tracking-wider">
                                {donation.condition || 'Good Condition'}
                              </span>
                            </div>

                            <div>
                              <h3 className="font-bold text-slate-900 text-base">{donation.title || donation.itemName}</h3>
                              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {donation.pickup_address || donation.location?.address || 'Mumbai Region'}
                              </p>
                              {donation.description && (
                                <p className="text-slate-600 text-xs mt-2 line-clamp-2">{donation.description}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                              <span className="text-slate-500 font-medium">Quantity Available</span>
                              <span className="text-slate-900 font-bold">{donation.quantity} units</span>
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            onClick={() => handleClaimSupply(donation.id)}
                            isDisabled={claimingId === donation.id}
                            icon={claimingId === donation.id ? RefreshCw : Building2}
                            className="w-full justify-center text-xs py-2.5 bg-blue-600 hover:bg-blue-700"
                          >
                            {claimingId === donation.id ? 'Claiming...' : 'Claim & Request Delivery'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* QUICK ROLE ACTION CARDS */}
              <div className="pt-8 border-t border-border">
                <h3 className="font-display font-bold text-slate-900 text-lg mb-4">
                  Quick Platform Actions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-border p-5 rounded-2xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">Donate Surplus Items</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Upload spare textbooks, clothes, electronics, or medical kits to connect with non-profits.
                    </p>
                    <Button variant="secondary" onClick={() => navigate('/upload-donation')} className="w-full text-xs">
                      Start Donation Listing
                    </Button>
                  </div>

                  <div className="bg-white border border-border p-5 rounded-2xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">Post Emergency NGO Need</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Are you a registered NGO? Broadcast urgent community demands for donor matching.
                    </p>
                    <Button variant="secondary" onClick={() => navigate('/post-need')} className="w-full text-xs">
                      Broadcast Requirement
                    </Button>
                  </div>

                  <div className="bg-white border border-border p-5 rounded-2xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">Explore Impact Metrics</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      View real-time CO₂ savings, verified delivery milestones, and circular economy stats.
                    </p>
                    <Button variant="secondary" onClick={() => navigate('/impact')} className="w-full text-xs">
                      View Impact Dashboard
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ──────────────────────────────────────────────── */}
          {/* TAB 2: 8-STEP WORKFLOW TIMELINE                  */}
          {/* ──────────────────────────────────────────────── */}
          {activeTab === 'workflow' && (
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Left: Step Navigation */}
              <div className="w-full lg:w-80 shrink-0 space-y-2">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = activeStep === step.num;
                  const isPast = activeStep > step.num;
                  return (
                    <button
                      key={step.num}
                      onClick={() => setActiveStep(step.num)}
                      className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'border-primary bg-emerald-50/40 shadow-sm font-bold'
                          : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-primary text-white' :
                        isPast ? 'bg-emerald-100 text-primary' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-slate-400 font-semibold uppercase tracking-wider text-[10px] ${isActive ? 'text-primary' : ''}`}>
                          Step {step.num}
                        </p>
                        <p className={`text-sm truncate ${isActive ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                          {step.title}
                        </p>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Right: Step Detail Card */}
              <div className="flex-1">
                <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
                  
                  {/* Step Header */}
                  <div className="p-6 lg:p-8 border-b border-border bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${currentStep.color}`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-primary font-semibold uppercase tracking-wider text-xs">
                          Step {currentStep.num} of {STEPS.length}
                        </p>
                        <h2 className="font-display font-bold text-slate-900 text-xl">
                          {currentStep.title}
                        </h2>
                      </div>
                    </div>
                    <p className="text-slate-500 mt-3 text-sm leading-relaxed max-w-2xl">
                      {currentStep.desc}
                    </p>
                  </div>

                  {/* Step Body */}
                  <div className="p-6 lg:p-8 space-y-6">
                    
                    {/* Checklist */}
                    <div className="space-y-2.5">
                      <h3 className="font-semibold text-slate-400 uppercase tracking-wider text-xs">
                        What happens at this step
                      </h3>
                      <ul className="space-y-2">
                        {currentStep.details.map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-slate-700 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Live Preview Mockup */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-400 uppercase tracking-wider text-xs">
                        Interactive Live Preview
                      </h3>
                      <div className="border border-border rounded-xl p-5 bg-slate-50/30">
                        {currentStep.mockup}
                      </div>
                    </div>
                  </div>

                  {/* Step Navigation Footer */}
                  <div className="p-6 lg:p-8 border-t border-border bg-slate-50/30 flex items-center justify-between">
                    <Button
                      variant="secondary"
                      onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                      isDisabled={activeStep === 1}
                      className="text-xs"
                    >
                      Previous Step
                    </Button>
                    
                    {/* Progress indicator */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      {STEPS.map(s => (
                        <div
                          key={s.num}
                          className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
                            s.num === activeStep ? 'bg-primary' :
                            s.num < activeStep ? 'bg-emerald-200' :
                            'bg-slate-200'
                          }`}
                          onClick={() => setActiveStep(s.num)}
                        />
                      ))}
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => setActiveStep(Math.min(STEPS.length, activeStep + 1))}
                      isDisabled={activeStep === STEPS.length}
                      icon={ArrowRight}
                      className="text-xs"
                    >
                      Next Step
                    </Button>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
