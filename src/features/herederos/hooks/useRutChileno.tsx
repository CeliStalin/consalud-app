import { useState, useCallback, useMemo } from 'react';
import { validarRut, formatearRut } from '../../../utils/rutValidation';

export const useRutChileno = () => {
  const [rut, setRut] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [formattedRut, setFormattedRut] = useState('');

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
  }, []);

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
  const returnValue = useMemo(
    () => ({
      rut,
      isValid,
      formattedRut,
      handleRutChange,
      validarRut,
      formatearRut,
      resetRut,
      formatSimpleRut,
      setRut,
    }),
    [rut, isValid, formattedRut, handleRutChange, resetRut, formatSimpleRut, setRut]
  );

  return returnValue;
};
