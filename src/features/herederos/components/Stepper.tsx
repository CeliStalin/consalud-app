import { StepperProps } from "../interfaces/StepperProps";
import * as ConsaludCore from '@consalud/core';
import './styles/Stepper.css'

const Stepper = ({ step }: StepperProps) => {
  const steps = [
    { title: "Paso 1", description: "Datos del titular" },
    { title: "Paso 2", description: "Registrar persona heredera" },
    { title: "Paso 3", description: "Carga de documentos" },
    { title: "Paso 4", description: "Cuenta bancaria" },
  ];

  const renderCircle = (index: number) => {
    const isCompleted = index < step;
    const isActive = index === step - 1;
    return (
      <div
        className={`circle ${isCompleted ? 'completed' : 'incomplete'}${isActive ? ' circle-animate animate-pulse animate-ping' : ''}${isCompleted && !isActive ? ' animate-bounce' : ''}`}
      >
        {isCompleted && (
          <svg
            className={isActive ? 'animate-spin' : ''}
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4.83887 8.30114L6.76509 10.2274L6.75264 10.2149L11.0984 5.86914"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div
     className="containerStepper"
    >
      {/* Línea superior con los pasos */}
      <div
        className="lineStepper"
      >
        {steps.map((_, index) => (
          <div
            key={index}
            className="flexCenterRelative"
          >
            {renderCircle(index)}

            {/* Línea conectando al siguiente círculo */}
            {index < steps.length - 1 && (
              <div
                className={`progressLine duration-500${index < step - 1 ? ' active scale-110 opacity-100' : ' inactive opacity-0'}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: index < step - 1 ? '100%' : '100%',
                  height: "2px",
                  zIndex: 0,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: index < step - 1 ? "#00CBBF" : "#EEEEEE",
                  transition: 'background-color 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Textos debajo de los pasos */}
      <div
        className="stepperRow"
      >
        {steps.map((s, index) => (
          <div key={index} style={{ textAlign: "center", width: "100%" }}>
            <ConsaludCore.Typography 
              variant="bodySmall" 
              weight="bold" 
              style={{ fontSize: '0.875rem' }} 
              color={ConsaludCore.theme?.textColors?.primary || "#505050"}
              gutterBottom
            >
              {s.title}
            </ConsaludCore.Typography>
            <ConsaludCore.Typography 
              variant="caption" 
              style={{ fontSize: '0.75rem' }} 
              color={ConsaludCore.theme?.textColors?.muted || "#909090"}
            >
              {s.description}
            </ConsaludCore.Typography>
          </div>
        ))}
      </div>
    </div>
  );
};


export{
  Stepper
}