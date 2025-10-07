interface Titular {
  id: number; // IdPersona del BFF
  rut: string; // RutPersona-RutDigito (ej: 12345678-9)
  nombre: string; // NomPersona
  apellidoPat: string; // ApePaterno
  apellidoMat: string; // ApeMaterno
  fechaDefuncion: string; // FecFallecido
  poseeFondos: boolean; // PoseeFondos
  poseeSolicitud: boolean; // PoseeSolicitudes
  indFallecido: string; // IndFallecido del BFF
}

export type { Titular };
