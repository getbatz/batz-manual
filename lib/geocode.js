export async function searchAddress(query) {
  if (!query || query.length < 2) return [];

  // Координаты центра Шарбакты для приоритета
  const viewbox = '75.5,53.3,75.9,53.1'; // bounding box around Sharbakty
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&countrycodes=kz&viewbox=${viewbox}&bounded=1`,
      {
        headers: {
          'User-Agent': 'BATZ-Taxi-App/1.0',
        },
      }
    );
    const data = await response.json();
    return data.map(item => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Обратное геокодирование (координаты → адрес)
export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BATZ-Taxi-App/1.0',
        },
      }
    );
    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
}

