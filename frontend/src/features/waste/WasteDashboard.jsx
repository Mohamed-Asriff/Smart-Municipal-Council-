import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Activity, CheckCircle2, Plus } from 'lucide-react';
import { api } from '../../api';
import { WasteMap } from '../../components/maps/WasteMap';
import BinSidebar from '../../components/waste/BinSidebar';
import BinDetailsModal from '../../components/waste/BinDetailsModal';
import AddBinModal from '../../components/waste/AddBinModal';
import { getFillStatus } from '../../utils/wasteHelpers';

export default function WasteDashboard() {
  const [bins, setBins] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBin, setSelectedBin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddBin, setShowAddBin] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [binsRes, statsRes] = await Promise.all([api.getBins(), api.getWasteStats()]);
      setBins(Array.isArray(binsRes) ? binsRes : []);
      setStats(statsRes);
    } catch (e) {
      console.error('Failed to load waste data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const filteredBins = bins.filter(bin => {
    const matchSearch = (bin.name||'').toLowerCase().includes(searchTerm.toLowerCase())
      || String(bin.id||'').toLowerCase().includes(searchTerm.toLowerCase());
    const matchZone = zoneFilter === 'All' || bin.zone === zoneFilter;
    const fill = bin.latestFillPercentage ?? 0;
    const matchStatus = statusFilter === 'All' || getFillStatus(fill) === statusFilter;
    return matchSearch && matchZone && matchStatus;
  });

  return (
    <div style={{ height:'calc(100vh - 8rem)', display:'flex', flexDirection:'column', gap:'16px' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div>
          <h1 className="text-2xl font-serif font-bold text-kmc-navy">Smart Waste IoT Network</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time sensor telemetry and bin fill levels — Kalmunai Municipal Council</p>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <button onClick={() => setShowAddBin(true)} className="btn-gov py-2.5 px-4 text-sm"
            style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <Plus className="w-4 h-4"/> Add Bin
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', flexShrink:0 }}>
          {[
            { label:'Total Bins', value:stats.totalBins, icon:Trash2, color:'kmc-navy', bg:'slate-100', border:'kmc-navy' },
            { label:'Critical (>85%)', value:stats.criticalBins, icon:AlertTriangle, color:'red-600', bg:'red-50', border:'red-500' },
            { label:'Avg Fill Level', value:(stats.averageFillPercentage?.toFixed(1)||0)+'%', icon:Activity, color:'amber-600', bg:'amber-50', border:'amber-500' },
            { label:'Active Sensors', value:stats.activeBins, icon:CheckCircle2, color:'emerald-600', bg:'emerald-50', border:'emerald-500' },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`card-gov p-4 flex items-center gap-4 border-l-4 border-l-${border}`}>
              <div className={`w-10 h-10 rounded-lg bg-${bg} flex items-center justify-center text-${color}`}>
                <Icon className="w-5 h-5"/>
              </div>
              <div>
                <p className={`text-xs font-bold text-slate-500 uppercase`}>{label}</p>
                <p className={`text-xl font-black text-${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map + Sidebar */}
      <div style={{ flex:1, display:'flex', gap:'16px', overflow:'hidden', minHeight:0 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <WasteMap bins={filteredBins} selectedBin={selectedBin} onSelectBin={setSelectedBin}/>
        </div>
        <BinSidebar
          bins={filteredBins}
          allBins={bins}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          zoneFilter={zoneFilter}
          onZoneChange={setZoneFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          selectedBin={selectedBin}
          onSelectBin={setSelectedBin}
        />
      </div>

      {/* Modals */}
      {selectedBin && (
        <BinDetailsModal bin={selectedBin} onClose={() => setSelectedBin(null)} onBinDeleted={fetchData}/>
      )}
      {showAddBin && (
        <AddBinModal onClose={() => setShowAddBin(false)} onBinAdded={fetchData}/>
      )}
    </div>
  );
}