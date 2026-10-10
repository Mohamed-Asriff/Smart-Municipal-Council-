import React from 'react';
import { getFillColor, getFillStatus, formatDateTime } from '../../utils/helpers';

const BinCard = ({ bin, onSelect }) => {
  const fill = bin.latestFillPercentage != null ? bin.latestFillPercentage : 0;
  const color = getFillColor(fill);
  const status = getFillStatus(fill);

  return (
    <div className="bin-card glass-panel" onClick={onSelect}>
      <div className="card-header">
        <div className="card-title">
          <div className="status-dot" style={{ backgroundColor: color }}></div>
          <h3>{bin.name}</h3>
        </div>
        <span className="bin-id">#{bin.id}</span>
        <span className={`device-status ${(bin.status || 'ACTIVE').toLowerCase()}`}>
          {bin.status || 'ACTIVE'}
        </span>
      </div>
      
      <p className="card-zone">📍 {bin.zone}</p>
      
      <div className="fill-section">
        <div className="fill-header">
          <span>Fill Level</span>
          <span style={{ color }}>{fill.toFixed(1)}% ({status})</span>
        </div>
        <div className="fill-track">
          <div 
            className="fill-progress" 
            style={{ width: `${fill}%`, backgroundColor: color }}
          ></div>
        </div>
      </div>
      
      {bin.latestDistanceCm != null && (
        <p className="card-distance">📏 Distance: {Number(bin.latestDistanceCm).toFixed(1)} cm</p>
      )}
      
      <p className="card-updated">Last updated: {formatDateTime(bin.lastUpdated)}</p>
    </div>
  );
};

export default BinCard;
