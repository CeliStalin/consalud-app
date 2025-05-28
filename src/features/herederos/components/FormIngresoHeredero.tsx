import React, { use, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es, he } from 'date-fns/locale';
import './styles/FormHeredero.css';
import * as ConsaludCore from '@consalud/core'; 
import { Stepper } from './Stepper';
import { useHeredero } from '../contexts/HerederoContext';

// Datos para los selectores
const SEXO_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' }
];

const PARENTESCO_OPTIONS = [
  { value: 'H', label: 'Hijo/a' },
  { value: 'P', label: 'Padre' },
  { value: 'M', label: 'Madre' },
  { value: 'C', label: 'Cónyuge' },
  { value: 'O', label: 'Otro' }
];

const CIUDAD_OPTIONS = [
  { value: 'Santiago', label: 'Santiago' },
  { value: 'Valparaíso', label: 'Valparaíso' },
  { value: 'Concepción', label: 'Concepción' }
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
}

const FormIngresoHeredero: React.FC = () => {
  const navigate = useNavigate();
  const {heredero} = useHeredero();
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
    villaOpcional: heredero?.contactabilidad.direccion.villa || ''
  });

  // Estado para manejar errores de validación
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

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

  // Manejar cambio de ciudad (resetea comuna)
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
  };

  // Validar formulario
  const validateForm = (): boolean => {
    
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    let isValid = true;

    // Campos requeridos
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
      
      // Redirigir a la siguiente página o mostrar mensaje de éxito
      navigate('/mnherederos/ingresoher/cargadoc');
    }
  };

  console.log(heredero);
  console.log('rut en contexto:'+heredero?.rut);
  return (
    <>
                <div className="textoTituloComponentes">
                <span className="titleComponent">
                  Registrar persona heredera
                </span>
            </div>
     <div className='generalContainer'>
      <Stepper step={2} />
      </div>
    <div className="main-container">
      
      <div className="form-container">
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            {/* Sección de Datos Personales */}
            <div className="form-section">
              <div className="section-title">
              <img 
                src={ConsaludCore.DocumentsFileCheckmarkSvg} 
                alt="Datos personales"
                className="section-icon"
                style={{ width: '24px', height: '24px' }} 
              />
                <span>Datos personales</span>
              </div>
              <p className="description">
                Verifica que los datos de la persona heredera sean correctos, de lo contrario actualízalos.
              </p>

              <div className="form-row">
                {/* Fecha de nacimiento */}
                <div className="form-column">
                  <label>Fecha nacimiento</label>
                  <div className={`datepicker-wrapper ${errors.fechaNacimiento ? 'is-danger' : ''}`}>
                    <DatePicker
                      selected={formData.fechaNacimiento}
                      onChange={handleDateChange}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/AAAA"
                      className={`input ${errors.fechaNacimiento ? 'is-danger' : ''}`}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      maxDate={new Date()}
                      locale={es}
                    />
                    <div className="calendar-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                      </svg>
                    </div>
                  </div>
                  {errors.fechaNacimiento && (
                    <p className="help is-danger">{errors.fechaNacimiento}</p>
                  )}
                </div>

                {/* Nombres */}
                <div className="form-column">
                  <label>Nombres</label>
                  <input
                    className={`input ${errors.nombres ? 'is-danger' : ''}`}
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                  />
                  {errors.nombres && (
                    <p className="help is-danger">{errors.nombres}</p>
                  )}
                </div>

                {/* Apellido Paterno */}
                <div className="form-column">
                  <label>Apellido Paterno</label>
                  <input
                    className={`input ${errors.apellidoPaterno ? 'is-danger' : ''}`}
                    type="text"
                    name="apellidoPaterno"
                    value={formData.apellidoPaterno}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                  />
                  {errors.apellidoPaterno && (
                    <p className="help is-danger">{errors.apellidoPaterno}</p>
                  )}
                </div>

                {/* Apellido Materno */}
                <div className="form-column">
                  <label>Apellido Materno</label>
                  <input
                    className={`input ${errors.apellidoMaterno ? 'is-danger' : ''}`}
                    type="text"
                    name="apellidoMaterno"
                    value={formData.apellidoMaterno}
                    onChange={handleInputChange}
                    placeholder="Ingresar"
                  />
                  {errors.apellidoMaterno && (
                    <p className="help is-danger">{errors.apellidoMaterno}</p>
                  )}
                </div>

                {/* Sexo */}
                <div className="form-column">
                  <label>Sexo</label>
                  <div className={`select ${errors.sexo ? 'is-danger' : ''}`}>
                    <select
                      name="sexo"
                      value={formData.sexo}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Seleccionar</option>
                      {SEXO_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.sexo && (
                    <p className="help is-danger">{errors.sexo}</p>
                  )}
                </div>

                {/* Parentesco */}
                <div className="form-column">
                  <label>Parentesco</label>
                  <div className={`select ${errors.parentesco ? 'is-danger' : ''}`}>
                    <select
                      name="parentesco"
                      value={formData.parentesco}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Seleccionar</option>
                      {PARENTESCO_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.parentesco && (
                    <p className="help is-danger">{errors.parentesco}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="form-column">
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
                <div className="form-column">
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
              <img 
                src={ConsaludCore.MapsSvg} 
                alt="Datos personales"
                className="section-icon"
                style={{ width: '24px', height: '24px' }} 
              />
                <span>Dirección</span>
              </div>

              <div className="form-row">
                {/* Ciudad */}
                <div className="form-column">
                  <label>Ciudad</label>
                  <div className={`select ${errors.ciudad ? 'is-danger' : ''}`}>
                    <select
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleCiudadChange}
                    >
                      <option value="" disabled>Seleccionar</option>
                      {CIUDAD_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.ciudad && (
                    <p className="help is-danger">{errors.ciudad}</p>
                  )}
                </div>

                {/* Comuna */}
                <div className="form-column">
                  <label>Comuna</label>
                  <div className={`select ${errors.comuna ? 'is-danger' : ''}`}>
                    <select
                      name="comuna"
                      value={formData.comuna}
                      onChange={handleInputChange}
                      disabled={!formData.ciudad}
                    >
                      <option value="" disabled>Seleccionar</option>
                      {formData.ciudad && COMUNA_OPTIONS[formData.ciudad as keyof typeof COMUNA_OPTIONS]?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.comuna && (
                    <p className="help is-danger">{errors.comuna}</p>
                  )}
                </div>

                {/* Calle */}
                <div className="form-column">
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
                <div className="form-column">
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

                {/* Depto/Block (Opcional) */}
                <div className="form-column">
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
                <div className="form-column">
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
        </div>
      </div>
    </div>
    </>
  );
};

export default FormIngresoHeredero;