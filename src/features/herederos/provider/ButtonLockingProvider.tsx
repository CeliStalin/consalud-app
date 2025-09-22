import React from 'react';
import { ButtonLockingNotification } from '../components/ButtonLockingNotification';
import { ButtonLockingProvider } from '../contexts/ButtonLockingContext';
import '../styles/ButtonLocking.css';

export interface ButtonLockingProviderWrapperProps {
  children: React.ReactNode;
  showNotification?: boolean;
  showOverlay?: boolean;
  showTopBar?: boolean;
}

/**
 * Wrapper del provider de bloqueo de botones que incluye la notificación
 * Facilita la integración en la aplicación principal
 */
export const ButtonLockingProviderWrapper: React.FC<ButtonLockingProviderWrapperProps> = ({
  children,
  showNotification = true,
  showOverlay = true,
  showTopBar = true
}) => {
  return (
    <ButtonLockingProvider>
      {children}
      {showNotification && (
        <ButtonLockingNotification
          showOverlay={showOverlay}
          showTopBar={showTopBar}
        />
      )}
    </ButtonLockingProvider>
  );
};

export default ButtonLockingProviderWrapper;
