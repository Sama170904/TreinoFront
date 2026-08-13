export interface PaqueteCredito {
    creditoId: number;
    clienteId: number;
    creditosTotales: number;
    creditosDisponibles: number;
    vigenciaTipo: VigenciaTipo;
    fechaAsignacion: string;
    fechaExpiracion: string;
    estado: string;
}

export enum VigenciaTipo {
    SEMANAL = 'SEMANAL',
    MENSUAL = 'MENSUAL',
    TRIMESTRAL = 'TRIMESTRAL',
    SEMESTRAL = 'SEMESTRAL',
    ANUAL = 'ANUAL'
}

export interface CreditoAsignar {
    clienteId: number;
    cantidad: number;
    vigenciaTipo: string;
}

export interface CreditoQuitar {
    clienteId: number;
    cantidad: number;
}

export interface HistorialCredito {
    historialId: number;
    clienteId: number;
    reservaId?: number;
    cantidad: number;
    tipoMovimiento: TipoMovimiento;
    descripcion: string;
    fechaMovimiento: string;
}

export enum TipoMovimiento {
    ASIGNACION = 'ASIGNACION',
    CONSUMO_RESERVA = 'CONSUMO_RESERVA',
    DEVOLUCION_CANCELACION = 'DEVOLUCION_CANCELACION',
    EXPIRACION = 'EXPIRACION'
}
