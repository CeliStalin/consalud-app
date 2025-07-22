import { StepperProps } from "../interfaces/StepperProps";
import * as ConsaludCore from '@consalud/core';
import './styles/Stepper.css'
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StepperContextType {
  step: number;
  setStep: (step: number) => void;
}

const StepperContext = createContext<StepperContextType | undefined>(undefined);

export const StepperProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState(1);
  return (
    <StepperContext.Provider value={{ step, setStep }}>
      {children}
    </StepperContext.Provider>
  );
};

export const useStepper = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper debe usarse dentro de StepperProvider');
  }
  return context;
};

interface StepperPropsWithLoading extends StepperProps {
  loadingTransition?: boolean;
}

const Stepper = ({ step, loadingTransition = false }: StepperPropsWithLoading) => {
  const steps = [
    { title: "Paso 1", description: "Datos del titular" },
    { title: "Paso 2", description: "Registrar persona heredera" },
    { title: "Paso 3", description: "Carga de documentos" },
    { title: "Paso 4", description: "Cuenta bancaria" },
  ];

  // Estado para animar el llenado de la barra entre el paso anterior y el actual
  const [progressWidths, setProgressWidths] = useState(Array(steps.length - 1).fill('0%'));
  const prevStep = React.useRef(step);

  React.useEffect(() => {
    // Si el step avanza, animar la barra correspondiente
    if (step > prevStep.current) {
      setProgressWidths((prev) => prev.map((w, i) => {
        if (i === step - 2) return '100%'; // Solo la barra del paso recién avanzado
        if (i < step - 2) return '100%'; // Barras previas ya completas
        return w;
      }));
    } else if (step < prevStep.current) {
      setProgressWidths((prev) => prev.map((w, i) => {
        if (i === step - 1) return '0%'; // Solo la barra que retrocede
        if (i < step - 1) return '100%'; // Barras previas ya completas
        return w;
      }));
    }
    prevStep.current = step;
  }, [step]);

  React.useEffect(() => {
    // Al montar, si el step es 1, todas las barras en 0%
    if (step === 1) {
      setProgressWidths(Array(steps.length - 1).fill('0%'));
    }
  }, [step, steps.length]);

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
                className={`progressLine duration-500${index < step - 1 ? ' active scale-110 opacity-100' : ' inactive opacity-0'}${loadingTransition && index === step - 2 ? ' shimmer-green' : ''}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: progressWidths[index],
                  height: "2px",
                  zIndex: 0,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: index < step - 1 ? "#00CBBF" : "#EEEEEE",
                  transition: 'background-color 1s cubic-bezier(0.34, 1.56, 0.64, 1), width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
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