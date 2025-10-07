import { Titular } from './Titular';

interface TitularContextType {
  titular: Titular | null;
  loading: boolean;
  error: string | null;
  buscarTitular: (rut: string) => Promise<Titular | null>;
  limpiarTitular: () => void;
}

export type { TitularContextType };
