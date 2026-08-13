import type { Usuario } from './usuario.types';
import type { Sede } from './sede.types';

export interface Clase {
    claseId: number;
    profesorId: number;
    sedeId: number;
    disciplina: string;
    descripcion: string;
    fechaHoraInicio: string;
    fechaHoraFin: string;
    cupoMaximo: number;
    cuposReservados: number;
    estado: string;
}

export interface ClaseCreate {
    profesorId: number;
    sedeId: number;
    disciplina: string;
    descripcion: string;
    fechaHoraInicio: string;
    fechaHoraFin: string;
    cupoMaximo: number;
}

export interface ClaseUpdate {
    claseId: number;
    profesorId: number;
    sedeId: number;
    disciplina: string;
    descripcion: string;
    fechaHoraInicio: string;
    fechaHoraFin: string;
    cupoMaximo: number;
}

export interface ClaseResponse extends Clase {
    profesor?: Usuario;
    sede?: Sede;
    sedeNombre?: string;
    profesorNombre?: string;
}
