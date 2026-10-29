
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import BinMarker from './BinMarker';

export const WasteMap = ({ bins, selectedBin, onSelectBin }) => (
  <div style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
    <MapContainer
      center={[7.4167, 81.8217]}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bins.map(bin => (
        <BinMarker
          key={bin.id}
          bin={bin}
          isSelected={selectedBin?.id === bin.id}
          onSelect={() => onSelectBin(bin)}
        />
      ))}
    </MapContainer>
  </div>
);
