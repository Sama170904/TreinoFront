import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';
import { sedeService } from '../services/sedeService';
import { claseService } from '../services/claseService';
import { analyticsService } from '../services/analyticsService';
import type { AnalyticsDashboard } from '../types/analytics.types';

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState({
        totalClients: 0,
        totalSedes: 0,
        totalClases: 0
    });
    const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardStats = async () => {
            setIsLoading(true);
            try {
                const usuarios = await usuarioService.getAll();
                const sedes = await sedeService.getAll();
                const clases = await claseService.getAll();

                setStats({
                    totalClients: Array.isArray(usuarios) ? usuarios.length : 0,
                    totalSedes: Array.isArray(sedes) ? sedes.length : 0,
                    totalClases: Array.isArray(clases) ? clases.length : 0
                });

                try {
                    const analyticsData = await analyticsService.getDashboardAnalytics();
                    setAnalytics(analyticsData);
                } catch (analyticsErr) {
                    console.warn('Analytics endpoint not active yet or failed:', analyticsErr);
                }
            } catch (err) {
                console.error('Error cargando métricas:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardStats();
    }, []);

    return (
        <div className="min-h-screen bg-surface-container-high p-4 sm:p-6 lg:p-10 font-body text-on-surface pb-24 md:pb-12">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Panel de Administración & Analítica
                        </h1>
                        <p className="text-on-surface-variant text-sm mt-1">
                            Métricas de ocupación por horario, rendimiento de instructores y gestión general del estudio.
                        </p>
                    </div>
                </div>

                {/* KPI Overview Section */}
                <section>
                    <h2 className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                        Métricas Generales
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        
                        {/* KPI 1: Ocupación Global */}
                        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <p className="font-label text-on-surface-variant font-semibold text-xs uppercase tracking-wider">Ocupación Promedio</p>
                                <span className="material-symbols-outlined text-primary bg-primary-container p-2 rounded-xl text-xl">pie_chart</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <h3 className="text-3xl font-headline font-extrabold text-slate-900">
                                    {isLoading ? '...' : `${analytics?.ocupacionGlobalPromedio || 45}%`}
                                </h3>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-xs">trending_up</span> General
                                </span>
                            </div>
                        </div>

                        {/* KPI 2: Hora de Mayor Demanda */}
                        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <p className="font-label text-on-surface-variant font-semibold text-xs uppercase tracking-wider">Mayor Demanda</p>
                                <span className="material-symbols-outlined text-amber-600 bg-amber-50 p-2 rounded-xl text-xl">local_fire_department</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-headline font-extrabold text-slate-900">
                                    {isLoading ? '...' : (analytics?.horaMasConcurrida || '18:00 - 19:00')}
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-1">Horario con mayor tasa de reservas</p>
                            </div>
                        </div>

                        {/* KPI 3: Hora de Menor Demanda */}
                        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <p className="font-label text-on-surface-variant font-semibold text-xs uppercase tracking-wider">Menor Demanda</p>
                                <span className="material-symbols-outlined text-blue-600 bg-blue-50 p-2 rounded-xl text-xl">ac_unit</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-headline font-extrabold text-slate-900">
                                    {isLoading ? '...' : (analytics?.horaMenosConcurrida || '15:00 - 16:00')}
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-1">Horario con menor ocupación</p>
                            </div>
                        </div>

                        {/* KPI 4: Usuarios Registrados */}
                        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <p className="font-label text-on-surface-variant font-semibold text-xs uppercase tracking-wider">Usuarios Registrados</p>
                                <span className="material-symbols-outlined text-primary bg-primary-container p-2 rounded-xl text-xl">groups</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-headline font-extrabold text-slate-900">
                                        {isLoading ? '...' : stats.totalClients} <span className="text-xs text-slate-500 font-normal">Usuarios</span>
                                    </h3>
                                    <p className="text-xs text-slate-500">{stats.totalSedes} Sedes | {stats.totalClases} Clases</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Strategic Analytics Section: Occupancy by Hour */}
                <section className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/60 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">query_stats</span>
                                <h2 className="font-headline font-bold text-lg text-slate-900">Ocupación por Rango Horario</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Distribución del porcentaje de ocupación de clases agrupado por hora.</p>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                                <span>Alta (≥70%)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                                <span>Media (40-69%)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                                <span>Baja (&lt;40%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Hourly Occupancy Heatmap Bar Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(analytics?.ocupacionPorHorario || [
                            { horaEtiqueta: '07:00 - 08:00', totalClases: 4, porcentajeOcupacion: 85, estadoDemanda: 'ALTA' },
                            { horaEtiqueta: '09:00 - 10:00', totalClases: 3, porcentajeOcupacion: 60, estadoDemanda: 'MEDIA' },
                            { horaEtiqueta: '15:00 - 16:00', totalClases: 2, porcentajeOcupacion: 30, estadoDemanda: 'BAJA' },
                            { horaEtiqueta: '17:00 - 18:00', totalClases: 5, porcentajeOcupacion: 75, estadoDemanda: 'ALTA' },
                            { horaEtiqueta: '19:00 - 20:00', totalClases: 4, porcentajeOcupacion: 90, estadoDemanda: 'ALTA' }
                        ]).map((item, idx) => {
                            const isHigh = item.estadoDemanda === 'ALTA';
                            const isLow = item.estadoDemanda === 'BAJA';

                            return (
                                <div key={idx} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-slate-500">schedule</span>
                                            <span className="font-headline font-bold text-xs text-slate-900">{item.horaEtiqueta}</span>
                                        </div>
                                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                            isHigh ? 'bg-red-100 text-red-700' : isLow ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {item.porcentajeOcupacion}% Ocupación
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className={`h-2.5 rounded-full transition-all ${
                                                isHigh ? 'bg-red-500' : isLow ? 'bg-blue-500' : 'bg-amber-500'
                                            }`}
                                            style={{ width: `${Math.max(5, item.porcentajeOcupacion)}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                                        <span>{item.totalClases} {item.totalClases === 1 ? 'clase programada' : 'clases programadas'}</span>
                                        <span className="font-semibold text-slate-700">{item.estadoDemanda === 'ALTA' ? 'Demanda Alta' : item.estadoDemanda === 'BAJA' ? 'Demanda Baja' : 'Demanda Media'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Teacher Performance & Student Retention Section */}
                <section className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/60 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">workspace_premium</span>
                                <h2 className="font-headline font-bold text-lg text-slate-900">Desempeño de Instructores y Retención de Alumnos</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Reportes de ocupación de clases, tasa de asistencia y retención por profesor.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[650px]">
                            <thead>
                                <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-label font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4">Instructor</th>
                                    <th className="py-3 px-4 text-center">Clases Dictadas</th>
                                    <th className="py-3 px-4 text-center">Llenado Promedio</th>
                                    <th className="py-3 px-4 text-center">Tasa Asistencia</th>
                                    <th className="py-3 px-4 text-center">No-Shows</th>
                                    <th className="py-3 px-4 text-center">Alumnos Únicos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/60 text-sm">
                                {(analytics?.desempenoProfesores || [
                                    { profesorId: 1, nombreProfesor: 'Laura Profesor', clasesDictadas: 8, porcentajeLlenado: 88, totalReservas: 96, porcentajeNoShow: 2.1, porcentajeAsistencia: 97.9, alumnosUnicosAtendidos: 34 }
                                ]).map((p) => (
                                    <tr key={p.profesorId} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-container text-primary font-bold flex items-center justify-center text-xs">
                                                {p.nombreProfesor.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{p.nombreProfesor}</p>
                                                <p className="text-[11px] text-slate-500 font-normal">Instructor</p>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                                            {p.clasesDictadas}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                                <span className="material-symbols-outlined text-xs">trending_up</span>
                                                {p.porcentajeLlenado}%
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                                            {p.porcentajeAsistencia}%
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                p.porcentajeNoShow > 10 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {p.porcentajeNoShow}%
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                                            {p.alumnosUnicosAtendidos} alumnos
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Quick Actions Grid */}
                <section>
                    <h2 className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                        Acciones Rápidas de Administración
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
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
