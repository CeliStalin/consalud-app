import { createContext, useContext } from 'react';
import { TitularContextType } from '../interfaces/TitularContext';

const TitularContext = createContext<TitularContextType | undefined>(undefined);

export const useTitular = () => {
  const context = useContext(TitularContext);

  if (context === undefined) {
    throw new Error('useTitular debe usarse dentro de un TitularProvider');
  }

  return context;
};

export { TitularContext };
