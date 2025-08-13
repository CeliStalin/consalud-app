import React, { useState, useEffect, useRef } from 'react';
import './styles/AutoCompleteInput.css';
import { useNumerosCalleAutocomplete } from '../hooks/useNumerosCalleAutocomplete';
import { NumeroCalle } from '../interfaces/Pargen';

interface NumberAutoCompleteInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOptionSelect?: (option: NumeroCalle) => void;
  nombreCalle?: string;
  idComuna?: number;
  placeholder?: string;
  label?: string;
  error?: boolean;
  disabled?: boolean;
  minCharsToSearch?: number;
  debounceMs?: number;
}

export const NumberAutoCompleteInput: React.FC<NumberAutoCompleteInputProps> = ({
  name,
  value,
  onChange,
  onOptionSelect,
  nombreCalle,
  idComuna,
  placeholder = 'Ingresar',
  label,
  error = false,
  disabled = false,
  minCharsToSearch = 1,
  debounceMs = 200
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook para autocompletado de números
  const { numeros, loading, error: apiError, searchNumeros, clearNumeros } = useNumerosCalleAutocomplete({
    nombreCalle,
    idComuna
  });

  // Actualizar inputValue cuando cambia el value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce para la búsqueda
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (inputValue.length >= minCharsToSearch) {
        searchNumeros(inputValue);
      } else {
        clearNumeros();
      }
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputValue, searchNumeros, clearNumeros, minCharsToSearch, debounceMs]);

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    // Llamar al onChange del padre
    onChange(e);
  };

  // Manejar selección de opción
  const handleOptionSelect = (numero: NumeroCalle) => {
    setInputValue(numero.numeroCalle.toString());
    setIsOpen(false);
    setHighlightedIndex(-1);
    
    // Crear un evento sintético para el onChange
    const syntheticEvent = {
      target: {
        name,
        value: numero.numeroCalle.toString()
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
    
    if (onOptionSelect) {
      onOptionSelect(numero);
    }
  };

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || numeros.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < numeros.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : numeros.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleOptionSelect(numeros[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar focus
  const handleFocus = () => {
    if (inputValue.length >= minCharsToSearch && numeros.length > 0) {
      setIsOpen(true);
    }
  };

  // Manejar blur
  const handleBlur = () => {
    // Pequeño delay para permitir que el clic en una opción se procese
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  // Determinar si el campo debe estar deshabilitado
  const isDisabled = disabled || !idComuna;

  return (
    <div className="autocomplete-container" ref={dropdownRef}>
      {label && (
        <label className="label">{label}</label>
      )}
      
      <div className="field">
        <div className={`control has-icons-right ${loading ? 'is-loading' : ''}`}>
          <input
            ref={inputRef}
            className={`input ${error ? 'is-danger' : ''} ${isDisabled ? 'is-static' : ''}`}
            type="text"
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={!idComuna ? 'Seleccione comuna primero' : !nombreCalle ? 'Seleccione calle primero' : placeholder}
            disabled={isDisabled}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
          />
          
          {loading && (
            <span className="icon is-small is-right">
              <i className="fas fa-spinner fa-spin"></i>
            </span>
          )}
        </div>
      </div>

      {/* Dropdown de opciones */}
      {isOpen && numeros.length > 0 && (
        <div className="autocomplete-dropdown">
          <ul className="autocomplete-list" role="listbox">
            {numeros.map((numero, index) => (
              <li
                key={numero.idDireccion || index}
                className={`autocomplete-item ${index === highlightedIndex ? 'is-highlighted' : ''}`}
                onClick={() => handleOptionSelect(numero)}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                {numero.numeroCalle}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {isOpen && inputValue.length >= minCharsToSearch && numeros.length === 0 && !loading && (
        <div className="autocomplete-dropdown">
          <div className="autocomplete-no-results">
            <p className="has-text-grey">No se encontraron números</p>
          </div>
        </div>
      )}

      {/* Mostrar error de API si existe */}
      {apiError && (
        <p className="help is-danger">{apiError}</p>
      )}
    </div>
  );
}; 