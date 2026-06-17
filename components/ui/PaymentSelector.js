import { t } from '../lib/i18n';

export default function PaymentSelector({ methods, selected, onSelect, lang }) {
  return (
    <>
      <div style={styles.paymentLabel}>{t(lang, 'payment')}:</div>
      <div style={styles.paymentMethods}>
        {methods.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            style={{
              ...styles.paymentBtn,
              ...(selected === p.id ? styles.paymentActive : {}),
            }}
            aria-pressed={selected === p.id}
          >
            {p.id === 'cash' ? (
              <span style={{ fontSize: '28px' }}>{p.icon}</span>
            ) : (
              <img src={p.icon} alt={p.name} style={styles.logo} />
            )}
            <span>{t(lang, p.name)}</span>
          </button>
        ))}
      </div>
    </>
  );
}

const styles = {
  paymentLabel: {
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333',
  },
  paymentMethods: {
    display: 'flex',
    gap: '8px',
    marginBottom: '15px',
  },
  paymentBtn: {
    flex: 1,
    padding: '10px',
    border: '2px solid #ddd',
    borderRadius: '10px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
  },
  paymentActive: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFDE7',
  },
  logo: {
    width: '35px',
    height: '35px',
    objectFit: 'contain',
    marginBottom: '3px',
  },
};
