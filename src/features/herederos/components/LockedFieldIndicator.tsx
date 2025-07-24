import React from 'react';

interface LockedFieldIndicatorProps {
  isLocked: boolean;
  children: React.ReactNode;
  label?: string;
}

/**
 * Componente para mostrar indicadores visuales de campos bloqueados
 * Aplica estilos de Bulma para campos deshabilitados
 */
export const LockedFieldIndicator: React.FC<LockedFieldIndicatorProps> = ({
  isLocked,
  children,
  label
}) => {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="field">
      {label && (
        <label className="label" style={{ fontSize: '14px', fontWeight: 600, color: '#505050' }}>
          {label}
          <span style={{ marginLeft: '4px', color: '#04A59B' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="#04A59B" strokeWidth="2"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="#04A59B" strokeWidth="2"/>
            </svg>
          </span>
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {children}
        {isLocked && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(245, 245, 245, 0.8)',
              cursor: 'not-allowed',
              borderRadius: '4px',
              zIndex: 1
            }}
          />
        )}
      </div>
    </div>
  );
}; 