import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import TreinoLogo from './TreinoLogo';

const Navbar: React.FC = () => {
    const { usuario, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!usuario) return null;

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Top Desktop & Tablet Header */}
            <header className="sticky top-0 w-full bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-sm z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        
                        {/* Brand Logo & Name */}
                        <div className="flex items-center gap-8">
                            <Link to="/" className="flex items-center gap-2 group">
                                <TreinoLogo size="sm" />
                            </Link>

                            {/* Navigation Links based on Role (Desktop) */}
                            <nav className="hidden md:flex items-center gap-1">
                                {usuario.rol === 'ADMINISTRADOR' && (
                                    <>
                                        <Link
                                            to="/admin"
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-label font-medium transition-colors ${
                                                isActive('/admin')
                                                    ? 'bg-primary-container text-primary font-bold'
                                                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">dashboard</span>
                                            <span>Dashboard</span>
                                        </Link>
                                        <Link
                                            to="/admin/sedes"
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-label font-medium transition-colors ${
                                                isActive('/admin/sedes')
                                                    ? 'bg-primary-container text-primary font-bold'
                                                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">storefront</span>
                                            <span>Sedes</span>
                                        </Link>
                                        <Link
                                            to="/admin/usuarios"
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-label font-medium transition-colors ${
                                                isActive('/admin/usuarios')
                                                    ? 'bg-primary-container text-primary font-bold'
                                                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">group</span>
                                            <span>Usuarios & Créditos</span>
                                        </Link>
                                    </>
                                )}

                                {(usuario.rol === 'PROFESOR' || usuario.rol === 'ADMINISTRADOR') && (
                                    <>
                                        <Link
                                            to="/teacher/clases"
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-label font-medium transition-colors ${
                                                isActive('/teacher/clases')
                                                    ? 'bg-primary-container text-primary font-bold'
                                                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">event_note</span>
                                            <span>Gestión Clases</span>
                                        </Link>
                                        <Link
                                            to="/teacher/check-in"
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-label font-medium transition-colors ${
                                                isActive('/teacher/check-in')
                                                    ? 'bg-primary-container text-primary font-bold'
                                                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">how_to_reg</span>
                                            <span>Pase de Lista</span>
                                        </Link>
                                    </>
                                )}

                                {usuario.rol === 'CLIENTE' && (
                                    <>
                                        <Link
                                            to="/clases"
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-label font-medium transition-colors ${
                                                isActive('/clases')
                                                    ? 'bg-primary-container text-primary font-bold'
                                                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">calendar_month</span>
                                            <span>Reservar Clases</span>
                                        </Link>
                                        <Link
                                            to="/mis-reservas"
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-label font-medium transition-colors ${
                                                isActive('/mis-reservas')
                                                    ? 'bg-primary-container text-primary font-bold'
                                                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">confirmation_number</span>
                                            <span>Mis Reservas</span>
                                        </Link>
                                        <Link
                                            to="/creditos"
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-label font-medium transition-colors ${
                                                isActive('/creditos')
                                                    ? 'bg-primary-container text-primary font-bold'
                                                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                                            <span>Mis Créditos</span>
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>

                        {/* Right User Controls */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
                            >
                                <div className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-sm">
                                    {usuario.email ? usuario.email.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="hidden sm:flex flex-col text-left">
                                    <span className="text-xs font-label font-semibold text-on-surface truncate max-w-[140px]">
                                        {usuario.email}
                                    </span>
                                    <span className="text-[10px] font-label font-bold text-primary uppercase tracking-wider">
                                        {usuario.rol}
                                    </span>
                                </div>
                            </Link>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                title="Cerrar Sesión"
                                className="p-2 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 text-sm font-medium"
                            >
                                <span className="material-symbols-outlined text-xl">logout</span>
                                <span className="hidden lg:inline text-xs">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Native Mobile Bottom Navigation Bar (Visible only on Mobile screens < 768px) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-lg border-t border-outline-variant shadow-lg px-2 py-1">
                <nav className="flex justify-around items-center h-14">
                    {usuario.rol === 'CLIENTE' && (
                        <>
                            <Link
                                to="/clases"
                                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-label font-semibold transition-colors ${
                                    isActive('/clases') ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">calendar_month</span>
                                <span>Clases</span>
                            </Link>
                            <Link
                                to="/mis-reservas"
                                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-label font-semibold transition-colors ${
                                    isActive('/mis-reservas') ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">confirmation_number</span>
                                <span>Reservas</span>
                            </Link>
                            <Link
                                to="/creditos"
                                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-label font-semibold transition-colors ${
                                    isActive('/creditos') ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                                <span>Créditos</span>
                            </Link>
                            <Link
                                to="/profile"
                                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-label font-semibold transition-colors ${
                                    isActive('/profile') ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">person</span>
                                <span>Perfil</span>
                            </Link>
                        </>
                    )}

                    {usuario.rol === 'PROFESOR' && (
                        <>
                            <Link
                                to="/teacher/clases"
                                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-label font-semibold transition-colors ${
                                    isActive('/teacher/clases') ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">event_note</span>
                                <span>Clases</span>
                            </Link>
                            <Link
                                to="/teacher/check-in"
                                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-label font-semibold transition-colors ${
                                    isActive('/teacher/check-in') ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">how_to_reg</span>
                                <span>Pase Lista</span>
                            </Link>
                            <Link
                                to="/profile"
                                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-label font-semibold transition-colors ${
                                    isActive('/profile') ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">person</span>
                                <span>Perfil</span>
                            </Link>
                        </>
                    )}

                    {usuario.rol === 'ADMINISTRADOR' && (
                        <>
                            <Link
                                to="/admin"
                                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-label font-semibold transition-colors ${
                                    isActive('/admin') ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">dashboard</span>
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                to="/admin/sedes"
                                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-label font-semibold transition-colors ${
                                    isActive('/admin/sedes') ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">storefront</span>
                                <span>Sedes</span>
                            </Link>
                            <Link
                                to="/admin/usuarios"
                                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-label font-semibold transition-colors ${
                                    isActive('/admin/usuarios') ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">group</span>
                                <span>Usuarios</span>
                            </Link>
                            <Link
                                to="/teacher/clases"
                                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-label font-semibold transition-colors ${
                                    isActive('/teacher/clases') ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">event_note</span>
                                <span>Clases</span>
                            </Link>
                            <Link
                                to="/profile"
                                className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-label font-semibold transition-colors ${
                                    isActive('/profile') ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">person</span>
                                <span>Perfil</span>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </>
    );
};

export default Navbar;
