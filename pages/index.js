import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [tariff, setTariff] = useState('economy');
  const [user, setUser] = useState(null);

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
  }, []);

  const tariffs = {
    economy: { name: 'Эконом', price: 1000, icon: '🚗', time: 5 },
    comfort: { name: 'Комфорт', price: 1500, icon: '🚙', time: 7 },
    business: { name: 'Бизнес', price: 2500, icon: '🚘', time: 10 },
  };

  const handleOrder = () => {
    if (!from || !to) {
      alert('Заполни оба адреса!');
      return;
    }

    const orderInfo = `
🚕 Заказ такси БАЦ

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
              Привет, {user.first_name}! 👋
            </p>
          )}
          <p style={styles.tagline}>Быстро. Удобно. Рядом.</p>
        </div>

        {/* Карта placeholder */}
        <div style={styles.mapPlaceholder}>
          📍 Карта (будет в следующей версии)
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
            Заказать БАЦ 🚕
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
  mapPlaceholder: {
    height: '200px',
    backgroundColor: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#666',
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

