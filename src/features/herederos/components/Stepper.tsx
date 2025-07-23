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

const Stepper: React.FC<StepperPropsWithLoading> = ({ step, loadingTransition = false }) => {
  const steps = [
    { title: "Paso 1", description: "Datos del titular" },
    { title: "Paso 2", description: "Registrar persona heredera" },
    { title: "Paso 3", description: "Carga de documentos" },
    { title: "Paso 4", description: "Cuenta bancaria" },
  ];

  // Estado para animar el llenado de la barra entre el paso anterior y el actual
  const [progressWidths, setProgressWidths] = useState<string[]>(Array(steps.length - 1).fill('0%'));
  const prevStep = React.useRef(step);

  React.useEffect(() => {
    if (step > prevStep.current) {
      setProgressWidths((prev) => prev.map((w, i) => {
        if (i === step - 2) return '100%';
        if (i < step - 2) return '100%';
        return w;
      }));
    } else if (step < prevStep.current) {
      setProgressWidths((prev) => prev.map((w, i) => {
        if (i === step - 1) return '0%';
        if (i < step - 1) return '100%';
        return w;
      }));
    }
    prevStep.current = step;
  }, [step]);

  React.useEffect(() => {
    if (step === 1) {
      setProgressWidths(Array(steps.length - 1).fill('0%'));
    }
  }, [step, steps.length]);

  const renderCircle = (index: number) => {
    const isCompleted = index < step - 1;
    const isActive = index === step - 1;
    return (
      <div
        className={`stepper-circle${isCompleted ? ' completed' : ''}${isActive ? ' active' : ''}`}
      >
        {isCompleted && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
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
    <div className="containerStepper">
      <div className="lineStepper">
        {steps.map((_, index) => (
          <div key={index} className="flexCenterRelative" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {renderCircle(index)}
            {index < steps.length - 1 && (
              <div
                className={`progressLine${index < step - 1 ? ' active' : ''}`}
                style={{
                  width: 'calc(100% - 24px)', // 24px es el diámetro del círculo
                  backgroundColor: index < step - 1 ? '#00CBBF' : '#EEEEEE',
                  height: 2,
                  position: 'absolute',
                  top: '50%',
                  left: 'calc(50% + 12px)', // 12px es el radio del círculo, para empezar justo al borde derecho
                  zIndex: 0,
                  transform: 'translateY(-50%)',
                  transition: 'background-color 0.5s, width 0.5s',
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="stepperRow">
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