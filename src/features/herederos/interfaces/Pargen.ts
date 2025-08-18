/**
 * Interfaces para parámetros generales (Pargen)
 */

export interface Genero {
  Codigo: string;
  Descripcion: string;
}

export interface Region {
  idRegion: number;
  codRegion: number;
  nombreRegion: string;
  estadoPar: string;
  estadoReg: string;
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

export interface NumeroCalle {
  idComuna: number;
  idComunaIsapre: number;
  idDireccion: number;
  nombreCalle: string;
  numeroCalle: number;
}

export interface TipoDocumento {
  valValor: number;
  nombre: string;
  descripcion: string;
} 