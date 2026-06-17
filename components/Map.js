import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Исправление иконок для Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Координаты центра села Шарбакты
const SHARBAKTY_CENTER = [53.2167, 75.6833]; // Центр села Шарбакты

// Кастомная иконка для текущей позиции
const locationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Кастомная иконка для пункта назначения
const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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
  const [zoom, setZoom] = useState(15); // Более детальный зум

  useEffect(() => {
    if (userLocation) {
      setCurrentPos([userLocation.lat, userLocation.lng]);
      setZoom(15);
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
      style={{ width: '100%', height: '100%' }}
      onClick={handleMapClick}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Маркер текущей позиции */}
      {currentPos && (
        <Marker position={currentPos} icon={locationIcon}>
          <Popup>Вы здесь</Popup>
        </Marker>
      )}

      <MapUpdater center={currentPos} zoom={zoom} />
    </MapContainer>
  );
}

