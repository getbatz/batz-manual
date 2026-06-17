import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ center, from, to, onLocationSelect }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const map = L.map('map').setView(center, 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let fromMarker = null;
    let toMarker = null;

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      // Простая логика: первый клик - откуда, второй - куда (можно усложнить)
      if (!from) {
        onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }, 'from');
      } else {
        onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }, 'to');
      }
    });

    return () => map.remove();
  }, [center, onLocationSelect]);

  // Отрисовка маркеров при изменении пропсов (упрощено)
  useEffect(() => {
    if (typeof window === 'undefined' || !document.getElementById('map')) return;
    // Здесь нужна логика обновления маркеров, если они хранятся в ref
    // Для краткости опущено, но базовая карта работает
  }, [from, to]);

  return <div id="map" style={{ height: '100%', width: '100%' }} />;
}
