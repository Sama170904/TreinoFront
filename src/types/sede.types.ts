export interface Sede {
    sedeId: number;
    nombre: string;
    direccion: string;
    capacidadMaxima: number;
    estado: string;
}

export interface SedeCreate {
    nombre: string;
    direccion: string;
    capacidadMaxima: number;
}

export interface SedeUpdate {
    sedeId: number;
    nombre: string;
    direccion: string;
    capacidadMaxima: number;
}

export interface SedeResponse extends Sede {}
