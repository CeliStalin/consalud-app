import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/FormHeredero.css';
import { Stepper } from './Stepper';
import { useHeredero } from '../contexts/HerederoContext';
import { useFormHerederoData } from '../hooks/useFormHerederoData';
import * as ConsaludCore from '@consalud/core';
import { fetchGeneros, fetchCiudades, fetchComunasPorCiudad, fetchRegiones, Genero, Ciudad, Comuna, Region } from '../services';
import { CustomSelect } from './CustomSelect';
import { AutoCompleteInput } from './AutoCompleteInput';
import { useCallesAutocomplete } from '../hooks/useCallesAutocomplete';
import { FormData } from '../interfaces/FormData';
import { validarEdadConMensaje } from '../../../utils/ageValidation';

interface BreadcrumbItem {
    label: string;
}

interface FormIngresoHerederoProps {
  showHeader?: boolean;
}

// Datos para los selectores
const PARENTESCO_OPTIONS = [
  { value: 'H', label: 'Hijo/a' },
  { value: 'P', label: 'Padre' },
  { value: 'M', label: 'Madre' },
  { value: 'C', label: 'Cónyuge' },
  { value: 'O', label: 'Otro' }
];

const FormIngresoHeredero: React.FC<FormIngresoHerederoProps> = ({ showHeader = true }) => {
  const navigate = useNavigate();
  const {heredero, fieldsLocked} = useHeredero();
  const { 
    formData, 
    handleSaveForm, 
    handleReloadFromStorage
  } = useFormHerederoData();

  // Función para obtener la descripción de región por código
  const obtenerDescripcionRegion = (codRegion: number): string => {
    const region = regiones.find(r => r.codRegion === codRegion);
    return region ? region.nombreRegion : '';
  };

  // Estado local para el formulario (se sincroniza con el contexto)
  const [localFormData, setLocalFormData] = useState<FormData>({
    fechaNacimiento: formData?.fechaNacimiento || (heredero?.fechaNacimiento ? new Date(heredero.fechaNacimiento) : null),
    nombres: formData?.nombres || heredero?.nombre || '',
    apellidoPaterno: formData?.apellidoPaterno || heredero?.apellidoPat || '',
    apellidoMaterno: formData?.apellidoMaterno || heredero?.apellidoMat || '',
    sexo: formData?.sexo || '',
    parentesco: formData?.parentesco || '',
    telefono: formData?.telefono || heredero?.contactabilidad.telefono.numero || '',
    correoElectronico: formData?.correoElectronico || heredero?.contactabilidad.correo.sort((a, b) => a.validacion - b.validacion)[0]?.mail || '',
    ciudad: formData?.ciudad || heredero?.descripcionCiudad || '',
    comuna: formData?.comuna || heredero?.descripcionComuna || '',
    calle: formData?.calle || heredero?.contactabilidad.direccion.calle || '',
    numero: formData?.numero || (heredero?.contactabilidad.direccion.numero ? String(heredero.contactabilidad.direccion.numero) : ''),
    deptoBloqueOpcional: formData?.deptoBloqueOpcional || heredero?.contactabilidad.direccion.departamento || '',
    villaOpcional: formData?.villaOpcional || heredero?.contactabilidad.direccion.villa || '',
    region: formData?.region || '',
    // Códigos para cargar los combos correctamente
    codRegion: formData?.codRegion || heredero?.codRegion || undefined,
    codCiudad: formData?.codCiudad || heredero?.codCiudad || undefined,
    codComuna: formData?.codComuna || undefined
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

  // Hook para autocompletado de calles
  const selectedComuna = comunas.find(comuna => comuna.NombreComuna === localFormData.comuna);
  const { calles, loading: loadingCalles, error: errorCalles, searchCalles } = useCallesAutocomplete({
    idComuna: selectedComuna?.idComuna
  });

  React.useEffect(() => {
    setLoadingGeneros(true);
    fetchGeneros()
      .then((data) => {
        setGeneros(data);
        setErrorGeneros(null);
      })
      .catch(() => {
        setErrorGeneros('No se pudieron cargar los géneros');
        setGeneros([]);
      })
      .finally(() => setLoadingGeneros(false));
  }, []);

  // Comentado: Ahora las ciudades se cargan cuando se selecciona una región
  // React.useEffect(() => {
  //   setLoadingCiudades(true);
  //   fetchCiudades()
  //     .then((data) => {
  //       setCiudades(data);
  //       setErrorCiudades(null);
  //     })
  //     .catch(() => {
  //       setErrorCiudades('No se pudieron cargar las ciudades');
  //       setCiudades([]);
  //     })
  //     .finally(() => setLoadingCiudades(false));
  // }, []);

  React.useEffect(() => {
    setLoadingRegiones(true);
    fetchRegiones()
      .then((data) => {
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
      // Cargar ciudades de la región del heredero para tener las opciones disponibles
      setLoadingCiudades(true);
      fetchCiudades(heredero.codRegion)
        .then((data) => {
          setCiudades(data);
          setErrorCiudades(null);
          
          // Si hay ciudad del heredero, cargar comunas para tener las opciones disponibles
          if (heredero.codCiudad) {
            setLoadingComunas(true);
            fetchComunasPorCiudad(heredero.codCiudad)
              .then((comunasData) => {
                setComunas(comunasData);
                setErrorComunas(null);
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
  }, [heredero, fieldsLocked]);

  // Inicializar el formulario solo una vez al montar
  useEffect(() => {
    // Recargar datos del sessionStorage al montar
    handleReloadFromStorage();
  }, [handleReloadFromStorage]);

  // Sincronizar datos locales cuando cambie formData del contexto
  useEffect(() => {
    if (formData) {
      console.log('🔄 Sincronizando datos del contexto:', formData);
      setLocalFormData(prevData => {
        // Solo actualizar si los datos son diferentes
        if (JSON.stringify(prevData) !== JSON.stringify(formData)) {
          console.log('📝 Actualizando localFormData con datos del contexto');
          return formData;
        }
        return prevData;
      });
    }
  }, [formData]);

  // Cargar datos de ubicación cuando se restaura el formulario con códigos
  useEffect(() => {
    if (localFormData.codRegion && regiones.length > 0) {
      // Cargar ciudades de la región guardada
      setLoadingCiudades(true);
      fetchCiudades(localFormData.codRegion)
        .then((data) => {
          setCiudades(data);
          setErrorCiudades(null);
          
          // Si hay código de ciudad, cargar comunas
          if (localFormData.codCiudad) {
            setLoadingComunas(true);
            fetchComunasPorCiudad(localFormData.codCiudad)
              .then((comunasData) => {
                setComunas(comunasData);
                setErrorComunas(null);
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
  }, [localFormData.codRegion, localFormData.codCiudad, regiones.length]);

  // Actualizar datos cuando cambie el heredero
  useEffect(() => {
    if (heredero) {
      setLocalFormData(prevData => {
        // Si los campos están bloqueados, usar los datos del heredero
        if (fieldsLocked) {
          const newData = {
            ...prevData,
            fechaNacimiento: heredero.fechaNacimiento ? new Date(heredero.fechaNacimiento) : null,
            nombres: heredero.nombre || '',
            apellidoPaterno: heredero.apellidoPat || '',
            apellidoMaterno: heredero.apellidoMat || '',
            telefono: heredero.contactabilidad.telefono.numero || '',
            correoElectronico: heredero.contactabilidad.correo.sort((a, b) => a.validacion - b.validacion)[0]?.mail || '',
            ciudad: heredero.descripcionCiudad || '',
            comuna: heredero.descripcionComuna || '',
            calle: heredero.contactabilidad.direccion.calle || '',
            numero: heredero.contactabilidad.direccion.numero ? String(heredero.contactabilidad.direccion.numero) : '',
            deptoBloqueOpcional: heredero.contactabilidad.direccion.departamento || '',
            villaOpcional: heredero.contactabilidad.direccion.villa || '',
            // Códigos del heredero
            codRegion: heredero.codRegion || undefined,
            codCiudad: heredero.codCiudad || undefined,
            codComuna: undefined // No hay código de comuna en el heredero
          };
          return newData;
        } else {
          // Si los campos no están bloqueados (status 412), mantener solo el RUT y limpiar el resto
          const newData = {
            ...prevData,
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
            // Limpiar códigos
            codRegion: undefined,
            codCiudad: undefined,
            codComuna: undefined
          };
          return newData;
        }
      });
    }
  }, [heredero, fieldsLocked]);

  // Actualizar región cuando se carguen las regiones y haya un heredero
  useEffect(() => {
    if (regiones.length > 0 && heredero?.codRegion && fieldsLocked) {
      const descripcionRegion = obtenerDescripcionRegion(heredero.codRegion);
      if (descripcionRegion) {
        setLocalFormData(prevData => ({
          ...prevData,
          region: descripcionRegion,
          codRegion: heredero.codRegion
        }));
      }
    }
  }, [regiones, heredero?.codRegion, fieldsLocked]);

  // Eliminar la sincronización automática que causa el infinite loop
  // Los cambios se guardarán solo cuando se envíe el formulario

  const handleBackClick = useCallback((): void => {
    navigate(-1);
  }, [navigate]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Administración devolución herederos' }
  ];
  
  const cleanedBreadcrumbItems = breadcrumbItems.map(item => ({
    ...item,
    label: typeof item.label === 'string' ? item.label.replace(/^\/+/, '') : item.label
  }));

  // Manejar cambios en campos de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFormData({
      ...localFormData,
      [name]: value
    });

    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name as keyof FormData]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Manejar cambio de fecha
  const handleDateChange = (date: Date | null) => {
    console.log('DatePicker del core - fecha seleccionada:', date);
    setLocalFormData({
      ...localFormData,
      fechaNacimiento: date
    });

    // Validar edad en tiempo real
    if (date) {
      const validacion = validarEdadConMensaje(date, 'La persona heredera debe tener al menos 18 años');
      if (validacion.esValido) {
        setErrors({
          ...errors,
          fechaNacimiento: ''
        });
      } else {
        setErrors({
          ...errors,
          fechaNacimiento: validacion.mensaje || ''
        });
      }
    } else {
      setErrors({
        ...errors,
        fechaNacimiento: ''
      });
    }
  };

  // Manejar cambio de región (resetea ciudad, comuna y carga ciudades)
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    
    // Buscar la región seleccionada para obtener su código
    const regionObj = regiones.find((r) => r.nombreRegion === value);
    
    setLocalFormData({
      ...localFormData,
      region: value,
      codRegion: regionObj?.idRegion || undefined,
      ciudad: '', // Resetear ciudad al cambiar región
      comuna: '', // Resetear comuna al cambiar región
      codCiudad: undefined, // Resetear código de ciudad
      codComuna: undefined // Resetear código de comuna
    });

    if (errors.region) {
      setErrors({
        ...errors,
        region: ''
      });
    }

    // Cargar ciudades de la región seleccionada
    if (regionObj) {
      setLoadingCiudades(true);
      fetchCiudades(regionObj.idRegion)
        .then((data) => {
          setCiudades(data);
          setErrorCiudades(null);
        })
        .catch(() => {
          setErrorCiudades('No se pudieron cargar las ciudades');
          setCiudades([]);
        })
        .finally(() => setLoadingCiudades(false));
    } else {
      setCiudades([]);
    }
  };

  // Manejar cambio de ciudad (resetea comuna y carga comunas)
  const handleCiudadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    
    // Buscar la ciudad seleccionada para obtener su código
    const ciudadObj = ciudades.find((c) => c.nombreCiudad === value);
    
    setLocalFormData({
      ...localFormData,
      ciudad: value,
      codCiudad: ciudadObj?.idCiudad || undefined,
      comuna: '', // Resetear comuna al cambiar ciudad
      codComuna: undefined // Resetear código de comuna
    });

    if (errors.ciudad) {
      setErrors({
        ...errors,
        ciudad: ''
      });
    }

    // Cargar comunas de la ciudad seleccionada
    if (ciudadObj) {
      setLoadingComunas(true);
      fetchComunasPorCiudad(ciudadObj.idCiudad)
        .then((data) => {
          setComunas(data);
          setErrorComunas(null);
        })
        .catch(() => {
          setErrorComunas('No se pudieron cargar las comunas');
          setComunas([]);
        })
        .finally(() => setLoadingComunas(false));
    } else {
      setComunas([]);
    }
  };

  // Manejar cambio de comuna (resetea calle y carga calles)
  const handleComunaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    
    // Buscar la comuna seleccionada para obtener su código
    const comunaObj = comunas.find((c) => c.NombreComuna === value);
    
    setLocalFormData({
      ...localFormData,
      comuna: value,
      codComuna: comunaObj?.idComuna || undefined,
      calle: '' // Resetear calle al cambiar comuna
    });

    if (errors.comuna) {
      setErrors({
        ...errors,
        comuna: ''
      });
    }
  };

  // Manejar cambio de calle con autocompletado
  const handleCalleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLocalFormData({
      ...localFormData,
      calle: value
    });

    // Actualizar búsqueda de calles
    searchCalles(value);

    if (errors.calle) {
      setErrors({
        ...errors,
        calle: ''
      });
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    let isValid = true;

    // Campos requeridos - solo validar si no están bloqueados
    if (!fieldsLocked) {
      if (localFormData.fechaNacimiento) {
        const validacion = validarEdadConMensaje(localFormData.fechaNacimiento, 'La persona heredera debe tener al menos 18 años');
        if (!validacion.esValido) {
          newErrors.fechaNacimiento = validacion.mensaje || '';
          isValid = false;
        }
      } else {
        newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
        isValid = false;
      }

      if (!localFormData.nombres.trim()) {
        newErrors.nombres = 'El nombre es requerido';
        isValid = false;
      }

      if (!localFormData.apellidoPaterno.trim()) {
        newErrors.apellidoPaterno = 'El apellido paterno es requerido';
        isValid = false;
      }
    }

    // Campos que siempre se validan (no están en la lista de bloqueados)
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('✅ Formulario válido, guardando datos:', localFormData);
      
      // Guardar datos en el contexto
      handleSaveForm(localFormData);
      
      // Verificar que se guardó correctamente
      setTimeout(() => {
        const stored = sessionStorage.getItem('formHerederoData');
        console.log('🔍 Verificación después de guardar:', stored ? '✅ Datos en sessionStorage' : '❌ No hay datos en sessionStorage');
        if (stored) {
          console.log('📄 Datos guardados:', JSON.parse(stored));
        }
      }, 100);
      
      // Redirigir a la página de carga de documentos (stepper 3)
      navigate('/mnherederos/ingresoher/cargadoc');
    } else {
      console.log('❌ Formulario inválido, no se guardan datos');
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
            <span className="titleComponent">
              Registrar persona heredera
            </span>
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
                  <img src="/DatosPersonales.svg" alt="Datos personales" width="20" height="20" />
                </div>
                <span>Datos personales</span>
              </div>
              <p className="description">
                Verifica que los datos de la persona heredera sean correctos, de lo contrario actualízalos.
              </p>

              <div className="form-row" style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '20px', width: '100%' }}>
                {/* Fecha de nacimiento */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
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
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
                  <label>Nombres</label>
                  <input
                    className={`input ${errors.nombres ? 'is-danger' : ''} ${fieldsLocked ? 'is-static' : ''}`}
                    type="text"
                    name="nombres"
                    value={localFormData.nombres}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                    disabled={fieldsLocked}
                    style={fieldsLocked ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                  />
                  {errors.nombres && (
                    <p className="help is-danger">{errors.nombres}</p>
                  )}
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '20px', width: '100%' }}>
                {/* Apellido Paterno */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
                  <label>Apellido Paterno</label>
                  <input
                    className={`input ${errors.apellidoPaterno ? 'is-danger' : ''} ${fieldsLocked ? 'is-static' : ''}`}
                    type="text"
                    name="apellidoPaterno"
                    value={localFormData.apellidoPaterno}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                    disabled={fieldsLocked}
                    style={fieldsLocked ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                  />
                  {errors.apellidoPaterno && (
                    <p className="help is-danger">{errors.apellidoPaterno}</p>
                  )}
                </div>

                {/* Apellido Materno */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
                  <label>Apellido Materno</label>
                  <input
                    className={`input ${errors.apellidoMaterno ? 'is-danger' : ''} ${fieldsLocked ? 'is-static' : ''}`}
                    type="text"
                    name="apellidoMaterno"
                    value={localFormData.apellidoMaterno}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                    disabled={fieldsLocked}
                    style={fieldsLocked ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                  />
                  {errors.apellidoMaterno && (
                    <p className="help is-danger">{errors.apellidoMaterno}</p>
                  )}
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '20px', width: '100%' }}>
                {/* Sexo */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
                  <label>Sexo</label>
                  <CustomSelect
                    name="sexo"
                    value={localFormData.sexo}
                    onChange={handleInputChange}
                    options={generos.map((genero) => ({
                      value: genero.Codigo,
                      label: genero.Descripcion
                    }))}
                    placeholder={loadingGeneros ? 'Cargando...' : errorGeneros ? 'Error al cargar' : 'Seleccionar'}
                    disabled={loadingGeneros || !!errorGeneros}
                    error={!!errors.sexo}
                  />
                  {errors.sexo && (
                    <p className="help is-danger">{errors.sexo}</p>
                  )}
                  {errorGeneros && (
                    <p className="help is-danger">{errorGeneros}</p>
                  )}
                </div>

                {/* Parentesco */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
                  <label>Parentesco</label>
                  <CustomSelect
                    name="parentesco"
                    value={localFormData.parentesco}
                    onChange={handleInputChange}
                    options={PARENTESCO_OPTIONS}
                    placeholder="Seleccionar"
                    error={!!errors.parentesco}
                  />
                  {errors.parentesco && (
                    <p className="help is-danger">{errors.parentesco}</p>
                  )}
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '20px', width: '100%' }}>
                {/* Teléfono */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
                  <label>Teléfono</label>
                  <input
                    className={`input ${errors.telefono ? 'is-danger' : ''}`}
                    type="tel"
                    name="telefono"
                    value={localFormData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                  />
                  {errors.telefono && (
                    <p className="help is-danger">{errors.telefono}</p>
                  )}
                </div>

                {/* Correo electrónico */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
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
                </div>
              </div>
            </div>

            {/* Sección de Dirección */}
            <div className="form-section">
              <div className="section-title">
                <div className="location-icon">
                  <img src="/Direccion.svg" alt="Dirección" width="20" height="20" />
                </div>
                <span>Dirección</span>
              </div>
              <div className="form-row" style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '20px', width: '100%' }}>
                {/* Región */}
                <div className="form-column full-width" style={{ flex: 1, width: '100%', maxWidth: '100%' }}>
                  <label>Región</label>
                  <CustomSelect
                    name="region"
                    value={localFormData.region || ''}
                    onChange={handleRegionChange}
                    options={regiones.map((region) => ({
                      value: region.nombreRegion,
                      label: region.nombreRegion
                    }))}
                    placeholder={loadingRegiones ? 'Cargando...' : errorRegiones ? 'Error al cargar' : 'Seleccionar'}
                    disabled={loadingRegiones || !!errorRegiones}
                    error={!!errors.region}
                  />
                  {errors.region && (
                    <p className="help is-danger">{errors.region}</p>
                  )}
                  {errorRegiones && (
                    <p className="help is-danger">{errorRegiones}</p>
                  )}
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '20px', width: '100%' }}>
                {/* Ciudad */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
                  <label>Ciudad</label>
                  <CustomSelect
                    name="ciudad"
                    value={localFormData.ciudad}
                    onChange={handleCiudadChange}
                    options={ciudades.map((ciudad) => ({
                      value: ciudad.nombreCiudad,
                      label: ciudad.nombreCiudad
                    }))}
                    placeholder={!localFormData.region ? 'Seleccione región primero' : loadingCiudades ? 'Cargando...' : errorCiudades ? 'Error al cargar' : 'Seleccionar'}
                    disabled={!localFormData.region || loadingCiudades || !!errorCiudades}
                    error={!!errors.ciudad}
                  />
                  {errors.ciudad && (
                    <p className="help is-danger">{errors.ciudad}</p>
                  )}
                  {errorCiudades && (
                    <p className="help is-danger">{errorCiudades}</p>
                  )}
                </div>

                {/* Comuna */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
                  <label>Comuna</label>
                  <CustomSelect
                    name="comuna"
                    value={localFormData.comuna}
                    onChange={handleComunaChange}
                    options={comunas.map((comuna) => ({
                      value: comuna.NombreComuna,
                      label: comuna.NombreComuna
                    }))}
                    placeholder={!localFormData.region ? 'Seleccione región primero' : !localFormData.ciudad ? 'Seleccione ciudad primero' : loadingComunas ? 'Cargando...' : errorComunas ? 'Error al cargar' : 'Seleccionar'}
                    disabled={!localFormData.region || !localFormData.ciudad || loadingComunas || !!errorComunas}
                    error={!!errors.comuna}
                  />
                  {errors.comuna && (
                    <p className="help is-danger">{errors.comuna}</p>
                  )}
                  {errorComunas && (
                    <p className="help is-danger">{errorComunas}</p>
                  )}
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '20px', width: '100%' }}>
                {/* Calle */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
                  <label>Calle</label>
                  <AutoCompleteInput
                    name="calle"
                    value={localFormData.calle}
                    onChange={handleCalleChange}
                    options={calles.map(calle => ({
                      value: calle.nombreCalle,
                      label: calle.nombreCalle,
                      id: calle.idCalle
                    }))}
                    placeholder={!localFormData.region ? 'Seleccione región primero' : !localFormData.ciudad ? 'Seleccione ciudad primero' : !localFormData.comuna ? 'Seleccione comuna primero' : 'Buscar calle...'}
                    disabled={!localFormData.region || !localFormData.ciudad || !localFormData.comuna}
                    loading={loadingCalles}
                    error={!!errors.calle}
                    minCharsToSearch={2}
                    debounceMs={300}
                  />
                  {errors.calle && (
                    <p className="help is-danger">{errors.calle}</p>
                  )}
                  {errorCalles && (
                    <p className="help is-danger">{errorCalles}</p>
                  )}
                </div>

                {/* Número */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
                  <label>Número</label>
                  <input
                    className={`input ${errors.numero ? 'is-danger' : ''}`}
                    type="text"
                    name="numero"
                    value={localFormData.numero}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                  />
                  {errors.numero && (
                    <p className="help is-danger">{errors.numero}</p>
                  )}
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '20px', width: '100%' }}>
                {/* Depto/Block (Opcional) */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
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
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
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
              >
                Continuar
              </button>
            </div>
          </form>
        </ConsaludCore.Card>
      </div>
    </>
  );

  return showHeader ? (
    <div className="route-container layout-stable">
      {formContent}
    </div>
  ) : (
    <>
      {formContent}
    </>
  );
};
export default FormIngresoHeredero;