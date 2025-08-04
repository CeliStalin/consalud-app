import { createContext, useContext } from 'react';
import { FormHerederoContextType } from '../interfaces/FormHerederoContext';

const FormHerederoContext = createContext<FormHerederoContextType | undefined>(undefined);

export const useFormHeredero = () => {
    const context = useContext(FormHerederoContext);
    
    if (context === undefined) {
      throw new Error('useFormHeredero debe usarse dentro de un FormHerederoProvider');
    }
    
    return context;
};

export { FormHerederoContext }; 