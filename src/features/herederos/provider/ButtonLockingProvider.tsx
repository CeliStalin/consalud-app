import React from 'react';
import { ButtonLockingProvider } from '../contexts/ButtonLockingContext';

export interface ButtonLockingProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper del provider de bloqueo de botones
 * Facilita la integración en la aplicación principal
 */
export const ButtonLockingProviderWrapper: React.FC<ButtonLockingProviderWrapperProps> = ({
  children
}) => {
  return (
    <ButtonLockingProvider>
      {children}
    </ButtonLockingProvider>
  );
};

export default ButtonLockingProviderWrapper;
