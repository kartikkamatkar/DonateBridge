import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, MapPin, CheckCircle, Package, ArrowLeft, Calendar, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Navbar from '../components/Navbar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DONOR_COORDS = [12.9592, 77.5726];
const NGO_COORDS = [12.9716, 77.5946];

export default function LogisticsTracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(3);
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const courierMarker = useRef(null);
  const routeLine = useRef(null);

  const milestones = [
    { title: 'Donation Request Lodged', time: '10:00 AM, July 2', desc: 'Donor Sarah Jenkins logged 25 Wool Blankets.', done: true },
    { title: 'NGO Match Approval Signed', time: '10:15 AM, July 2', desc: 'Hope Foundation accepted and validated item spec codes.', done: true },
    { title: 'Courier Dispatched', time: '10:45 AM, July 2', desc: 'Express Cargo #DB-990 dispatched to collect cargo.', done: true },
    { title: 'Fulfillment & Scaling', time: 'Pending', desc: 'Cargo scaling and digital signatures confirming receipt at NGO Hub.', done: false },
    { title: 'Impact Ledger Confirmed', time: 'Pending', desc: 'Audit transaction saved to the transparency block ledger.', done: false },
  ];

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([12.9654, 77.5836], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      const donorIcon = L.divIcon({
        html: `<div class="w-6 h-6 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-white font-extrabold text-[8px] shadow-premium-md">DON</div>`,
        className: 'custom-donor-icon',
        iconSize: [24, 24]
      });
      L.marker(DONOR_COORDS, { icon: donorIcon })
        .addTo(mapInstance.current)
        .bindPopup('<b>Donor Pickup:</b> Sarah Jenkins<br/>Bengaluru City Center');

      const ngoIcon = L.divIcon({
        html: `<div class="w-6 h-6 rounded-full bg-[#2E7D32] border-2 border-white flex items-center justify-center text-white font-extrabold text-[8px] shadow-premium-md">NGO</div>`,
        className: 'custom-ngo-icon',
        iconSize: [24, 24]
      });
      L.marker(NGO_COORDS, { icon: ngoIcon })
        .addTo(mapInstance.current)
        .bindPopup('<b>NGO Destination Hub:</b> Hope Foundation');

      routeLine.current = L.polyline([DONOR_COORDS, NGO_COORDS], {
        color: '#2E7D32',
        weight: 2,
        dashArray: '4,6',
        opacity: 0.8
      }).addTo(mapInstance.current);

      const truckIcon = L.divIcon({
        html: `<div class="w-7 h-7 rounded-lg bg-[#2E7D32] border border-white flex items-center justify-center text-white shadow-premium-lg animate-pulse"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>`,
        className: 'custom-truck-icon',
        iconSize: [28, 28]
      });
      courierMarker.current = L.marker(DONOR_COORDS, { icon: truckIcon }).addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        courierMarker.current = null;
        routeLine.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (courierMarker.current) {
      let nextPos = DONOR_COORDS;
      if (activeStep <= 2) {
        nextPos = DONOR_COORDS;
      } else if (activeStep === 3) {
        nextPos = [
          (DONOR_COORDS[0] + NGO_COORDS[0]) / 2,
          (DONOR_COORDS[1] + NGO_COORDS[1]) / 2
        ];
      } else {
        nextPos = NGO_COORDS;
      }
      courierMarker.current.setLatLng(nextPos);
      if (mapInstance.current) {
        mapInstance.current.panTo(nextPos);
      }
    }
  }, [activeStep]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 border-t border-border">
        
        {/* Left Side: Milestones */}
        <aside className="w-full lg:w-[460px] bg-white border-r border-border p-6 flex flex-col min-h-0 overflow-y-auto space-y-6 shrink-0 shadow-premium-sm">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <h3 className="text-sm font-display font-bold text-slate-900">Milestone Courier Tracker</h3>
              <p className="text-[10px] text-slate-400 font-mono">PARCEL TIMELINE PATH</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-400 block">PARCEL ID</span>
              <span className="text-xs font-mono font-bold text-primary">DB-{id || '1042'}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-border p-4 rounded-xl text-xs space-y-2 font-mono">
            <div className="flex justify-between items-center font-bold">
              <span>Transit Status:</span>
              <span className="text-primary">
                {activeStep <= 2 ? 'Dispatched' : activeStep === 3 ? 'In Transit' : 'Delivered'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Estimated Delivery:</span>
              <span className="text-slate-800">
                {activeStep <= 2 ? '18 mins' : activeStep === 3 ? '8 mins' : 'Arrived'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Carrier Unit:</span>
              <span className="text-slate-800">Express Cargo #DB-990</span>
            </div>
          </div>

          <div className="relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 pl-8 space-y-6 flex-1">
            {milestones.map((m, idx) => {
              const stepNum = idx + 1;
              const isCurrent = stepNum === activeStep;
              const isPassed = stepNum < activeStep;

              return (
                <div key={idx} className="relative text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center absolute -left-[38px] -top-1 font-mono font-bold text-[9px] border transition-all ${
                    isCurrent ? 'bg-primary text-white border-primary ring-4 ring-primary/10' :
                    isPassed ? 'bg-[#F1F8F5] text-primary border-emerald-200' :
                    'bg-white text-slate-400 border-border'
                  }`}>
                    {isPassed ? '✓' : stepNum}
                  </div>

                  <div className="space-y-0.5">
                    <p className={`font-semibold ${isCurrent ? 'text-primary font-bold' : 'text-slate-900'}`}>{m.title}</p>
                    <p className="text-[9px] text-slate-400 font-mono">{m.time}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border flex gap-2">
            <button
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              className="w-full py-2 border border-border bg-white hover:bg-slate-50 text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              PREVIOUS STEP
            </button>
            <button
              onClick={() => setActiveStep(prev => Math.min(5, prev + 1))}
              className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              NEXT STEP
            </button>
          </div>
        </aside>

        {/* Right Side: Map */}
        <main ref={mapRef} className="flex-1 min-h-[350px] lg:min-h-0 z-10" />

      </div>
    </div>
  );
}
