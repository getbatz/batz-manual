// lib/geocode.js

// Границы зоны обслуживания (Щербактинский район)
const SERVICE_BOUNDS = {
  north: 53.5,
  south: 52.5,
  east: 78.5,
  west: 77.8,
};

// Координаты центра (с. Шарбакты)
const CENTER_COORDS = { lat: 52.48945, lng: 78.16120 };

// Список населенных пунктов для приоритизации
const DISTRICT_SETTLEMENTS = [
  'Шарбакты', 'Александровка', 'Жанааул', 'Алексеевка', 'Куркамыс', 
  'Николаевка', 'Бориктал', 'Арбигень', 'Ботабас', 'Галкино', 'Кулат', 
  'Маралды', 'Малиновка', 'Орловка', 'Сахновка', 'Сугур', 'Северное', 
  'Заборовка', 'Сосновка', 'Софиевка', 'Сретенка', 'Татьяновка', 
  'Богодаровка', 'Хмельницкое', 'Есильбай', 'Шалдай', 'Чигириновка', 'Жылыбулак'
];

export async function searchAddress(query, lang = 'ru') {
  if (!query || query.length < 3) return [];

  // Формируем запрос с приоритетом на Казахстан и конкретные села
  // Если пользователь не ввел название села, добавляем "Шарбакты" для поиска улиц
  let searchQuery = query;
  
  // Простая эвристика: если в запросе нет названия села, ищем сначала в Шарбакты
  const hasSettlement = DISTRICT_SETTLEMENTS.some(s => query.toLowerCase().includes(s.toLowerCase()));
  if (!hasSettlement && query.length < 20) {
     // Добавляем контекст района для Nominatim, но аккуратно
     searchQuery = `${query}, Щербактинский район, Павлодарская область, Казахстан`;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=kz&limit=5&addressdetails=1&accept-language=${lang}`
    );
    
    if (!response.ok) throw new Error('Nominatim error');
    
    const results = await response.json();
    
    // Фильтрация результатов внутри зоны обслуживания
    return results.filter(item => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      return isInServiceZone(lat, lon);
    }).map(item => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      address: formatAddress(item.address, item.display_name)
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

export async function reverseGeocode(lat, lng, lang = 'ru') {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=${lang}`
    );
    
    if (!response.ok) throw new Error('Reverse geocoding error');
    
    const data = await response.json();
    
    if (!isInServiceZone(lat, lng)) {
      return { error: 'outside_zone' };
    }

    return {
      lat,
      lng,
      displayName: data.display_name,
      address: formatAddress(data.address, data.display_name)
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

export function isInServiceZone(lat, lng) {
  return (
    lat >= SERVICE_BOUNDS.south &&
    lat <= SERVICE_BOUNDS.north &&
    lng >= SERVICE_BOUNDS.west &&
    lng <= SERVICE_BOUNDS.east
  );
}

function formatAddress(addressObj, fullDisplayName) {
  if (!addressObj) return fullDisplayName;
  
  const parts = [];
  if (addressObj.road) parts.push(`ул. ${addressObj.road}`);
  if (addressObj.house_number) parts.push(addressObj.house_number);
  
  // Для Шарбакты не добавляем название села в краткий адрес
  const isSharbakty = addressObj.village === 'Шарбакты' || addressObj.town === 'Шарбакты';
  
  if (!isSharbakty) {
    if (addressObj.village) parts.unshift(`с. ${addressObj.village}`);
    if (addressObj.town) parts.unshift(`с. ${addressObj.town}`);
  }

  return parts.join(', ') || fullDisplayName;
}

export { CENTER_COORDS, SERVICE_BOUNDS };
