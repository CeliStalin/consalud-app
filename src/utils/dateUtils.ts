/**
 * Utilidades centralizadas para manejo y formateo de fechas
 * Consolida lógica dispersa en formDataTransformer y ageValidation
 */

/**
 * Formatos de fecha soportados
 */
export const DATE_FORMATS = {
  API: 'YYYY-MM-DD',
  DISPLAY: 'DD-MM-YYYY',
  ISO: 'ISO8601',
} as const;

/**
 * Parsea una fecha de string a objeto Date
 * Maneja múltiples formatos de entrada
 * @param dateInput - Fecha en formato string, Date, o null/undefined
 * @returns Objeto Date válido o null si es inválido
 */
export const parseDate = (dateInput: Date | string | null | undefined): Date | null => {
  if (!dateInput) return null;

  let dateObj: Date;

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();

    // Formato ISO con hora (ej: "1982-07-24T00:00:00")
    if (trimmed.includes('T')) {
      const datePart = trimmed.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
      dateObj = new Date(year, month - 1, day);
    }
    // Formato YYYY-MM-DD
    else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
      dateObj = new Date(year, month - 1, day);
    }
    // Formato DD-MM-YYYY
    else if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
      dateObj = new Date(year, month - 1, day);
    }
    // Fallback: intentar parseo nativo
    else {
      dateObj = new Date(trimmed);
    }
  } else {
    dateObj = dateInput;
  }

  // Validar que la fecha sea válida
  if (isNaN(dateObj.getTime())) {
    return null;
  }

  return dateObj;
};

/**
 * Formatea una fecha al formato esperado por la API (YYYY-MM-DD)
 * @param dateInput - Fecha a formatear
 * @param useCurrentIfInvalid - Si true, usa fecha actual si la entrada es inválida
 * @returns String en formato YYYY-MM-DD
 */
export const formatDateForAPI = (
  dateInput: Date | string | null | undefined,
  useCurrentIfInvalid: boolean = true
): string => {
  let dateObj = parseDate(dateInput);

  // Si es inválida y se permite usar fecha actual
  if (!dateObj && useCurrentIfInvalid) {
    dateObj = new Date();
  }

  // Si aún es null, retornar string vacío
  if (!dateObj) {
    return '';
  }

  // Retornar en formato YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha para visualización (DD-MM-YYYY)
 * @param dateInput - Fecha a formatear
 * @returns String en formato DD-MM-YYYY o vacío si es inválido
 */
export const formatDateForDisplay = (dateInput: Date | string | null | undefined): string => {
  const dateObj = parseDate(dateInput);

  if (!dateObj) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  return `${day}-${month}-${year}`;
};

/**
 * Valida que una fecha sea válida
 * @param dateInput - Fecha a validar
 * @returns true si es válida, false en caso contrario
 */
export const isValidDate = (dateInput: Date | string | null | undefined): boolean => {
  const dateObj = parseDate(dateInput);
  return dateObj !== null;
};

/**
 * Calcula la diferencia en años entre dos fechas
 * @param startDate - Fecha inicial
 * @param endDate - Fecha final (por defecto: hoy)
 * @returns Diferencia en años (puede ser negativa si startDate > endDate)
 */
export const getYearsDifference = (
  startDate: Date | string,
  endDate: Date | string = new Date()
): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) {
    throw new Error('Fechas inválidas para calcular diferencia');
  }

  let years = end.getFullYear() - start.getFullYear();

  // Ajustar si aún no ha cumplido años en el año actual
  const monthDiff = end.getMonth() - start.getMonth();
  const dayDiff = end.getDate() - start.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years--;
  }

  return years;
};

/**
 * Obtiene la fecha actual en formato API
 * @returns String en formato YYYY-MM-DD de la fecha actual
 */
export const getCurrentDateForAPI = (): string => {
  return formatDateForAPI(new Date(), false);
};

/**
 * Constantes de mensajes de error
 */
export const DATE_ERROR_MESSAGES = {
  INVALID_DATE: 'La fecha ingresada no es válida',
  DATE_REQUIRED: 'La fecha es requerida',
  INVALID_FORMAT: 'El formato de la fecha no es correcto',
} as const;
