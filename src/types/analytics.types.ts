export interface HoraOcupacion {
    horaEtiqueta: string;
    totalClases: number;
    porcentajeOcupacion: number;
    estadoDemanda: 'PICO' | 'NORMAL' | 'BAJA';
    recomendacionEstrategica: string;
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

export interface AnalyticsDashboard {
    ocupacionGlobalPromedio: number;
    totalReservasConfirmadas: number;
    horaMasConcurrida: string;
    horaMenosConcurrida: string;
    ocupacionPorHorario: HoraOcupacion[];
    desempenoProfesores: ProfesorDesempeno[];
}
