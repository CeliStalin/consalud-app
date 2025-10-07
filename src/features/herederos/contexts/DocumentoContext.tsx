import { createContext, useContext } from 'react';
import { DocumentoContextType } from '../interfaces/DocumentosContext';

const DocumentoContext = createContext<DocumentoContextType | undefined>(undefined);

export const useDocumento = () => {
  const context = useContext(DocumentoContext);

  if (context === undefined) {
    throw new Error('useDocumento debe usarse dentro de un DocumentoProvider');
  }

  return context;
};

export { DocumentoContext };
