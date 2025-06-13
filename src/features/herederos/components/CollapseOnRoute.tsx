import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMenuCollapse } from '@consalud/core';

export const CollapseOnRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { collapseMenu } = useMenuCollapse();

  useEffect(() => {
    if (location.pathname.startsWith('/mnherederos/ingresoher')) {
      collapseMenu();
    }
  }, [location.pathname, collapseMenu]);

  return <>{children}</>;
}; 