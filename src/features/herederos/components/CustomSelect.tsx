import React from 'react';

interface CustomSelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

/**
 * Componente personalizado para selectores con flechita elegante
 * Mantiene la consistencia visual con el diseño del sistema
 */
export const CustomSelect: React.FC<CustomSelectProps> = ({
  name,
  value,
  onChange,
  options,
  placeholder = "Seleccionar",
  disabled = false,
  error = false,
  className = ""
}) => {
  return (
    <div 
      className={`custom-select-container ${error ? 'has-error' : ''} ${className}`}
      style={{
        position: 'relative',
        width: '100%'
      }}
    >
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%',
          height: '42px',
          padding: '8px 16px',
          border: error ? '1.5px solid #E11D48' : '1.5px solid #e0e0e0',
          borderRadius: '24px',
          fontSize: '16px',
          backgroundColor: disabled ? '#f5f5f5' : '#f8f9fa',
          color: disabled ? '#6c757d' : '#495057',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          boxShadow: '0 2px 8px rgba(4, 165, 155, 0.07)',
          transition: 'border 0.2s, box-shadow 0.2s'
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = '#04A59B';
            e.target.style.boxShadow = '0 2px 8px rgba(4, 165, 155, 0.15)';
          }
        }}
        onBlur={(e) => {
          if (!disabled) {
            e.target.style.borderColor = error ? '#E11D48' : '#e0e0e0';
            e.target.style.boxShadow = '0 2px 8px rgba(4, 165, 155, 0.07)';
          }
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Flechita personalizada */}
      <div
        style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            color: disabled ? '#6c757d' : '#9ca3af',
            transition: 'color 0.2s'
          }}
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}; 