import { createContext, useContext } from "react";
import { HerederoContextType } from "../interfaces/HerederoContext";

const HerederoContext = createContext<HerederoContextType | undefined>(undefined);

// Hook personalizado para acceder al contexto
export const useHeredero = () => {
  const context = useContext(HerederoContext);
  
  if (context === undefined) {
    throw new Error('useHeredero debe usarse dentro de un HerederoProvider');
  }
  
  return context;
};
export { HerederoContext };