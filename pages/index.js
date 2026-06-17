import { useEffect, useState, useCallback } from 'react';
import Head from 'headless';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { t, setLanguage } from '../lib/i18n';
import { CENTER_COORDS, isInServiceZone, searchAddress, reverseGeocode } from '../lib/geocode';
import { calculateTaxiPrice, TARIFFS } from '../lib/priceCalculator';

// Динамический импорт компонентов UI
import Header from '../components/ui/Header';
import AddressInput from '../components/ui/AddressInput';
import TariffSelector from '../components/ui/TariffSelector';
import PaymentSelector from '../components/ui/PaymentSelector';
import OrderHistory from '../components/ui/OrderHistory';

// Динамический импорт карты (чтобы не грузить её на сервере)
const MapComponent = dynamic(() => import('../components/Map/Map'), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('ru');
  
  // Состояние карты и локаций
  const [mapInstance, setMapInstance] = useState(null);
  const [fromLocation, setFromLocation] = useState(null); // { lat, lng, address }
  const [toLocation, setToLocation] = useState(null);     // { lat, lng, address }
  
  // Состояние заказа
  const [tariff, setTariff] = useState('economy');
  const [payment, setPayment] = useState('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [price, setPrice] = useState(0);
  const [distance, setDistance] = useState(0); // в метрах
  const [orderStatus, setOrderStatus] = useState('idle'); // idle, confirming, searching, found, in_progress, completed
  
  // Инициализация Telegram WebApp
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram) {
      const telegram = window.Telegram.WebApp;
      telegram.ready();
      telegram.expand();
      telegram.setHeaderColor('#FFD700');
      telegram.setBackgroundColor('#ffffff');
      telegram.enableClosingConfirmation();
      
      setTg(telegram);
      
      const userData = telegram.initDataUnsafe?.user;
      if (userData) {
        setUser(userData);
        // Автоопределение языка
        const tgLang = userData.language_code || 'ru';
        const supportedLangs = ['ru', 'kk', 'en'];
        const selectedLang = supportedLangs.includes(tgLang) ? tgLang : 'ru';
        setLang(selectedLang);
        setLanguage(selectedLang);
      }
      
      // Настройка MainButton
      telegram.MainButton.setText(t('order_taxi'));
      telegram.MainButton.setColor('#FFD700');
      telegram.MainButton.setTextColor('#000000');
      
      return () => {
        telegram.disableClosingConfirmation();
      };
    }
  }, []);

  // Обновление текста кнопки при смене языка или статуса
  useEffect(() => {
    if (!tg) return;
    
    let buttonText = t('order_taxi');
    if (orderStatus === 'confirming') buttonText = t('confirm_order');
    if (orderStatus === 'searching') buttonText = t('cancel_search');
    if (orderStatus === 'found') buttonText = t('contact_driver');
    
    tg.MainButton.setText(buttonText);
    
    if (orderStatus === 'idle' || orderStatus === 'confirming') {
      tg.MainButton.show();
      tg.MainButton.enable();
    } else if (orderStatus === 'searching' || orderStatus === 'found') {
      tg.MainButton.show();
      tg.MainButton.enable();
    } else {
      tg.MainButton.hide();
    }
  }, [tg, orderStatus, lang]);

  // Обработчик нажатия на главную кнопку
  useEffect(() => {
    if (!tg) return;
    
    const handleMainButtonClick = () => {
      if (orderStatus === 'idle') {
        if (!fromLocation || !toLocation) {
          tg.showAlert(t('fill_addresses'));
          return;
        }
        if (!isInServiceZone(fromLocation.lat, fromLocation.lng)) {
          tg.showAlert(t('outside_zone'));
          return;
        }
        if (!isInServiceZone(toLocation.lat, toLocation.lng)) {
          tg.showAlert(t('outside_zone'));
          return;
        }
        setOrderStatus('confirming');
      } else if (orderStatus === 'confirming') {
        // Подтверждение заказа
        setOrderStatus('searching');
        // Здесь будет логика отправки заказа в базу и уведомления водителей
        setTimeout(() => {
          setOrderStatus('found');
        }, 3000);
      } else if (orderStatus === 'searching') {
        // Отмена поиска
        setOrderStatus('idle');
      } else if (orderStatus === 'found') {
        // Связь с водителем
        tg.openTelegramLink('https://t.me/driver_username');
      }
    };
    
    tg.MainButton.onClick(handleMainButtonClick);
    return () => tg.MainButton.offClick(handleMainButtonClick);
  }, [tg, orderStatus, fromLocation, toLocation, lang]);

  // Расчет стоимости при изменении точек или тарифа
  useEffect(() => {
    if (fromLocation && toLocation) {
      // Простой расчет расстояния (в реальности нужно использовать OSRM для маршрута)
      const dx = fromLocation.lng - toLocation.lng;
      const dy = fromLocation.lat - toLocation.lat;
      const distDeg = Math.sqrt(dx * dx + dy * dy);
      const distMeters = distDeg * 111000; // Примерный перевод градусов в метры
      
      setDistance(distMeters);
      
      // Проверка: является ли поездка пригородной (упрощенно)
      const isSuburb = !isInServiceZone(toLocation.lat, toLocation.lng); 
      const suburbDist = isSuburb ? distMeters / 1000 : 0;
      
      const basePrice = calculateTaxiPrice(distMeters, isSuburb, suburbDist);
      const finalPrice = Math.round(basePrice * TARIFFS[tariff].multiplier);
      
      setPrice(finalPrice);
    } else {
      setPrice(0);
      setDistance(0);
    }
  }, [fromLocation, toLocation, tariff]);

  // Обработчики для AddressInput
  const handleFromSelect = (location) => {
    if (!isInServiceZone(location.lat, location.lng)) {
      if (tg) tg.showAlert(t('outside_zone'));
      return;
    }
    setFromLocation(location);
  };

  const handleToSelect = (location) => {
    // Для пункта назначения можно разрешить выбор за пределами зоны, но предупредить
    setToLocation(location);
  };

  if (!tg) {
    return <div style={{ padding: 20, textAlign: 'center' }}>{t('loading')}</div>;
  }

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#F5F5F5',
      minHeight: '100vh',
      paddingBottom: 80
    }}>
      <Header lang={lang} setLang={(l) => { setLang(l); setLanguage(l); }} />
      
      {/* Карта */}
      <div style={{ height: '40vh', width: '100%', position: 'relative' }}>
        <MapComponent 
          center={[CENTER_COORDS.lat, CENTER_COORDS.lng]}
          from={fromLocation}
          to={toLocation}
          onMapReady={setMapInstance}
          onLocationSelect={(loc, type) => {
            if (type === 'from') handleFromSelect(loc);
            if (type === 'to') handleToSelect(loc);
          }}
        />
      </div>

      {/* Форма заказа */}
      <div style={{ padding: 16, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, position: 'relative', zIndex: 10 }}>
        
        <AddressInput 
          label={t('from')}
          value={fromLocation?.address || ''}
          onSelect={handleFromSelect}
          placeholder={t('enter_from')}
          type="from"
        />
        
        <div style={{ height: 12 }} />
        
        <AddressInput 
          label={t('to')}
          value={toLocation?.address || ''}
          onSelect={handleToSelect}
          placeholder={t('enter_to')}
          type="to"
        />

        <div style={{ height: 20 }} />
        
        <TariffSelector 
          selected={tariff} 
          onChange={setTariff} 
          lang={lang}
        />

        <div style={{ height: 20 }} />
        
        <PaymentSelector 
          selected={payment} 
          onChange={setPayment} 
          cashAmount={cashAmount}
          onCashAmountChange={setCashAmount}
          lang={lang}
        />

        {/* Итого */}
        <div style={{ 
          marginTop: 24, 
          padding: 16, 
          backgroundColor: '#FFF9C4', 
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>{t('total')}:</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#000' }}>
            {price > 0 ? `${price} ₸` : '---'}
          </span>
        </div>
        
        {distance > 0 && (
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#666' }}>
            ~{(distance / 1000).toFixed(2)} км
          </div>
        )}
      </div>

      {/* История заказов (можно вынести в отдельную страницу или модалку) */}
      {orderStatus === 'idle' && (
        <div style={{ padding: 16 }}>
          <h3 style={{ fontSize: 18, marginBottom: 12 }}>{t('history')}</h3>
          <OrderHistory userId={user?.id} lang={lang} />
        </div>
      )}
    </div>
  );
}
