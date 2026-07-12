import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { useToast } from '../components/ui/Toast';
import LeafletMap from '../components/ui/LeafletMap';

const MAP_CENTER = [12.9716, 77.5946];

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'donor', // 'donor' | 'ngo' | 'partner'
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Your message has been sent successfully! Our support team will reach out shortly.');
    setFormData({ name: '', email: '', role: 'donor', message: '' });
  };

  const markers = [
    {
      lat: MAP_CENTER[0],
      lng: MAP_CENTER[1],
      popupContent: (
        <div>
          <strong className="text-primary font-bold">DonateBridge HQ</strong>
          <p className="text-slate-500 text-[10px] mt-0.5">MG Road, Bengaluru</p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 space-y-16">
        
        {/* Header Title */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 bg-emerald-50 text-primary rounded-full font-bold uppercase tracking-wider border border-emerald-100" style={{ fontSize: '11px' }}>
            Get In Touch
          </span>
          <h1 className="font-display font-black text-slate-900 tracking-tight leading-tight">
            We'd love to hear from you
          </h1>
          <p className="text-slate-500 leading-relaxed max-w-xl mx-auto" style={{ fontSize: '16px' }}>
            Have questions about donations, NGO verification, or logistics partnerships? Send us a message.
          </p>
        </section>

        {/* Form and Details Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Contact Details & Info */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="bg-white border border-border p-8 rounded-2xl shadow-premium-sm space-y-8 flex-grow">
              <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>
                Contact Information
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-primary shrink-0 border border-emerald-100">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800" style={{ fontSize: '15px' }}>Email Us</p>
                    <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>support@donatebridge.org</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-primary shrink-0 border border-emerald-100">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800" style={{ fontSize: '15px' }}>Call Us</p>
                    <p className="text-slate-500 mt-1" style={{ fontSize: '14px' }}>+91 (80) 4567-8900</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-primary shrink-0 border border-emerald-100">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800" style={{ fontSize: '15px' }}>Our Office</p>
                    <p className="text-slate-500 mt-1 leading-relaxed" style={{ fontSize: '14px' }}>
                      MG Road Central Office Hub,<br />
                      Sector 4, Bengaluru, Karnataka
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map wrapper using shared LeafletMap */}
            <div className="h-64 w-full rounded-2xl overflow-hidden shadow-premium-sm border border-border">
              <LeafletMap
                center={MAP_CENTER}
                zoom={13}
                markers={markers}
                className="h-full w-full border-none"
              />
            </div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white border border-border p-8 rounded-2xl shadow-premium-sm">
            <h3 className="font-display font-bold text-slate-900 mb-6" style={{ fontSize: '18px' }}>
              Send us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Full Name"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                required
              />

              <InputField
                label="Email Address"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                required
              />

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">I am a...</label>
                <div className="grid grid-cols-3 gap-3">
                  {['donor', 'ngo', 'partner'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role }))}
                      className={`py-3 px-4 border rounded-xl font-semibold capitalize text-center transition-all cursor-pointer ${
                        formData.role === role
                          ? 'border-primary bg-emerald-50 text-primary'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                      style={{ fontSize: '14px', minHeight: '48px' }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 block">Message Details</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="How can we help you?"
                  rows={4}
                  className="w-full p-4 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-primary placeholder-slate-400 bg-white"
                  style={{ fontSize: '16px', minHeight: '120px' }}
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button type="submit" variant="primary" className="w-full" icon={Send}>
                  Send Message
                </Button>
              </div>
            </form>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
