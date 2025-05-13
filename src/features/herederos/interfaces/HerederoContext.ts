import { Heredero } from "./Heredero";

interface HerederoContextType {
    heredero: Heredero | null;
    loading: boolean;
    error: string | null;
    buscarHeredero: (rut: string) => Promise<void>;
    limpiarHeredero: () => void;
  }
    export type { HerederoContextType };