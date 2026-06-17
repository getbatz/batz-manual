import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import Head from 'next/head';
import { t } from '../lib/i18n';
import { saveOrder, getOrders } from '../lib/supabase';
import Header from '../components/ui/Header';
import AddressInput from '../components/ui/AddressInput';
import TariffSelector from '../components/ui/TariffSelector';
import PaymentSelector from '../components/ui/PaymentSelector';
import OrderHistory from '../components/ui/OrderHistory';

const Map = lazy(() => import('../components/Map'));

const TARIFFS = {
  economy: { name: 'economy', price: 1000, icon: '🚗', time: 5 },
  comfort: { name: 'comfort', price: 1500, icon: '🚙', time: 7 },
  business: { name: 'business', price: 2500, icon: '🚘', time: 10 },
};

const PAYMENT_METHODS = [
  { id: 'cash', icon: '💵', name: 'cash' },
  { id: 'kaspi', icon: '/kaspi-logo.PNG', name: 'kaspi' },
  { id: 'halyk', icon: '/halyk-logo.PNG', name: 'halyk' },
];

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      setTimeout(() => tg.expand(), 100);
      setTimeout(() => tg.expand(), 300);
      
      tg.setHeaderColor('#FFD700');
      tg.setBackgroundColor('#ffffff');
      
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
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
          
          try {
            const { reverseGeocode } = await import('../lib/geocode');
            const address = await reverseGeocode(lat, lng);
            setFrom(address || t(lang, 'myLocation'));
          } catch (error) {
            console.error('Reverse geocode error:', error);
            setFrom(t(lang, 'myLocation'));
          }
          setLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLoadingLocation(false);
          setUserLocation({ lat: 53.2167, lng: 75.6833 });
          setFrom(t(lang, 'defaultLocation') || 'с. Шарбакты');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleSearch = useCallback((value, field) => {
    setActiveField(field);
    if (field === 'from') setFrom(value);
    else setTo(value);

    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const { searchAddress } = await import('../lib/geocode');
        const results = await searchAddress(value);
        setSuggestions(results);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      }
    }, 500);
    
    setSearchTimeout(timeout);
  }, [searchTimeout, lang]);

  const selectSuggestion = (suggestion) => {
    if (activeField === 'from') setFrom(suggestion.name);
    else setTo(suggestion.name);
    setSuggestions([]);
  };

  const handleMapClick = async (latlng) => {
    setLoadingLocation(true);
    
    try {
      const { reverseGeocode } = await import('../lib/geocode');
      const address = await reverseGeocode(latlng.lat, latlng.lng);
      const targetAddress = address || t(lang, 'mapPoint');
      
      if (activeField === 'to' || (to && activeField !== 'from')) {
        setTo(targetAddress);
      } else {
        setFrom(targetAddress);
      }
    } catch (error) {
      console.error('Map click error:', error);
    }
    
    setLoadingLocation(false);
  };

  const handleOrder = async () => {
    if (!from || !to) {
      alert(t(lang, 'fillAddresses'));
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const orderData = {
      user_id: user?.id || 'anonymous',
      user_name: user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Anonymous',
      user_username: user?.username || '',
      from,
      to,
      tariff,
      payment,
      price: TARIFFS[tariff].price,
      eta: TARIFFS[tariff].time,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    try {
      const result = await saveOrder(orderData);

      if (result.success) {
        alert(`${t(lang, 'orderSuccess')}\n\n📍 ${from}\n🏁 ${to}\n🚗 ${t(lang, tariff)}\n💰 ${TARIFFS[tariff].price} ${t(lang, 'tenge')}\n⏱ ${t(lang, 'driverComing')} ${TARIFFS[tariff].time} ${t(lang, 'minutes')}`);
        setFrom('');
        setTo('');
      } else {
        alert(t(lang, 'orderError') || 'Ошибка сохранения заказа.');
      }
    } catch (error) {
      console.error('Order error:', error);
      alert(t(lang, 'orderError') || 'Ошибка сохранения заказа.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadHistory = async () => {
    if (!user) {
      alert(t(lang, 'loginRequired') || 'Войдите через Telegram');
      return;
    }
    setShowHistory(true);
    try {
      const history = await getOrders(user.id);
      setOrders(history);
    } catch (error) {
      console.error('Load history error:', error);
    }
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
        <meta name="description" content={t(lang, 'tagline')} />
      </Head>

      <div style={styles.container}>
        <Header 
          lang={lang}
          onLanguageChange={changeLanguage}
          onHistoryClick={loadHistory}
          user={user}
        />

        <div style={styles.scrollContent}>
          <div style={styles.mapContainer}>
            <Suspense fallback={<div style={styles.mapPlaceholder}>{t(lang, 'loadingMap') || 'Загрузка карты...'}</div>}>
              <Map onLocationSelect={handleMapClick} userLocation={userLocation} />
            </Suspense>
            <button 
              onClick={requestLocation} 
              style={styles.geoButton}
              aria-label={t(lang, 'myLocation')}
              disabled={loadingLocation}
            >
              {loadingLocation ? '⏳' : '📍'}
            </button>
          </div>

          <div style={styles.form}>
            <AddressInput
              label={t(lang, 'from')}
              value={from}
              onChange={(val) => handleSearch(val, 'from')}
              onFocus={() => setActiveField('from')}
              isActive={activeField === 'from'}
              suggestions={suggestions}
              onSelectSuggestion={selectSuggestion}
              icon="📍"
            />

            <div style={styles.line}></div>

            <AddressInput
              label={t(lang, 'to')}
              value={to}
              onChange={(val) => handleSearch(val, 'to')}
              onFocus={() => setActiveField('to')}
              isActive={activeField === 'to'}
              suggestions={suggestions}
              onSelectSuggestion={selectSuggestion}
              icon="🏁"
            />

            <TariffSelector
              tariffs={TARIFFS}
              selected={tariff}
              onSelect={setTariff}
              lang={lang}
            />

            <PaymentSelector
              methods={PAYMENT_METHODS}
              selected={payment}
              onSelect={setPayment}
              lang={lang}
            />

            <div style={styles.totalRow}>
              <span>{t(lang, 'total')}:</span>
              <span style={styles.totalPrice}>{TARIFFS[tariff].price} {t(lang, 'tenge')}</span>
            </div>

            <button 
              onClick={handleOrder} 
              style={{
                ...styles.orderBtn,
                ...(isSubmitting ? styles.orderBtnDisabled : {}),
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ ' : ''}{t(lang, 'order')} 🚕
            </button>
          </div>
        </div>

        {showHistory && (
          <OrderHistory
            orders={orders}
            onClose={() => setShowHistory(false)}
            lang={lang}
          />
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
    height: '100vh',
    overflow: 'hidden',
  },
  scrollContent: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
  },
  mapContainer: {
    height: '200px',
    position: 'relative',
    width: '100%',
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
    bottom: '10px',
    right: '10px',
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: 'none',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    fontSize: '20px',
    cursor: 'pointer',
    zIndex: 1000,
  },
  form: {
    padding: '15px',
    backgroundColor: '#fff',
    borderTopLeftRadius: '25px',
    borderTopRightRadius: '25px',
    marginTop: '-40px',
    position: 'relative',
    zIndex: 10,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
    paddingBottom: '30px',
  },
  line: {
    height: '2px',
    backgroundColor: '#FFD700',
    margin: '8px 18px',
    opacity: 0.5,
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    marginBottom: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  totalPrice: {
    color: '#FFD700',
    fontSize: '18px',
  },
  orderBtn: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#FFD700',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
    transition: 'transform 0.2s',
  },
  orderBtnDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
};
