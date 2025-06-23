import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const IngresoHerederosPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir automáticamente al IngresoTitularPage
    navigate('/mnherederos/ingresoher/ingresotitular', { replace: true });
  }, [navigate]);

  // No renderizar layout ni componentes visuales para evitar parpadeo
  return null;
};

export default IngresoHerederosPage;