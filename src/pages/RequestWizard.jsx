import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useToast } from '../components/ui/Toast';
import { useMockDB } from '../hooks/useMockDB';
import { useAuth } from '../context/GlobalStateContext';
import Navbar from '../components/Navbar';
import LeafletMap from '../components/ui/LeafletMap';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import {
  Sparkles, CheckCircle, Package, ArrowRight, ArrowLeft,
  FileText, Upload, Trash2, Eye, Compass, Calendar, AlertTriangle
} from 'lucide-react';

const CATEGORIES = [
  'Books', 'Clothes', 'Food', 'Furniture', 'Electronics',
  'Medical Equipment', 'School Supplies', 'Blankets', 'Sports Equipment'
];

const CONDITIONS = [
  'New', 'Like New', 'Good', 'Fair', 'Poor'
];

export default function RequestWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const db = useMockDB();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1); // 1: Details, 2: Location Map, 3: Photos, 4: Success Receipt
  const [selectedCoords, setSelectedCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [photos, setPhotos] = useState([]); // Array of { name, previewUrl }
  const [trackingId] = useState(() => Math.floor(10000 + Math.random() * 90000));

  const preselectedCategory = searchParams.get('category') || 'Blankets';

  const { register, handleSubmit, formState: { errors }, trigger } = useForm({
    defaultValues: {
      title: '',
      category: preselectedCategory,
      condition: 'Good',
      quantity: '1',
      description: '',
      pickupAddress: '',
      preferredPickupTime: ''
    }
  });

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ['title', 'category', 'condition', 'quantity', 'description'];
    } else if (step === 2) {
      fieldsToValidate = ['pickupAddress', 'preferredPickupTime'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
    } else {
      toast.error('Please fix form validation errors.');
    }
  };

  const handleMapClick = (latlng) => {
    setSelectedCoords({ lat: latlng.lat, lng: latlng.lng });
    toast.success(`Pickup point pinned: ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.warning('Maximum 5 images are allowed.');
      return;
    }

    const newPhotos = files.map(file => ({
      name: file.name,
      previewUrl: URL.createObjectURL(file)
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    toast.success(`Added ${files.length} photo(s).`);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    toast.success('Photo removed.');
  };

  const onSubmitForm = (data) => {
    if (photos.length === 0) {
      toast.warning('Please upload at least one photo of the donation item.');
      return;
    }

    const donationData = {
      title: data.title,
      category: data.category,
      condition: data.condition,
      quantity: parseInt(data.quantity) || 1,
      description: data.description,
      donorName: user?.name || 'Sarah Jenkins',
      donorEmail: user?.email || 'donor@donatebridge.org',
      photos: photos.map(p => p.previewUrl),
      location: {
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
        address: data.pickupAddress
      },
      preferredPickupTime: data.preferredPickupTime,
      status: 'PENDING' // must be Pending Review to hide it from marketplace
    };

    db.addDonation(donationData);
    setStep(4);
    toast.success('Donation listing logged in moderation queue.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-grow max-w-2xl mx-auto w-full p-6 sm:p-8 space-y-8">
        
        {/* Header */}
        <section className="text-center max-w-xl mx-auto space-y-2">
          <span className="px-3 py-1 bg-[#F1F8F5] text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
            Donation Dispatcher
          </span>
          <h1 className="text-3xl font-display font-black tracking-tight text-slate-900 leading-tight">
            Upload Item Donation
          </h1>
          <p className="text-sm text-slate-500">
            Detail physical surplus item logistics. New uploads are moderated by admins to enforce platform integrity.
          </p>
        </section>

        {/* Wizard Progress */}
        {step < 4 && (
          <div className="bg-white border border-border p-4 rounded-xl shadow-premium-sm flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
              <span className={step === 1 ? 'font-bold text-slate-900' : 'text-slate-500'}>Item Details</span>
            </div>
            <span className="h-[1px] bg-border flex-1 mx-4"></span>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
              <span className={step === 2 ? 'font-bold text-slate-900' : 'text-slate-500'}>Pickup Logistics</span>
            </div>
            <span className="h-[1px] bg-border flex-1 mx-4"></span>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>3</span>
              <span className={step === 3 ? 'font-bold text-slate-900' : 'text-slate-500'}>Photos Upload</span>
            </div>
          </div>
        )}

        {/* Wizard Form Panels */}
        <div className="bg-white border border-border rounded-2xl shadow-premium-sm p-6 sm:p-8">
          
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Step 1: Item Details</h3>
                <p className="text-xs text-slate-500 mt-1">Specify categories, quantities, and operational conditions.</p>
              </div>

              <div className="space-y-4">
                <InputField
                  label="Item Title"
                  id="title"
                  placeholder="e.g. Winter blankets and woolen caps"
                  error={errors.title}
                  {...register('title', { required: 'Item title is required' })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Category</label>
                    <select
                      id="category"
                      {...register('category', { required: 'Category is required' })}
                      className="w-full px-4 py-3 border border-border rounded-xl text-xs bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none h-12 font-medium"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Condition</label>
                    <select
                      id="condition"
                      {...register('condition', { required: 'Condition is required' })}
                      className="w-full px-4 py-3 border border-border rounded-xl text-xs bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none h-12 font-medium"
                    >
                      {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <InputField
                    label="Quantity"
                    id="quantity"
                    type="number"
                    placeholder="e.g. 5"
                    error={errors.quantity}
                    {...register('quantity', {
                      required: 'Quantity is required',
                      min: { value: 1, message: 'Minimum 1 item required' }
                    })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Item Description & Specifications</label>
                  <textarea
                    id="description"
                    rows="4"
                    placeholder="Describe cleanliness, size details, wrapping status, and sorting breakdown..."
                    {...register('description', { required: 'Detailed description is required' })}
                    className="w-full px-4 py-3 border border-border rounded-xl text-xs bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none min-h-[120px]"
                  />
                  {errors.description && <p className="text-[10px] text-red-500">{errors.description.message}</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button type="button" variant="primary" onClick={handleNextStep} icon={ArrowRight}>
                  Continue to Pickup Details
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Step 2: Pickup Logistics & Map coordinates</h3>
                <p className="text-xs text-slate-500 mt-1">Designate package retrieval street details and select coordinates.</p>
              </div>

              <div className="space-y-4">
                <InputField
                  label="Preferred Pickup Time Window"
                  id="preferredPickupTime"
                  placeholder="e.g. Weekdays 9:00 AM - 1:00 PM, or Saturday afternoon"
                  error={errors.preferredPickupTime}
                  {...register('preferredPickupTime', { required: 'Preferred pickup time is required' })}
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Pickup Street Address</label>
                  <textarea
                    id="pickupAddress"
                    rows="3"
                    placeholder="Provide full address where the logistics carriers can pick up items..."
                    {...register('pickupAddress', { required: 'Pickup address is required' })}
                    className="w-full px-4 py-3 border border-border rounded-xl text-xs bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none min-h-[90px]"
                  />
                  {errors.pickupAddress && <p className="text-[10px] text-red-500">{errors.pickupAddress.message}</p>}
                </div>

                {/* Coordinate Map Picker */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5"><Compass className="w-4 h-4 text-primary" /> Map Pin location</span>
                    <span className="font-mono text-primary font-bold">Coords: {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}</span>
                  </div>
                  <div className="h-64 rounded-xl overflow-hidden border border-border">
                    <LeafletMap
                      center={[selectedCoords.lat, selectedCoords.lng]}
                      zoom={13}
                      markers={[{ lat: selectedCoords.lat, lng: selectedCoords.lng, popupContent: <div><b>Donation Pickup Location</b></div> }]}
                      onMapClick={handleMapClick}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Click on the map above to select the coordinates of your pickup site.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} icon={ArrowLeft}>
                  Back
                </Button>
                <Button type="button" variant="primary" onClick={handleNextStep} icon={ArrowRight}>
                  Continue to Photo Uploads
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Step 3: Item Photos</h3>
                <p className="text-xs text-slate-500 mt-1">Upload clear photos showing the current condition (maximum 5 images).</p>
              </div>

              <div className="space-y-6">
                {/* Drag & Drop uploader */}
                <div
                  onClick={() => document.getElementById('photoSelect').click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 bg-slate-50 text-center hover:bg-slate-100/50 transition-all cursor-pointer space-y-2"
                >
                  <Upload className="w-8 h-8 text-primary mx-auto" />
                  <p className="text-xs font-bold text-slate-800">Drag & Drop or Click to upload photos</p>
                  <p className="text-[10px] text-slate-400">Supported formats: JPG, PNG. Max 5MB per file.</p>
                  <input
                    type="file"
                    id="photoSelect"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Thumbnails review */}
                {photos.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">Uploaded Images ({photos.length}/5)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="border border-border rounded-lg overflow-hidden bg-white relative aspect-square group shadow-premium-sm">
                          <img src={photo.previewUrl} alt={`Item preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-red-50 hover:text-red-600 rounded-md text-slate-600 transition-colors shadow-premium-sm cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alert warning */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Pending Review Enforcement</p>
                    <p className="mt-0.5 text-amber-700/90 leading-relaxed">
                      Upon submission, this listing is held as "Pending Review" and will NOT appear publicly on the marketplace directory. Once approved by our team, it will be published immediately.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between">
                <Button type="button" variant="secondary" onClick={() => setStep(2)} icon={ArrowLeft}>
                  Back
                </Button>
                <Button type="button" variant="primary" onClick={handleSubmit(onSubmitForm)} icon={CheckCircle}>
                  Submit Listing Proposal
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6 py-6">
              <div className="w-16 h-16 bg-[#F1F8F5] border border-emerald-100 rounded-full flex items-center justify-center text-primary mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Donation Request Logged</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your physical donation proposal has been submitted to the moderation panel.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-border rounded-xl text-left max-w-sm mx-auto text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">LISTING STATUS:</span>
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px]">PENDING AUDIT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TRACKING ID:</span>
                  <span className="text-slate-900 font-bold">#DB-DNT-{trackingId}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-[10px] text-slate-400 text-center leading-relaxed">
                  <span>It will remain private until approved by an administrator.</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2 max-w-xs mx-auto text-center">
                <Button variant="primary" className="w-full" onClick={() => navigate('/donor-dashboard')}>
                  Go to Donor Dashboard
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => navigate('/discover')}>
                  Browse Marketplace
                </Button>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
