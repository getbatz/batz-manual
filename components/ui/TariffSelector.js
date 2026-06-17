import { TARIFFS } from '../../lib/priceCalculator';

export default function TariffSelector({ selected, onChange, lang }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {Object.entries(TARIFFS).map(([key, data]) => (
        <div
          key={key}
          onClick={() => onChange(key)}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: selected === key ? '2px solid #FFD700' : '1px solid #ddd',
            backgroundColor: selected === key ? '#FFF9C4' : 'white',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          {data.name}
        </div>
      ))}
    </div>
  );
}
