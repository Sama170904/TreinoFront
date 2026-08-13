import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';
import { sedeService } from '../services/sedeService';
import { claseService } from '../services/claseService';

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState({
        totalClients: 0,
        totalSedes: 0,
        totalClases: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardStats = async () => {
            try {
                const usuarios = await usuarioService.getAll();
                const sedes = await sedeService.getAll();
                const clases = await claseService.getAll();

                setStats({
                    totalClients: Array.isArray(usuarios) ? usuarios.length : 0,
                    totalSedes: Array.isArray(sedes) ? sedes.length : 0,
                    totalClases: Array.isArray(clases) ? clases.length : 0
                });
            } catch (err) {
                console.error('Error cargando métricas:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardStats();
    }, []);

    return (
        <div className="min-h-screen bg-surface-container-high p-6 lg:p-10 font-body text-on-surface">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight">
                            Panel de Administración
                        </h1>
                        <p className="text-on-surface-variant text-sm mt-1">
                            Supervisión general del estudio, sedes, instructores y paquetes de créditos.
                        </p>
                    </div>
                </div>

                {/* KPI Overview Section */}
                <section>
                    <h2 className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                        Resumen Operativo
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* KPI 1: Usuarios */}
                        <div className="bg-surface rounded-xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <p className="font-label text-on-surface-variant font-semibold text-sm">Usuarios Registrados</p>
                                <span className="material-symbols-outlined text-primary bg-primary-container p-2 rounded-xl">group</span>
                            </div>
                            <div className="flex items-end gap-3">
                                <h3 className="text-3xl font-headline font-extrabold text-slate-900">
                                    {isLoading ? '...' : stats.totalClients}
                                </h3>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">trending_up</span> Activos
                                </span>
                            </div>
                        </div>

                        {/* KPI 2: Sedes */}
                        <div className="bg-surface rounded-xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <p className="font-label text-on-surface-variant font-semibold text-sm">Sedes Operativas</p>
                                <span className="material-symbols-outlined text-primary bg-primary-container p-2 rounded-xl">storefront</span>
                            </div>
                            <div className="flex items-end gap-3">
                                <h3 className="text-3xl font-headline font-extrabold text-slate-900">
                                    {isLoading ? '...' : stats.totalSedes}
                                </h3>
                            </div>
                        </div>

                        {/* KPI 3: Clases */}
                        <div className="bg-surface rounded-xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <p className="font-label text-on-surface-variant font-semibold text-sm">Clases Programadas</p>
                                <span className="material-symbols-outlined text-primary bg-primary-container p-2 rounded-xl">event_available</span>
                            </div>
                            <div className="flex items-end gap-3">
                                <h3 className="text-3xl font-headline font-extrabold text-slate-900">
                                    {isLoading ? '...' : stats.totalClases}
                                </h3>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Actions Grid */}
                <section>
                    <h2 className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                        Acciones Rápidas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* Manage Users & Credits */}
                        <Link to="/admin/usuarios" className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant hover:border-primary/50 transition-all group hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">manage_accounts</span>
                                </div>
                                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
                            </div>
                            <h3 className="font-headline font-bold text-lg text-slate-900 mb-1">Gestión de Usuarios & Créditos</h3>
                            <p className="text-sm text-on-surface-variant font-body">Crear nuevos clientes/profesores, consultar información y asignar o quitar paquetes de créditos.</p>
                        </Link>

                        {/* Manage Venues */}
                        <Link to="/admin/sedes" className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant hover:border-primary/50 transition-all group hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">location_city</span>
                                </div>
                                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
                            </div>
                            <h3 className="font-headline font-bold text-lg text-slate-900 mb-1">Gestión de Sedes</h3>
                            <p className="text-sm text-on-surface-variant font-body">Crear y actualizar sucursales del estudio, dirección física y capacidad de alumnos por sede.</p>
                        </Link>

                        {/* Manage Classes */}
                        <Link to="/teacher/clases" className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant hover:border-primary/50 transition-all group hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">calendar_add_on</span>
                                </div>
                                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
                            </div>
                            <h3 className="font-headline font-bold text-lg text-slate-900 mb-1">Programación de Clases</h3>
                            <p className="text-sm text-on-surface-variant font-body">Crear nuevas sesiones, asignar instructores, fijar cupos máximos y definir disciplinas.</p>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
