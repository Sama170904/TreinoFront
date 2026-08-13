export interface HoraOcupacion {
    horaEtiqueta: string;
    totalClases: number;
    porcentajeOcupacion: number;
    estadoDemanda: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface ProfesorDesempeno {
    profesorId: number;
    nombreProfesor: string;
    clasesDictadas: number;
    porcentajeLlenado: number;
    totalReservas: number;
    porcentajeNoShow: number;
    porcentajeAsistencia: number;
    alumnosUnicosAtendidos: number;
}

export interface AlumnoRiesgo {
    clienteId: number;
    nombreCliente: string;
    email: string;
    telefono: string;
    diasSinEntrenar: number;
    fechaUltimaClase: string;
    disciplinaUltimaClase: string;
    creditosDisponibles: number;
    nivelRiesgo: 'MEDIO' | 'ALTO';
    enlaceWhatsAppDirecto: string;
}

export interface AnalyticsDashboard {
    ocupacionGlobalPromedio: number;
    totalReservasConfirmadas: number;
    horaMasConcurrida: string;
    horaMenosConcurrida: string;
    ocupacionPorHorario: HoraOcupacion[];
    desempenoProfesores: ProfesorDesempeno[];
    alumnosEnRiesgo: AlumnoRiesgo[];
}
