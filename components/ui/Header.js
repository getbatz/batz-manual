import { t } from '../lib/i18n';

export default function Header({ lang, onLanguageChange, onHistoryClick, user }) {
  return (
    <header style={styles.header}>
      <div style={styles.headerTop}>
        <h1 style={styles.title}>{t(lang, 'appName')} 🚕</h1>
        <div style={styles.headerButtons}>
          <button onClick={onLanguageChange} style={styles.langBtn} aria-label="Change language">
            {lang.toUpperCase()}
          </button>
          <button onClick={onHistoryClick} style={styles.historyBtn} aria-label="View history">
            📋
          </button>
        </div>
      </div>
      {user && (
        <p style={styles.greeting}>
          {t(lang, 'welcome')}, {user.first_name}! 👋
        </p>
      )}
      <p style={styles.tagline}>{t(lang, 'tagline')}</p>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#FFD700',
    padding: '12px',
    paddingTop: '40px',
    flexShrink: 0,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
  },
  headerButtons: {
    display: 'flex',
    gap: '8px',
  },
  langBtn: {
    backgroundColor: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px',
  },
  historyBtn: {
    backgroundColor: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
  },
  greeting: {
    margin: '8px 0 4px',
    fontSize: '14px',
  },
  tagline: {
    margin: 0,
    fontSize: '13px',
    opacity: 0.9,
  },
};
