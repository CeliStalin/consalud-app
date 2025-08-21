import React, { useEffect, useRef, useState } from 'react';
import './styles/CustomSelect.css';

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
 * Componente personalizado para selectores con UX elegante y sutil
 * Siguiendo los estándares de diseño del proyecto
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
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Manejar clic fuera del select para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Simular el comportamiento del select nativo
  const handleSelectClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      selectRef.current?.focus();
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsFocused(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay más largo para permitir que el clic en las opciones funcione
    setTimeout(() => setIsOpen(false), 300);
  };

  const handleOptionClick = (optionValue: string) => {
    const syntheticEvent = {
      target: { name, value: optionValue }
    } as React.ChangeEvent<HTMLSelectElement>;

    onChange(syntheticEvent);
    setIsOpen(false);
    setIsFocused(false);
  };

  const selectedOption = options.find(option => option.value === value);



  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${error ? 'has-error' : ''} ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''} ${className}`}
    >
      {/* Select nativo oculto para mantener la funcionalidad */}
      <select
        ref={selectRef}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: '1px',
          height: '1px'
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

      {/* Select visual personalizado - Siguiendo estándares del proyecto */}
      <div
        className="custom-select-visual"
        onClick={handleSelectClick}
        style={{
          borderColor: error ? '#E11D48' : isFocused ? '#04A59B' : '#e0e0e0',
          backgroundColor: disabled ? '#f5f5f5' : '#f8f9fa',
          color: disabled ? '#6c757d' : selectedOption ? '#495057' : '#9ca3af',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <span style={{ fontWeight: selectedOption ? '500' : '400' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Flechita animada */}
        <div className="custom-select-arrow">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              color: disabled ? '#6c757d' : isFocused ? '#04A59B' : '#9ca3af',
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

      {/* Dropdown personalizado - Fondo blanco como estándar del proyecto */}
      {isOpen && !disabled && (
        <div className="custom-select-dropdown">
          {options.map(option => (
            <div
              key={option.value}
              className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
