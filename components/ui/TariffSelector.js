import { t } from '../lib/i18n';

export default function TariffSelector({ tariffs, selected, onSelect, lang }) {
  return (
    <div style={styles.tariffs}>
      {Object.entries(tariffs).map(([key, value]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          style={{
            ...styles.tariffBtn,
            ...(selected === key ? styles.tariffActive : {}),
          }}
          aria-pressed={selected === key}
        >
          <div style={styles.tariffIcon}>{value.icon}</div>
          <div style={styles.tariffName}>{t(lang, value.name)}</div>
          <div style={styles.tariffPrice}>{value.price} {t(lang, 'tenge')}</div>
        </button>
      ))}
    </div>
  );
}

const styles = {
  tariffs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '15px',
    marginTop: '15px',
  },
  tariffBtn: {
    flex: 1,
    padding: '10px 6px',
    border: '2px solid #ddd',
    borderRadius: '10px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    textAlign: 'center',
  },
  tariffActive: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFDE7',
  },
  tariffIcon: {
    fontSize: '24px',
    marginBottom: '3px',
  },
  tariffName: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  tariffPrice: {
    fontSize: '11px',
    color: '#666',
  },
};
