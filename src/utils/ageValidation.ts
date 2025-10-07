/**
 * Utilidades para validación de edad
 * Centraliza la lógica de cálculo y validación de edad mayor de 18 años
 */

import { getYearsDifference } from './dateUtils';

/**
 * Calcula la edad exacta basada en la fecha de nacimiento
 * @param fechaNacimiento - Fecha de nacimiento (Date o string)
 * @returns Edad en años
 */
export const calcularEdad = (fechaNacimiento: Date | string): number => {
  try {
    const age = getYearsDifference(fechaNacimiento, new Date());
    return Math.max(0, age); // Asegurar que la edad no sea negativa
  } catch {
    throw new Error('Fecha de nacimiento inválida');
  }
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
