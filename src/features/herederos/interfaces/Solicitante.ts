interface SolicitanteInMae {
  IdPersona: number;
  RutPersona: number;
  RutDigito: string;
  NomPersona: string;
  ApePaterno: string;
  ApeMaterno: string;
  FecNacimiento: string;
}

interface MejorContactibilidadSolicitante {
  CodCiudad: number;
  CodComuna: number;
  CodRegion: number;
  CodigoPostal: number;
  Email: string;
  descripcionCiudad: string;
  descripcionComuna: string;
  descripcionRegion: string;
  numeroBloque: number;
  numeroDepartamento: number;
  nombreVillaCondominio: string;
  nombreCalle: string;
  numeroCalle: number;
  numeroCelular: number;
  numeroFijo: number;
  tipoDireccion: string;
}

interface SolicitanteResponse {
  SolicitanteInMae: SolicitanteInMae;
  MejorContactibilidadSolicitante: MejorContactibilidadSolicitante;
}

export type { SolicitanteInMae, MejorContactibilidadSolicitante, SolicitanteResponse }; 