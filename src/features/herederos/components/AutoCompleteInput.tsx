import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/AutoCompleteInput.css';

interface AutoCompleteOption {
  value: string;
  label: string;
  id?: number;
}

interface AutoCompleteInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOptionSelect?: (option: AutoCompleteOption) => void;
  options: AutoCompleteOption[];
  placeholder?: string;
  label?: string;
  error?: boolean;
  disabled?: boolean;
  loading?: boolean;
  minCharsToSearch?: number;
  debounceMs?: number;
}

export const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
  name,
  value,
  onChange,
  onOptionSelect,
  options,
  placeholder = 'Ingresar',
  label,
  error = false,
  disabled = false,
  loading = false,
  minCharsToSearch = 2,
  debounceMs = 300
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<AutoCompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Actualizar inputValue cuando cambia el value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filtrar opciones basado en el texto ingresado
  const filterOptions = useCallback((searchText: string) => {
    if (searchText.length < minCharsToSearch) {
      setFilteredOptions([]);
      return;
    }

    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [options, minCharsToSearch]);

  // Debounce para la búsqueda
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      filterOptions(inputValue);
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputValue, filterOptions, debounceMs]);

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
  const handleOptionSelect = (option: AutoCompleteOption) => {
    setInputValue(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
    
    // Crear un evento sintético para el onChange
    const syntheticEvent = {
      target: {
        name,
        value: option.label
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
    
    if (onOptionSelect) {
      onOptionSelect(option);
    }
  };

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
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
    if (inputValue.length >= minCharsToSearch && filteredOptions.length > 0) {
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

  return (
    <div className="autocomplete-container" ref={dropdownRef}>
      {label && (
        <label className="label">{label}</label>
      )}
      
      <div className="field">
        <div className={`control has-icons-right ${loading ? 'is-loading' : ''}`}>
          <input
            ref={inputRef}
            className={`input ${error ? 'is-danger' : ''} ${disabled ? 'is-static' : ''}`}
            type="text"
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
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
      {isOpen && filteredOptions.length > 0 && (
        <div className="autocomplete-dropdown">
          <ul className="autocomplete-list" role="listbox">
            {filteredOptions.map((option, index) => (
              <li
                key={option.id || index}
                className={`autocomplete-item ${index === highlightedIndex ? 'is-highlighted' : ''}`}
                onClick={() => handleOptionSelect(option)}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {isOpen && inputValue.length >= minCharsToSearch && filteredOptions.length === 0 && !loading && (
        <div className="autocomplete-dropdown">
          <div className="autocomplete-no-results">
            <p className="has-text-grey">No se encontraron resultados</p>
          </div>
        </div>
      )}
    </div>
  );
}; 