interface Titular {
    id: number;
    rut: string;
    nombre: string;
    apellidoPat: string;
    apellidoMat: string;
    fechaDefuncion: string;
    poseeFondos: boolean;
    poseeSolicitud: boolean;
}

export type {
    Titular
}