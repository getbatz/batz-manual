import { useState, useEffect, lazy, Suspense } from 'react';
import Head from 'next/head';
import { t } from '../lib/i18n';
import { searchAddress } from '../lib/geocode';
import { saveOrder, getOrders } from '../lib/supabase';

const Map = lazy(() => import('../components/Map'));

export default function Home() {
  const [lang, setLang] = useState('ru');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [tariff, setTariff] = useState('economy');
  const [payment, setPayment] = useState('cash');
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
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

    requestLocation();
  }, []);

  const requestLocation = async () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setLoadingLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          
          const { reverseGeocode } = await import('../lib/geocode');
          const address = await reverseGeocode(lat, lng);
          setFrom(address || `Моё местоположение`);
          setLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLoadingLocation(false);
          setUserLocation({ lat: 53.2167, lng: 75.6833 });
          setFrom('с. Шарбакты, Щербактинский район');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleSearch = (value, field) => {
    setActiveField(field);
    if (field === 'from') setFrom(value);
    else setTo(value);

    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const results = await searchAddress(value);
      setSuggestions(results);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const selectSuggestion = (suggestion) => {
    if (activeField === 'from') setFrom(suggestion.name);
    else setTo(suggestion.name);
    setSuggestions([]);
  };

  const tariffs = {
    economy: { name: 'economy', price: 1000, icon: '🚗', time: 5 },
    comfort: { name: 'comfort', price: 1500, icon: '🚙', time: 7 },
    business: { name: 'business', price: 2500, icon: '', time: 10 },
  };

  const paymentMethods = [
    { id: 'cash', icon: '💵', name: 'cash' },
    { id: 'kaspi', icon: '', name: 'kaspi' },
    { id: 'halyk', icon: '🔵', name: 'halyk' },
  ];

  const handleOrder = async () => {
    if (!from || !to) {
      alert(t(lang, 'fillAddresses'));
      return;
    }

    const orderData = {
      user_id: user?.id || 'anonymous',
      user_name: user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Anonymous',
      user_username: user?.username || '',
      from,
      to,
      tariff,
      payment,
      price: tariffs[tariff].price,
      eta: tariffs[tariff].time,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const result = await saveOrder(orderData);

    if (result.success) {
      alert(`${t(lang, 'orderSuccess')}\n\n📍 ${from}\n🏁 ${to}\n🚗 ${t(lang, tariff)}\n💰 ${tariffs[tariff].price} ${t(lang, 'tenge')}\n⏱ ${t(lang, 'driverComing')} ${tariffs[tariff].time} ${t(lang, 'minutes')}`);
    } else {
      alert('Ошибка сохранения заказа. Попробуйте еще раз.');
    }
  };

  const loadHistory = async () => {
    if (!user) {
      alert('Войдите через Telegram');
      return;
    }
    setShowHistory(true);
    const history = await getOrders(user.id);
    setOrders(history);
  };

  const changeLanguage = () => {
    const langs = ['ru', 'kz', 'en'];
    const idx = langs.indexOf(lang);
    setLang(langs[(idx + 1) % langs.length]);
  };

  return (
    <>
      <Head>
        <title>{t(lang, 'appName')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div style={styles.container}>
        {/* Шапка */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <h1 style={styles.title}>{t(lang, 'appName')} </h1>
            <div style={styles.headerButtons}>
              <button onClick={changeLanguage} style={styles.langBtn}>
                {lang.toUpperCase()}
              </button>
              <button onClick={loadHistory} style={styles.historyBtn}>
                📋
              </button>
            </div>
          </div>
          {user && (
            <p style={styles.greeting}>
              {t(lang, 'welcome')}, {user.first_name}! 
            </p>
          )}
          <p style={styles.tagline}>{t(lang, 'tagline')}</p>
        </div>

        {/* Карта */}
        <div style={styles.mapContainer}>
          <Suspense fallback={<div style={styles.mapPlaceholder}>️ Загрузка...</div>}>
            <Map onLocationSelect={() => {}} userLocation={userLocation} />
          </Suspense>
          <button onClick={requestLocation} style={styles.geoButton}>
            {loadingLocation ? '' : '📍'}
          </button>
        </div>

        {/* Форма */}
        <div style={styles.form}>
          {/* Откуда */}
          <div style={styles.inputWrapper}>
            <span style={styles.icon}></span>
            <div style={styles.inputContainer}>
              <input
                type="text"
                placeholder={t(lang, 'from')}
                value={from}
                onChange={(e) => handleSearch(e.target.value, 'from')}
                onFocus={() => setActiveField('from')}
                style={styles.input}
              />
              {activeField === 'from' && suggestions.length > 0 && (
                <div style={styles.suggestions}>
                  {suggestions.map((s, i) => (
                    <div key={i} style={styles.suggestionItem} onClick={() => selectSuggestion(s)}>
                      📍 {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.line}></div>

          {/* Куда */}
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>🏁</span>
            <div style={styles.inputContainer}>
              <input
                type="text"
                placeholder={t(lang, 'to')}
                value={to}
                onChange={(e) => handleSearch(e.target.value, 'to')}
                onFocus={() => setActiveField('to')}
                style={styles.input}
              />
              {activeField === 'to' && suggestions.length > 0 && (
                <div style={styles.suggestions}>
                  {suggestions.map((s, i) => (
                    <div key={i} style={styles.suggestionItem} onClick={() => selectSuggestion(s)}>
                       {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                <div style={styles.tariffName}>{t(lang, value.name)}</div>
                <div style={styles.tariffPrice}>{value.price} {t(lang, 'tenge')}</div>
              </button>
            ))}
          </div>

          {/* Оплата */}
          <div style={styles.paymentLabel}>{t(lang, 'payment')}:</div>
          <div style={styles.paymentMethods}>
            {paymentMethods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPayment(p.id)}
                style={{
                  ...styles.paymentBtn,
                  ...(payment === p.id ? styles.paymentActive : {}),
                }}
              >
                <span>{p.icon}</span>
                <span>{t(lang, p.name)}</span>
              </button>
            ))}
          </div>

          {/* Итого */}
          <div style={styles.totalRow}>
            <span>{t(lang, 'total')}:</span>
            <span style={styles.totalPrice}>{tariffs[tariff].price} {t(lang, 'tenge')}</span>
          </div>

          {/* Кнопка заказа */}
          <button onClick={handleOrder} style={styles.orderBtn}>
            {t(lang, 'order')} 🚕
          </button>
        </div>

        {/* Модалка истории */}
        {showHistory && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>{t(lang, 'history')}</h2>
                <button onClick={() => setShowHistory(false)} style={styles.closeBtn}></button>
              </div>
              <div style={styles.modalBody}>
                {orders.length === 0 ? (
                  <p style={styles.emptyText}>{t(lang, 'noOrders')}</p>
                ) : (
                  orders.map((order, i) => (
                    <div key={i} style={styles.orderItem}>
                      <div style={styles.orderDate}>
                        {new Date(order.created_at).toLocaleString('ru-RU')}
                      </div>
                      <div>📍 {order.from}</div>
                      <div>🏁 {order.to}</div>
                      <div style={styles.orderPrice}>
                        💰 {order.price} {t(lang, 'tenge')} • {t(lang, order.tariff)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
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
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 'bold',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
  },
  langBtn: {
    backgroundColor: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
  },
  historyBtn: {
    backgroundColor: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
  },
  greeting: {
    margin: '8px 0 4px',
    fontSize: '15px',
  },
  tagline: {
    margin: 0,
    fontSize: '13px',
    opacity: 0.9,
  },
  mapContainer: {
    height: '250px',
    position: 'relative',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
  },
  geoButton: {
    position: 'absolute',
    bottom: '15px',
    right: '15px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: 'none',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    fontSize: '22px',
    cursor: 'pointer',
    zIndex: 1000,
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
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '10px',
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  icon: {
    fontSize: '22px',
    width: '30px',
    textAlign: 'center',
    paddingTop: '14px',
  },
  input: {
    width: '100%',
    padding: '14px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '10px',
    marginTop: '5px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 100,
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  suggestionItem: {
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    fontSize: '14px',
  },
  line: {
    height: '2px',
    backgroundColor: '#FFD700',
    margin: '8px 22px',
    opacity: 0.5,
  },
  tariffs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    marginTop: '20px',
  },
  tariffBtn: {
    flex: 1,
    padding: '12px 8px',
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
    fontSize: '26px',
    marginBottom: '4px',
  },
  tariffName: {
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  tariffPrice: {
    fontSize: '12px',
    color: '#666',
  },
  paymentLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  paymentMethods: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  paymentBtn: {
    flex: 1,
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '12px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    fontSize: '13px',
  },
  paymentActive: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFDE7',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  totalPrice: {
    color: '#FFD700',
    fontSize: '22px',
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
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    maxHeight: '80vh',
    borderTopLeftRadius: '25px',
    borderTopRightRadius: '25px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '5px',
  },
  modalBody: {
    padding: '20px',
    overflowY: 'auto',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: '30px',
  },
  orderItem: {
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    marginBottom: '10px',
    fontSize: '14px',
  },
  orderDate: {
    fontSize: '12px',
    color: '#999',
    marginBottom: '8px',
  },
  orderPrice: {
    marginTop: '8px',
    fontWeight: 'bold',
    color: '#FFD700',
  },
};

