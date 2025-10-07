import { Documento } from './Documento';

interface DocumentoContextType {
  documento: Documento | null;
  loading: boolean;
  error: string | null;
}

export type { DocumentoContextType };
