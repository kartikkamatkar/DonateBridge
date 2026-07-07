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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto w-full p-6 flex flex-col justify-center">
        
        {/* Step Indicator */}
        {step < 3 && (
          <div className="mb-8 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
              <span className={step === 1 ? 'font-semibold text-slate-900' : 'text-slate-500'}>Category & Specs</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
              <span className={step === 2 ? 'font-semibold text-slate-900' : 'text-slate-500'}>Verification Logs</span>
            </div>
          </div>
        )}

        {/* Form Step Cards */}
        {step === 1 && (
          <div className="bg-white border border-border rounded-2xl shadow-premium-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-display font-bold text-ink">Parcel Specifications</h2>
              <p className="text-xs text-slate-500">Provide shipment metrics for AI-assisted NGO routing matches.</p>
            </div>

            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Item Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: c }))}
                      className={`p-2.5 text-xs rounded-xl border text-center transition-all cursor-pointer font-semibold ${
                        formData.category === c
                          ? 'border-primary bg-[#F1F8F5] text-primary'
                          : 'border-border bg-white text-slate-600 hover:border-primary hover:text-primary'
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
                placeholder="e.g. 25 clean wool blankets in waterproof packaging"
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

              <div className="pt-4 border-t border-border flex justify-end">
                <Button type="submit" variant="primary" icon={ArrowRight}>
                  Next step
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-border rounded-2xl shadow-premium-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-display font-bold text-ink">Verification Documentation</h2>
              <p className="text-xs text-slate-500">Optional: Add receipts, photos, or certifications to secure swift approvals.</p>
            </div>

            <form onSubmit={handleNextStep} className="space-y-5">
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
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragOver ? 'border-primary bg-slate-50' : 'border-border bg-slate-50'
                }`}
              >
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-xs font-bold mb-1 text-slate-800">Drag & Drop certificate files here</p>
                <p className="text-[10px] text-slate-400 mb-3">PDF, PNG or JPG files up to 5MB</p>
                
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
                  <div className="mt-4 p-2 bg-[#F1F8F5] border border-emerald-100 rounded-lg text-xs font-mono text-primary inline-flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{formData.fileName || 'document.pdf'}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex justify-between">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" variant="primary" icon={CheckCircle}>
                  Broadcast Shipment
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white border border-border rounded-2xl shadow-premium-sm p-6 text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#F1F8F5] border border-emerald-200 flex items-center justify-center mx-auto text-primary">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-display font-bold text-ink">Transaction Lodged</h2>
              <p className="text-xs text-slate-500 mt-1">AI-assisted logistics tags are successfully generated.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-border rounded-xl text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">TRANSACTION ID:</span>
                <span className="font-bold text-primary">DB-{Math.floor(Math.random() * 9000 + 1000)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-slate-400">CATEGORY:</span>
                <span className="text-slate-900 font-bold">{formData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WEIGHT:</span>
                <span className="text-slate-900 font-bold">{formData.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TRUST RATING:</span>
                <span className="text-emerald-700 font-bold">{formData.trustDocUploaded ? 'HIGH TRUST VERIFICATION' : 'STANDARD'}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button variant="primary" className="w-full" onClick={() => navigate('/discover')}>
                Go to Marketplace
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
