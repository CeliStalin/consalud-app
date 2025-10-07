import { FormData, FormHerederoData } from '../interfaces/FormData';

/**
 * Función helper para formatear fecha al formato esperado por la API (YYYY-MM-DD)
 */
const formatDateForAPI = (date: Date | string | null | undefined): string => {
  // Si la fecha es null o undefined, usar fecha actual
  if (!date) {
    date = new Date();
  }

  let dateObj: Date;

  if (typeof date === 'string') {
    // Si ya está en formato YYYY-MM-DD, devolverlo tal como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Si es un string de fecha en formato dd-MM-yyyy u otro formato, convertirlo a Date
    dateObj = new Date(date);

    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      console.warn('Fecha inválida recibida:', date, 'usando fecha actual');
      dateObj = new Date();
    }
  } else {
    dateObj = date;
  }

  // Retornar en formato YYYY-MM-DD como espera la API
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Servicio para transformar datos entre FormData y FormHerederoData
 * Mantiene la compatibilidad con el código existente
 */
export class FormDataTransformer {

  /**
   * Convierte FormData a FormHerederoData para el session storage
   */
  static toFormHerederoData(formData: FormData, rut: string, usuario: string = ''): FormHerederoData {
    // Extraer RUT y dígito verificador
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    const rutPersona = parseInt(rutLimpio.slice(0, -1));
    const rutDigito = rutLimpio.slice(-1).toUpperCase();

    // Mapear campos con valores por defecto apropiados
    return {
      RutPersona: rutPersona,
      NombrePersona: formData.nombres || '',
      ApellidoPaterno: formData.apellidoPaterno || '',
      ApellidoMaterno: formData.apellidoMaterno || '',
      RutCompleto: rut,
      RutDigito: rutDigito,
      CodigoSexo: formData.sexo || '',
      FechaNacimiento: formData.fechaNacimiento ? formatDateForAPI(formData.fechaNacimiento) : formatDateForAPI(new Date()),
      IdParentesco: this.mapParentescoToId(formData.parentesco),
      IdTipoSolicitante: 1, // Valor por defecto para heredero
      EstadoRegistro: 'V', // Activo por defecto
      NumTelef: parseInt(formData.telefono) || 0,
      Mail: formData.correoElectronico || '',
      IdRegion: formData.codRegion || 0,
      DesRegion: formData.region || '',
      IdCiudad: formData.codCiudad || 0,
      DesCiudad: formData.ciudad || '',
      IdComuna: formData.codComuna || 0,
      DesComuna: formData.comuna || '',
      Calle: formData.calle || '',
      NumCalle: parseInt(formData.numero) || 0,
      villa: formData.villaOpcional || '',
      DepBlock: parseInt(formData.deptoBloqueOpcional) || 0,
      Usuario: usuario
    };
  }

  /**
   * Convierte FormHerederoData a FormData para mantener compatibilidad
   */
  static toFormData(formHerederoData: FormHerederoData): FormData {
    return {
      fechaNacimiento: formHerederoData.FechaNacimiento ? new Date(formHerederoData.FechaNacimiento) : null,
      nombres: formHerederoData.NombrePersona || '',
      apellidoPaterno: formHerederoData.ApellidoPaterno || '',
      apellidoMaterno: formHerederoData.ApellidoMaterno || '',
      sexo: formHerederoData.CodigoSexo || '',
      parentesco: this.mapIdToParentesco(formHerederoData.IdParentesco),
      telefono: formHerederoData.NumTelef ? formHerederoData.NumTelef.toString() : '',
      correoElectronico: formHerederoData.Mail || '',
      region: formHerederoData.DesRegion || '',
      codRegion: formHerederoData.IdRegion || undefined,
      ciudad: formHerederoData.DesCiudad || '',
      comuna: formHerederoData.DesComuna || '',
      calle: formHerederoData.Calle || '',
      numero: formHerederoData.NumCalle ? formHerederoData.NumCalle.toString() : '',
      deptoBloqueOpcional: formHerederoData.DepBlock ? formHerederoData.DepBlock.toString() : '',
      villaOpcional: formHerederoData.villa || '',
      codCiudad: formHerederoData.IdCiudad || undefined,
      codComuna: formHerederoData.IdComuna || undefined
    };
  }

  /**
   * Mapea el parentesco de string a ID numérico
   * Ahora el valor del combo ya es el ID numérico del endpoint
   */
  private static mapParentescoToId(parentesco: string): number {
    // El valor del combo ya es el ID numérico del endpoint
    // Solo necesitamos convertirlo a número
    const id = parseInt(parentesco);
    return isNaN(id) ? 0 : id;
  }

  /**
   * Mapea el ID del parentesco a string
   *  retornamos el ID como string
   */
  private static mapIdToParentesco(id: number): string {
    // Si el ID es 0, significa que no se ha seleccionado parentesco
    if (id === 0) {
      return '';
    }

    // Retornamos el ID como string para que coincida con el valor del combo
    return id.toString();
  }
}
