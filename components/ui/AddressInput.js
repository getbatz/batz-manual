import { useState, useEffect } from 'react';
import { t } from '../lib/i18n';

export default function AddressInput({ 
  label, 
  value, 
  onChange, 
  onFocus, 
  isActive, 
  suggestions, 
  onSelectSuggestion,
  icon 
}) {
  return (
    <div style={styles.inputWrapper}>
      <span style={styles.icon}>{icon}</span>
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          style={styles.input}
          aria-label={label}
        />
        {isActive && suggestions.length > 0 && (
          <div style={styles.suggestions} role="listbox">
            {suggestions.map((s, i) => (
              <div
                key={i}
                style={styles.suggestionItem}
                onClick={() => onSelectSuggestion(s)}
                role="option"
                tabIndex={0}
              >
                {icon} {s.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  inputWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '8px',
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 100,
  },
  icon: {
    fontSize: '20px',
    width: '28px',
    textAlign: 'center',
    paddingTop: '12px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'text',
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '10px',
    marginTop: '5px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
  },
  suggestionItem: {
    padding: '10px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
