// src/context/MenuConfigContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

interface MenuItem {
  path: string;
  label: string;
  icon?: string;
}

interface MenuConfigContextType {
  enableDynamicMenu: boolean;
  customMenuItems?: MenuItem[];
}

// Valores por defecto
const defaultConfig: MenuConfigContextType = {
  enableDynamicMenu: true,
  customMenuItems: [
    {
      path: '/ejemplo',
      label: 'Aplicación Ejemplo',
      icon: '🔹'
    }
  ]
};

// Crear el contexto
const MenuConfigContext = createContext<MenuConfigContextType>(defaultConfig);

// Props para el proveedor
interface MenuConfigProviderProps {
  children: ReactNode;
  config?: Partial<MenuConfigContextType>;
}

// Proveedor del contexto
export const MenuConfigProvider: React.FC<MenuConfigProviderProps> = ({ 
  children, 
  config = {} 
}) => {
  // Combinar la configuración predeterminada con la proporcionada
  const configValue: MenuConfigContextType = {
    ...defaultConfig,
    ...config,
    // Combinar elementos del menú personalizados
    customMenuItems: [
      ...(defaultConfig.customMenuItems || []),
      ...(config.customMenuItems || [])
    ]
  };
  
  return (
    <MenuConfigContext.Provider value={configValue}>
      {children}
    </MenuConfigContext.Provider>
  );
};

// Hook para acceder a la configuración
export const useMenuConfig = (): MenuConfigContextType => {
  const context = useContext(MenuConfigContext);
  if (!context) {
    throw new Error('useMenuConfig debe usarse dentro de un MenuConfigProvider');
  }
  return context;
};