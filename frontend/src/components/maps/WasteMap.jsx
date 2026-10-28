
import React from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import BinMarker from './BinMarker';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCMfg3Mv8n521o2owaQqX93CWCnUj-k3Vk';

export const WasteMap = ({ bins, selectedBin, onSelectBin }) => (
  <div style={{ height:'100%', width:'100%', borderRadius:'12px', overflow:'hidden' }}>
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map defaultCenter={{lat:7.4167,lng:81.8217}} defaultZoom={14}
        gestureHandling="greedy" zoomControl mapTypeControl={false}
        streetViewControl={false} fullscreenControl>
        {bins.map(bin => (
          <BinMarker key={bin.id} bin={bin}
            isSelected={selectedBin?.id === bin.id}
            onSelect={() => onSelectBin(bin)} />
        ))}
      </Map>
    </APIProvider>
  </div>
);
