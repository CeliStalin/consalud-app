interface SolicitanteInMae {
  IdPersona: number;
  RutPersona: number;
  RutDigito: string;
  NomPersona: string;
  ApePaterno: string;
  ApeMaterno: string;
  FecNacimiento: string;
  IndFallecido: string; // "N" o "S" - indica si la persona está fallecida
  CodSexo?: string;
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
  CodSexo?: number;
}

interface SolicitanteResponse {
  SolicitanteInMae: SolicitanteInMae;
  MejorContactibilidadSolicitante: MejorContactibilidadSolicitante;
}

// Nueva interfaz para la solicitud POST de Solicitante
interface SolicitantePostRequest {
  RutPersona: number;
  NombrePersona: string;
  ApellidoPaterno: string;
  ApellidoMaterno: string;
  RutCompleto: string;
  RutDigito: string;
  CodigoSexo: string;
  FechaNacimiento: string;
  IdParentesco: number;
  IdTipoSolicitante: number;
  EstadoRegistro: string;
  NumTelef: number;
  Mail: string;
  IdRegion: number;
  DesRegion: string;
  IdCiudad: number;
  DesCiudad: string;
  IdComuna: number;
  DesComuna: string;
  Calle: string;
  NumCalle: number;
  villa: string;
  DepBlock: number;
  Usuario: string;
}

// Nueva interfaz para la solicitud POST de Solicitud
interface SolicitudPostRequest {
  idSolicitante: number;
  idMae: number;
  fechaIngreso: string;
  fechaDeterminacion: string;
  estadoSolicitud: number;
  tipoSolicitud: number;
  observaciones: string;
  estadoRegistro: string;
  usuarioCreacion: string;
  fechaEstadoRegistro: string;
}

export type {
  MejorContactibilidadSolicitante,
  SolicitanteInMae,
  SolicitantePostRequest,
  SolicitanteResponse,
  SolicitudPostRequest,
};
