import { Correo } from './Correo';
import { Direccion } from './Direccion';
import { Telefono } from './Telefono';

interface Contactabilidad {
  direccion: Direccion;
  telefono: Telefono;
  correo: Correo[];
}
export type { Contactabilidad };
