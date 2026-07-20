import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { ngoAPI, authAPI, getApiError } from '../api/index';
import Navbar from '../components/layout/Navbar';
import LeafletMap from '../components/ui/LeafletMap';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import {
 Building, MapPin, Upload, FileText, CheckCircle,
 ArrowRight, ArrowLeft, Trash2, Eye, Compass, Heart, Plus, X
} from 'lucide-react';

const DOCUMENT_SLOTS = [
 { key: 'govRegCert', label: 'Government Registration Certificate (Required)' }
];

export default function NgoRegister() {
 const navigate = useNavigate();
 const { toast } = useToast();
 const [isSubmitting, setIsSubmitting] = useState(false);

 const [step, setStep] = useState(1); // 1: Org Info, 2: Address & Location Map, 3: Document Filings, 4: Success
 const [selectedCoords, setSelectedCoords] = useState({ lat: 21.1458, lng: 79.0882 }); // Nagpur default
 const [uploadedFiles, setUploadedFiles] = useState({}); // { [key]: Array<{ id, name, previewUrl }> }
 const [selectedPreviewPage, setSelectedPreviewPage] = useState(null); // { page, label }
 const [trackingId] = useState(() => Math.floor(1000 + Math.random() * 9000));

 const { register, handleSubmit, formState: { errors }, trigger } = useForm({
  defaultValues: {
   name: '',
   registrationNumber: '',
   govRegistrationNumber: '',
   ngoType: 'Trust',
   email: '',
   phone: '',
   website: '',
   address: '',
   state: 'Karnataka',
   district: 'Bengaluru Urban',
   city: 'Bengaluru',
   pinCode: '',
   description: '',
   mission: '',
   workingAreas: '',
   operatingSince: '',
   volunteersCount: ''
  }
 });

 React.useEffect(() => {
  if (navigator.geolocation) {
   navigator.geolocation.getCurrentPosition(
    (position) => {
     setSelectedCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
    },
    () => {
     // Fallback to Nagpur
    }
   );
  }
 }, []);

  const handleNextStep = async () => {
   const isValid = await trigger(['name', 'phone', 'address']);
   if (isValid) {
    setStep(3); // Skip straight to documents step
   } else {
    toast.error('Please resolve validation errors before continuing.');
   }
  };

 const handleMapClick = (latlng) => {
  setSelectedCoords({ lat: latlng.lat, lng: latlng.lng });
  toast.success(`Registered Location Pin: ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`);
 };

 const handleFileChange = (key, e) => {
  const files = e.target.files;
  if (files && files.length > 0) {
   const newPages = Array.from(files).map(file => {
    const previewUrl = file.type.startsWith('image/')
     ? URL.createObjectURL(file)
     : 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400'; // mock PDF cover
    return {
     id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
     name: file.name,
     previewUrl
    };
   });

   setUploadedFiles(prev => ({
    ...prev,
    [key]: [...(prev[key] || []), ...newPages]
   }));
   const label = DOCUMENT_SLOTS.find(s => s.key === key)?.label || 'Document';
   toast.success(`Added ${newPages.length} page(s) to ${label}`);
  }
 };

 const handleRemovePage = (key, pageId) => {
  setUploadedFiles(prev => {
   const copy = { ...prev };
   if (copy[key]) {
    copy[key] = copy[key].filter(page => page.id !== pageId);
    if (copy[key].length === 0) {
     delete copy[key];
    }
   }
   return copy;
  });
  toast.success('Page removed from document.');
 };

 const onFormSubmit = async (data) => {
  const missingDocs = DOCUMENT_SLOTS.filter(slot => !uploadedFiles[slot.key] || uploadedFiles[slot.key].length === 0);
  if (missingDocs.length > 0) {
   toast.warning(`Please upload files for: ${missingDocs.map(d => d.label).slice(0, 2).join(', ')}...`);
   return;
  }

  setIsSubmitting(true);
  try {
   // Upload all document files to backend and get URLs
   const uploadedDocUrls = {};
   for (const [key, pages] of Object.entries(uploadedFiles)) {
    uploadedDocUrls[key] = [];
    for (const page of pages) {
     // If it's already a URL (from unsplash/sample), use it directly
     if (page.previewUrl.startsWith('http') && !page.previewUrl.startsWith('blob:')) {
      uploadedDocUrls[key].push(page.previewUrl);
     } else if (page.previewUrl.startsWith('blob:')) {
      // Real file upload
      try {
       const blob = await fetch(page.previewUrl).then(r => r.blob());
       const file = new File([blob], page.name || 'document.jpg', { type: blob.type });
       const uploadRes = await authAPI.uploadFile(file);
       uploadedDocUrls[key].push(uploadRes.data.url);
      } catch {
       uploadedDocUrls[key].push(page.previewUrl);
      }
     } else {
      uploadedDocUrls[key].push(page.previewUrl);
     }
    }
   }

   const payload = {
    name: data.name,
    registration_number: data.registrationNumber || 'N/A',
    gov_registration_number: data.govRegistrationNumber || 'N/A',
    ngo_type: data.ngoType || 'Trust',
    phone: data.phone,
    website: data.website || '',
    state: data.state || 'Karnataka',
    district: data.district || 'Bengaluru Urban',
    city: data.city || 'Bengaluru',
    pin_code: data.pinCode || '560000',
    address: data.address,
    description: data.description || 'Verified fast-track NGO.',
    mission: data.mission || 'To serve the community quickly.',
    working_areas: data.workingAreas || 'General Relief',
    operating_since: data.operatingSince || '2023',
    volunteers_count: parseInt(data.volunteersCount) || 10,
    lat: selectedCoords.lat,
    lng: selectedCoords.lng,
    documents: uploadedDocUrls,
   };

   await ngoAPI.register(payload);
   setStep(4);
   toast.success('Registration filed successfully! Pending admin review.');
  } catch (err) {
   toast.error(getApiError(err));
  } finally {
   setIsSubmitting(false);
  }
 };

 return (
  <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
   <Navbar />

   <main className="flex-1 max-w-4xl mx-auto w-full p-6 sm:p-8 space-y-8">
    
    {/* Page title and description */}
    <section className="text-center max-w-2xl mx-auto space-y-2">
     <span className="px-3 py-1 bg-[#F1F8F5] text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
      NGO Partnership
     </span>
     <h1 className="text-3xl font-display font-black tracking-tight text-slate-900 leading-tight">
      Register NGO Authority Profile
     </h1>
     <p className="text-sm text-slate-500">
      Submit regulatory documentation for administrative audit. All details require validation before listings become visible.
     </p>
    </section>

    {step < 4 && (
     <div className="db-card flex justify-between items-center text-xs max-w-md mx-auto">
      <div className="flex items-center gap-2">
       <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
       <span className={step === 1 ? 'font-bold text-slate-900' : 'text-slate-500'}>Basic Info</span>
      </div>
      <span className="h-[1px] bg-border flex-1 mx-4"></span>
      <div className="flex items-center gap-2">
       <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
       <span className={step === 3 ? 'font-bold text-slate-900' : 'text-slate-500'}>Upload Document</span>
      </div>
     </div>
    )}

    {/* Wizard Form Cards */}
    <div className="bg-white border border-border rounded-2xl shadow-premium-sm p-6 sm:p-8">
     
     {step === 1 && (
      <div className="space-y-6">
       <div>
        <h3 className="text-xl font-bold text-slate-900">Step 1: Basic Information</h3>
        <p className="text-xs text-slate-500 mt-1">Provide your organization name and address.</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
         label="NGO Name"
         id="name"
         placeholder="e.g. Hope Foundation"
         error={errors.name}
         {...register('name', { required: 'NGO Legal Name is required' })}
        />
        <InputField
         label="Phone Number"
         id="phone"
         placeholder="e.g. +91 9988776655"
         error={errors.phone}
         {...register('phone', { required: 'Contact phone is required' })}
        />
       </div>
       <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 block">Street Address Details</label>
        <textarea
         id="address"
         rows="2"
         placeholder="Complete office or facility address..."
         {...register('address', { required: 'Street address is required' })}
         className="w-full px-4 py-3 border border-border rounded-xl text-xs bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none min-h-[70px]"
        />
        {errors.address && <p className="text-[10px] text-red-500">{errors.address.message}</p>}
       </div>
       {/* Map Coordinator Picker */}
       <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
         <span className="font-semibold text-slate-700 flex items-center gap-1.5"><Compass className="w-4 h-4 text-primary" /> Map Pin Coordinates</span>
         <span className="font-mono text-primary font-bold">Coords: {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}</span>
        </div>
        <div className="h-64 rounded-xl overflow-hidden border border-border">
         <LeafletMap
          center={[selectedCoords.lat, selectedCoords.lng]}
          zoom={13}
          markers={[{ lat: selectedCoords.lat, lng: selectedCoords.lng, popupContent: <div><b>NGO Registered Coordinates</b></div> }]}
          onMapClick={handleMapClick}
         />
        </div>
        <p className="text-[10px] text-slate-400">Click anywhere on the map above to select the coordinates of your NGO facility.</p>
       </div>
       <div className="pt-4 border-t border-border flex justify-end">
        <Button type="button" variant="primary" onClick={handleNextStep} icon={ArrowRight}>
         Continue to Document
        </Button>
       </div>
      </div>
     )}

     {step === 3 && (
      <div className="space-y-6">
       <div>
        <h3 className="text-xl font-bold text-slate-900">Step 3: Document Filings Upload</h3>
        <p className="text-xs text-slate-500 mt-1">Upload the required certifications. Document preview is supported before submission.</p>
       </div>

       <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        
        {/* 11 slots list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {DOCUMENT_SLOTS.map((slot) => {
          const pages = uploadedFiles[slot.key];
          return (
           <div key={slot.key} className="border border-border p-4 rounded-xl bg-slate-50 flex flex-col justify-between gap-4">
            <div className="flex justify-between items-start">
             <div className="space-y-1">
              <span className="text-xs font-bold text-slate-800 block">{slot.label}</span>
              <span className="text-[9px] text-slate-400 block">Upload scans (PDF, Images)</span>
             </div>
             {pages && pages.length > 0 && (
              <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
               {pages.length} page(s)
              </span>
             )}
            </div>

            {pages && pages.length > 0 ? (
             <div className="flex flex-wrap gap-2 p-2 bg-white border border-slate-100 rounded-lg">
              {pages.map((page, idx) => (
               <div key={page.id} className="relative group w-12 h-12 rounded border border-border bg-slate-50 overflow-hidden shrink-0">
                <img src={page.previewUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                 <button
                  type="button"
                  onClick={() => setSelectedPreviewPage({ page, label: `${slot.label} - Page ${idx + 1}` })}
                  className="p-1 text-white hover:text-blue-200 cursor-pointer"
                  title="Preview page"
                 >
                  <Eye className="w-3.5 h-3.5" />
                 </button>
                 <button
                  type="button"
                  onClick={() => handleRemovePage(slot.key, page.id)}
                  className="p-1 text-white hover:text-red-400 cursor-pointer"
                  title="Delete page"
                 >
                  <Trash2 className="w-3.5 h-3.5" />
                 </button>
                </div>
                <span className="absolute bottom-0 inset-x-0 text-[8px] bg-black/70 text-white text-center py-0.5 font-bold font-mono">
                 P.{idx + 1}
                </span>
               </div>
              ))}

              <div className="w-12 h-12 shrink-0">
               <input
                type="file"
                id={`file-add-${slot.key}`}
                accept="image/*,application/pdf"
                multiple
                onChange={(e) => handleFileChange(slot.key, e)}
                className="hidden"
               />
               <button
                type="button"
                onClick={() => document.getElementById(`file-add-${slot.key}`).click()}
                className="w-full h-full border border-dashed border-slate-300 hover:border-primary rounded flex flex-col items-center justify-center text-slate-400 hover:text-primary bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer"
               >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[7px] font-bold mt-0.5">Add Page</span>
               </button>
              </div>
             </div>
            ) : (
             <div className="border border-dashed border-slate-200 p-4 rounded-lg bg-white flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-[10px] text-slate-400">No pages uploaded yet</span>
              <input
               type="file"
               id={`file-init-${slot.key}`}
               accept="image/*,application/pdf"
               multiple
               onChange={(e) => handleFileChange(slot.key, e)}
               className="hidden"
              />
              <Button
               type="button"
               variant="secondary"
               size="sm"
               className="text-[9px] py-1 px-3 font-bold"
               onClick={() => document.getElementById(`file-init-${slot.key}`).click()}
               icon={Upload}
              >
               Upload Pages
              </Button>
             </div>
            )}
           </div>
          );
         })}
        </div>

        <div className="pt-4 border-t border-border flex justify-between">
         <Button type="button" variant="secondary" onClick={() => setStep(1)} icon={ArrowLeft}>
          Back
         </Button>
         <Button type="submit" variant="primary" icon={CheckCircle} loading={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Submit Application'}
         </Button>
        </div>
       </form>
      </div>
     )}

     {step === 4 && (
      <div className="text-center space-y-6 py-8">
       <div className="w-16 h-16 bg-[#F1F8F5] border border-emerald-100 rounded-full flex items-center justify-center text-primary mx-auto">
        <CheckCircle className="w-8 h-8" />
       </div>

       <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Application Submitted Successfully</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
         Your NGO partnership filings have been logged into our system queue. An administrator will verify the government registrations and map coordinates.
        </p>
       </div>

       <div className="p-4 bg-slate-50 border border-border rounded-xl text-left max-w-sm mx-auto text-xs font-mono space-y-2">
        <div className="flex justify-between">
         <span className="text-slate-400">APPLICATION STATUS:</span>
         <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px]">PENDING AUDIT</span>
        </div>
        <div className="flex justify-between">
         <span className="text-slate-400">QUEUE INDEX:</span>
         <span className="text-slate-900 font-bold">#DB-REG-{trackingId}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-[10px] text-slate-400 text-center leading-relaxed">
         <span>Our admins typically audit document filings within 24 hours.</span>
        </div>
       </div>

       <div className="pt-4 flex flex-col gap-2 max-w-xs mx-auto">
        <Button variant="primary" className="w-full" onClick={() => navigate('/auth')}>
         Go to Login Screen
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => navigate('/')}>
         Return to Home
        </Button>
       </div>
      </div>
     )}

    </div>

    {/* PAGE PREVIEW MODAL */}
    {selectedPreviewPage && (
     <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-border w-full max-w-2xl rounded-2xl shadow-premium-2xl overflow-hidden flex flex-col max-h-[85vh]">
       <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50">
        <div className="text-xs">
         <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Document Page Preview</span>
         <span className="font-bold text-slate-900">{selectedPreviewPage.label}</span>
        </div>
        <button
         type="button"
         onClick={() => setSelectedPreviewPage(null)}
         className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
        >
         <X className="w-4 h-4" />
        </button>
       </div>
       <div className="flex-1 overflow-auto bg-slate-900 p-6 flex items-center justify-center">
        <img
         src={selectedPreviewPage.page.previewUrl}
         alt={selectedPreviewPage.page.name}
         className="max-h-[60vh] object-contain rounded border border-slate-700/60"
        />
       </div>
       <div className="p-3 bg-slate-50 border-t border-border flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>File: {selectedPreviewPage.page.name}</span>
       </div>
      </div>
     </div>
    )}

   </main>
  </div>
 );
}
