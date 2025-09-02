import { FormData, FormHerederoData } from '../interfaces/FormData';

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
      FechaNacimiento: formData.fechaNacimiento ? formData.fechaNacimiento.toISOString() : new Date().toISOString(),
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
   */
  private static mapParentescoToId(parentesco: string): number {
    const parentescoMap: Record<string, number> = {
      'P': 1, // Padre
      'M': 2, // Madre
      'H': 3, // Hijo
      'E': 4, // Esposo/a
      'B': 5, // Hermano/a (cambiado de 'H' a 'B' para evitar duplicado)
      'O': 6  // Otro
    };
    return parentescoMap[parentesco] || 6;
  }

  /**
   * Mapea el ID del parentesco a string
   */
  private static mapIdToParentesco(id: number): string {
    // Si el ID es 0, significa que no se ha seleccionado parentesco
    if (id === 0) {
      return '';
    }

    const idMap: Record<number, string> = {
      1: 'P', // Padre
      2: 'M', // Madre
      3: 'H', // Hijo
      4: 'E', // Esposo/a
      5: 'B', // Hermano/a (cambiado de 'H' a 'B' para evitar duplicado)
      6: 'O'  // Otro
    };
    return idMap[id] || '';
  }
}
