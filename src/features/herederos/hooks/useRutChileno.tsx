import { useState, useCallback, useMemo } from 'react';


export const useRutChileno = () => {
  const [rut, setRut] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [formattedRut, setFormattedRut] = useState('');

  const validarRut = useCallback((rutCompleto: string): boolean => {
    if (!rutCompleto) return false;
    
    const rutLimpio = rutCompleto.replace(/\./g, '').replace('-', '');
    
    if (!/^[0-9]{7,8}[0-9Kk]$/i.test(rutLimpio)) return false;
    
    const rutDigits = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();
    
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = rutDigits.length - 1; i >= 0; i--) {
      suma += parseInt(rutDigits[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const dvEsperado = 11 - (suma % 11);
    
    let dvCalculado: string;
    if (dvEsperado === 11) dvCalculado = '0';
    else if (dvEsperado === 10) dvCalculado = 'K';
    else dvCalculado = dvEsperado.toString();
    
    return dv === dvCalculado;
  }, []);

  const formatearRut = useCallback((rutValue: string): string => {
    if (!rutValue) return '';
    
    const valor = rutValue.replace(/\./g, '').replace('-', '');
    
    if (valor.length < 2) return valor;

    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1).toUpperCase();
    
    let rutFormateado = '';
    let j = 0;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      rutFormateado = cuerpo.charAt(i) + rutFormateado;
      j++;
      if (j % 3 === 0 && i !== 0) {
        rutFormateado = '.' + rutFormateado;
      }
    }
    
    return `${rutFormateado}-${dv}`;
  }, []);

  const handleRutChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // Limpia el valor (deja solo números y k/K)
    const limpio = inputValue.replace(/[^0-9kK]/g, '');
    
    // Aplica formateo
    const formateado = formatearRut(limpio);
    
    setRut(formateado);
    
    // Valida contra el limpio (sin puntos ni guión)
    const esValido = validarRut(limpio);
    setIsValid(esValido);
    
    // Guarda formateado sólo si es válido
    if (esValido) {
      setFormattedRut(formateado);
    }
  }, [formatearRut, validarRut]);

  const resetRut = useCallback(() => {
    setRut('');
    setIsValid(false);
    setFormattedRut('');
  }, []);
  
  const formatSimpleRut = useCallback((rut: string): string => {
    // Eliminar cualquier caracter no alfanumérico
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    
    if (rutLimpio.length <= 1) return rutLimpio;
    
    // Separar en cuerpo y dígito verificador
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    
    return `${cuerpo}-${dv}`;
  }, []);

  // Memorizar el objeto de retorno para evitar re-renders innecesarios
  const returnValue = useMemo(() => ({
    rut,
    isValid,
    formattedRut,
    handleRutChange,
    validarRut,
    formatearRut,
    resetRut,
    formatSimpleRut,
    setRut
  }), [rut, isValid, formattedRut, handleRutChange, validarRut, formatearRut, resetRut, formatSimpleRut, setRut]);

  return returnValue;
};

