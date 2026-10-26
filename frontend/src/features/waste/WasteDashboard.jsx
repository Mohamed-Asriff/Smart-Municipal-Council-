import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Activity, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../../api';
import { WasteMap } from '../../components/maps/WasteMap';

export default function WasteDashboard() {
  const [bins, setBins] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBins = async () => {
    setIsLoading(true);
    try {
      const [binsRes, statsRes] = await Promise.all([
        api.getBins(),
        api.getWasteStats()
      ]);
      setBins(Array.isArray(binsRes) ? binsRes : []);
      setStats(statsRes);
    } catch (e) { 
      console.error('Failed to load waste data', e); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
    const interval = setInterval(fetchBins, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-serif font-bold text-kmc-navy">Smart Waste IoT Network</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time sensor telemetry and bin fill levels.</p>
        </div>
        <button onClick={fetchBins} className="btn-gov-outline py-2.5 px-4 text-sm shadow-none">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

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
            <div><p className="text-xs font-bold text-slate-500 uppercase">Avg Fill Level</p><p className="text-xl font-black text-kmc-navy">{stats.averageFillPercentage?.toFixed(1) || 0}%</p></div>
          </div>
          <div className="card-gov p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5"/></div>
            <div><p className="text-xs font-bold text-slate-500 uppercase">Active Sensors</p><p className="text-xl font-black text-kmc-navy">{stats.activeBins}</p></div>
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        <WasteMap bins={bins} onSelectBin={(bin) => console.log(bin)} />
      </div>
    </div>
  );
}