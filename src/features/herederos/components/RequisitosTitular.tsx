import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import * as ConsaludCore from '@consalud/core';
import { useTitular } from '../contexts/TitularContext';
import RequisitosIcon from '@/assets/requisitos.svg';
import CheckIcon from '@/assets/check-requisitos.svg';
import './styles/RequisitosTitular.css';

const RequisitosTitular: React.FC = () => {
  const navigator = useNavigate();
  const { titular, loading, buscarTitular } = useTitular();
  const renderCount = useRef(0);
  renderCount.current++;

  useEffect(() => {
    if (!loading && (!titular || !titular.nombre || !titular.apellidoPat)) {
      const rutSession = sessionStorage.getItem('rutTitular');
      if (rutSession) {
        buscarTitular(rutSession).catch(() => {
          console.error('No se pudo recuperar los datos del titular.');
        });
      } else {
        console.error('No se encontró información del titular.');
      }
    }
  }, [titular, loading, buscarTitular]);

  const renderRequirementItem = (text: string, description?: string) => (
    <li className="requirementItem">
      <img src={CheckIcon} width={20} height={20} alt="Check" className="checkIcon" />
      <div className="requirementTextContainer">
        <ConsaludCore.Typography variant="body" className="requirementFullText">
          <span className="requirementBold">{text}</span>
          {description && <span className="requirementNormal"> {description}</span>}
        </ConsaludCore.Typography>
      </div>
    </li>
  );

  return (
    <div className="route-container layout-stable">
      {/* Fallback visual si faltan campos */}
      {(!titular?.nombre || !titular?.apellidoPat) && (
        <div className="has-text-danger warningMessage">
          <b>Advertencia:</b> Faltan datos del titular (nombre o apellidoPat). Verifica el mapeo de
          datos.
        </div>
      )}

      {/* Header Section */}
      <div className="headerSection">
        <div className="headerContent">
          {/* Breadcrumb */}
          <div className="breadcrumbContainer">
            <ConsaludCore.Breadcrumb
              items={[{ label: 'Administración devolución herederos' }]}
              separator={<span>{'>'}</span>}
              showHome={true}
              className="breadcrumb-custom"
            />
          </div>
          {/* Botón volver */}
          <div className="backButtonContainer">
            <button
              className="back-button"
              onClick={() => navigator(-1)}
              aria-label="Volver a la página anterior"
            >
              <span className="back-button-icon">←</span> Volver
            </button>
          </div>
        </div>
      </div>

      {/* Título fuera de la Card */}
      <div className="titleSection">
        <ConsaludCore.Typography
          variant="h5"
          component="h2"
          weight={600}
          className="titleComponent"
        >
          Requisitos
        </ConsaludCore.Typography>
      </div>

      {/* Card centrado con Bulma */}
      <div className="cardContainer">
        <ConsaludCore.Card
          variant="elevated"
          padding={undefined}
          className="card-elevated ingreso-card animate-fade-in-up p-6 requisitosCard"
        >
          <div className="cardContent">
            {/* Icono y subtítulo */}
            <div className="iconSubtitleSection">
              <div className="iconTitleContainer">
                <img
                  src={RequisitosIcon}
                  width={24}
                  height={24}
                  alt="Ícono requisitos"
                  className="requisitosIcon"
                />
                <ConsaludCore.Typography variant="body" className="iconTitle">
                  Requisitos
                </ConsaludCore.Typography>
              </div>
              <ConsaludCore.Typography variant="bodySmall" className="subtitleText">
                Antes de comenzar, verifica que la persona heredera tenga lo siguiente:
              </ConsaludCore.Typography>
              <ul className="requirementsList">
                {renderRequirementItem('Cédula de identidad vigente.')}
                {renderRequirementItem(
                  'Posesión efectiva',
                  'que acredite su condición de heredero.'
                )}
                {renderRequirementItem(
                  'Poder notarial válido',
                  'para actuar en representación del titular.'
                )}
              </ul>
            </div>
            <div className="buttonSection">
              <button
                className={`button is-primary is-rounded proceso-button animate-fade-in-up${loading ? ' is-loading-custom' : ''}`}
                onClick={() => navigator('/mnherederos/ingresoher/DatosTitular')}
                type="button"
                aria-label="Continuar"
                disabled={loading}
              >
                <ConsaludCore.Typography variant="button" color="#fff" className="buttonText">
                  Continuar
                </ConsaludCore.Typography>
              </button>
            </div>
          </div>
        </ConsaludCore.Card>
      </div>
    </div>
  );
};

export { RequisitosTitular };
