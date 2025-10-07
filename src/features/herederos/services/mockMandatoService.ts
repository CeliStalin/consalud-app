/**
 * Servicio mock para datos de mandatos
 * Reemplaza el sistema de proxy que ya no se usa
 */

export interface MandatoResult {
  mandatoId: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  nombreCliente: string;
  apellidoPaterno: string;
  apellido: string;
  rutCliente: string;
  digitoVerificador: string;
  mensaje: string;
  indTipo: string;
}

export class MockMandatoService {
  /**
   * Obtiene información del mandato (datos mock)
   */
  async getMandatoInfo(rutCliente: string, _nSecMandato: string = ''): Promise<MandatoResult> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockData: MandatoResult = {
      mandatoId: '123456',
      banco: 'BANCO DE CHILE',
      tipoCuenta: 'Cuenta Corriente',
      numeroCuenta: '123456789',
      nombreCliente: 'IGNACIO JAVIER',
      apellidoPaterno: 'QUINTANA',
      apellido: 'ASENJO',
      rutCliente: rutCliente || '17175966',
      digitoVerificador: '8',
      mensaje: 'OK',
      indTipo: '1',
    };

    return mockData;
  }
}

export const mockMandatoService = new MockMandatoService();
