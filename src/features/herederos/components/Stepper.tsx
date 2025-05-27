import { StepperProps } from "../interfaces/StepperProps";
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
    return (
      <div
      className={`circle ${isCompleted ? 'completed' : 'incomplete'}`}
      >
        {isCompleted && (
          <svg
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
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100%",
                  height: "2px",
                  backgroundColor: index < step - 1 ? "#00CBBF" : "#EEEEEE",
                  zIndex: 0,
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
            <div style={{ fontWeight: "bold", fontSize: "14px", color: "#505050" }}>
              {s.title}
            </div>
            <div style={{ fontSize: "12px", color: "#909090" }}>{s.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};


export{
  Stepper
}