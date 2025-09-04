import { calcularEdad, validarEdadConMensaje, validarEdadMayorDe18 } from '../../../utils/ageValidation';

// Tests para verificar la validación de edad en el provider
describe('Validación de edad en HerederoProvider', () => {
  test('debe validar correctamente que una persona mayor de 18 años pase la validación', () => {
    const fechaNacimiento = '1990-01-01';
    const esMayorDeEdad = validarEdadMayorDe18(fechaNacimiento);
    expect(esMayorDeEdad).toBe(true);
  });

  test('debe validar correctamente que una persona menor de 18 años no pase la validación', () => {
    const fechaNacimiento = '2010-01-01';
    const esMayorDeEdad = validarEdadMayorDe18(fechaNacimiento);
    expect(esMayorDeEdad).toBe(false);
  });

  test('debe validar correctamente que una persona de exactamente 18 años pase la validación', () => {
    const hoy = new Date();
    const fechaNacimiento = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    const esMayorDeEdad = validarEdadMayorDe18(fechaNacimiento.toISOString().split('T')[0]);
    expect(esMayorDeEdad).toBe(true);
  });

  test('debe validar correctamente que una persona que cumple 18 años mañana no pase la validación', () => {
    const hoy = new Date();
    const fechaNacimiento = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate() + 1);
    const esMayorDeEdad = validarEdadMayorDe18(fechaNacimiento.toISOString().split('T')[0]);
    expect(esMayorDeEdad).toBe(false);
  });

  test('debe manejar correctamente diferentes formatos de fecha', () => {
    const fechasValidas = [
      '1990-01-01',
      '1985-12-31',
      '2000-06-15'
    ];

    fechasValidas.forEach(fecha => {
      const esMayorDeEdad = validarEdadMayorDe18(fecha);
      expect(esMayorDeEdad).toBe(true);
    });

    const fechasInvalidas = [
      '2010-01-01',
      '2015-12-31',
      '2020-06-15'
    ];

    fechasInvalidas.forEach(fecha => {
      const esMayorDeEdad = validarEdadMayorDe18(fecha);
      expect(esMayorDeEdad).toBe(false);
    });
  });

  test('debe manejar correctamente casos edge de fechas', () => {
    // Test para persona que cumple 18 años hoy
    const hoy = new Date();
    const fechaHoy = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    const esMayorDeEdadHoy = validarEdadMayorDe18(fechaHoy.toISOString().split('T')[0]);
    expect(esMayorDeEdadHoy).toBe(true);

    // Test para persona que cumple 18 años mañana
    const fechaManana = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate() + 1);
    const esMayorDeEdadManana = validarEdadMayorDe18(fechaManana.toISOString().split('T')[0]);
    expect(esMayorDeEdadManana).toBe(false);

    // Test para persona que cumplió 18 años ayer
    const fechaAyer = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate() - 1);
    const esMayorDeEdadAyer = validarEdadMayorDe18(fechaAyer.toISOString().split('T')[0]);
    expect(esMayorDeEdadAyer).toBe(true);
  });

  test('debe calcular correctamente la edad para fechas en diferentes meses', () => {
    const hoy = new Date();

    // Test para persona nacida en un mes anterior al actual (ya cumplió años este año)
    const mesAnterior = hoy.getMonth() === 0 ? 11 : hoy.getMonth() - 1; // mes anterior, o diciembre si estamos en enero
    const fechaMesAnterior = new Date(hoy.getFullYear() - 18, mesAnterior, 15);
    const edadMesAnterior = calcularEdad(fechaMesAnterior.toISOString().split('T')[0]);

    // Test para persona nacida en un mes posterior al actual (aún no cumple años este año)
    const mesPosterior = hoy.getMonth() === 11 ? 0 : hoy.getMonth() + 1; // mes posterior, o enero si estamos en diciembre
    const fechaMesPosterior = new Date(hoy.getFullYear() - 18, mesPosterior, 15);
    const edadMesPosterior = calcularEdad(fechaMesPosterior.toISOString().split('T')[0]);

    // Verificar que el cálculo sea correcto
    // La persona del mes anterior ya cumplió 18 años
    expect(edadMesAnterior).toBeGreaterThanOrEqual(18);
    // La persona del mes posterior aún no cumple 18 años
    expect(edadMesPosterior).toBeLessThan(18);
  });

  test('debe validar correctamente con mensajes personalizados', () => {
    const fechaMenor = '2010-01-01';
    const mensajePersonalizado = 'La persona heredera debe tener al menos 18 años';

    const validacion = validarEdadConMensaje(fechaMenor, mensajePersonalizado);

    expect(validacion.esValido).toBe(false);
    expect(validacion.mensaje).toBe(mensajePersonalizado);
  });

  test('debe manejar correctamente fechas ISO con hora del API', () => {
    // Test con formato ISO que viene del API
    const fechaISO = '1982-07-24T00:00:00';
    const esMayorDeEdad = validarEdadMayorDe18(fechaISO);
    expect(esMayorDeEdad).toBe(true);

    // Test con fecha ISO de menor de edad
    const fechaMenorISO = '2010-01-01T00:00:00';
    const esMenorDeEdad = validarEdadMayorDe18(fechaMenorISO);
    expect(esMenorDeEdad).toBe(false);

    // Test con validarEdadConMensaje
    const validacion = validarEdadConMensaje(fechaISO);
    expect(validacion.esValido).toBe(true);
    expect(validacion.mensaje).toBeNull();
  });
});
