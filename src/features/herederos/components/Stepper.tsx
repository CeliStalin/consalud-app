import { StepperProps } from "../interfaces/StepperProps";
import * as ConsaludCore from '@consalud/core';
import './styles/Stepper.css';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import CheckIcon from '@/assets/check-icon.svg';

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

interface StepperPropsWithLoading extends StepperProps {}

const Stepper: React.FC<StepperPropsWithLoading> = ({ step }) => {
  const steps = [
    { title: "Paso 1", description: "Datos del titular" },
    { title: "Paso 2", description: "Registrar persona heredera" },
    { title: "Paso 3", description: "Carga de documentos" },
    { title: "Paso 4", description: "Cuenta bancaria" },
  ];

  const renderCircle = (index: number) => {
    const isCompleted = index < step - 1;
    const isActive = index === step - 1;
    
    return (
      <div
        className={`stepper-circle${isCompleted ? ' completed' : ''}${isActive ? ' active' : ''}`}
      >
        {isCompleted && <img src={CheckIcon} alt="Completado" />}
      </div>
    );
  };

  const renderProgressLine = (index: number) => {
    if (index >= steps.length - 1) return null;
    
    return (
      <div className={`progressLine${index < step - 1 ? ' active' : ''}`} />
    );
  };

  const renderStepText = (stepData: { title: string; description: string }) => (
    <div className="stepText">
      <ConsaludCore.Typography
        variant="bodySmall"
        weight="bold"
        className="stepTitle"
        color={ConsaludCore.theme?.textColors?.primary || "#505050"}
        gutterBottom
      >
        {stepData.title}
      </ConsaludCore.Typography>
      <ConsaludCore.Typography
        variant="caption"
        className="stepDescription"
        color={ConsaludCore.theme?.textColors?.muted || "#909090"}
      >
        {stepData.description}
      </ConsaludCore.Typography>
    </div>
  );

  return (
    <div className="containerStepper">
      <div className="lineStepper">
        {steps.map((_, index) => (
          <div key={index} className="flexCenterRelative">
            {renderCircle(index)}
            {renderProgressLine(index)}
          </div>
        ))}
      </div>
      <div className="stepperRow">
        {steps.map((stepData, index) => (
          <div key={index} className="flexCenterRelative">
            {renderStepText(stepData)}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Stepper };