import React, { useState, useEffect } from 'react';
import { fetchBins, fetchDashboardStats } from '../../services/api';
import { getFillStatus } from '../../utils/helpers';
import ErrorBoundary from '../ErrorBoundary';
import StatsBar from '../Stats/StatsBar';
import BinMap from '../Map/BinMap';
import Sidebar from '../Sidebar/Sidebar';
import BinDetailsModal from '../BinDetails/BinDetailsModal';
import AddBinModal from '../AddBin/AddBinModal';
import './Dashboard.css';

const Dashboard = () => {
  const [bins, setBins] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddBin, setShowAddBin] = useState(false);

  const loadData = async () => {
    const [binsData, statsData] = await Promise.all([fetchBins(), fetchDashboardStats()]);
    setBins(binsData);
    setStats(statsData);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Poll every 5 seconds for near-realtime updates
    return () => clearInterval(interval);
  }, []);

  const filteredBins = bins.filter(bin => {
    const name = bin.name || '';
    const id = bin.id || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || id.includes(searchTerm);
    const matchesZone = zoneFilter === 'All' || bin.zone === zoneFilter;
    const fill = bin.latestFillPercentage != null ? bin.latestFillPercentage : 0;
    const matchesStatus = statusFilter === 'All' || getFillStatus(fill) === statusFilter;
    return matchesSearch && matchesZone && matchesStatus;
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-title">
          <span className="header-icon">🏛️</span>
          <div>
            <h1>Smart Waste Monitoring</h1>
            <p>Kalmunai Municipal Council</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="header-badge">
            <span className="live-dot"></span>
            Live
          </div>
          <button className="add-bin-btn" onClick={() => setShowAddBin(true)}>
            ➕ Add Bin
          </button>
        </div>
      </div>

      {stats && <StatsBar stats={stats} />}

      <div className="dashboard-content">
        <div className="map-container">
          <ErrorBoundary
            icon="🗺️"
            title="Map failed to load"
            message="Google Maps encountered an error. Check your API key and try again."
          >
            <BinMap 
              bins={filteredBins} 
              selectedBin={selectedBin}
              onSelectBin={setSelectedBin}
            />
          </ErrorBoundary>
        </div>
        <Sidebar 
          bins={filteredBins}
          allBins={bins}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          zoneFilter={zoneFilter}
          onZoneChange={setZoneFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onSelectBin={setSelectedBin}
        />
      </div>

      {selectedBin && (
        <BinDetailsModal 
          bin={selectedBin} 
          onClose={() => setSelectedBin(null)} 
          onBinDeleted={loadData}
        />
      )}
      
      {showAddBin && (
        <AddBinModal
          onClose={() => setShowAddBin(false)}
          onBinAdded={loadData}
        />
      )}
    </div>
  );
};

export default Dashboard;
