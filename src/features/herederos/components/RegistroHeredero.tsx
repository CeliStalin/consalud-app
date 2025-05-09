import { Stepper } from "./Stepper";

const RegistroHeredero = () => {
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '32px' }}>
                <span style={{
                    fontFamily: 'Work Sans',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#505050'
                }}>
                    Registrar persona heredera
                </span>
            </div>

            <Stepper step={2} />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 32px',
                marginTop: '40px',
            }}>
                <div style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '32px',
                    width: '600px',
                    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M16.3346 21.0043H4.66379C3.7424 21.0043 2.99609 20.258 2.99609 19.3366V7.66574C2.99609 6.74436 3.7424 5.99805 4.66379 5.99805H16.3356C17.256 5.99805 18.0023 6.74436 18.0023 7.66574V19.3376C18.0023 20.258 17.256 21.0043 16.3346 21.0043Z" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12.2682 10.1643C13.2446 11.1407 13.2446 12.7244 12.2682 13.7018C11.2918 14.6782 9.70813 14.6782 8.73073 13.7018C7.75332 12.7254 7.75432 11.1417 8.73073 10.1643C9.70713 9.18691 11.2908 9.18791 12.2682 10.1643" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M15.0008 18.4362C14.8698 18.107 14.6667 17.8109 14.4066 17.5698V17.5698C13.9674 17.1616 13.3922 16.9355 12.7919 16.9355C11.7915 16.9355 9.20641 16.9355 8.20599 16.9355C7.60574 16.9355 7.0315 17.1626 6.59132 17.5698V17.5698C6.33121 17.8109 6.12812 18.107 5.99707 18.4362" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5.99707 5.99734V4.66379C5.99707 3.7424 6.74338 2.99609 7.66476 2.99609H19.3366C20.257 2.99609 21.0033 3.7424 21.0033 4.66379V16.3356C21.0033 17.256 20.257 18.0023 19.3356 18.0023H18.0021" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                        <p style={{ fontFamily: 'Work Sans', fontSize: '16px', fontWeight: 500, color: '#505050' }}>
                            Registrar persona heredera
                        </p>
                    </div>
                    <p style={{ fontSize: '14px', color: '#656565', fontFamily: 'Source Sans Pro',alignSelf:"flex-start" }}>
                        Ingresa los datos de la persona heredera para la devolución.
                    </p>
                    <span style={{ fontSize: '14px', fontWeight:500, color: '#808080', fontFamily: 'Work Sans',alignSelf:"flex-start", marginBottom: '-25px' }}>
                        RUT persona heredera
                    </span>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}>
                        <input
                            id="RutHeredero"
                            type="text"
                            placeholder="RUT persona heredera"
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                borderRadius: '24px',
                                border: '1px solid #D0D5DD',
                                fontSize: '16px',
                                fontFamily: 'Work Sans',
                                outline: 'none',
                            }}
                        />
                        <button style={{
                            backgroundColor: '#B1EAEA',
                            color: '#009EA6',
                            border: 'none',
                            borderRadius: '24px',
                            padding: '12px 24px',
                            fontWeight: 600,
                            fontSize: '16px',
                            cursor: 'pointer',
                            boxShadow: '0px 2px 14px 4px rgba(208, 208, 208, 0.35)'
                        }} disabled >
                            Buscar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export { RegistroHeredero };
