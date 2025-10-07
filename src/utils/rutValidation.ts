/**
 * Utilidades para validación de RUT chileno
 * Centraliza la lógica de validación, formateo y cálculo de dígito verificador
 */

/**
 * Valida si un RUT chileno es válido
 * @param rut - RUT a validar (con o sin formato)
 * @returns true si el RUT es válido, false en caso contrario
 */
export const validarRut = (rut: string): boolean => {
  if (!rut) return false;

  const rutLimpio = rut.replace(/\./g, '').replace('-', '');

  if (!/^[0-9]{7,8}[0-9Kk]$/i.test(rutLimpio)) return false;

  const rutDigits = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();

  let suma = 0;
  let multiplicador = 2;

  for (let i = rutDigits.length - 1; i >= 0; i--) {
    suma += parseInt(rutDigits[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const dvEsperado = 11 - (suma % 11);

  let dvCalculado: string;
  if (dvEsperado === 11) dvCalculado = '0';
  else if (dvEsperado === 10) dvCalculado = 'K';
  else dvCalculado = dvEsperado.toString();
  return dv === dvCalculado;
};

/**
 * Formatea un RUT con puntos y guión
 * @param rut - RUT sin formato
 * @returns RUT formateado (ej: 12.345.678-9)
 */
export const formatearRut = (rut: string): string => {
  if (!rut) return '';

  const valor = rut.replace(/\./g, '').replace('-', '');

  if (valor.length < 2) return valor;

  const cuerpo = valor.slice(0, -1);
  const dv = valor.slice(-1).toUpperCase();

  let rutFormateado = '';
  let j = 0;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    rutFormateado = cuerpo.charAt(i) + rutFormateado;
    j++;
    if (j % 3 === 0 && i !== 0) {
      rutFormateado = '.' + rutFormateado;
    }
  }

  return `${rutFormateado}-${dv}`;
};

/**
 * Limpia un RUT removiendo puntos y guiones
 * @param rut - RUT con formato
 * @returns RUT limpio (solo números y dígito verificador)
 */
export const limpiarRut = (rut: string): string => {
  return rut.replace(/\./g, '').replace('-', '');
};

/**
 * Valida RUT con mensaje de error personalizable
 * @param rut - RUT a validar
 * @param mensajeError - Mensaje de error personalizado (opcional)
 * @returns Objeto con resultado de validación y mensaje de error
 */
export const validarRutConMensaje = (
  rut: string,
  mensajeError: string = 'El RUT ingresado no es válido'
): { esValido: boolean; mensaje: string | null } => {
  if (!rut || rut.trim() === '') {
    return { esValido: false, mensaje: 'El RUT es requerido' };
  }

  const esValido = validarRut(rut);
  return {
    esValido,
    mensaje: esValido ? null : mensajeError
  };
};

/**
 * Valida que dos RUTs sean diferentes
 * @param rut1 - Primer RUT
 * @param rut2 - Segundo RUT
 * @returns true si son diferentes, false si son iguales
 */
export const validarRutsDiferentes = (rut1: string, rut2: string): boolean => {
  const rut1Limpio = limpiarRut(rut1).toLowerCase();
  const rut2Limpio = limpiarRut(rut2).toLowerCase();
  return rut1Limpio !== rut2Limpio;
};

/**
 * Extrae solo la parte numérica del RUT (sin dígito verificador)
 * @param rut - RUT completo
 * @returns Solo los números del RUT
 */
export const extraerNumerosRut = (rut: string): string => {
  const rutLimpio = limpiarRut(rut);
  return rutLimpio.slice(0, -1);
};

/**
 * Constantes para validación de RUT
 */
export const PATRONES_RUT = {
  RUT_COMPLETO: /^[0-9]{7,8}[0-9Kk]$/i,
  SOLO_NUMEROS: /^[0-9]{7,8}$/,
  FORMATO_VALIDO: /^[0-9]{1,3}(\.[0-9]{3})*-[0-9Kk]$/i
} as const;

export const MENSAJES_ERROR_RUT = {
  RUT_REQUERIDO: 'El RUT es requerido',
  RUT_INVALIDO: 'El RUT ingresado no es válido',
  RUT_FORMATO_INVALIDO: 'El formato del RUT no es correcto',
  RUTS_IGUALES: 'El RUT del heredero no puede ser igual al del titular',
  RUT_DIGITO_VERIFICADOR_INVALIDO: 'El dígito verificador no es correcto'
} as const;
