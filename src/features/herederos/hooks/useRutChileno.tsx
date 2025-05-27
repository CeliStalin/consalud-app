import { useState, useCallback } from 'react';


export const useRutChileno = () => {
  const [rut, setRut] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [formattedRut, setFormattedRut] = useState('');

  const validarRut = useCallback((rutCompleto:string) => {
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
    
    let dvCalculado;
    if (dvEsperado === 11) dvCalculado = '0';
    else if (dvEsperado === 10) dvCalculado = 'K';
    else dvCalculado = dvEsperado.toString();
    
    // Comparar con el dígito verificador ingresado
    return dv === dvCalculado;
  }, []);


  const formatearRut = useCallback((rutValue:string) => {
    if (!rutValue) return '';
    

    const valor:string = rutValue.replace(/\./g, '').replace('-', '');
    

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
    
    // Setea el valor formateado en el input
    setRut(formateado);
  
    // Valida contra el limpio (sin puntos ni guión)
    const esValido = validarRut(limpio);
    setIsValid(esValido);
  
    // Guarda formateado sólo si es válido (opcional)
    if (esValido) {
      setFormattedRut(formateado);
    }
  }, [formatearRut, validarRut]);

  /**
   * Limpia el RUT y reinicia los estados
   */
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
    
    // Retornar con formato simple (solo guión)
    return `${cuerpo}-${dv}`;
  }, []);
  return {
    rut,                // Valor actual del input
    isValid,            // Indica si el RUT es válido
    formattedRut,       // RUT formateado (si es válido)
    handleRutChange,    // Manejador para el evento onChange
    validarRut,         // Función de validación para usar directamente
    formatearRut,       // Función de formateo para usar directamente
    resetRut,            // Función para reiniciar el estado
    formatSimpleRut
  };
};

