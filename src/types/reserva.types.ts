import type { ClaseResponse } from './clase.types';
import type { UsuarioResponse } from './usuario.types';

export interface Reserva {
    reservaId: number;
    clienteId: number;
    claseId: number;
    fechaReserva: string;
    estadoReserva: EstadoReserva;
    estadoAsistencia: EstadoAsistencia;
    estado: string;
}

export enum EstadoReserva {
    CONFIRMADA = 'CONFIRMADA',
    CANCELADA_TIEMPO = 'CANCELADA_TIEMPO',
    CANCELADA_FUERA_TIEMPO = 'CANCELADA_FUERA_TIEMPO'
}

export enum EstadoAsistencia {
    PENDIENTE = 'PENDIENTE',
    ASISTIO = 'ASISTIO',
    NO_SHOW = 'NO_SHOW'
}

export interface ReservaCreate {
    claseId: number;
}

export interface ReservaResponse extends Reserva {
    clase?: ClaseResponse;
    cliente?: UsuarioResponse;
}
