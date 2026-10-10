import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const KALMUNAI = [7.4167, 81.8167]

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

// When "Use my location" is pressed, glide the map to that spot
function FlyToPin({ pin }) {
  const map = useMap()
  useEffect(() => {
    if (pin && pin.fly) map.flyTo([pin.lat, pin.lng], 16)
  }, [pin, map])
  return null
}

export default function MapPicker({ pin, onPick }) {
  return (
    <MapContainer
      center={pin ? [pin.lat, pin.lng] : KALMUNAI}
      zoom={14}
      className="map-picker"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      <FlyToPin pin={pin} />
      {pin && (
        <CircleMarker
          center={[pin.lat, pin.lng]}
          radius={10}
          pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#d90429', fillOpacity: 1 }}
        />
      )}
    </MapContainer>
  )
}