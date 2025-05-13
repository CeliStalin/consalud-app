import { Titular } from "./Titular";

interface TitularContextType {
    titular: Titular | null;
    loading: boolean;
    error: string | null;
    buscarTitular: (rut: string) => Promise<void>;
    limpiarTitular: () => void;
}

export type {
    TitularContextType
}
  