import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, esAdmin } from '../store/useAuthStore';

interface Props {
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<Props> = ({ allowedRoles }) => {
    const { isAuthenticated, usuario } = useAuthStore();

    if (!isAuthenticated || !usuario || !usuario.rol) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const hasPermission = allowedRoles.includes(usuario.rol) || (allowedRoles.includes('ADMINISTRADOR') && esAdmin(usuario));
        
        if (!hasPermission) {
            // Evitar bucle infinito dirigiendo al home según su rol
            if (usuario.rol === 'ADMINISTRADOR') return <Navigate to="/admin" replace />;
            if (usuario.rol === 'PROFESOR') return <Navigate to="/teacher/clases" replace />;
            if (usuario.rol === 'CLIENTE') return <Navigate to="/clases" replace />;
            return <Navigate to="/login" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
