import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import {
  Sparkles, CheckCircle, Package, ArrowRight, ArrowLeft,
  FileText, Upload, ShieldCheck, Heart, Info, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
import Navbar from '../components/Navbar';

export default function RequestWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const preselectedCategory = searchParams.get('category') || '';
  const preselectedNgoId = searchParams.get('ngo') || '';

  const [step, setStep] = useState(1); // 1: Category & Details, 2: Document Audit, 3: Success Receipt
  const [formData, setFormData] = useState({
    category: preselectedCategory,
    description: '',
    weight: '',
    trustDocUploaded: false,
    fileName: '',
  });

  const categories = [
    'Blankets', 'Clothes', 'Medical Equipment', 'Daily Essentials',
    'School Supplies', 'Books', 'Toys', 'Food', 'Electronics'
  ];

  // Drag and drop mock state
  const [isDragOver, setIsDragOver] = useState(false);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.category) {
        toast.error('Please select an item category.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        trustDocUploaded: true,
        fileName: file.name
      }));
    }
  };

  return (
    <div className="db-page min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Shared Main Navbar */}
      <Navbar />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-xl mx-auto w-full p-6 flex flex-col justify-center">
        
        {/* Step Indicator Header (Hide on Success) */}
        {step < 3 && (
          <div className="mb-8 flex justify-between items-center text-xs animate-fadeInUp">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
              <span className={step === 1 ? 'font-bold text-slate-900' : 'text-slate-500'}>Category & Specs</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
              <span className={step === 2 ? 'font-bold text-slate-900' : 'text-slate-500'}>Document Verification</span>
            </div>
          </div>
        )}

        {/* Wizard content cards */}
        {step === 1 && (
          <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6 animate-fadeInUp">
            <h2 className="font-sans font-bold text-lg mb-1 text-slate-900">Select Parcel Category & Specifications</h2>
            <p className="text-xs text-slate-500 mb-6">Describe the materials you are dispatching to matched NGOs.</p>

            <form onSubmit={handleNextStep} className="space-y-5">
              {/* Category list picks */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Item Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: c }))}
                      className={`p-2.5 text-xs rounded-md border text-center transition-all cursor-pointer font-medium ${
                        formData.category === c
                          ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-blue-600 hover:text-blue-600'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <InputField
                label="Detailed Description"
                id="description"
                placeholder="e.g. 25 organic cotton sweaters, size medium, packed in waterproof box"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />

              <InputField
                label="Weight Estimate (kg)"
                id="weight"
                type="number"
                placeholder="e.g. 12"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                required
              />

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button type="submit" variant="primary" icon={ArrowRight}>
                  Next: Verify Materials
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6 animate-fadeInUp">
            <h2 className="font-sans font-bold text-lg mb-1 text-slate-900">Verification Document Upload</h2>
            <p className="text-xs text-slate-500 mb-6">Optional: Upload material purchase logs or certificates to secure higher verification points.</p>

            <form onSubmit={handleNextStep} className="space-y-5">
              {/* Drag and Drop File box */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    setFormData(prev => ({ ...prev, trustDocUploaded: true, fileName: file.name }));
                  }
                }}
                className={`border border-dashed rounded-md p-8 text-center transition-all ${
                  isDragOver ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'
                }`}
              >
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-bold mb-1 text-slate-800">Drag and drop receipts or documentation here</p>
                <p className="text-[10px] text-slate-500 mb-3">Accepts PDF, PNG, JPG files up to 5MB</p>
                
                <input
                  type="file"
                  id="fileUpload"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => document.getElementById('fileUpload').click()}
                >
                  Choose File
                </Button>

                {formData.trustDocUploaded && (
                  <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-md text-xs font-mono text-blue-600 inline-flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{formData.fileName || 'document.pdf'}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" variant="primary" icon={CheckCircle}>
                  Sign & Confirm Dispatch
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm p-6 text-center space-y-6 animate-successPop">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-sans font-bold text-lg text-slate-900">Donation Transaction Lodged</h2>
              <p className="text-xs text-slate-500">Your dispatch request has been signed and matching algorithms are calculated.</p>
            </div>

            {/* Receipt Summary receipt block */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">RECEIPT ID:</span>
                <span className="font-bold text-blue-600">DB-{Math.floor(Math.random() * 9000 + 1000)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">CATEGORY:</span>
                <span className="text-slate-950 font-bold">{formData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">WEIGHT:</span>
                <span className="text-slate-950 font-bold">{formData.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DOCUMENTATION:</span>
                <span className="text-emerald-600 font-bold">{formData.trustDocUploaded ? 'VERIFIED SIGNATURE' : 'NOT UPLOADED'}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button variant="primary" className="w-full" onClick={() => navigate('/smart-match')}>
                Find Optimal Routing
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => navigate('/donor-dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
