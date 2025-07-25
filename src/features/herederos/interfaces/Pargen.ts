/**
 * Interfaces para parámetros generales (Pargen)
 */

export interface Genero {
  Codigo: string;
  Descripcion: string;
}

export interface Ciudad {
  idCiudad: number;
  idRegion: number;
  idProvincia: number;
  nombreCiudad: string;
  EstadoPar: string;
  EstadoReg: string;
}

export interface Comuna {
  idComuna: number;
  CodComuna: number;
  idCiudad: number;
  idRegion: number;
  idProvicia: number;
  NombreComuna: string;
}

export interface Calle {
  idCalle: number;
  nombreCalle: string;
  idComuna: number;
} 