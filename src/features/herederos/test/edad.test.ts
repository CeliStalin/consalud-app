import { calcularEdad, validarEdadMayorDe18, validarEdadConMensaje } from '../../../utils/ageValidation';

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

  test('debe validar correctamente con la función validarEdadMayorDe18', () => {
    const fechaMayor = new Date('1990-01-01');
    const fechaMenor = new Date('2010-01-01');
    
    expect(validarEdadMayorDe18(fechaMayor)).toBe(true);
    expect(validarEdadMayorDe18(fechaMenor)).toBe(false);
  });

  test('debe validar correctamente con la función validarEdadConMensaje', () => {
    const fechaMayor = new Date('1990-01-01');
    const fechaMenor = new Date('2010-01-01');
    
    const validacionMayor = validarEdadConMensaje(fechaMayor);
    const validacionMenor = validarEdadConMensaje(fechaMenor);
    
    expect(validacionMayor.esValido).toBe(true);
    expect(validacionMayor.mensaje).toBeNull();
    
    expect(validacionMenor.esValido).toBe(false);
    expect(validacionMenor.mensaje).toBe('La persona debe tener al menos 18 años');
  });
}); 