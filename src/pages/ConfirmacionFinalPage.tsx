import React from 'react';
import { ConfirmacionFinal } from '@/features/herederos/components/ConfirmacionFinal';
import { StepperProvider } from '@/features/herederos/components/Stepper';
import { FormHerederoProvider } from '@/features/herederos/provider/FormHerederoProvider';
import { useHeredero } from '@/features/herederos/contexts/HerederoContext';

const ConfirmacionFinalPage: React.FC = () => {
  const { heredero } = useHeredero();
  const rutHeredero = heredero?.rut || '';

  return (
    <StepperProvider>
      <FormHerederoProvider rutHeredero={rutHeredero}>
        <div className="route-container layout-stable" style={{ overflowY: 'auto', height: '100vh', paddingBottom: 40 }}>
          <ConfirmacionFinal />
        </div>
      </FormHerederoProvider>
    </StepperProvider>
  );
};

export default ConfirmacionFinalPage; 