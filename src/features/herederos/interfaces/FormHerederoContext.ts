import { FormData } from './FormData';

interface FormHerederoContextType {
  formData: FormData | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  saveFormData: (data: FormData) => void;
  updateFormData: (field: string | number | symbol, value: any) => void;
  clearFormData: () => void;
  validateFormData: () => boolean;
  getFormData: () => FormData | null;
  reloadFromStorage: () => void;
  forceSyncFromStorage: () => void;
}

export type { FormHerederoContextType };
