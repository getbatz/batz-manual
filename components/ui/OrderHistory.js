import { t } from '../lib/i18n';

export default function OrderHistory({ orders, onClose, lang }) {
  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{t(lang, 'history')}</h2>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close">✕</button>
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
  );
}

const styles = {
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '400px',
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
  },
  orderItem: {
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    marginBottom: '10px',
    fontSize: '13px',
  },
  orderDate: {
    fontSize: '11px',
    color: '#999',
    marginBottom: '5px',
  },
  orderPrice: {
    marginTop: '8px',
    fontWeight: 'bold',
    color: '#333',
  },
};
