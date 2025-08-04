import React from 'react';
import { ConfirmacionFinal } from '@/features/herederos/components/ConfirmacionFinal';
import { StepperProvider } from '@/features/herederos/components/Stepper';
import { FormHerederoProvider } from '@/features/herederos/provider/FormHerederoProvider';

const ConfirmacionFinalPage: React.FC = () => {
  return (
    <StepperProvider>
      <FormHerederoProvider>
        <div className="route-container layout-stable" style={{ overflowY: 'auto', height: '100vh', paddingBottom: 40 }}>
          <ConfirmacionFinal />
        </div>
      </FormHerederoProvider>
    </StepperProvider>
  );
};

export default ConfirmacionFinalPage; 