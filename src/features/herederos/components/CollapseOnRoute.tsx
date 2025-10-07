import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useMenuCollapse } from '@consalud/core';

export const CollapseOnRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { isMenuCollapsed, collapseMenu } = useMenuCollapse();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    // Solo colapsa si venimos de fuera de la sección
    if (
      location.pathname.startsWith('/mnherederos/ingresoher') &&
      !isMenuCollapsed &&
      (!prevPath.current || !prevPath.current.startsWith('/mnherederos/ingresoher'))
    ) {
      collapseMenu();
    }
    prevPath.current = location.pathname;
  }, [location.pathname, isMenuCollapsed, collapseMenu]);

  return <>{children}</>;
};
