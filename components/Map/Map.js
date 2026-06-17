port { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ center, from, to, onMapReady, onLocationSelect }) {
  useEffect(() => {
    if (!onMapReady) return;

    const map = L.map('map-container').setView(center, 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    onMapReady(map);

    // Обработка клика по карте
    map.on('click', (e) => {
      // Логика выбора точки (нужно определить, куда ставим маркер - откуда или куда)
      // Для простоты можно ставить в свободное поле или спрашивать пользователя
      if (onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng, address: 'Выбрано на карте' }, 'from'); 
      }
    });

    return () => map.remove();
  }, []);

  // Эффекты для обновления маркеров (from/to) можно добавить здесь

  return <div id="map-container" style={{ width: '100%', height: '100%' }} />;
}
