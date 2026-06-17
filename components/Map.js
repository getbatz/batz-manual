import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Исправление иконок
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SHARBAKTY_CENTER = [52.48945, 78.16120];

const locationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 15);
    }
  }, [center, zoom, map]);
  return null;
}

export default function Map({ onLocationSelect, userLocation }) {
  const [currentPos, setCurrentPos] = useState(SHARBAKTY_CENTER);
  const [zoom, setZoom] = useState(14);

  useEffect(() => {
    if (userLocation) {
      setCurrentPos([userLocation.lat, userLocation.lng]);
      setZoom(15);
    } else {
      setCurrentPos(SHARBAKTY_CENTER);
      setZoom(14);
    }
  }, [userLocation]);

  const handleMapClick = (e) => {
    if (onLocationSelect) {
      onLocationSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    }
  };

  return (
    <MapContainer
      center={currentPos}
      zoom={zoom}
      style={{ width: '100%', height: '100%', zIndex: 1 }}
      onClick={handleMapClick}
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      dragging={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {currentPos && (
        <Marker position={currentPos} icon={locationIcon}>
          <Popup>Вы здесь</Popup>
        </Marker>
      )}

      <MapUpdater center={currentPos} zoom={zoom} />
    </MapContainer>
  );
}
