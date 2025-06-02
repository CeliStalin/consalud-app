import React from 'react';
import * as ConsaludCore from '@consalud/core';
import { useCoreIntegration } from '@/hooks/useCoreIntegration';

const HomePage: React.FC = () => {
  const { checkBounceSupport } = useCoreIntegration();
  
  React.useEffect(() => {
    // Verificar que el bounce esté funcionando
    checkBounceSupport();
  }, [checkBounceSupport]);
  
  return (
    <ConsaludCore.HomePage 
      enableBounce={true}
      showWelcomeSection={true}
      showApplicationsSection={true}
      showDirectAccessSection={true}
      // Agregar props adicionales si el core las soporta
      bounceIntensity="medium"
      animationDuration={300}
    />
  );
};

export default HomePage;
