/**
 * Servicio mock para datos de herederos y titulares
 * Reemplaza las llamadas al proxy que ya no se usa
 */


export class MockDataService {
  private mockData = {
    Heredero: [
      {
        id: 1,
        rut: "18621734-9",
        fechaNacimiento: "1990-05-15",
        nombre: "María",
        apellidoPat: "López",
        apellidoMat: "García",
        telefono: "+56912345678",
        email: "maria.lopez@email.com",
        direccion: "Av. Principal 123, Santiago",
        parentesco: "Hija",
        porcentaje: 50
      }
    ],
    Titular: [
      {
        id: 1,
        rut: "18621734-9",
        nombre: "Juan",
        apellidoPat: "Pérez",
        apellidoMat: "Gómez",
        fechaDefuncion: "2023-10-01",
        poseeFondos: true,
        poseeSolicitud: false
      }
    ]
  };

  /**
   * Obtiene herederos mock
   */
  async getHerederos(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockData.Heredero;
  }

  /**
   * Obtiene titulares mock
   */
  async getTitulares(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockData.Titular;
  }
}

export const mockDataService = new MockDataService();
