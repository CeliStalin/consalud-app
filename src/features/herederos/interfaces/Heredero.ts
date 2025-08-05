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
    indFallecido?: string; // "N" o "S" - indica si la persona está fallecida
    // Campos adicionales para compatibilidad con BFF
    codCiudad?: number;
    codComuna?: number;
    codRegion?: number;
    codigoPostal?: number;
    email?: string;
    descripcionCiudad?: string;
    descripcionComuna?: string;
    descripcionRegion?: string;
    numeroBloque?: number;
    numeroDepartamento?: number;
    nombreVillaCondominio?: string;
    nombreCalle?: string;
    numeroCalle?: number;
    numeroCelular?: number;
    numeroFijo?: number;
    tipoDireccion?: string;
}
export type { Heredero };