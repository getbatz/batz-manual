import { useState, useEffect } from 'react';
import { searchAddress } from '../../lib/geocode';

export default function AddressInput({ label, value, onSelect, placeholder }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        const results = await searchAddress(query);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>{label}</label>
      <input
        type="text"
        value={value || query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!e.target.value) onSelect(null);
        }}
        placeholder={placeholder}
        style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', boxSizing: 'border-box' }}
      />
      {suggestions.length > 0 && (
        <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #ddd', borderRadius: 8, listStyle: 'none', padding: 0, margin: 0, zIndex: 100, maxHeight: 200, overflowY: 'auto' }}>
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              onClick={() => {
                onSelect(item);
                setSuggestions([]);
                setQuery('');
              }}
              style={{ padding: 10, borderBottom: '1px solid #eee', cursor: 'pointer' }}
            >
              {item.address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
