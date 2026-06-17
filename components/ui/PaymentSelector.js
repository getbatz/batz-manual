export default function PaymentSelector({ selected, onChange, cashAmount, onCashAmountChange, lang }) {
  const options = [
    { id: 'cash', label: 'Наличные' },
    { id: 'kaspi', label: 'Kaspi' },
    { id: 'halyk', label: 'Halyk' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        {options.map(opt => (
          <div
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: selected === opt.id ? '2px solid #FFD700' : '1px solid #ddd',
              backgroundColor: selected === opt.id ? '#FFF9C4' : 'white',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            {opt.label}
          </div>
        ))}
      </div>
      {selected === 'cash' && (
        <input
          type="number"
          placeholder="Сумма для сдачи (например, 2000)"
          value={cashAmount}
          onChange={(e) => onCashAmountChange(e.target.value)}
          style={{ width: '100%', marginTop: 10, padding: 10, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
      )}
    </div>
  );
}
