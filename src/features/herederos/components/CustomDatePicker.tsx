import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays, subDays, getYear, setYear, setMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import './styles/CustomDatePicker.css';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  isError?: boolean;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
  className?: string;
  label?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selected,
  onChange,
  placeholder = "DD/MM/AAAA",
  isError = false,
  disabled = false,
  maxDate,
  minDate,
  className = "",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthSelection, setShowMonthSelection] = useState(false);
  const [showYearSelection, setShowYearSelection] = useState(false);
  const [yearPage, setYearPage] = useState(0);
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(prev => setMonth(prev, monthIndex));
    setShowMonthDropdown(false);
    setShowMonthSelection(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(prev => setYear(prev, year));
    setShowYearDropdown(false);
    setShowYearSelection(false);
    setYearPage(0);
  };

  const handleYearPageChange = (direction: 'prev' | 'next') => {
    setYearPage(prev => {
      const currentYear = getYear(new Date());
      const totalPages = Math.ceil((currentYear - 1900 + 1) / 12);
      
      console.log('Year page change:', { direction, prev, totalPages, currentYear });
      
      if (direction === 'next') {
        const newPage = Math.min(totalPages - 1, prev + 1);
        console.log('Next page:', newPage);
        return newPage;
      } else {
        const newPage = Math.max(0, prev - 1);
        console.log('Prev page:', newPage);
        return newPage;
      }
    });
  };

  const handleMonthButtonClick = () => {
    setShowMonthDropdown(false);
    setShowMonthSelection(!showMonthSelection);
    setShowYearDropdown(false);
    setShowYearSelection(false);
  };

  const handleYearButtonClick = () => {
    setShowYearDropdown(false);
    setShowYearSelection(!showYearSelection);
    setShowMonthDropdown(false);
    setShowMonthSelection(false);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return format(date, 'dd/MM/yyyy', { locale: es });
  };

  const getDaysInMonth = (): Date[] => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add days from previous month to fill first week
    const firstDayOfWeek = start.getDay();
    const prevMonthDays: Date[] = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevMonthEnd = endOfMonth(subMonths(start, 1));
      const prevDay = subDays(prevMonthEnd, i);
      prevMonthDays.push(prevDay);
    }
    
    // Add days from next month to fill last week
    const lastDayOfWeek = end.getDay();
    const nextMonthDays: Date[] = [];
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      const nextMonthStart = startOfMonth(addMonths(start, 1));
      const nextDay = addDays(nextMonthStart, i - 1);
      nextMonthDays.push(nextDay);
    }
    
    return [...prevMonthDays, ...days, ...nextMonthDays];
  };

  const isDateDisabled = (date: Date): boolean => {
    if (maxDate && date > maxDate) return true;
    if (minDate && date < minDate) return true;
    return false;
  };

  const isDateSelected = (date: Date): boolean => {
    return selected ? isSameDay(date, selected) : false;
  };

  const isDateCurrentMonth = (date: Date): boolean => {
    return isSameMonth(date, currentMonth);
  };

  // Generate years for pagination (from current year to 1900, descending order)
  const currentYear = getYear(new Date());
  const yearsPerPage = 12;
  const totalYears = currentYear - 1900 + 1;
  const totalYearPages = Math.ceil(totalYears / yearsPerPage);
  
  // Calculate years for current page (descending order)
  const startYear = currentYear - (yearPage * yearsPerPage);
  const endYear = Math.max(startYear - yearsPerPage + 1, 1900);
  const years = Array.from({ length: startYear - endYear + 1 }, (_, i) => startYear - i);

  // Generate months for selection (in calendar order)
  const months = [
    { name: 'Enero', short: 'Ene', index: 0 },
    { name: 'Febrero', short: 'Feb', index: 1 },
    { name: 'Marzo', short: 'Mar', index: 2 },
    { name: 'Abril', short: 'Abr', index: 3 },
    { name: 'Mayo', short: 'May', index: 4 },
    { name: 'Junio', short: 'Jun', index: 5 },
    { name: 'Julio', short: 'Jul', index: 6 },
    { name: 'Agosto', short: 'Ago', index: 7 },
    { name: 'Septiembre', short: 'Sep', index: 8 },
    { name: 'Octubre', short: 'Oct', index: 9 },
    { name: 'Noviembre', short: 'Nov', index: 10 },
    { name: 'Diciembre', short: 'Dic', index: 11 }
  ];

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMonthDropdown(false);
        setShowYearDropdown(false);
        setShowMonthSelection(false);
        setShowYearSelection(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const daysInMonth = getDaysInMonth();
  const weekDays = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

  return (
    <div className={`custom-datepicker-container ${className}`}>
      {label && (
        <label className="custom-datepicker-label">
          {label}
        </label>
      )}
      <div 
        className={`custom-datepicker-wrapper ${isError ? 'is-error' : ''} ${disabled ? 'is-disabled' : ''}`}
        onClick={handleInputClick}
      >
        <input
          type="text"
          value={formatDate(selected)}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          className="custom-datepicker-input"
        />
        <div className="custom-datepicker-icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="custom-calendar-popper" ref={calendarRef}>
          <div className="custom-calendar">
            <div className="custom-calendar-header">
              <div className="custom-calendar-month-year">
                <div className="custom-calendar-month-dropdown">
                  <button
                    className="custom-calendar-dropdown-btn"
                    onClick={handleMonthButtonClick}
                    type="button"
                  >
                    {format(currentMonth, 'MMMM', { locale: es }).charAt(0).toUpperCase() + format(currentMonth, 'MMMM', { locale: es }).slice(1)}
                  </button>
                  {showMonthDropdown && (
                    <div className="custom-calendar-dropdown-menu custom-calendar-month-dropdown-menu">
                      {months.map((month) => (
                        <button
                          key={month.name}
                          className={`custom-calendar-dropdown-item ${
                            month.index === currentMonth.getMonth() ? 'custom-calendar-dropdown-item-selected' : ''
                          }`}
                          onClick={() => handleMonthSelect(month.index)}
                          type="button"
                        >
                          {month.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="custom-calendar-year-dropdown">
                  <button
                    className="custom-calendar-dropdown-btn"
                    onClick={handleYearButtonClick}
                    type="button"
                  >
                    {format(currentMonth, 'yyyy')}
                  </button>
                  {showYearDropdown && (
                    <div className="custom-calendar-dropdown-menu custom-calendar-year-dropdown-menu">
                      <div className="custom-calendar-year-header">
                        <button
                          className="custom-calendar-year-nav"
                          onClick={() => handleYearPageChange('prev')}
                          disabled={yearPage === 0}
                          type="button"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <span className="custom-calendar-year-range">
                          {startYear} - {endYear}
                        </span>
                        <button
                          className="custom-calendar-year-nav"
                          onClick={() => handleYearPageChange('next')}
                          disabled={yearPage === totalYearPages - 1}
                          type="button"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                      <div className="custom-calendar-year-grid">
                        {years.map(year => (
                          <button
                            key={year}
                            className={`custom-calendar-dropdown-item custom-calendar-year-item ${
                              year === getYear(currentMonth) ? 'custom-calendar-dropdown-item-selected' : ''
                            }`}
                            onClick={() => handleYearSelect(year)}
                            type="button"
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Month Selection View */}
            {showMonthSelection && (
              <div className="custom-calendar-month-selection">
                <div className="custom-calendar-month-selection-header">
                  <button
                    className="custom-calendar-month-selection-nav"
                    onClick={() => setCurrentMonth(prev => setYear(prev, getYear(prev) - 1))}
                    type="button"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <span className="custom-calendar-month-selection-year">
                    {getYear(currentMonth)}
                  </span>
                  <button
                    className="custom-calendar-month-selection-nav"
                    onClick={() => setCurrentMonth(prev => setYear(prev, getYear(prev) + 1))}
                    type="button"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="custom-calendar-month-selection-grid">
                  {months.map((month) => (
                    <button
                      key={month.name}
                      className={`custom-calendar-month-selection-item ${
                        month.index === currentMonth.getMonth() && getYear(currentMonth) === getYear(new Date()) ? 'custom-calendar-month-selection-item-selected' : ''
                      }`}
                      onClick={() => handleMonthSelect(month.index)}
                      type="button"
                    >
                      {month.short}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Year Selection View */}
            {showYearSelection && (
              <div className="custom-calendar-year-selection">
                <div className="custom-calendar-year-selection-header">
                  <button
                    className="custom-calendar-year-selection-nav"
                    onClick={() => handleYearPageChange('prev')}
                    disabled={yearPage === 0}
                    type="button"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <span className="custom-calendar-year-selection-range">
                    {startYear} - {endYear}
                  </span>
                  <button
                    className="custom-calendar-year-selection-nav"
                    onClick={() => handleYearPageChange('next')}
                    disabled={yearPage === totalYearPages - 1}
                    type="button"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="custom-calendar-year-selection-grid">
                  {years.map(year => (
                    <button
                      key={year}
                      className={`custom-calendar-year-selection-item ${
                        year === getYear(currentMonth) ? 'custom-calendar-year-selection-item-selected' : ''
                      }`}
                      onClick={() => handleYearSelect(year)}
                      type="button"
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Calendar View */}
            {!showMonthSelection && !showYearSelection && (
              <>
                <div className="custom-calendar-day-names">
                  {weekDays.map(day => (
                    <div key={day} className="custom-calendar-day-name">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="custom-calendar-days">
                  {daysInMonth.map((date, index) => (
                    <button
                      key={index}
                      className={`custom-calendar-day ${
                        isDateSelected(date) ? 'custom-calendar-day-selected' : ''
                      } ${
                        !isDateCurrentMonth(date) ? 'custom-calendar-day-outside' : ''
                      } ${
                        isDateDisabled(date) ? 'custom-calendar-day-disabled' : ''
                      } ${
                        isToday(date) ? 'custom-calendar-day-today' : ''
                      }`}
                      onClick={() => !isDateDisabled(date) && handleDateSelect(date)}
                      disabled={isDateDisabled(date)}
                      type="button"
                    >
                      {format(date, 'd')}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 