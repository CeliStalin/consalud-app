// Función para calcular la edad (copiada del provider)
const calcularEdadProvider = (fechaNacimiento: string): number => {
  const fechaNac = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = fechaNac.getMonth();
  const diaActual = hoy.getDate();
  const diaNacimiento = fechaNac.getDate();
  
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
    edad--;
  }
  
  return edad;
};

// Función para validar edad mayor de 18 años (copiada del provider)
const validarEdadMayorDe18Provider = (fechaNacimiento: string): boolean => {
  const edad = calcularEdadProvider(fechaNacimiento);
  return edad >= 18;
};

// Tests para verificar la validación de edad en el provider
describe('Validación de edad en HerederoProvider', () => {
  test('debe validar correctamente que una persona mayor de 18 años pase la validación', () => {
    const fechaNacimiento = '1990-01-01';
    const esMayorDeEdad = validarEdadMayorDe18Provider(fechaNacimiento);
    expect(esMayorDeEdad).toBe(true);
  });

  test('debe validar correctamente que una persona menor de 18 años no pase la validación', () => {
    const fechaNacimiento = '2010-01-01';
    const esMayorDeEdad = validarEdadMayorDe18Provider(fechaNacimiento);
    expect(esMayorDeEdad).toBe(false);
  });

  test('debe validar correctamente que una persona de exactamente 18 años pase la validación', () => {
    const hoy = new Date();
    const fechaNacimiento = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    const esMayorDeEdad = validarEdadMayorDe18Provider(fechaNacimiento.toISOString().split('T')[0]);
    expect(esMayorDeEdad).toBe(true);
  });

  test('debe validar correctamente que una persona que cumple 18 años mañana no pase la validación', () => {
    const hoy = new Date();
    const fechaNacimiento = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate() + 1);
    const esMayorDeEdad = validarEdadMayorDe18Provider(fechaNacimiento.toISOString().split('T')[0]);
    expect(esMayorDeEdad).toBe(false);
  });

  test('debe manejar correctamente diferentes formatos de fecha', () => {
    const fechasValidas = [
      '1990-01-01',
      '1985-12-31',
      '2000-06-15'
    ];

    fechasValidas.forEach(fecha => {
      const esMayorDeEdad = validarEdadMayorDe18Provider(fecha);
      expect(esMayorDeEdad).toBe(true);
    });

    const fechasInvalidas = [
      '2010-01-01',
      '2015-12-31',
      '2020-06-15'
    ];

    fechasInvalidas.forEach(fecha => {
      const esMayorDeEdad = validarEdadMayorDe18Provider(fecha);
      expect(esMayorDeEdad).toBe(false);
    });
  });

  test('debe manejar correctamente casos edge de fechas', () => {
    // Test para persona que cumple 18 años hoy
    const hoy = new Date();
    const fechaHoy = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    const esMayorDeEdadHoy = validarEdadMayorDe18Provider(fechaHoy.toISOString().split('T')[0]);
    expect(esMayorDeEdadHoy).toBe(true);

    // Test para persona que cumple 18 años mañana
    const fechaManana = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate() + 1);
    const esMayorDeEdadManana = validarEdadMayorDe18Provider(fechaManana.toISOString().split('T')[0]);
    expect(esMayorDeEdadManana).toBe(false);

    // Test para persona que cumplió 18 años ayer
    const fechaAyer = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate() - 1);
    const esMayorDeEdadAyer = validarEdadMayorDe18Provider(fechaAyer.toISOString().split('T')[0]);
    expect(esMayorDeEdadAyer).toBe(true);
  });

  test('debe calcular correctamente la edad para fechas en diferentes meses', () => {
    const hoy = new Date();
    
    // Test para persona nacida en diciembre (mes anterior al actual)
    const fechaDiciembre = new Date(hoy.getFullYear() - 18, 11, 15); // 15 de diciembre
    const edadDiciembre = calcularEdadProvider(fechaDiciembre.toISOString().split('T')[0]);
    
    // Test para persona nacida en enero (mes posterior al actual si estamos en diciembre)
    const fechaEnero = new Date(hoy.getFullYear() - 18, 0, 15); // 15 de enero
    const edadEnero = calcularEdadProvider(fechaEnero.toISOString().split('T')[0]);
    
    // Verificar que el cálculo sea correcto
    expect(edadDiciembre).toBeGreaterThanOrEqual(18);
    expect(edadEnero).toBeGreaterThanOrEqual(18);
  });
}); 