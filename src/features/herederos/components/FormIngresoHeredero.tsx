import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { es } from 'date-fns/locale';
import './styles/FormHeredero.css';
import { Stepper } from './Stepper';
import { useHeredero } from '../contexts/HerederoContext';
import * as ConsaludCore from '@consalud/core';
import { fetchGeneros, fetchCiudades, fetchComunasPorCiudad, Genero, Ciudad, Comuna } from '../services';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomSelect } from './CustomSelect';

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

const COMUNA_OPTIONS = {
  'Santiago': [
    { value: 'Santiago', label: 'Santiago' },
    { value: 'Providencia', label: 'Providencia' },
    { value: 'Las Condes', label: 'Las Condes' }
  ],
  'Valparaíso': [
    { value: 'Valparaíso', label: 'Valparaíso' },
    { value: 'Viña del Mar', label: 'Viña del Mar' }
  ],
  'Concepción': [
    { value: 'Concepción', label: 'Concepción' },
    { value: 'Talcahuano', label: 'Talcahuano' }
  ]
};

interface FormData {
  fechaNacimiento: Date | null;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: string;
  parentesco: string;
  telefono: string;
  correoElectronico: string;
  ciudad: string;
  comuna: string;
  calle: string;
  numero: string;
  deptoBloqueOpcional: string;
  villaOpcional: string;
  region?: string; // Added for the new form structure
}

const FormIngresoHeredero: React.FC<FormIngresoHerederoProps> = ({ showHeader = true }) => {
  const navigate = useNavigate();
  const {heredero, fieldsLocked} = useHeredero();
  const [formData, setFormData] = useState<FormData>({
    fechaNacimiento: heredero?.fechaNacimiento ? new Date(heredero.fechaNacimiento) : null,
    nombres: heredero?.nombre || '',
    apellidoPaterno: heredero?.apellidoPat || '',
    apellidoMaterno: heredero?.apellidoMat || '',
    sexo:  '',
    parentesco: '',
    telefono: heredero?.contactabilidad.telefono.numero || '',
    correoElectronico:heredero?.contactabilidad.correo.sort((a, b) => a.validacion - b.validacion)[0]?.mail || '',
    ciudad: '',
    comuna: '',
    calle: heredero?.contactabilidad.direccion.calle || '',
    numero: heredero?.contactabilidad.direccion.numero ? String(heredero.contactabilidad.direccion.numero) : '',
    deptoBloqueOpcional: heredero?.contactabilidad.direccion.departamento || '',
    villaOpcional: heredero?.contactabilidad.direccion.villa || '',
    region: heredero?.contactabilidad.direccion.regionNombre || '' // Initialize region
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

  React.useEffect(() => {
    setLoadingGeneros(true);
    fetchGeneros()
      .then((data) => {
        setGeneros(data);
        setErrorGeneros(null);
      })
      .catch((err) => {
        setErrorGeneros('No se pudieron cargar los géneros');
        setGeneros([]);
      })
      .finally(() => setLoadingGeneros(false));
  }, []);

  React.useEffect(() => {
    setLoadingCiudades(true);
    fetchCiudades()
      .then((data) => {
        setCiudades(data);
        setErrorCiudades(null);
      })
      .catch(() => {
        setErrorCiudades('No se pudieron cargar las ciudades');
        setCiudades([]);
      })
      .finally(() => setLoadingCiudades(false));
  }, []);

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
    setFormData({
      ...formData,
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
    setFormData({
      ...formData,
      fechaNacimiento: date
    });

    if (errors.fechaNacimiento) {
      setErrors({
        ...errors,
        fechaNacimiento: ''
      });
    }
  };

  // Manejar cambio de ciudad (resetea comuna y carga comunas)
  const handleCiudadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      ciudad: value,
      comuna: '' // Resetear comuna al cambiar ciudad
    });

    if (errors.ciudad) {
      setErrors({
        ...errors,
        ciudad: ''
      });
    }

    // Buscar idCiudad correspondiente
    const ciudadObj = ciudades.find((c) => c.nombreCiudad === value);
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

  // Validar formulario
  const validateForm = (): boolean => {
    
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    let isValid = true;

    // Campos requeridos - solo validar si no están bloqueados
    if (!fieldsLocked) {
      if (!formData.fechaNacimiento) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
        isValid = false;
      }

      if (!formData.nombres.trim()) {
        newErrors.nombres = 'El nombre es requerido';
        isValid = false;
      }

      if (!formData.apellidoPaterno.trim()) {
        newErrors.apellidoPaterno = 'El apellido paterno es requerido';
        isValid = false;
      }
    }

    // Campos que siempre se validan (no están en la lista de bloqueados)
    if (!formData.sexo) {
      newErrors.sexo = 'Seleccione un sexo';
      isValid = false;
    }

    if (!formData.parentesco) {
      newErrors.parentesco = 'Seleccione un parentesco';
      isValid = false;
    }

    // Validación de email si se proporciona
    if (formData.correoElectronico && !/\S+@\S+\.\S+/.test(formData.correoElectronico)) {
      newErrors.correoElectronico = 'Correo electrónico inválido';
      isValid = false;
    }

    // Validación de número de teléfono si se proporciona
    if (formData.telefono && !/^\d{9}$/.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono debe tener 9 dígitos';
      isValid = false;
    }

    // Validación de dirección
    if (!formData.region) {
      newErrors.region = 'Seleccione una región';
      isValid = false;
    }

    if (!formData.ciudad) {
      newErrors.ciudad = 'Seleccione una ciudad';
      isValid = false;
    }

    if (!formData.comuna) {
      newErrors.comuna = 'Seleccione una comuna';
      isValid = false;
    }

    if (!formData.calle.trim()) {
      newErrors.calle = 'La calle es requerida';
      isValid = false;
    }

    if (!formData.numero.trim()) {
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
      console.log('Datos del formulario:', formData);
      // Aquí iría la lógica para enviar los datos al backend
      
      // Redirigir a la página de carga de documentos (stepper 3)
      navigate('/mnherederos/ingresoher/cargadoc');
    }
  };

  console.log(heredero);
  console.log('rut en contexto:'+heredero?.rut);
  
  return (
    <div className="route-container layout-stable">
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
                  <CustomDatePicker
                    selected={formData.fechaNacimiento}
                    onChange={handleDateChange}
                    placeholder="DD/MM/AAAA"
                    isError={!!errors.fechaNacimiento}
                    maxDate={new Date()}
                    label="Fecha nacimiento"
                    disabled={fieldsLocked}
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
                    value={formData.nombres}
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
                    value={formData.apellidoPaterno}
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
                    value={formData.apellidoMaterno}
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
                    value={formData.sexo}
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
                    value={formData.parentesco}
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
                    value={formData.telefono}
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
                    value={formData.correoElectronico}
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
                    value={formData.region || ''}
                    onChange={handleInputChange}
                    options={[
                      { value: 'Metropolitana', label: 'Región Metropolitana' },
                      { value: 'Valparaíso', label: 'Valparaíso' },
                      { value: 'Biobío', label: 'Biobío' },
                      { value: 'Araucanía', label: 'La Araucanía' }
                    ]}
                    placeholder="Seleccionar"
                    error={!!errors.region}
                  />
                  {errors.region && (
                    <p className="help is-danger">{errors.region}</p>
                  )}
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '20px', width: '100%' }}>
                {/* Ciudad */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
                  <label>Ciudad</label>
                  <CustomSelect
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleCiudadChange}
                    options={ciudades.map((ciudad) => ({
                      value: ciudad.nombreCiudad,
                      label: ciudad.nombreCiudad
                    }))}
                    placeholder={loadingCiudades ? 'Cargando...' : errorCiudades ? 'Error al cargar' : 'Seleccionar'}
                    disabled={loadingCiudades || !!errorCiudades}
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
                    value={formData.comuna}
                    onChange={handleInputChange}
                    options={comunas.map((comuna) => ({
                      value: comuna.NombreComuna,
                      label: comuna.NombreComuna
                    }))}
                    placeholder={!formData.ciudad ? 'Seleccione ciudad' : loadingComunas ? 'Cargando...' : errorComunas ? 'Error al cargar' : 'Seleccionar'}
                    disabled={!formData.ciudad || loadingComunas || !!errorComunas}
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
                  <input
                    className={`input ${errors.calle ? 'is-danger' : ''}`}
                    type="text"
                    name="calle"
                    value={formData.calle}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                  />
                  {errors.calle && (
                    <p className="help is-danger">{errors.calle}</p>
                  )}
                </div>

                {/* Número */}
                <div className="form-column" style={{ flex: 1, width: 'calc(50% - 8px)', maxWidth: 'calc(50% - 8px)' }}>
                  <label>Número</label>
                  <input
                    className={`input ${errors.numero ? 'is-danger' : ''}`}
                    type="text"
                    name="numero"
                    value={formData.numero}
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
                    value={formData.deptoBloqueOpcional}
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
                    value={formData.villaOpcional}
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
    </div>
  );
};
export default FormIngresoHeredero;