export async function fetchTitularByRut(rut: number): Promise<any> {
  const baseUrl = import.meta.env.VITE_BFF_HEREDEROS_DNS;
  const url = `${baseUrl}/api/Titular/ByRut`;
  const apiKeyHeader = import.meta.env.VITE_BFF_HEREDEROS_API_KEY_HEADER;
  const apiKeyValue = import.meta.env.VITE_BFF_HEREDEROS_API_KEY_VALUE;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'text/plain',
      'Content-Type': 'application/json',
      [apiKeyHeader]: apiKeyValue,
    },
    body: JSON.stringify(rut),
  });

  console.log(response.status);

  if (!response.ok) {
    throw new Error(String(response.status));
  }

  return response.text(); 

} 