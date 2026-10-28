import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trash2, Activity, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../../api';

// Fix Leaflet Default Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createBinIcon = (fill) => {
  let color = '#15803d'; // Green
  if (fill >= 85) color = '#dc2626'; // Red
  else if (fill >= 70) color = '#d97706'; // Amber
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M19 8h-2V6c0-1.1-.9-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8zm-4 0H9V6h6v2z"/></svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
};

export default function WasteBinDashboard() {
  const [bins, setBins] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBin, setSelectedBin] = useState(null);

  const fetchBins = async () => {
    setIsLoading(true);
    try {
      const [binsRes, statsRes] = await Promise.all([
        api.getBins(),
        api.getWasteStats()
      ]);
      setBins(binsRes || []);
      setStats(statsRes);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBins();
    const interval = setInterval(fetchBins, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-serif font-bold text-kmc-navy">Smart Waste IoT Network</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time sensor telemetry and bin fill levels.</p>
        </div>
        <button onClick={fetchBins} className="btn-gov-outline py-2.5 px-4 text-sm shadow-none">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* KPI Row */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
          <div className="card-gov p-4 flex items-center gap-4 border-l-4 border-l-kmc-navy">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-kmc-navy"><Trash2 className="w-5 h-5"/></div>
            <div><p className="text-xs font-bold text-slate-500 uppercase">Total Bins</p><p className="text-xl font-black text-kmc-navy">{stats.totalBins}</p></div>
          </div>
          <div className="card-gov p-4 flex items-center gap-4 border-l-4 border-l-red-500">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600"><AlertTriangle className="w-5 h-5"/></div>
            <div><p className="text-xs font-bold text-slate-500 uppercase">Critical (&gt;85%)</p><p className="text-xl font-black text-red-600">{stats.criticalBins}</p></div>
          </div>
          <div className="card-gov p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><Activity className="w-5 h-5"/></div>
            <div><p className="text-xs font-bold text-slate-500 uppercase">Avg Fill Level</p><p className="text-xl font-black text-kmc-navy">{stats.averageFillPercentage.toFixed(1)}%</p></div>
          </div>
          <div className="card-gov p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5"/></div>
            <div><p className="text-xs font-bold text-slate-500 uppercase">Active Sensors</p><p className="text-xl font-black text-kmc-navy">{stats.activeBins}</p></div>
          </div>
        </div>
      )}

      {/* Full Width Map */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
        <MapContainer center={[7.4167, 81.8217]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {bins.map((bin) => (
            <Marker 
              key={bin.id} 
              position={[bin.latitude, bin.longitude]} 
              icon={createBinIcon(bin.latestFillPercentage || 0)}
              eventHandlers={{ click: () => setSelectedBin(bin) }}
            >
              <Popup className="kmc-popup">
                {/* FIXED TAILWIND CLASSES HERE */}
                <div className="p-1 min-w-50">
                  <p className="font-bold text-kmc-navy text-sm">{bin.name}</p>
                  <p className="text-xs text-slate-500 mb-2">Zone: {bin.zone} | ID: {bin.id}</p>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                    <div className="h-2 rounded-full" style={{ width: `${bin.latestFillPercentage}%`, backgroundColor: bin.latestFillPercentage > 85 ? '#dc2626' : '#15803d' }}></div>
                  </div>
                  <p className="text-xs font-bold text-right">{bin.latestFillPercentage?.toFixed(1)}% Full</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Floating Legend */}
        {/* FIXED TAILWIND CLASSES HERE */}
        <div className="absolute bottom-6 right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-200 z-400">
          <p className="text-xs font-bold text-kmc-navy mb-3 uppercase tracking-wide">Fill Level Status</p>
          <div className="space-y-2 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> Normal (&lt;70%)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Warning (70-85%)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600"></span> Critical (&gt;85%)</div>
          </div>
        </div>
      </div>
    </div>
  );
}