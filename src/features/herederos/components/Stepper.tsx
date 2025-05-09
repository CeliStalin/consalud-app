import { StepperProps } from "../interfaces/StepperProps";

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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="8" fill={isCompleted ? "#00CBBF" : "#D0D0D0"} />
          {isCompleted && (
            <path d="M4.83887 8.30114L6.76509 10.2274L6.75264 10.2149L11.0984 5.86914" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          )}
        </svg>
      );
    };
  
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '20px 40px',
        position: 'relative'
      }}>
        {steps.map((s, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
          }}>
            {renderCircle(index)}
  
            {index < steps.length - 1 && (
                <div style={{
                    width: '200px',
                    height: '2px',
                    backgroundColor: index < step - 1 ? '#00CBBF' : '#EEEEEE', 
                    marginLeft: '-1px'
                }}></div>
            )}
  
            <div style={{
              position: 'absolute',
              top: '28px',
              left: '7%',
              transform: 'translateX(-50%)',
              textAlign: 'center'
            }}>
              <div style={{
                fontWeight: 'bold',
                fontSize: '16px',
                color: '#505050'
              }}>
                {s.title}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#909090'
              }}>
                {s.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export { Stepper };