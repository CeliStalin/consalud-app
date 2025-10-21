export interface FormData {
  fechaNacimiento: Date | null;
  nombres: string;
  apellidoPaterno?: string; // Ya no es requerido
  apellidoMaterno?: string; // Ya no es requerido
  sexo: string;
  parentesco: string;
  telefono: string;
  correoElectronico: string;
  ciudad: string;
  comuna: string;
  calle: string;
  numero: string;
  deptoBloqueOpcional: string;
  villaOpcional: string;
  region?: string;
  // Códigos para cargar los combos correctamente
  codRegion?: number;
  codCiudad?: number;
  codComuna?: number;
}

// Nueva interfaz para la estructura del session storage
export interface FormHerederoData {
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
  NumCalle: string;
  villa: string;
  DepBlock: string;
  Usuario: string;
}
