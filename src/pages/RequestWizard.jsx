import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar, Clock, Paperclip, ChevronRight, ChevronLeft, Check,
  Sparkles, FileText, ArrowRight, ShieldCheck, Heart, AlertCircle, UploadCloud
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';

export default function RequestWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialNgo = searchParams.get('ngo') || '';
  const initialCat = searchParams.get('category') || '';
  const initialDesc = searchParams.get('desc') || '';
  const initialWeight = searchParams.get('weight') || '';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ngoId: initialNgo || '1',
    category: initialCat || 'Blankets',
    description: initialDesc || '',
    weight: initialWeight || '',
    pickupDate: '',
    pickupTime: '10:00 - 14:00',
    address: '104 Oakwood Apartments, East End',
    phone: '+1 (555) 019-2831',
    files: [],
  });

  const [dragOver, setDragOver] = useState(false);
  const [receiptCode, setReceiptCode] = useState('');

  const categories = [
    'Books', 'Clothes', 'Food', 'Toys', 'School Supplies',
    'Blankets', 'Furniture', 'Medical Equipment', 'Electronics', 'Daily Essentials'
  ];

  const handleNext = () => {
    if (step < 4) {
      if (step === 3) {
        // Generate random receipt code
        setReceiptCode(`DB-REC-${Math.floor(100000 + Math.random() * 900000)}`);
      }
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files.map(f => f.name)] }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files.map(f => f.name)] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <Card className="w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-premium-lg flex flex-col min-h-[500px]">
        {/* Header progress timeline */}
        <div className="border-b border-slate-100 dark:border-slate-850 pb-6 mb-6">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-4">
            <span>PHYSICAL ITEM DONATION REQUEST WIZARD</span>
            <span className="text-primary font-bold">Step {step} of 4</span>
          </div>

          {/* Stepper bubbles */}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary z-0 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                disabled={num > step}
                onClick={() => setStep(num)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs relative z-10 transition-all ${
                  step === num ? 'bg-primary text-white ring-4 ring-emerald-500/20' :
                  step > num ? 'bg-primary text-white' :
                  'bg-slate-250 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {step > num ? <Check className="w-4 h-4" /> : num}
              </button>
            ))}
          </div>
        </div>

        {/* Step Panels */}
        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base mb-1">Select Item Categories</h3>
                <p className="text-xs text-slate-500">Pick the primary category mapping for this shipping package.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                    className={`p-3 text-xs font-bold rounded border text-center transition-all ${
                      formData.category === cat
                        ? 'border-primary bg-emerald-50 dark:bg-emerald-950/20 text-primary dark:text-emerald-450 ring-2 ring-primary'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-slate-350'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <InputField
                label="Detailed Item Description"
                id="description"
                placeholder="Describe quantity, dimensions, and box pack details..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />

              <InputField
                label="Total Measured Weight (kg)"
                id="weight"
                type="number"
                placeholder="e.g. 25"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                required
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base mb-1">Courier Scheduling Coordinates</h3>
                <p className="text-xs text-slate-500">Allocate logistics interval slots and pickup coordinates.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Pickup Date Selection"
                  id="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupDate: e.target.value }))}
                  required
                />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-350 block mb-1.5">
                    Pickup Hour Interval
                  </label>
                  <select
                    value={formData.pickupTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, pickupTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary"
                  >
                    <option value="10:00 - 14:00">10:00 AM - 02:00 PM</option>
                    <option value="14:00 - 18:00">02:00 PM - 06:00 PM</option>
                    <option value="18:00 - 21:00">06:00 PM - 09:00 PM</option>
                  </select>
                </div>
              </div>

              <InputField
                label="Pickup Address Location"
                id="address"
                placeholder="Apartment/Suite, Street, City"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />

              <InputField
                label="On-site Contact Mobile"
                id="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base mb-1">Verify Parcel Media Documents</h3>
                <p className="text-xs text-slate-500">Attach packaging receipts, list details, or cargo pictures.</p>
              </div>

              {/* Drag and Drop Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  dragOver ? 'border-primary bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                <input
                  type="file"
                  id="file-select"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="file-select" className="cursor-pointer">
                  <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Drag & drop files here, or click to upload</p>
                  <p className="text-[10px] text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                </label>
              </div>

              {formData.files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase text-slate-500">Uploaded documents</p>
                  {formData.files.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                      <span className="font-semibold text-slate-750 dark:text-slate-200 flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5" /> {file}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }))}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Donation Request Registered!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your parcel details have been submitted and matched with active NGO priority requirements.
                </p>
              </div>

              {/* Receipt card info */}
              <Card className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md mx-auto text-left space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Transact Ledger ID</span>
                  <span className="font-mono text-xs font-bold text-primary">{receiptCode}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-slate-500 font-semibold">Category:</span>
                  <span className="font-bold text-right">{formData.category}</span>
                  
                  <span className="text-slate-500 font-semibold">Measured Weight:</span>
                  <span className="font-bold text-right">{formData.weight} kg</span>

                  <span className="text-slate-500 font-semibold">Address coordinates:</span>
                  <span className="font-bold text-right truncate pl-4">{formData.address}</span>

                  <span className="text-slate-500 font-semibold">Pickup Interval:</span>
                  <span className="font-bold text-right font-mono text-[11px]">{formData.pickupDate} ({formData.pickupTime})</span>
                </div>
              </Card>

              <div className="text-[10px] text-slate-500 max-w-md mx-auto flex items-start gap-2 bg-blue-50 dark:bg-slate-800/50 p-3 rounded text-left border border-blue-200 dark:border-slate-850">
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p>
                  A courier vehicle is being allocated to your location. You can track GPS coordinates and milestone sign-offs in real time on your dashboard.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-6 mt-6 shrink-0">
          {step > 1 && step < 4 ? (
            <Button variant="secondary" onClick={handleBack} icon={ChevronLeft}>
              Back
            </Button>
          ) : <div />}

          {step < 4 ? (
            <Button variant="primary" onClick={handleNext} className="ml-auto">
              {step === 3 ? 'Register Request' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="primary" onClick={() => navigate('/donor-dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
