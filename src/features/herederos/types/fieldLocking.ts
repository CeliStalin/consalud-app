/**
 * Tipos y constantes para el sistema de bloqueo de campos
 */

export const LOCKED_FIELDS = {
  FECHA_NACIMIENTO: 'fechaNacimiento',
  NOMBRES: 'nombres',
  APELLIDO_PATERNO: 'apellidoPaterno',
  APELLIDO_MATERNO: 'apellidoMaterno',
} as const;

export type LockedFieldKey = (typeof LOCKED_FIELDS)[keyof typeof LOCKED_FIELDS];

export interface FieldLockingConfig {
  enableLocking: boolean;
  showLockedIndicator: boolean;
  allowOverride: boolean;
}
