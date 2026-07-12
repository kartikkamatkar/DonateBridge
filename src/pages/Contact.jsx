import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { useToast } from '../components/ui/Toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MAP_CENTER = [12.9716, 77.5946];

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(MAP_CENTER, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      L.marker(MAP_CENTER)
        .addTo(mapInstance.current)
        .bindPopup('<b>DonateBridge HQ</b><br/>MG Road Coordinate Center, Bangalore')
        .openPopup();
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Your message has been successfully logged! Our support team will respond shortly.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full p-6 sm:p-8 space-y-12">
        
        {/* Header Title */}
        <section className="text-center space-y-4 pt-4">
          <span className="px-3 py-1 bg-[#F1F8F5] text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
            GET IN TOUCH
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-slate-900 leading-tight">
            Contact Coordinate Support
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Reach out with partnership enquiries, address coordinate verification reviews, or general support tickets.
          </p>
        </section>

        {/* Form and Details Split */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Contact Details & Info */}
          <div className="space-y-6">
            <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm space-y-6">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">HQ Coordinate Details</h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-border flex items-center justify-center text-primary shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Email Enquiries</p>
                    <p className="text-slate-500 mt-0.5">support@donatebridge.org</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-border flex items-center justify-center text-primary shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Direct Telephone</p>
                    <p className="text-slate-500 mt-0.5">+1 (555) 234-9844</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-border flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Physical Address Coordinates</p>
                    <p className="text-slate-500 mt-0.5">MG Road Central Office Hub, Sector 4, Bangalore</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map wrapper */}
            <div ref={mapRef} className="h-64 w-full border border-border rounded-2xl z-10 shadow-premium-sm" />

          </div>

          {/* Input Contact Form */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-premium-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-6">Send Secure Message</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Full Name / Display Name"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />

              <InputField
                label="Email Address"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Message Details</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your inquiry..."
                  rows={5}
                  className="w-full p-3.5 text-xs rounded-xl border border-border bg-white text-slate-900 focus:outline-none placeholder-slate-400"
                  required
                />
              </div>

              <div className="pt-4 border-t border-border">
                <Button type="submit" variant="primary" className="w-full text-xs font-bold" icon={Send}>
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
