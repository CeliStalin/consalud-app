import { Contactabilidad } from "./Contactabilidad";

interface Heredero {
    id: number;
    rut: string;
    fechaNacimiento: string;
    nombre: string;
    apellidoPat: string;
    apellidoMat: string;
    parentesco: number;
    Genero: string;
    contactabilidad: Contactabilidad;
  }
  export type { Heredero };