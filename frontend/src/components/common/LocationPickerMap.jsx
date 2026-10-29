import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Loader2, Check, AlertCircle } from 'lucide-react';
import { KALMUNAI_CENTER } from '../../config/maps';

// Fix Leaflet marker icons in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom styled pin icon (pure CSS/DOM - zero 404 risk)
const pinIcon = L.divIcon({
  html: `<div style="background-color: #ef4444; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35);"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// Sub-component: Invalidate map size after mounting inside modal animations
function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {
        // ignore
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Sub-component to handle map clicks & 1-click pin drop
function ClickAndDropHandler({ onPositionChange }) {
  const map = useMapEvents({
    click(e) {
      if (e?.latlng) {
        onPositionChange(e.latlng.lat, e.latlng.lng);
        map.panTo(e.latlng);
      }
    },
  });
  return null;
}

// Sub-component to pan to selected zone or updated center
function MapPanController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (map && center && center.lat != null && center.lng != null) {
      try {
        map.flyTo([center.lat, center.lng], 15, { duration: 0.8 });
      } catch (e) {
        map.setView([center.lat, center.lng], 15);
      }
    }
  }, [map, center]);
  return null;
}

export default function LocationPickerMap({ 
  selectedPosition, 
  onLocationSelect, 
  zoneCenter = null,
  height = '230px' 
}) {
  const [currentCenter, setCurrentCenter] = useState(
    selectedPosition || zoneCenter || KALMUNAI_CENTER
  );
  const [markerPosition, setMarkerPosition] = useState(selectedPosition);
  const [isLocating, setIsLocating] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState('');
  const [geoError, setGeoError] = useState('');

  // Sync external position updates
  useEffect(() => {
    if (selectedPosition && selectedPosition.lat != null && selectedPosition.lng != null) {
      setMarkerPosition(selectedPosition);
      setCurrentCenter(selectedPosition);
    }
  }, [selectedPosition]);

  // Pan when zone changes and no custom pin yet
  useEffect(() => {
    if (zoneCenter && !markerPosition) {
      setCurrentCenter(zoneCenter);
    }
  }, [zoneCenter, markerPosition]);

  // Reverse geocoding helper (Nominatim + Fallback)
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const a = data.address;
          const road = a.road || a.pedestrian || a.suburb || a.neighbourhood || a.village || '';
          const town = a.town || a.city || a.county || 'Kalmunai';
          if (road) return `${road}, ${town}`;
          if (data.display_name) return data.display_name.split(',').slice(0, 3).join(',');
        }
      }
    } catch (err) {
      console.debug('Geocoding offline or timed out:', err);
    }
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }, []);

  const handlePositionChange = useCallback(async (lat, lng) => {
    const pos = { lat, lng };
    setMarkerPosition(pos);
    setCurrentCenter(pos);
    setGeoError('');
    setGeocodedAddress('Fetching address...');

    const address = await reverseGeocode(lat, lng);
    setGeocodedAddress(address);

    if (onLocationSelect) {
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address,
      });
    }
  }, [reverseGeocode, onLocationSelect]);

  // Device GPS "Locate Me"
  const handleUseCurrentLocation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!navigator.geolocation) {
      setGeoError('GPS not supported in this browser');
      return;
    }

    setIsLocating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        handlePositionChange(latitude, longitude);
      },
      (err) => {
        setIsLocating(false);
        setGeoError(err.message || 'Unable to retrieve location');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const markerHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        if (marker != null) {
          const latlng = marker.getLatLng();
          handlePositionChange(latlng.lat, latlng.lng);
        }
      },
    }),
    [handlePositionChange]
  );

  return (
    <div className="rounded-xl overflow-hidden border border-slate-300 shadow-xs bg-slate-100 flex flex-col relative transition-all">
      {/* Top action and feedback bar */}
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between text-xs gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span className="font-semibold text-[11px]">
            {markerPosition 
              ? `${markerPosition.lat.toFixed(5)}, ${markerPosition.lng.toFixed(5)}` 
              : 'Click anywhere on map to drop pin'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {markerPosition && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Check className="w-3 h-3 text-emerald-600" /> Pin Set
            </span>
          )}

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-kmc-navy bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-md transition shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Use device GPS location"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Navigation className="w-3 h-3 text-blue-600" />
                <span>My Location</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div style={{ height, width: '100%', position: 'relative' }}>
        <MapContainer
          center={[currentCenter.lat, currentCenter.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%', zIndex: 10 }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          {/* Google Maps Road Tile Layer */}
          <TileLayer
            attribution='&copy; Google Maps'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            maxZoom={20}
          />

          <MapInvalidator />
          <ClickAndDropHandler onPositionChange={handlePositionChange} />
          <MapPanController center={currentCenter} />

          {markerPosition && (
            <Marker
              position={[markerPosition.lat, markerPosition.lng]}
              draggable={true}
              eventHandlers={markerHandlers}
              icon={pinIcon}
            />
          )}
        </MapContainer>

        {/* Floating guidance helper */}
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none flex justify-center z-20">
          <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <span>💡 1-click anywhere to drop pin, or drag to adjust</span>
          </div>
        </div>
      </div>

      {/* Geocoded status bar */}
      {geocodedAddress && (
        <div className="bg-blue-50/90 border-t border-blue-100 px-3 py-1.5 text-[11px] text-blue-900 truncate flex items-center gap-1.5">
          <span className="font-bold shrink-0">Selected:</span>
          <span className="truncate">{geocodedAddress}</span>
        </div>
      )}

      {geoError && (
        <div className="bg-red-50 border-t border-red-100 px-3 py-1.5 text-[11px] text-red-700 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}
    </div>
  );
}
