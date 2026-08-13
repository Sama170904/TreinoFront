import { create } from 'zustand';

export interface PayloadToken {
    userId: number;
    email: string;
    roles?: string[] | string;
    rol?: string;
}

export const decodificarToken = (token: string): PayloadToken | null => {
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return null;
        
        const payloadDecoded = atob(payloadBase64);
        const parsed = JSON.parse(payloadDecoded);
        
        const email = parsed.email || parsed.sub;
        if (!email) return null;

        let rol = parsed.rol;
        if (!rol && parsed.roles) {
            if (Array.isArray(parsed.roles)) {
                rol = parsed.roles[0];
            } else {
                rol = parsed.roles;
            }
        }

        const cleanRol = rol ? String(rol).replace('ROLE_', '') : undefined;

        return {
            userId: parsed.userId || 0,
            email,
            rol: cleanRol,
            roles: parsed.roles || (cleanRol ? [`ROLE_${cleanRol}`, cleanRol] : [])
        };
    } catch (e) {
        return null;
    }
};

export const esAdmin = (usuario: PayloadToken | null): boolean => {
    if (!usuario || !usuario.rol) return false;
    return usuario.rol === 'ADMINISTRADOR' || usuario.rol === 'ROLE_ADMINISTRADOR';
};

interface AuthState {
    token: string | null;
    usuario: PayloadToken | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const getInitialToken = () => localStorage.getItem('token');
const initialToken = getInitialToken();
const initialUsuario = initialToken ? decodificarToken(initialToken) : null;

// Si había un token guardado pero no se pudo decodificar o no tiene usuario/rol válido, limpiamos localStorage
if (initialToken && !initialUsuario) {
    localStorage.removeItem('token');
}

export const useAuthStore = create<AuthState>((set) => ({
    token: initialUsuario ? initialToken : null,
    usuario: initialUsuario,
    isAuthenticated: !!initialUsuario,
    login: (token: string) => {
        const decoded = decodificarToken(token);
        if (decoded) {
            localStorage.setItem('token', token);
            set({
                token,
                usuario: decoded,
                isAuthenticated: true
            });
        } else {
            localStorage.removeItem('token');
            set({
                token: null,
                usuario: null,
                isAuthenticated: false
            });
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        set({
            token: null,
            usuario: null,
            isAuthenticated: false
        });
    }
}));
