import React, { useState } from 'react';
import { Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { getFillColor, formatDateTime } from '../../utils/helpers';

const createBinIcon = (fillColor, fillPercent) => {
  const pct = Math.round(fillPercent);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="60" viewBox="0 0 48 60">
  <rect x="6" y="15" width="36" height="38" rx="3" fill="${fillColor}" stroke="white" stroke-width="2.5"/>
  <rect x="2" y="9" width="44" height="7" rx="3" fill="${fillColor}" stroke="white" stroke-width="2.5"/>
  <rect x="16" y="2" width="16" height="9" rx="3" fill="${fillColor}" stroke="white" stroke-width="2.5"/>
  <line x1="16" y1="20" x2="16" y2="48" stroke="rgba(0,0,0,0.2)" stroke-width="1.2"/>
  <line x1="24" y1="20" x2="24" y2="48" stroke="rgba(0,0,0,0.2)" stroke-width="1.2"/>
  <line x1="32" y1="20" x2="32" y2="48" stroke="rgba(0,0,0,0.2)" stroke-width="1.2"/>
  <text x="24" y="37" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="14" font-weight="900" fill="white" stroke="black" stroke-width="3" paint-order="stroke">${pct}%</text>
</svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
};

const BinMarker = ({ bin, isSelected, onSelect }) => {
  const [showInfo, setShowInfo] = useState(false);
  const fill = bin.latestFillPercentage != null ? bin.latestFillPercentage : 0;
  const fillColor = getFillColor(fill);
  const isCritical = fill >= 85;
  const position = { lat: bin.latitude, lng: bin.longitude };

  return (
    <>
      <Marker
        position={position}
        onClick={() => setShowInfo(true)}
        icon={{
          url: createBinIcon(fillColor, fill),
          scaledSize: { width: 48, height: 60 },
          anchor: { x: 24, y: 55 },
        }}
        animation={isCritical ? 1 : undefined}
      />

      {(showInfo || isSelected) && (
        <InfoWindow
          position={position}
          onCloseClick={() => setShowInfo(false)}
        >
          <div className="info-content">
            <h3>{bin.name}</h3>
            <p className="zone">📍 {bin.zone}</p>
            <div className="fill-bar-container">
              <div className="fill-bar" style={{ width: `${fill}%`, backgroundColor: fillColor }}></div>
            </div>
            <p className="fill-text" style={{ color: fillColor }}>{fill.toFixed(1)}% Full</p>
            <p className="updated">Updated: {formatDateTime(bin.lastUpdated)}</p>
            <p className="status-info" style={{ fontSize: '12px', color: (bin.status || 'ACTIVE') === 'ACTIVE' ? '#00d4aa' : '#ff9800', fontWeight: 600, marginTop: '4px' }}>
              ● {bin.status || 'ACTIVE'}
            </p>
            <button className="details-btn" onClick={() => onSelect()}>View Details</button>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default BinMarker;
