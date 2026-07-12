import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, MapPin, CheckCircle, Package, ArrowLeft, Calendar, ShieldCheck, RefreshCw, Navigation } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Navbar from '../components/Navbar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DONOR_COORDS = [12.9592, 77.5726];
const NGO_COORDS = [12.9716, 77.5946];
const MIDPOINT_COORDS = [12.9654, 77.5836];

export default function LogisticsTracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(4); // default In Transit
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const courierMarker = useRef(null);
  const routeLine = useRef(null);

  const milestones = [
    { title: 'Requested', time: '10:00 AM, July 2', desc: 'Donation request logged by donor, pending verification.', coords: DONOR_COORDS },
    { title: 'Approved', time: '10:15 AM, July 2', desc: 'Listing approved by Admin and matched with NGO need parameters.', coords: DONOR_COORDS },
    { title: 'Dispatched', time: '10:45 AM, July 2', desc: 'Logistics carrier assigned and dispatched to donor pickup location.', coords: DONOR_COORDS },
    { title: 'In Transit', time: '11:15 AM, July 2', desc: 'Shipment picked up, currently in transit to destination NGO hub.', coords: MIDPOINT_COORDS },
    { title: 'Delivered', time: '11:40 AM, July 2', desc: 'Parcels delivered to the destination NGO Hub address.', coords: NGO_COORDS },
    { title: 'Completed', time: '11:55 AM, July 2', desc: 'Digital receipt matching complete, transaction hashed on ledger.', coords: NGO_COORDS },
  ];

  // Current active coordinates based on step
  const currentCoords = milestones[activeStep - 1]?.coords || DONOR_COORDS;

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
        weight: 2.5,
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
      courierMarker.current.setLatLng(currentCoords);
      if (mapInstance.current) {
        mapInstance.current.panTo(currentCoords);
      }
    }
  }, [activeStep, currentCoords]);

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

          {/* Coordinates log panel */}
          <div className="bg-slate-50 border border-border p-4 rounded-xl text-xs space-y-2.5 font-mono">
            <div className="flex justify-between items-center font-bold">
              <span>Transit Status:</span>
              <span className="text-primary uppercase tracking-wide">
                {milestones[activeStep - 1]?.title}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Current GPS Coords:</span>
              <span className="text-slate-800 font-bold flex items-center gap-1">
                <Navigation className="w-3 h-3 text-primary animate-pulse" />
                {currentCoords[0].toFixed(5)}° N, {currentCoords[1].toFixed(5)}° E
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Carrier Unit:</span>
              <span className="text-slate-800">Express Cargo #DB-990</span>
            </div>
          </div>

          <div className="relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 pl-8 space-y-6 flex-grow">
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

          {/* Stepper Controls */}
          <div className="pt-4 border-t border-border flex gap-2 mt-auto">
            <button
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              className="w-full py-2 border border-border bg-white hover:bg-slate-50 text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              PREVIOUS STEP
            </button>
            <button
              onClick={() => setActiveStep(prev => Math.min(6, prev + 1))}
              className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              NEXT STEP
            </button>
          </div>
        </aside>

        {/* Right Side: Map */}
        <main ref={mapRef} className="flex-grow min-h-[350px] lg:min-h-0 z-10" />

      </div>
    </div>
  );
}
