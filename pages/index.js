import { useState, useEffect, lazy, Suspense } from 'react';
import Head from 'next/head';

const Map = lazy(() => import('../components/Map'));

export default function Home() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [tariff, setTariff] = useState('economy');
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    // Инициализация Telegram
    if (typeof window !== 'undefined' && window.Telegram) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }

      tg.setHeaderColor('#FFD700');
      tg.setBackgroundColor('#ffffff');
    }

    // Запрос геолокации
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setLoadingLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          
          // Получаем адрес через Nominatim (бесплатно)
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
            
            if (data && data.display_name) {
              setFrom(data.display_name);
            } else {
              setFrom(`Мое местоположение (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            setFrom(`Мое местоположение (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }
          
          setLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLoadingLocation(false);
          // Если геолокация недоступна, используем центр Шарбакты
          setUserLocation({ lat: 53.2167, lng: 75.6833 });
          setFrom('с. Шарбакты, Щербактинский район');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  const tariffs = {
    economy: { name: 'Эконом', price: 1000, icon: '🚗', time: 5 },
    comfort: { name: 'Комфорт', price: 1500, icon: '🚙', time: 7 },
    business: { name: 'Бизнес', price: 2500, icon: '', time: 10 },
  };

  const handleMapClick = async (latlng) => {
    setLoadingLocation(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BATZ-Taxi-App/1.0',
          },
        }
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setFrom(data.display_name);
      } else {
        setFrom(`Точка на карте (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setFrom(`Точка на карте (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`);
    }
    
    setLoadingLocation(false);
  };

  const handleOrder = () => {
    if (!from || !to) {
      alert('Заполни оба адреса!');
      return;
    }

    const orderInfo = `
 Заказ такси БАЦ

📍 Откуда: ${from}
🏁 Куда: ${to}
🚗 Тариф: ${tariffs[tariff].name}
⏱ Подача: ${tariffs[tariff].time} мин
💰 Примерная цена: ${tariffs[tariff].price} ₸

Подтвердить заказ?
    `;

    if (confirm(orderInfo)) {
      alert('✅ Заказ принят!\nВодитель будет подан через ' + tariffs[tariff].time + ' минут');
    }
  };

  return (
    <>
      <Head>
        <title>Такси БАЦ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div style={styles.container}>
        {/* Шапка */}
        <div style={styles.header}>
          <h1 style={styles.title}>Такси БАЦ 🚕</h1>
          {user && (
            <p style={styles.greeting}>
              Привет, {user.first_name}! 
            </p>
          )}
          <p style={styles.tagline}>Быстро. Удобно. Рядом.</p>
        </div>

        {/* Карта */}
        <div style={styles.mapContainer}>
          <Suspense fallback={<div style={styles.mapPlaceholder}>🗺️ Загрузка карты...</div>}>
            <Map 
              onLocationSelect={handleMapClick} 
              userLocation={userLocation}
            />
          </Suspense>
          
          {/* Кнопка геолокации */}
          <button 
            onClick={requestLocation} 
            style={styles.geoButton}
            title="Моё местоположение"
          >
            {loadingLocation ? '⏳' : '📍'}
          </button>
        </div>

        {/* Форма */}
        <div style={styles.form}>
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>📍</span>
            <input
              type="text"
              placeholder="Откуда едем?"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.line}></div>

          <div style={styles.inputWrapper}>
            <span style={styles.icon}>🏁</span>
            <input
              type="text"
              placeholder="Куда едем?"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Тарифы */}
          <div style={styles.tariffs}>
            {Object.entries(tariffs).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setTariff(key)}
                style={{
                  ...styles.tariffBtn,
                  ...(tariff === key ? styles.tariffActive : {}),
                }}
              >
                <div style={styles.tariffIcon}>{value.icon}</div>
                <div style={styles.tariffName}>{value.name}</div>
                <div style={styles.tariffPrice}>{value.price} ₸</div>
              </button>
            ))}
          </div>

          {/* Кнопка заказа */}
          <button onClick={handleOrder} style={styles.orderBtn}>
            Заказать БАЦ 
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    backgroundColor: '#FFD700',
    padding: '20px',
    paddingTop: '50px',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
  },
  greeting: {
    margin: '10px 0 5px',
    fontSize: '16px',
  },
  tagline: {
    margin: 0,
    fontSize: '14px',
    opacity: 0.9,
  },
  mapContainer: {
    height: '280px',
    position: 'relative',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    fontSize: '16px',
    color: '#666',
  },
  geoButton: {
    position: 'absolute',
    bottom: '15px',
    right: '15px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: 'none',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    fontSize: '24px',
    cursor: 'pointer',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    flex: 1,
    padding: '20px',
    backgroundColor: '#fff',
    borderTopLeftRadius: '25px',
    borderTopRightRadius: '25px',
    marginTop: '-20px',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  icon: {
    fontSize: '24px',
    width: '30px',
    textAlign: 'center',
  },
  input: {
    flex: 1,
    padding: '16px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
  },
  line: {
    height: '2px',
    backgroundColor: '#FFD700',
    margin: '12px 22px',
    opacity: 0.5,
  },
  tariffs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    marginTop: '25px',
  },
  tariffBtn: {
    flex: 1,
    padding: '15px 10px',
    border: '2px solid #ddd',
    borderRadius: '12px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    textAlign: 'center',
  },
  tariffActive: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFDE7',
  },
  tariffIcon: {
    fontSize: '28px',
    marginBottom: '5px',
  },
  tariffName: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '3px',
  },
  tariffPrice: {
    fontSize: '13px',
    color: '#666',
  },
  orderBtn: {
    width: '100%',
    padding: '20px',
    backgroundColor: '#FFD700',
    border: 'none',
    borderRadius: '15px',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
  },
};

