import DatosPersonalesIcon from '@/assets/DatosPersonales.svg';
import DireccionIcon from '@/assets/Direccion.svg';
import * as ConsaludCore from '@consalud/core';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validarEdadConMensaje } from '../../../utils/ageValidation';
import { useHeredero } from '../contexts/HerederoContext';
import { useCallesAutocomplete } from '../hooks/useCallesAutocomplete';
import { useFormHerederoData } from '../hooks/useFormHerederoData';
import { FormData } from '../interfaces/FormData';
import { TipoParentesco } from '../interfaces/Pargen';
import {
  Ciudad,
  Comuna,
  fetchCiudades,
  fetchComunasPorCiudad,
  fetchGeneros,
  fetchRegiones,
  fetchTiposParentesco,
  Genero,
  Region,
  validarCorreoElectronico,
  validarTelefono,
} from '../services';
import { AutoCompleteInput } from './AutoCompleteInput';
import { CustomSelect } from './CustomSelect';
import { NumberAutoCompleteInput } from './NumberAutoCompleteInput';
import { Stepper } from './Stepper';
import './styles/FormHeredero.css';

interface BreadcrumbItem {
  label: string;
}

interface FormIngresoHerederoProps {
  showHeader?: boolean;
}

// Función para mapear tipos de parentesco del endpoint a opciones del select
const mapTiposParentescoToOptions = (tipos: TipoParentesco[]) => {
  return tipos.map(tipo => ({
    value: tipo.valValor.toString(),
    label: tipo.descripcion,
  }));
};

const FormIngresoHeredero: React.FC<FormIngresoHerederoProps> = ({ showHeader = true }) => {
  const navigate = useNavigate();
  const { heredero, fieldsLocked } = useHeredero();
  const { formData, handleSaveForm, handleReloadFromStorage } = useFormHerederoData();

  // Estado local para el formulario (se sincroniza con el contexto)
  const [localFormData, setLocalFormData] = useState<FormData>(() => {
    // Inicializar con datos del heredero como fallback
    // Los datos del storage se cargarán después en el useEffect
    return {
      fechaNacimiento: heredero?.fechaNacimiento ? new Date(heredero.fechaNacimiento) : null,
      nombres: heredero?.nombre || '',
      apellidoPaterno: heredero?.apellidoPat || undefined,
      apellidoMaterno: heredero?.apellidoMat || undefined,
      sexo: heredero?.Genero ? heredero.Genero : '',
      parentesco: '',
      telefono: heredero?.contactabilidad?.telefono?.numero || '',
      correoElectronico:
        heredero?.contactabilidad?.correo && heredero.contactabilidad.correo.length > 0
          ? heredero.contactabilidad.correo.sort((a, b) => a.validacion - b.validacion)[0]?.mail ||
            ''
          : '',
      ciudad: heredero?.descripcionCiudad || '',
      comuna: heredero?.descripcionComuna || '',
      calle: heredero?.contactabilidad?.direccion?.calle || '',
      numero: heredero?.contactabilidad?.direccion?.numero
        ? String(heredero.contactabilidad?.direccion?.numero)
        : '',
      deptoBloqueOpcional: heredero?.contactabilidad?.direccion?.departamento || '',
      villaOpcional: heredero?.contactabilidad?.direccion?.villa || '',
      region: heredero?.descripcionRegion || '',
      // Códigos para cargar los combos correctamente
      codRegion: heredero?.codRegion || undefined,
      codCiudad: heredero?.codCiudad || undefined,
      codComuna: undefined,
    };
  });

  // Estado para manejar errores de validación
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Estado para géneros
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loadingGeneros, setLoadingGeneros] = useState<boolean>(false);
  const [errorGeneros, setErrorGeneros] = useState<string | null>(null);

  // Estado para ciudades
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loadingCiudades, setLoadingCiudades] = useState<boolean>(false);
  const [errorCiudades, setErrorCiudades] = useState<string | null>(null);

  // Estado para comunas
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [loadingComunas, setLoadingComunas] = useState<boolean>(false);
  const [errorComunas, setErrorComunas] = useState<string | null>(null);

  // Estado para regiones
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [loadingRegiones, setLoadingRegiones] = useState<boolean>(false);
  const [errorRegiones, setErrorRegiones] = useState<string | null>(null);

  // Estado para tipos de parentesco
  const [tiposParentesco, setTiposParentesco] = useState<TipoParentesco[]>([]);
  const [loadingParentesco, setLoadingParentesco] = useState<boolean>(false);
  const [errorParentesco, setErrorParentesco] = useState<string | null>(null);

  // Estado para validación de correo electrónico
  const [validatingEmail, setValidatingEmail] = useState<boolean>(false);
  const [emailValidationError, setEmailValidationError] = useState<string | null>(null);

  // Estado para validación de teléfono
  const [validatingPhone, setValidatingPhone] = useState<boolean>(false);
  const [phoneValidationError, setPhoneValidationError] = useState<string | null>(null);

  // Hook para autocompletado de calles
  const selectedComuna = comunas.find(comuna => comuna.NombreComuna === localFormData.comuna);
  const {
    calles,
    loading: loadingCalles,
    error: errorCalles,
    searchCalles,
  } = useCallesAutocomplete({
    idComuna: selectedComuna?.idComuna,
  });

  React.useEffect(() => {
    setLoadingGeneros(true);
    fetchGeneros()
      .then(data => {
        setGeneros(data);
        setErrorGeneros(null);
      })
      .catch(() => {
        setErrorGeneros('No se pudieron cargar los géneros');
        setGeneros([]);
      })
      .finally(() => setLoadingGeneros(false));
  }, []);

  // Cargar tipos de parentesco
  React.useEffect(() => {
    setLoadingParentesco(true);
    fetchTiposParentesco()
      .then(data => {
        setTiposParentesco(data);
        setErrorParentesco(null);
      })
      .catch(() => {
        setErrorParentesco('No se pudieron cargar los tipos de parentesco');
        setTiposParentesco([]);
      })
      .finally(() => setLoadingParentesco(false));
  }, []);

  React.useEffect(() => {
    setLoadingRegiones(true);
    fetchRegiones()
      .then(data => {
        setRegiones(data);
        setErrorRegiones(null);
      })
      .catch(() => {
        setErrorRegiones('No se pudieron cargar las regiones');
        setRegiones([]);
      })
      .finally(() => setLoadingRegiones(false));
  }, []);

  // Cargar datos de ubicación cuando se carga un heredero
  React.useEffect(() => {
    if (heredero && heredero.codRegion && fieldsLocked) {
      // Establecer la región del heredero
      setLocalFormData(prevData => ({
        ...prevData,
        region: heredero.descripcionRegion || '',
        codRegion: heredero.codRegion || undefined,
      }));

      // Cargar ciudades de la región del heredero para tener las opciones disponibles
      setLoadingCiudades(true);
      fetchCiudades(heredero.codRegion)
        .then(data => {
          setCiudades(data);
          setErrorCiudades(null);

          // Si hay ciudad del heredero, cargar comunas para tener las opciones disponibles
          if (heredero.codCiudad) {
            setLoadingComunas(true);
            fetchComunasPorCiudad(heredero.codCiudad)
              .then(comunasData => {
                setComunas(comunasData);
                setErrorComunas(null);

                // Establecer el valor de comuna DESPUÉS de cargar las opciones
                if (heredero.descripcionComuna) {
                  // Encontrar la comuna exacta para usar su formato original
                  const comunaExacta = comunasData.find(comuna => {
                    const comunaNormalizada = comuna.NombreComuna.trim().toUpperCase();
                    const descripcionNormalizada = (heredero.descripcionComuna || '')
                      .trim()
                      .toUpperCase();
                    return comunaNormalizada === descripcionNormalizada;
                  });

                  setLocalFormData(prevData => ({
                    ...prevData,
                    comuna: comunaExacta?.NombreComuna || heredero.descripcionComuna || '',
                    codComuna: heredero.codComuna || undefined,
                  }));
                }
              })
              .catch(error => {
                console.error('Error cargando comunas:', error);
                setErrorComunas('No se pudieron cargar las comunas');
                setComunas([]);
              })
              .finally(() => setLoadingComunas(false));
          }
        })
        .catch(error => {
          console.error('Error cargando ciudades:', error);
          setErrorCiudades('No se pudieron cargar las ciudades');
          setCiudades([]);
        })
        .finally(() => setLoadingCiudades(false));
    }
  }, [heredero, fieldsLocked]);

  // Inicializar el formulario solo una vez al montar
  useEffect(() => {
    // SIEMPRE recargar datos del sessionStorage al montar
    // Esto asegura que los datos del storage tengan prioridad absoluta
    handleReloadFromStorage();
  }, [handleReloadFromStorage]);

  // Sincronizar datos locales cuando cambie formData del contexto
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      // SIEMPRE priorizar datos del storage sobre datos del heredero
      setLocalFormData(prevData => {
        // Solo actualizar si los datos son diferentes y no estamos en medio de una edición
        const currentDataString = JSON.stringify(prevData);
        const newDataString = JSON.stringify(formData);

        if (currentDataString !== newDataString) {
          return formData;
        }
        return prevData;
      });
    } else if (!formData) {
      // Solo limpiar si realmente no hay datos del storage
      setLocalFormData(prevData => {
        // Verificar si realmente necesitamos limpiar
        const hasData = Object.values(prevData).some(
          value => value !== null && value !== undefined && value !== ''
        );

        if (hasData) {
          return {
            fechaNacimiento: null,
            nombres: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            sexo: '',
            parentesco: '',
            telefono: '',
            correoElectronico: '',
            ciudad: '',
            comuna: '',
            calle: '',
            numero: '',
            deptoBloqueOpcional: '',
            villaOpcional: '',
            region: '',
            codRegion: undefined,
            codCiudad: undefined,
            codComuna: undefined,
          };
        }
        return prevData;
      });
    }
  }, [formData]);

  // Efecto para limpiar el formulario cuando cambie el heredero
  useEffect(() => {
    if (heredero) {
      // Si hay un heredero, verificar si hay datos del storage para este RUT
      const storageKey = `formHerederoData_${heredero.rut.replace(/[^0-9kK]/g, '')}`;
      const storedData = sessionStorage.getItem(storageKey);

      if (!storedData) {
        // Si no hay datos del storage para este RUT, limpiar el formulario
        setLocalFormData({
          fechaNacimiento: heredero?.fechaNacimiento ? new Date(heredero.fechaNacimiento) : null,
          nombres: heredero?.nombre || '',
          apellidoPaterno: heredero?.apellidoPat || undefined,
          apellidoMaterno: heredero?.apellidoMat || undefined,
          sexo: heredero?.Genero ? heredero.Genero : '',
          parentesco: '',
          telefono: heredero?.contactabilidad?.telefono?.numero || '',
          correoElectronico:
            heredero?.contactabilidad?.correo && heredero.contactabilidad.correo.length > 0
              ? heredero.contactabilidad.correo.sort((a, b) => a.validacion - b.validacion)[0]
                  ?.mail || ''
              : '',
          ciudad: heredero?.descripcionCiudad || '',
          comuna: heredero?.descripcionComuna || '',
          calle: heredero?.contactabilidad?.direccion?.calle || '',
          numero: heredero?.contactabilidad?.direccion?.numero
            ? String(heredero.contactabilidad?.direccion?.numero)
            : '',
          deptoBloqueOpcional: heredero?.contactabilidad?.direccion?.departamento || '',
          villaOpcional: heredero?.contactabilidad?.direccion?.villa || '',
          region: heredero?.descripcionRegion || '',
          codRegion: heredero?.codRegion || undefined,
          codCiudad: heredero?.codCiudad || undefined,
          codComuna: undefined,
        });
      }
    } else {
      // Si no hay heredero, limpiar completamente el formulario
      setLocalFormData({
        fechaNacimiento: null,
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        sexo: '',
        parentesco: '',
        telefono: '',
        correoElectronico: '',
        ciudad: '',
        comuna: '',
        calle: '',
        numero: '',
        deptoBloqueOpcional: '',
        villaOpcional: '',
        region: '',
        codRegion: undefined,
        codCiudad: undefined,
        codComuna: undefined,
      });
    }
  }, [heredero]);

  // Cargar datos de ubicación cuando se restaura el formulario con códigos
  useEffect(() => {
    if (localFormData.codRegion && regiones.length > 0) {
      // Cargar ciudades de la región guardada
      setLoadingCiudades(true);
      fetchCiudades(localFormData.codRegion)
        .then(data => {
          setCiudades(data);
          setErrorCiudades(null);

          //  Establecer la ciudad del storage DESPUÉS de cargar las opciones
          if (formData?.ciudad && formData.ciudad !== localFormData.ciudad) {
            setLocalFormData(prevData => ({
              ...prevData,
              ciudad: formData.ciudad,
            }));
          }

          // Si hay código de ciudad, cargar comunas
          if (localFormData.codCiudad) {
            setLoadingComunas(true);
            fetchComunasPorCiudad(localFormData.codCiudad)
              .then(comunasData => {
                setComunas(comunasData);
                setErrorComunas(null);

                // Establecer la comuna del storage DESPUÉS de cargar las opciones
                if (formData?.comuna && formData.comuna !== localFormData.comuna) {
                  setLocalFormData(prevData => ({
                    ...prevData,
                    comuna: formData.comuna,
                  }));
                }
              })
              .catch(() => {
                setErrorComunas('No se pudieron cargar las comunas');
                setComunas([]);
              })
              .finally(() => setLoadingComunas(false));
          }
        })
        .catch(() => {
          setErrorCiudades('No se pudieron cargar las ciudades');
          setCiudades([]);
        })
        .finally(() => setLoadingCiudades(false));
    }
  }, [localFormData.codRegion, regiones.length, formData]);

  // Efecto para establecer el valor de región cuando se cargan datos desde storage
  useEffect(() => {
    if (localFormData.region && regiones.length > 0) {
      // Buscar la región en la lista cargada para asegurar que existe
      const regionEncontrada = regiones.find(r => r.nombreRegion === localFormData.region);
      if (regionEncontrada) {
        // Si la región existe en la lista, establecer el código
        setLocalFormData(prevData => ({
          ...prevData,
          codRegion: regionEncontrada.idRegion,
        }));
      }
    }
  }, [localFormData.region, regiones.length]);

  // Efecto específico para establecer la comuna del storage cuando se carguen las opciones
  useEffect(() => {
    if (comunas.length > 0 && formData?.comuna && formData.comuna !== localFormData.comuna) {
      setLocalFormData(prevData => ({
        ...prevData,
        comuna: formData.comuna,
      }));
    }
  }, [comunas.length, formData?.comuna, localFormData.comuna]);

  // Efecto para establecer la región cuando se cargan las regiones y hay heredero
  // SOLO si NO hay datos del storage
  useEffect(() => {
    const hasStorageData = formData && Object.keys(formData).length > 0;

    // SOLO establecer región del heredero si NO hay datos del storage
    if (
      heredero &&
      heredero.descripcionRegion &&
      regiones.length > 0 &&
      fieldsLocked &&
      !hasStorageData
    ) {
      // Buscar por código de región (método más confiable)
      const regionEncontradaVariaciones = regiones.find(r => r.idRegion === heredero.codRegion);

      if (regionEncontradaVariaciones) {
        // Siempre usar el nombre de la API, no el del backend
        setLocalFormData(prevData => ({
          ...prevData,
          region: regionEncontradaVariaciones.nombreRegion, // Usar el nombre exacto de la lista
          codRegion: heredero.codRegion || undefined,
        }));
      }
    }
  }, [heredero, regiones.length, fieldsLocked, formData]);

  const handleBackClick = useCallback((): void => {
    navigate(-1);
  }, [navigate]);

  const breadcrumbItems: BreadcrumbItem[] = [{ label: 'Administración devolución herederos' }];

  const cleanedBreadcrumbItems = breadcrumbItems.map(item => ({
    ...item,
    label: typeof item.label === 'string' ? item.label.replace(/^\/+/, '') : item.label,
  }));

  // Manejar cambios en campos de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...localFormData,
      [name]: value,
    };

    setLocalFormData(newFormData);

    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name as keyof FormData]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }

    // Guardar en el contexto con un pequeño delay para evitar re-renders inmediatos
    setTimeout(() => {
      handleSaveForm(newFormData);
    }, 0);
  };

  // Manejar cambio de fecha
  const handleDateChange = (date: Date | null) => {
    const newFormData = {
      ...localFormData,
      fechaNacimiento: date,
    };

    setLocalFormData(newFormData);

    // Guardar en el contexto inmediatamente

    handleSaveForm(newFormData);

    // Validar edad en tiempo real
    if (date) {
      const validacion = validarEdadConMensaje(
        date,
        'La persona heredera debe tener al menos 18 años'
      );
      if (validacion.esValido) {
        setErrors({
          ...errors,
          fechaNacimiento: '',
        });
      } else {
        setErrors({
          ...errors,
          fechaNacimiento: validacion.mensaje || '',
        });
      }
    } else {
      setErrors({
        ...errors,
        fechaNacimiento: '',
      });
    }
  };

  // Manejar cambio de región (resetea ciudad, comuna y carga ciudades)
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    // Buscar la región seleccionada para obtener su código
    const regionObj = regiones.find(r => r.nombreRegion === value);

    const newFormData = {
      ...localFormData,
      region: value,
      codRegion: regionObj?.idRegion || undefined,
      ciudad: '',
      comuna: '',
      calle: '',
      numero: '',
      codCiudad: undefined,
      codComuna: undefined,
    };

    setLocalFormData(newFormData);

    // Guardar en el contexto inmediatamente

    handleSaveForm(newFormData);

    if (errors.region) {
      setErrors({
        ...errors,
        region: '',
      });
    }

    // Limpiar listas dependientes
    setCiudades([]);
    setComunas([]);
    setErrorCiudades(null);
    setErrorComunas(null);

    // Cargar ciudades de la región seleccionada
    if (regionObj) {
      setLoadingCiudades(true);
      fetchCiudades(regionObj.idRegion)
        .then(data => {
          setCiudades(data);
          setErrorCiudades(null);
        })
        .catch(() => {
          setErrorCiudades('No se pudieron cargar las ciudades');
          setCiudades([]);
        })
        .finally(() => setLoadingCiudades(false));
    }
  };

  // Manejar cambio de ciudad (resetea comuna y carga comunas)
  const handleCiudadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    // Buscar la ciudad seleccionada para obtener su código
    const ciudadObj = ciudades.find(c => c.nombreCiudad === value);

    const newFormData = {
      ...localFormData,
      ciudad: value,
      codCiudad: ciudadObj?.idCiudad || undefined,
      comuna: '',
      calle: '',
      numero: '',
      codComuna: undefined,
    };

    setLocalFormData(newFormData);

    // Guardar en el contexto inmediatamente

    handleSaveForm(newFormData);

    if (errors.ciudad) {
      setErrors({
        ...errors,
        ciudad: '',
      });
    }

    // Limpiar lista de comunas
    setComunas([]);
    setErrorComunas(null);

    // Cargar comunas de la ciudad seleccionada
    if (ciudadObj) {
      setLoadingComunas(true);
      fetchComunasPorCiudad(ciudadObj.idCiudad)
        .then(data => {
          setComunas(data);
          setErrorComunas(null);
        })
        .catch(() => {
          setErrorComunas('No se pudieron cargar las comunas');
          setComunas([]);
        })
        .finally(() => setLoadingComunas(false));
    }
  };

  // Manejar cambio de comuna (resetea calle y carga calles)
  const handleComunaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    // Buscar la comuna seleccionada para obtener su código
    const comunaObj = comunas.find(c => c.NombreComuna === value);

    const newFormData = {
      ...localFormData,
      comuna: value,
      codComuna: comunaObj?.idComuna || undefined,
      calle: '', // Resetear calle al cambiar comuna
      numero: '', // Resetear número al cambiar comuna
    };

    setLocalFormData(newFormData);

    // Guardar en el contexto inmediatamente

    handleSaveForm(newFormData);

    if (errors.comuna) {
      setErrors({
        ...errors,
        comuna: '',
      });
    }
  };

  // Manejar cambio de calle con autocompletado
  const handleCalleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newFormData = {
      ...localFormData,
      calle: value,
      numero: '', // Limpiar número cuando cambia la calle
    };

    setLocalFormData(newFormData);

    // Guardar en el contexto inmediatamente

    handleSaveForm(newFormData);

    // Actualizar búsqueda de calles
    searchCalles(value);

    if (errors.calle) {
      setErrors({
        ...errors,
        calle: '',
      });
    }
  };

  // Manejar selección de calle desde el autocompletado
  const handleCalleSelect = (option: { value: string; label: string; id?: number }) => {
    const newFormData = {
      ...localFormData,
      calle: option.label,
      numero: '', // Limpiar número cuando se selecciona una nueva calle
    };

    setLocalFormData(newFormData);

    // Guardar en el contexto inmediatamente

    handleSaveForm(newFormData);

    // Limpiar error de calle si existe
    if (errors.calle) {
      setErrors({
        ...errors,
        calle: '',
      });
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    let isValid = true;

    // Campos requeridos según la especificación
    if (!localFormData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
      isValid = false;
    } else {
      // Validar edad si se proporciona fecha
      const validacion = validarEdadConMensaje(
        localFormData.fechaNacimiento,
        'La persona heredera debe tener al menos 18 años'
      );
      if (!validacion.esValido) {
        newErrors.fechaNacimiento = validacion.mensaje || '';
        isValid = false;
      }
    }

    if (!localFormData.nombres.trim()) {
      newErrors.nombres = 'El nombre es requerido';
      isValid = false;
    }

    if (!localFormData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
      isValid = false;
    }

    if (!localFormData.correoElectronico.trim()) {
      newErrors.correoElectronico = 'El correo electrónico es requerido';
      isValid = false;
    }

    if (!localFormData.sexo) {
      newErrors.sexo = 'Seleccione un sexo';
      isValid = false;
    }

    if (!localFormData.parentesco) {
      newErrors.parentesco = 'Seleccione un parentesco';
      isValid = false;
    }

    // Validación de email si se proporciona
    if (localFormData.correoElectronico && !/\S+@\S+\.\S+/.test(localFormData.correoElectronico)) {
      newErrors.correoElectronico = 'Correo electrónico inválido';
      isValid = false;
    }

    // Validación de número de teléfono si se proporciona
    if (localFormData.telefono && !/^\d{9}$/.test(localFormData.telefono)) {
      newErrors.telefono = 'Teléfono debe tener 9 dígitos';
      isValid = false;
    }

    // Validación de dirección
    if (!localFormData.region) {
      newErrors.region = 'Seleccione una región';
      isValid = false;
    }

    if (!localFormData.ciudad) {
      newErrors.ciudad = 'Seleccione una ciudad';
      isValid = false;
    }

    if (!localFormData.comuna) {
      newErrors.comuna = 'Seleccione una comuna';
      isValid = false;
    }

    if (!localFormData.calle.trim()) {
      newErrors.calle = 'La calle es requerida';
      isValid = false;
    }

    if (!localFormData.numero.trim()) {
      newErrors.numero = 'El número es requerido';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Limpiar errores anteriores
      setEmailValidationError(null);
      setPhoneValidationError(null);
      setValidatingEmail(true);
      setValidatingPhone(true);

      try {
        // Obtener RUT del heredero sin puntos ni DV
        const rutHeredero = heredero?.rut ? parseInt(heredero.rut.replace(/[^0-9]/g, '')) : null;

        if (!rutHeredero) {
          throw new Error('No se pudo obtener el RUT del heredero');
        }

        // Validar correo electrónico y teléfono en paralelo
        const [emailValido, telefonoValido] = await Promise.all([
          validarCorreoElectronico(rutHeredero, localFormData.correoElectronico, ''),
          validarTelefono(rutHeredero, localFormData.telefono, ''),
        ]);

        // Verificar si ambas validaciones fueron exitosas
        if (!emailValido) {
          setEmailValidationError('El correo electrónico no es válido');
          setValidatingEmail(false);
          setValidatingPhone(false);
          return;
        }

        if (!telefonoValido) {
          setPhoneValidationError('El teléfono no es válido');
          setValidatingEmail(false);
          setValidatingPhone(false);
          return;
        }

        // Guardar datos en el contexto
        handleSaveForm(localFormData);

        // Redirigir a la página de carga de documentos (stepper 3)
        navigate('/mnherederos/ingresoher/cargadoc');
      } catch (error) {
        console.error('Error en validación de correo electrónico o teléfono:', error);
        setEmailValidationError(
          'Error al validar los datos de contacto. Por favor, inténtelo nuevamente.'
        );
        setPhoneValidationError(
          'Error al validar los datos de contacto. Por favor, inténtelo nuevamente.'
        );
      } finally {
        setValidatingEmail(false);
        setValidatingPhone(false);
      }
    }
  };

  // Contenido del formulario
  const formContent = (
    <>
      {showHeader && (
        <>
          {/* Header Section */}
          <div style={{ width: '100%', marginBottom: 24 }}>
            <div style={{ marginLeft: 48 }}>
              {/* Breadcrumb */}
              <div style={{ marginBottom: 8 }}>
                <ConsaludCore.Breadcrumb
                  items={cleanedBreadcrumbItems}
                  separator={<span>{'>'}</span>}
                  showHome={true}
                  className="breadcrumb-custom"
                />
              </div>
              {/* Botón volver */}
              <div>
                <button
                  className="back-button"
                  onClick={handleBackClick}
                  aria-label="Volver a la página anterior"
                >
                  <span className="back-button-icon">←</span> Volver
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content Section */}
      <div style={{ width: '100%' }}>
        {/* Title */}
        {showHeader && (
          <div className="textoTituloComponentes mb-4">
            <span className="titleComponent">Registrar persona heredera</span>
          </div>
        )}

        {/* Stepper */}
        {showHeader && (
          <div className="mb-5">
            <Stepper step={2} />
          </div>
        )}

        {/* Card */}
        <ConsaludCore.Card
          title={undefined}
          subtitle={undefined}
          variant="elevated"
          padding="large"
          className="card-elevated ingreso-card animate-fade-in-up"
        >
          <form onSubmit={handleSubmit}>
            {/* Sección de Datos Personales */}
            <div className="form-section">
              <div className="section-title">
                <div className="person-icon">
                  <img src={DatosPersonalesIcon} alt="Datos personales" width="20" height="20" />
                </div>
                <span>Datos personales</span>
              </div>
              <p className="description">
                Verifica que los datos de la persona heredera sean correctos, de lo contrario
                actualízalos.
              </p>

              <div
                className="form-row"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '16px',
                  marginBottom: '20px',
                  width: '100%',
                }}
              >
                {/* Fecha de nacimiento */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <ConsaludCore.DatePicker
                    value={localFormData.fechaNacimiento}
                    onChange={handleDateChange}
                    label="Fecha nacimiento"
                    placeholder="DD/MM/AAAA"
                    maxDate={new Date()}
                    disabled={fieldsLocked}
                    error={!!errors.fechaNacimiento}
                  />
                  {errors.fechaNacimiento && (
                    <p className="help is-danger">{errors.fechaNacimiento}</p>
                  )}
                </div>

                {/* Nombres */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Nombres</label>
                  <input
                    className={`input ${errors.nombres ? 'is-danger' : ''} ${fieldsLocked ? 'is-static' : ''}`}
                    type="text"
                    name="nombres"
                    value={localFormData.nombres}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                    disabled={fieldsLocked}
                    style={
                      fieldsLocked ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}
                    }
                  />
                  {errors.nombres && <p className="help is-danger">{errors.nombres}</p>}
                </div>
              </div>

              <div
                className="form-row"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '16px',
                  marginBottom: '20px',
                  width: '100%',
                }}
              >
                {/* Apellido Paterno */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Apellido Paterno</label>
                  <input
                    className={`input ${errors.apellidoPaterno ? 'is-danger' : ''} ${fieldsLocked ? 'is-static' : ''}`}
                    type="text"
                    name="apellidoPaterno"
                    value={localFormData.apellidoPaterno}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                    disabled={fieldsLocked}
                    style={
                      fieldsLocked ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}
                    }
                  />
                  {errors.apellidoPaterno && (
                    <p className="help is-danger">{errors.apellidoPaterno}</p>
                  )}
                </div>

                {/* Apellido Materno */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Apellido Materno</label>
                  <input
                    className={`input ${errors.apellidoMaterno ? 'is-danger' : ''} ${fieldsLocked ? 'is-static' : ''}`}
                    type="text"
                    name="apellidoMaterno"
                    value={localFormData.apellidoMaterno}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                    disabled={fieldsLocked}
                    style={
                      fieldsLocked ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}
                    }
                  />
                  {errors.apellidoMaterno && (
                    <p className="help is-danger">{errors.apellidoMaterno}</p>
                  )}
                </div>
              </div>

              <div
                className="form-row"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '16px',
                  marginBottom: '20px',
                  width: '100%',
                }}
              >
                {/* Sexo */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Sexo</label>
                  <CustomSelect
                    name="sexo"
                    value={localFormData.sexo}
                    onChange={handleInputChange}
                    options={generos.map(genero => ({
                      value: genero.Codigo,
                      label: genero.Descripcion,
                    }))}
                    placeholder={
                      loadingGeneros
                        ? 'Cargando...'
                        : errorGeneros
                          ? 'Error al cargar'
                          : 'Seleccionar'
                    }
                    disabled={loadingGeneros || !!errorGeneros || fieldsLocked}
                    error={!!errors.sexo}
                  />
                  {errors.sexo && <p className="help is-danger">{errors.sexo}</p>}
                  {errorGeneros && <p className="help is-danger">{errorGeneros}</p>}
                </div>

                {/* Parentesco */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Parentesco</label>
                  <CustomSelect
                    name="parentesco"
                    value={localFormData.parentesco}
                    onChange={handleInputChange}
                    options={mapTiposParentescoToOptions(tiposParentesco)}
                    placeholder={
                      loadingParentesco
                        ? 'Cargando...'
                        : errorParentesco
                          ? 'Error al cargar'
                          : 'Seleccionar'
                    }
                    disabled={loadingParentesco || !!errorParentesco}
                    error={!!errors.parentesco}
                  />
                  {errors.parentesco && <p className="help is-danger">{errors.parentesco}</p>}
                  {errorParentesco && <p className="help is-danger">{errorParentesco}</p>}
                </div>
              </div>

              <div
                className="form-row"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '16px',
                  marginBottom: '20px',
                  width: '100%',
                }}
              >
                {/* Teléfono */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Teléfono</label>
                  <input
                    className={`input ${errors.telefono ? 'is-danger' : ''}`}
                    type="tel"
                    name="telefono"
                    value={localFormData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                  />
                  {errors.telefono && <p className="help is-danger">{errors.telefono}</p>}
                  {phoneValidationError && <p className="help is-danger">{phoneValidationError}</p>}
                </div>

                {/* Correo electrónico */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Correo electrónico</label>
                  <input
                    className={`input ${errors.correoElectronico ? 'is-danger' : ''}`}
                    type="email"
                    name="correoElectronico"
                    value={localFormData.correoElectronico}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                  />
                  {errors.correoElectronico && (
                    <p className="help is-danger">{errors.correoElectronico}</p>
                  )}
                  {emailValidationError && <p className="help is-danger">{emailValidationError}</p>}
                </div>
              </div>
            </div>

            {/* Sección de Dirección */}
            <div className="form-section">
              <div className="section-title">
                <div className="location-icon">
                  <img src={DireccionIcon} alt="Dirección" width="20" height="20" />
                </div>
                <span>Dirección</span>
              </div>
              <div
                className="form-row"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '16px',
                  marginBottom: '20px',
                  width: '100%',
                }}
              >
                {/* Región */}
                <div
                  className="form-column full-width"
                  style={{ flex: 1, width: '100%', maxWidth: '100%' }}
                >
                  <label>Región</label>
                  <CustomSelect
                    name="region"
                    value={localFormData.region || ''}
                    onChange={handleRegionChange}
                    options={regiones.map(region => ({
                      value: region.nombreRegion,
                      label: region.nombreRegion,
                    }))}
                    placeholder={
                      loadingRegiones
                        ? 'Cargando...'
                        : errorRegiones
                          ? 'Error al cargar'
                          : 'Seleccionar'
                    }
                    disabled={loadingRegiones || !!errorRegiones}
                    error={!!errors.region}
                  />
                  {errors.region && <p className="help is-danger">{errors.region}</p>}
                  {errorRegiones && <p className="help is-danger">{errorRegiones}</p>}
                </div>
              </div>

              <div
                className="form-row"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '16px',
                  marginBottom: '20px',
                  width: '100%',
                }}
              >
                {/* Ciudad */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Ciudad</label>
                  <CustomSelect
                    name="ciudad"
                    value={localFormData.ciudad}
                    onChange={handleCiudadChange}
                    options={ciudades.map(ciudad => ({
                      value: ciudad.nombreCiudad,
                      label: ciudad.nombreCiudad,
                    }))}
                    placeholder={
                      !localFormData.region
                        ? 'Seleccione región primero'
                        : loadingCiudades
                          ? 'Cargando...'
                          : errorCiudades
                            ? 'Error al cargar'
                            : 'Seleccionar'
                    }
                    disabled={!localFormData.region || loadingCiudades || !!errorCiudades}
                    error={!!errors.ciudad}
                  />
                  {errors.ciudad && <p className="help is-danger">{errors.ciudad}</p>}
                  {errorCiudades && <p className="help is-danger">{errorCiudades}</p>}
                </div>

                {/* Comuna */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Comuna</label>
                  <CustomSelect
                    name="comuna"
                    value={localFormData.comuna}
                    onChange={handleComunaChange}
                    options={comunas.map(comuna => ({
                      value: comuna.NombreComuna,
                      label: comuna.NombreComuna,
                    }))}
                    placeholder={
                      !localFormData.region
                        ? 'Seleccione región primero'
                        : !localFormData.ciudad
                          ? 'Seleccione ciudad primero'
                          : loadingComunas
                            ? 'Cargando...'
                            : errorComunas
                              ? 'Error al cargar'
                              : 'Seleccionar'
                    }
                    disabled={
                      !localFormData.region ||
                      !localFormData.ciudad ||
                      loadingComunas ||
                      !!errorComunas
                    }
                    error={!!errors.comuna}
                  />
                  {errors.comuna && <p className="help is-danger">{errors.comuna}</p>}
                  {errorComunas && <p className="help is-danger">{errorComunas}</p>}
                </div>
              </div>

              <div
                className="form-row"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '16px',
                  marginBottom: '20px',
                  width: '100%',
                }}
              >
                {/* Calle */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Calle</label>
                  <AutoCompleteInput
                    name="calle"
                    value={localFormData.calle}
                    onChange={handleCalleChange}
                    onOptionSelect={handleCalleSelect}
                    options={calles.map(calle => ({
                      value: calle.nombreCalle,
                      label: calle.nombreCalle,
                      id: calle.idCalle,
                    }))}
                    placeholder={
                      !localFormData.region
                        ? 'Seleccione región primero'
                        : !localFormData.ciudad
                          ? 'Seleccione ciudad primero'
                          : !localFormData.comuna
                            ? 'Seleccione comuna primero'
                            : 'Buscar calle...'
                    }
                    disabled={
                      !localFormData.region || !localFormData.ciudad || !localFormData.comuna
                    }
                    loading={loadingCalles}
                    error={!!errors.calle}
                    minCharsToSearch={2}
                    debounceMs={300}
                  />
                  {errors.calle && <p className="help is-danger">{errors.calle}</p>}
                  {errorCalles && <p className="help is-danger">{errorCalles}</p>}
                </div>

                {/* Número */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Número</label>
                  <NumberAutoCompleteInput
                    name="numero"
                    value={localFormData.numero}
                    onChange={handleInputChange}
                    nombreCalle={localFormData.calle}
                    idComuna={selectedComuna?.idComuna}
                    placeholder="Ingresar"
                    error={!!errors.numero}
                    disabled={!localFormData.calle}
                    minCharsToSearch={1}
                    debounceMs={200}
                  />
                  {errors.numero && <p className="help is-danger">{errors.numero}</p>}
                </div>
              </div>

              <div
                className="form-row"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '16px',
                  marginBottom: '20px',
                  width: '100%',
                }}
              >
                {/* Depto/Block (Opcional) */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Depto/Block (Opcional)</label>
                  <input
                    className="input"
                    type="text"
                    name="deptoBloqueOpcional"
                    value={localFormData.deptoBloqueOpcional}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                  />
                </div>

                {/* Villa (Opcional) */}
                <div
                  className="form-column"
                  style={{
                    flex: 1,
                    width: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  }}
                >
                  <label>Villa (Opcional)</label>
                  <input
                    className="input"
                    type="text"
                    name="villaOpcional"
                    value={localFormData.villaOpcional}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                  />
                </div>
              </div>
            </div>
            {/* Separador antes del botón */}
            <div className="section-divider"></div>
            {/* Botón de envío */}
            <div className="continue-button">
              <button
                type="submit"
                className="button is-primary is-rounded"
                disabled={validatingEmail || validatingPhone}
              >
                {validatingEmail || validatingPhone ? 'Validando...' : 'Continuar'}
              </button>
            </div>
          </form>
        </ConsaludCore.Card>
      </div>
    </>
  );

  return showHeader ? (
    <div className="route-container layout-stable">{formContent}</div>
  ) : (
    <>{formContent}</>
  );
};
export default FormIngresoHeredero;
