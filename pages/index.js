import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { t } from '../lib/i18n';
import { CENTER_COORDS, isInServiceZone } from '../lib/geocode';
import { calculateTaxiPrice, TARIFFS } from '../lib/priceCalculator';

// Динамический импорт компонентов (они работают только в браузере)
const MapComponent = dynamic(() => import('../components/Map/Map'), { ssr: false });
const Header = dynamic(() => import('../components/ui/Header'), { ssr: false });
const AddressInput = dynamic(() => import('../components/ui/AddressInput'), { ssr: false });
const TariffSelector = dynamic(() => import('../components/ui/TariffSelector'), { ssr: false });
const PaymentSelector = dynamic(() => import('../components/ui/PaymentSelector'), { ssr: false });
const OrderHistory = dynamic(() => import('../components/ui/OrderHistory'), { ssr: false });

export default function Home() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('ru');
  
  // Состояние карты и локаций
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  
  // Состояние заказа
  const [tariff, setTariff] = useState('economy');
  const [payment, setPayment] = useState('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [price, setPrice] = useState(0);
  const [distance, setDistance] = useState(0);
  const [orderStatus, setOrderStatus] = useState('idle');

  // Инициализация Telegram WebApp
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram) {
      const telegram = window.Telegram.WebApp;
      telegram.ready();
      telegram.expand();
      telegram.setHeaderColor('#FFD700');
      telegram.setBackgroundColor('#ffffff');
      
      setTg(telegram);
      
      const userData = telegram.initDataUnsafe?.user;
      if (userData) {
        setUser(userData);
        const tgLang = userData.language_code || 'ru';
        const supportedLangs = ['ru', 'kk', 'en'];
        const selectedLang = supportedLangs.includes(tgLang) ? tgLang : 'ru';
        setLang(selectedLang);
      }
      
      telegram.MainButton.setText(t('order_taxi', selectedLang));
      telegram.MainButton.setColor('#FFD700');
      telegram.MainButton.setTextColor('#000000');
      telegram.MainButton.show();
    }
  }, []);

  // Обновление кнопки
  useEffect(() => {
    if (!tg) return;
    
    let buttonText = t('order_taxi', lang);
    if (orderStatus === 'confirming') buttonText = t('confirm_order', lang);
    if (orderStatus === 'searching') buttonText = t('cancel', lang);
    if (orderStatus === 'found') buttonText = t('contact_driver', lang);
    
    tg.MainButton.setText(buttonText);
    
    if (orderStatus === 'idle') {
       if (fromLocation && toLocation) tg.MainButton.enable();
       else tg.MainButton.disable();
    } else {
      tg.MainButton.enable();
    }
  }, [tg, orderStatus, lang, fromLocation, toLocation]);

  // Логика кнопки
  useEffect(() => {
    if (!tg) return;
    
    const handleClick = () => {
      if (orderStatus === 'idle') {
        if (!fromLocation || !toLocation) {
          tg.showAlert(t('fill_addresses', lang));
          return;
        }
        if (!isInServiceZone(fromLocation.lat, fromLocation.lng)) {
          tg.showAlert(t('outside_zone', lang));
          return;
        }
        setOrderStatus('confirming');
      } else if (orderStatus === 'confirming') {
        setOrderStatus('searching');
        // Имитация поиска водителя
        setTimeout(() => setOrderStatus('found'), 3000);
      } else if (orderStatus === 'searching') {
        setOrderStatus('idle');
      } else if (orderStatus === 'found') {
        tg.openTelegramLink('https://t.me/+77777777777');
      }
    };
    
    tg.MainButton.onClick(handleClick);
    return () => tg.MainButton.offClick(handleClick);
  }, [tg, orderStatus, fromLocation, toLocation, lang]);

  // Расчет цены
  useEffect(() => {
    if (fromLocation && toLocation) {
      const dx = fromLocation.lng - toLocation.lng;
      const dy = fromLocation.lat - toLocation.lat;
      const distDeg = Math.sqrt(dx * dx + dy * dy);
      const distMeters = distDeg * 111000; 
      
      setDistance(distMeters);
      
      // Упрощенная проверка пригорода
      const isSuburb = !isInServiceZone(toLocation.lat, toLocation.lng);
      const suburbDist = isSuburb ? distMeters / 1000 : 0;
      
      const basePrice = calculateTaxiPrice(distMeters, isSuburb, suburbDist);
      const finalPrice = Math.round(basePrice * TARIFFS[tariff].multiplier);
      
      setPrice(finalPrice);
      
      if (orderStatus === 'idle' && fromLocation && toLocation) {
         tg?.MainButton.enable();
      }
    }
  }, [fromLocation, toLocation, tariff, orderStatus, tg]);

  if (!tg) return <div style={{padding: 20, textAlign: 'center'}}>Loading...</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#F5F5F5', minHeight: '100vh', paddingBottom: 80 }}>
      <Header lang={lang} setLang={setLang} />
      
      <div style={{ height: '40vh', width: '100%' }}>
        <MapComponent 
          center={[CENTER_COORDS.lat, CENTER_COORDS.lng]}
          from={fromLocation}
          to={toLocation}
          onLocationSelect={(loc, type) => {
            if (!isInServiceZone(loc.lat, loc.lng)) {
              tg.showAlert(t('outside_zone', lang));
              return;
            }
            if (type === 'from') setFromLocation(loc);
            if (type === 'to') setToLocation(loc);
          }}
        />
      </div>

      <div style={{ padding: 16, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20 }}>
        <AddressInput label={t('from', lang)} value={fromLocation?.address || ''} onSelect={setFromLocation} placeholder={t('enter_from', lang)} />
        <div style={{ height: 12 }} />
        <AddressInput label={t('to', lang)} value={toLocation?.address || ''} onSelect={setToLocation} placeholder={t('enter_to', lang)} />
        
        <div style={{ height: 20 }} />
        <TariffSelector selected={tariff} onChange={setTariff} lang={lang} />
        
        <div style={{ height: 20 }} />
        <PaymentSelector selected={payment} onChange={setPayment} cashAmount={cashAmount} onCashAmountChange={setCashAmount} lang={lang} />

        <div style={{ marginTop: 24, padding: 16, backgroundColor: '#FFF9C4', borderRadius: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span>{t('total', lang)}:</span>
          <span style={{ fontWeight: 700 }}>{price > 0 ? `${price} ₸` : '---'}</span>
        </div>
        {distance > 0 && <div style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 8 }}>~{(distance / 1000).toFixed(2)} км</div>}
      </div>
      
      {orderStatus === 'idle' && <div style={{ padding: 16 }}><OrderHistory lang={lang} /></div>}
    </div>
  );
}
