import React from 'react';

interface RutErrorMessageProps {
  id?: string;
  className?: string;
}

const RutErrorMessage: React.FC<RutErrorMessageProps> = ({ id = 'rut-error', className = '' }) => (
  <div id={id} className={`errorRut ${className}`} role="alert" aria-live="polite">
    El RUT ingresado no es válido.
  </div>
);

export default RutErrorMessage;
