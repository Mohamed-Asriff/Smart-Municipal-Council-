import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createBinIcon = (fill) => {
  let color = '#15803d';
  if (fill >= 85) color = '#dc2626';
  else if (fill >= 70) color = '#d97706';
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M19 8h-2V6c0-1.1-.9-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8zm-4 0H9V6h6v2z"/></svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
};

export const WasteMap = ({ bins, onSelectBin }) => {
  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer center={[7.4167, 81.8217]} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        {bins.map((bin) => (
          <Marker 
            key={bin.id} 
            position={[bin.latitude, bin.longitude]} 
            icon={createBinIcon(bin.latestFillPercentage || 0)}
            eventHandlers={{ click: () => onSelectBin(bin) }}
          >
            <Popup>
              <div className="p-1 min-w-50">
                <p className="font-bold text-kmc-navy text-sm">{bin.name}</p>
                <div className="w-full bg-slate-200 rounded-full h-2 my-2">
                  <div className="h-2 rounded-full" style={{ width: `${bin.latestFillPercentage}%`, backgroundColor: bin.latestFillPercentage > 85 ? '#dc2626' : '#15803d' }}></div>
                </div>
                <p className="text-xs font-bold text-right">{bin.latestFillPercentage?.toFixed(1)}% Full</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};