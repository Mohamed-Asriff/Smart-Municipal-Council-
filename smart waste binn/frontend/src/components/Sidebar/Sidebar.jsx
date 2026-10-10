import React from 'react';
import BinCard from './BinCard';
import './Sidebar.css';

const Sidebar = ({
  bins,
  allBins,
  searchTerm,
  onSearchChange,
  zoneFilter,
  onZoneChange,
  statusFilter,
  onStatusChange,
  onSelectBin
}) => {
  const uniqueZones = ['All', ...new Set(allBins.map(bin => bin.zone))];
  const statuses = ['All', 'Normal', 'Warning', 'High', 'Critical'];

  return (
    <div className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2>Bin Overview</h2>
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search bins..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="filters">
        <select 
          value={zoneFilter}
          onChange={(e) => onZoneChange(e.target.value)}
          className="zone-select"
        >
          {uniqueZones.map(zone => (
            <option key={zone} value={zone}>{zone} Zone</option>
          ))}
        </select>

        <div className="status-filters">
          {statuses.map(status => (
            <button
              key={status}
              className={`filter-pill ${statusFilter === status ? 'active' : ''} ${status.toLowerCase()}`}
              onClick={() => onStatusChange(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="list-header">
        <span>{bins.length} Bins Found</span>
      </div>

      <div className="bin-list">
        {bins.map((bin, index) => (
          <div key={bin.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-slide-up">
            <BinCard bin={bin} onSelect={() => onSelectBin(bin)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
