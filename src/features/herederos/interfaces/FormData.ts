export interface FormData {
  fechaNacimiento: Date | null;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
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