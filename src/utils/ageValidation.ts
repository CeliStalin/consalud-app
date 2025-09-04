/**
 * Utilidades para validación de edad
 * Centraliza la lógica de cálculo y validación de edad mayor de 18 años
 */

/**
 * Calcula la edad exacta basada en la fecha de nacimiento
 * @param fechaNacimiento - Fecha de nacimiento (Date o string)
 * @returns Edad en años
 */
export const calcularEdad = (fechaNacimiento: Date | string): number => {
  let fechaNac: Date;

  if (typeof fechaNacimiento === 'string') {
    // Manejar diferentes formatos de fecha string
    let fechaString = fechaNacimiento.trim();

    // Si es formato ISO con hora (ej: "1982-07-24T00:00:00"), extraer solo la parte de fecha
    if (fechaString.includes('T')) {
      fechaString = fechaString.split('T')[0];
    }

    // Crear fecha en zona horaria local para evitar problemas de UTC
    const [year, month, day] = fechaString.split('-').map(Number);

    // Validar que los componentes de la fecha sean válidos
    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      throw new Error('Fecha de nacimiento inválida');
    }

    fechaNac = new Date(year, month - 1, day); // month - 1 porque Date usa 0-indexado
  } else {
    fechaNac = fechaNacimiento;
  }

  const hoy = new Date();

  // Validar que la fecha sea válida
  if (isNaN(fechaNac.getTime())) {
    throw new Error('Fecha de nacimiento inválida');
  }

  // Calcular la diferencia en años
  let edad = hoy.getFullYear() - fechaNac.getFullYear();

  // Ajustar si aún no ha cumplido años este año
  const mesActual = hoy.getMonth();
  const mesNacimiento = fechaNac.getMonth();
  const diaActual = hoy.getDate();
  const diaNacimiento = fechaNac.getDate();

  // Si el mes actual es menor al mes de nacimiento, o si es el mismo mes pero el día actual es menor al día de nacimiento
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
    edad--;
  }

  return Math.max(0, edad); // Asegurar que la edad no sea negativa
};

/**
 * Valida si una persona es mayor de edad (18 años o más)
 * @param fechaNacimiento - Fecha de nacimiento (Date o string)
 * @returns true si es mayor de edad, false en caso contrario
 */
export const validarEdadMayorDe18 = (fechaNacimiento: Date | string): boolean => {
  const edad = calcularEdad(fechaNacimiento);
  return edad >= 18;
};

/**
 * Valida edad mayor de edad con mensaje de error personalizable
 * @param fechaNacimiento - Fecha de nacimiento (Date o string)
 * @param mensajeError - Mensaje de error personalizado (opcional)
 * @returns Objeto con resultado de validación y mensaje de error
 */
export const validarEdadConMensaje = (
  fechaNacimiento: Date | string,
  mensajeError: string = 'La persona debe tener al menos 18 años'
): { esValido: boolean; mensaje: string | null } => {
  if (!fechaNacimiento) {
    return { esValido: false, mensaje: 'La fecha de nacimiento es requerida' };
  }

  const esMayorDeEdad = validarEdadMayorDe18(fechaNacimiento);
  return {
    esValido: esMayorDeEdad,
    mensaje: esMayorDeEdad ? null : mensajeError
  };
};

/**
 * Constantes para validación de edad
 */
export const EDAD_MINIMA = 18;
export const MENSAJES_ERROR = {
  EDAD_INSUFICIENTE: 'La persona debe tener al menos 18 años',
  FECHA_REQUERIDA: 'La fecha de nacimiento es requerida',
  FECHA_INVALIDA: 'La fecha de nacimiento no es válida'
} as const;
