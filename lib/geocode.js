const SERVICE_BOUNDS = { north: 53.5, south: 52.5, east: 78.5, west: 77.8 };
const CENTER_COORDS = { lat: 52.48945, lng: 78.16120 };

const DISTRICT_SETTLEMENTS = [
  'Шарбакты', 'Александровка', 'Жанааул', 'Алексеевка', 'Куркамыс',
  'Николаевка', 'Бориктал', 'Арбигень', 'Ботабас', 'Галкино', 'Кулат',
  'Маралды', 'Малиновка', 'Орловка', 'Сахновка', 'Сугур', 'Северное',
  'Заборовка', 'Сосновка', 'Софиевка', 'Сретенка', 'Татьяновка',
  'Богодаровка', 'Хмельницкое', 'Есильбай', 'Шалдай', 'Чигириновка', 'Жылыбулак'
];

export async function searchAddress(query, lang = 'ru') {
  if (!query || query.length < 3) return [];
  let searchQuery = query;
  const hasSettlement = DISTRICT_SETTLEMENTS.some(s => query.toLowerCase().includes(s.toLowerCase()));
  if (!hasSettlement && query.length < 20) {
     searchQuery = `${query}, Щербактинский район, Павлодарская область, Казахстан`;
  }
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=kz&limit=5&addressdetails=1&accept-language=${lang}`);
    if (!response.ok) throw new Error('Nominatim error');
    const results = await response.json();
    return results.filter(item => isInServiceZone(parseFloat(item.lat), parseFloat(item.lon)))
      .map(item => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        address: item.display_name.split(',').slice(0, 3).join(',') 
      }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function isInServiceZone(lat, lng) {
  return (lat >= SERVICE_BOUNDS.south && lat <= SERVICE_BOUNDS.north && lng >= SERVICE_BOUNDS.west && lng <= SERVICE_BOUNDS.east);
}

export { CENTER_COORDS, SERVICE_BOUNDS };
