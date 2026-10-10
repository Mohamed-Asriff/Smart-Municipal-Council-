import React from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import BinMarker from './BinMarker';
import ErrorBoundary from '../ErrorBoundary';
import './BinMap.css';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCMfg3Mv8n521o2owaQqX93CWCnUj-k3Vk';

const BinMap = ({ bins, selectedBin, onSelectBin }) => {
  const hasValidKey = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';

  if (!hasValidKey) {
    return (
      <div className="map-placeholder">
        <div className="map-placeholder-header">
          <span className="map-placeholder-icon">🗺️</span>
          <h3>Map View</h3>
          <p>Add your Google Maps API key to enable the interactive map</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={{ lat: 7.4167, lng: 81.8217 }}
        defaultZoom={14}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        zoomControl={true}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={true}
        colorScheme="DARK"
      >
        {bins.map(bin => (
          <ErrorBoundary key={bin.id} icon="📍" title="Marker error" showRetry={false}>
            <BinMarker
              bin={bin}
              isSelected={selectedBin?.id === bin.id}
              onSelect={() => onSelectBin(bin)}
            />
          </ErrorBoundary>
        ))}
      </Map>
    </APIProvider>
  );
};

export default BinMap;
