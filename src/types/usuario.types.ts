export interface Usuario {
    userId: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    rol: Rol;
    estado: Estado;
}

export enum Rol {
    ADMINISTRADOR = 'ADMINISTRADOR',
    PROFESOR = 'PROFESOR',
    CLIENTE = 'CLIENTE'
}

export enum Estado {
    ACTIVO = 'ACTIVO',
    INACTIVO = 'INACTIVO'
}

export interface UsuarioCreate {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    password?: string;
    rol: string;
}

export interface UsuarioUpdate {
    userId: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    rol: string;
}

export interface UsuarioResponse extends Usuario {}
