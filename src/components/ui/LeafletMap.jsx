import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet default marker icons fix using CDN assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A controller component to update map view dynamically when center or zoom changes
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

// A controller to capture map clicks and update marker location (e.g. for registration pickers)
function ClickHandler({ onMapClick }) {
  const map = useMap();
  useEffect(() => {
    if (!onMapClick) return;
    const handleMapClick = (e) => {
      onMapClick(e.latlng);
    };
    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [onMapClick, map]);
  return null;
}

export default function LeafletMap({
  center = [12.9716, 77.5946],
  zoom = 13,
  markers = [],
  circles = [],
  polylines = [],
  onMapClick = null,
  className = 'h-full w-full'
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border shadow-premium-sm ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Dynamic Center Updates */}
        <MapController center={center} zoom={zoom} />
        
        {/* Click events handler */}
        {onMapClick && <ClickHandler onMapClick={onMapClick} />}

        {/* Render Circles */}
        {circles.map((circle, idx) => (
          <Circle
            key={`circle-${idx}`}
            center={[circle.lat, circle.lng]}
            radius={circle.radius || 1000}
            pathOptions={{
              color: circle.color || '#2E7D32',
              fillColor: circle.color || '#2E7D32',
              fillOpacity: circle.fillOpacity || 0.15,
              weight: circle.weight || 1
            }}
          />
        ))}

        {/* Render Polylines */}
        {polylines.map((poly, idx) => (
          <Polyline
            key={`poly-${idx}`}
            positions={poly.positions}
            pathOptions={{
              color: poly.color || '#2E7D32',
              weight: poly.weight || 4,
              dashArray: poly.dashArray || '5, 5'
            }}
          />
        ))}

        {/* Render Markers */}
        {markers.map((marker, idx) => {
          const position = [marker.lat, marker.lng];
          return (
            <Marker key={`marker-${idx}`} position={position}>
              {marker.popupContent && (
                <Popup>
                  <div className="font-sans text-xs space-y-1.5 p-0.5 text-slate-800 leading-normal">
                    {marker.popupContent}
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
