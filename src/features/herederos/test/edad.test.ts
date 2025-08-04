// Función para calcular la edad (copiada del componente)
const calcularEdad = (fechaNacimiento: Date): number => {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = fechaNacimiento.getMonth();
  const diaActual = hoy.getDate();
  const diaNacimiento = fechaNacimiento.getDate();
  
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
    edad--;
  }
  
  return edad;
};

// Tests para verificar el cálculo de edad
describe('Cálculo de edad', () => {
  test('debe calcular correctamente la edad para una persona mayor de 18 años', () => {
    const fechaNacimiento = new Date('1990-01-01');
    const edad = calcularEdad(fechaNacimiento);
    expect(edad).toBeGreaterThanOrEqual(18);
  });

  test('debe calcular correctamente la edad para una persona menor de 18 años', () => {
    const fechaNacimiento = new Date('2010-01-01');
    const edad = calcularEdad(fechaNacimiento);
    expect(edad).toBeLessThan(18);
  });

  test('debe calcular correctamente la edad para una persona que cumple años hoy', () => {
    const hoy = new Date();
    const fechaNacimiento = new Date(hoy.getFullYear() - 20, hoy.getMonth(), hoy.getDate());
    const edad = calcularEdad(fechaNacimiento);
    expect(edad).toBe(20);
  });

  test('debe calcular correctamente la edad para una persona que cumple años mañana', () => {
    const hoy = new Date();
    const fechaNacimiento = new Date(hoy.getFullYear() - 20, hoy.getMonth(), hoy.getDate() + 1);
    const edad = calcularEdad(fechaNacimiento);
    expect(edad).toBe(19);
  });
}); 