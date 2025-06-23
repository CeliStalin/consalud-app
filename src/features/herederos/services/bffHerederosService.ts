import { Titular } from '../interfaces/Titular';

export async function fetchTitularByRut(rut: number): Promise<Titular> {
  const baseUrl = import.meta.env.VITE_BFF_HEREDEROS_DNS;
  const url = `${baseUrl}/api/Titular/ByRut`;
  const apiKeyHeader = import.meta.env.VITE_BFF_HEREDEROS_API_KEY_HEADER;
  const apiKeyValue = import.meta.env.VITE_BFF_HEREDEROS_API_KEY_VALUE;

  // Body según requerimiento
  const body = {
    IdentificadorUnico: rut,
    userName: ""
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      [apiKeyHeader]: apiKeyValue,
    },
    body: JSON.stringify(body),
  });

  console.log(response.status);

  if (!response.ok) {
    throw new Error(String(response.status));
  }

  const data = await response.json();

  // Mapear la respuesta del BFF al modelo Titular
  const titular: Titular = {
    id: data.IdPersona,
    rut: `${data.RutPersona}-${data.RutDigito}`,
    nombre: data.NomPersona,
    apellidoPat: data.ApePaterno,
    apellidoMat: data.ApeMaterno,
    fechaDefuncion: data.FecFallecido,
    poseeFondos: data.PoseeFondos,
    poseeSolicitud: data.PoseeSolicitudes,
    indFallecido: data.IndFallecido,
  };

  return titular;
} 