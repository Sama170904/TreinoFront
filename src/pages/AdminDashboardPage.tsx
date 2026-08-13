import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';
import { sedeService } from '../services/sedeService';
import { claseService } from '../services/claseService';
import { analyticsService } from '../services/analyticsService';
import type { AnalyticsDashboard, AlumnoRiesgo } from '../types/analytics.types';

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState({
        totalClients: 0,
        totalSedes: 0,
        totalClases: 0
    });
    const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
    const [alumnosRiesgo, setAlumnosRiesgo] = useState<AlumnoRiesgo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Interactive View Mode Toggles for Executive Clean UX
    const [occupancyViewMode, setOccupancyViewMode] = useState<'chart' | 'cards'>('chart');
    const [teacherViewMode, setTeacherViewMode] = useState<'chart' | 'table'>('table');

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
                setAlumnosRiesgo(analyticsData.alumnosEnRiesgo || []);
            } catch (analyticsErr) {
                console.warn('Analytics endpoint not active yet or failed:', analyticsErr);
            }
        } catch (err) {
            console.error('Error cargando métricas:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const handleArchivar = async (clienteId: number) => {
        try {
            await analyticsService.archivarAlumnoRiesgo(clienteId);
            setAlumnosRiesgo(prev => prev.filter(a => a.clienteId !== clienteId));
        } catch (err) {
            console.error('Error al archivar alumno en riesgo:', err);
        }
    };

    const hourlyData = analytics?.ocupacionPorHorario || [
        { horaEtiqueta: '06:00 - 07:00', totalClases: 2, porcentajeOcupacion: 40, estadoDemanda: 'MEDIA' },
        { horaEtiqueta: '07:00 - 08:00', totalClases: 4, porcentajeOcupacion: 85, estadoDemanda: 'ALTA' },
        { horaEtiqueta: '08:00 - 09:00', totalClases: 3, porcentajeOcupacion: 70, estadoDemanda: 'ALTA' },
        { horaEtiqueta: '09:00 - 10:00', totalClases: 3, porcentajeOcupacion: 60, estadoDemanda: 'MEDIA' },
        { horaEtiqueta: '10:00 - 11:00', totalClases: 2, porcentajeOcupacion: 35, estadoDemanda: 'BAJA' },
        { horaEtiqueta: '11:00 - 12:00', totalClases: 1, porcentajeOcupacion: 20, estadoDemanda: 'BAJA' },
        { horaEtiqueta: '15:00 - 16:00', totalClases: 2, porcentajeOcupacion: 30, estadoDemanda: 'BAJA' },
        { horaEtiqueta: '16:00 - 17:00', totalClases: 3, porcentajeOcupacion: 50, estadoDemanda: 'MEDIA' },
        { horaEtiqueta: '17:00 - 18:00', totalClases: 5, porcentajeOcupacion: 75, estadoDemanda: 'ALTA' },
        { horaEtiqueta: '18:00 - 19:00', totalClases: 4, porcentajeOcupacion: 90, estadoDemanda: 'ALTA' },
        { horaEtiqueta: '19:00 - 20:00', totalClases: 4, porcentajeOcupacion: 85, estadoDemanda: 'ALTA' },
        { horaEtiqueta: '20:00 - 21:00', totalClases: 2, porcentajeOcupacion: 45, estadoDemanda: 'MEDIA' }
    ];

    const teacherData = analytics?.desempenoProfesores || [
        { profesorId: 1, nombreProfesor: 'Laura Profesor', clasesDictadas: 8, porcentajeLlenado: 88, totalReservas: 96, porcentajeNoShow: 2.1, porcentajeAsistencia: 97.9, alumnosUnicosAtendidos: 34 },
        { profesorId: 2, nombreProfesor: 'Carlos Ruiz', clasesDictadas: 6, porcentajeLlenado: 72, totalReservas: 60, porcentajeNoShow: 5.0, porcentajeAsistencia: 95.0, alumnosUnicosAtendidos: 22 }
    ];

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
                            Supervisión ejecutiva de ocupación por horario, retención por WhatsApp y rendimiento general.
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

                        {/* KPI 2: Alumnos en Riesgo */}
                        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-amber-200 bg-amber-50/30 hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <p className="font-label text-amber-900 font-semibold text-xs uppercase tracking-wider">Riesgo de Abandono</p>
                                <span className="material-symbols-outlined text-amber-600 bg-amber-100 p-2 rounded-xl text-xl">warning</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <h3 className="text-3xl font-headline font-extrabold text-amber-900">
                                    {isLoading ? '...' : alumnosRiesgo.length}
                                </h3>
                                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full mb-1">
                                    10-45 días sin ir
                                </span>
                            </div>
                        </div>

                        {/* KPI 3: Hora de Mayor Demanda */}
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

                {/* Churn Risk Prevention Alert Section */}
                <section className="bg-surface rounded-2xl p-6 shadow-sm border border-amber-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/60 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-600 text-2xl">notification_important</span>
                                <h2 className="font-headline font-bold text-lg text-slate-900">Alumnos en Riesgo de Abandono (10 a 45 días sin entrenar)</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Clientes activos que llevan días sin reservar. Haz clic en el botón verde para enviarles un WhatsApp directo con mensaje prediseñado y retener la membresía.
                            </p>
                        </div>
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full shrink-0">
                            {alumnosRiesgo.length} {alumnosRiesgo.length === 1 ? 'Alumno para contactar' : 'Alumnos para contactar'}
                        </span>
                    </div>

                    {alumnosRiesgo.length === 0 ? (
                        <div className="p-8 text-center bg-amber-50/50 rounded-xl text-amber-900 space-y-1">
                            <span className="material-symbols-outlined text-3xl text-emerald-600">verified</span>
                            <p className="font-bold text-sm">¡Excelente! No hay alumnos en riesgo de abandono en este momento.</p>
                            <p className="text-xs text-slate-500">Todos tus clientes activos han asistido recientemente a sus clases.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-outline-variant bg-slate-50 text-xs font-label font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-4">Alumno</th>
                                        <th className="py-3 px-4">Teléfono</th>
                                        <th className="py-3 px-4 text-center">Inactividad</th>
                                        <th className="py-3 px-4 text-center">Créditos</th>
                                        <th className="py-3 px-4 text-center">Nivel Riesgo</th>
                                        <th className="py-3 px-4 text-right">Acción Rápida</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/60 text-sm">
                                    {alumnosRiesgo.map((a) => (
                                        <tr key={a.clienteId} className="hover:bg-amber-50/40 transition-colors">
                                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                                                <p className="font-bold text-sm text-slate-900">{a.nombreCliente}</p>
                                                <p className="text-xs text-slate-500 font-normal">{a.email}</p>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-xs text-slate-700 font-bold">
                                                {a.telefono}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="font-bold text-amber-900">{a.diasSinEntrenar} días</span>
                                                <p className="text-[10px] text-slate-400 font-normal">Última: {a.fechaUltimaClase}</p>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full font-bold text-xs">
                                                    {a.creditosDisponibles} créditos
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                                                    a.nivelRiesgo === 'ALTO' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {a.nivelRiesgo === 'ALTO' ? '🔴 ALTO' : '🟡 MEDIO'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {a.enlaceWhatsAppDirecto ? (
                                                        <a
                                                            href={a.enlaceWhatsAppDirecto}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                                                        >
                                                            <span className="material-symbols-outlined text-base">chat</span>
                                                            <span>📲 WhatsApp</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Sin Teléfono</span>
                                                    )}
                                                    <button
                                                        onClick={() => handleArchivar(a.clienteId)}
                                                        title="Marcar como contactado o archivar"
                                                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
                                                    >
                                                        ✔ Archivar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Strategic Analytics Section: Occupancy by Hour with View Switcher */}
                <section className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">query_stats</span>
                                <h2 className="font-headline font-bold text-lg text-slate-900">Ocupación por Rango Horario</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Distribución del porcentaje de ocupación de clases agrupado por hora.</p>
                        </div>

                        {/* Interactive View Mode Switcher */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                                <button
                                    onClick={() => setOccupancyViewMode('chart')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                                        occupancyViewMode === 'chart' ? 'bg-white text-primary shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-base">bar_chart</span>
                                    <span>Gráfico Visual</span>
                                </button>
                                <button
                                    onClick={() => setOccupancyViewMode('cards')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                                        occupancyViewMode === 'cards' ? 'bg-white text-primary shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-base">grid_view</span>
                                    <span>Vista Tarjetas</span>
                                </button>
                            </div>

                            {/* Legend */}
                            <div className="hidden lg:flex items-center gap-3 text-xs font-semibold border-l border-slate-200 pl-3">
                                <div className="flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                    <span>Pico (≥70%)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                    <span>Media</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                    <span>Baja</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* View Option 1: Executive Visual SVG Bar Chart */}
                    {occupancyViewMode === 'chart' ? (
                        <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-4 shadow-inner">
                            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 border-b border-slate-800 pb-3">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm text-primary">ssid_chart</span>
                                    Curva de Ocupación por Hora (06:00 - 21:00)
                                </span>
                                <span>100% Capacidad Máxima</span>
                            </div>

                            {/* Responsive Vertical Bar Chart */}
                            <div className="h-56 flex items-end justify-between gap-1.5 sm:gap-3 pt-6 pb-2 px-2 overflow-x-auto">
                                {hourlyData.map((item, idx) => {
                                    const pct = item.porcentajeOcupacion;
                                    const isHigh = pct >= 70;
                                    const isLow = pct < 40;

                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group min-w-[28px] relative">
                                            {/* Hover Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow-lg pointer-events-none z-10 whitespace-nowrap border border-slate-700">
                                                {item.horaEtiqueta}: {pct}% ({item.totalClases} clases)
                                            </div>

                                            {/* Value Label above Bar */}
                                            <span className={`text-[10px] font-extrabold ${
                                                isHigh ? 'text-red-400' : isLow ? 'text-blue-400' : 'text-amber-400'
                                            }`}>
                                                {pct}%
                                            </span>

                                            {/* Animated Bar Column */}
                                            <div className="w-full bg-slate-800 rounded-t-lg h-36 flex items-end p-0.5 overflow-hidden">
                                                <div
                                                    className={`w-full rounded-t-md transition-all duration-500 group-hover:brightness-125 ${
                                                        isHigh
                                                            ? 'bg-gradient-to-t from-red-600 to-red-400'
                                                            : isLow
                                                            ? 'bg-gradient-to-t from-blue-600 to-blue-400'
                                                            : 'bg-gradient-to-t from-amber-600 to-amber-400'
                                                    }`}
                                                    style={{ height: `${Math.max(8, pct)}%` }}
                                                ></div>
                                            </div>

                                            {/* Hour Tag */}
                                            <span className="text-[10px] text-slate-400 font-mono rotate-45 sm:rotate-0 origin-left mt-1">
                                                {item.horaEtiqueta.split(' - ')[0]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* View Option 2: Clean Card Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {hourlyData.map((item, idx) => {
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
                    )}
                </section>

                {/* Teacher Performance Section with View Switcher */}
                <section className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">workspace_premium</span>
                                <h2 className="font-headline font-bold text-lg text-slate-900">Desempeño de Instructores y Retención</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Reportes de ocupación de clases, tasa de asistencia y retención por profesor.</p>
                        </div>

                        {/* Interactive View Switcher for Teachers */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
                            <button
                                onClick={() => setTeacherViewMode('table')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                                    teacherViewMode === 'table' ? 'bg-white text-primary shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">table_chart</span>
                                <span>Vista Tabla</span>
                            </button>
                            <button
                                onClick={() => setTeacherViewMode('chart')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                                    teacherViewMode === 'chart' ? 'bg-white text-primary shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">equalizer</span>
                                <span>Comparativa Gráfica</span>
                            </button>
                        </div>
                    </div>

                    {teacherViewMode === 'table' ? (
                        /* Table View */
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
                                    {teacherData.map((p) => (
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
                    ) : (
                        /* Horizontal Visual Comparison Chart */
                        <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Porcentaje de Llenado por Instructor</p>
                            {teacherData.map((p) => (
                                <div key={p.profesorId} className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-900">{p.nombreProfesor}</span>
                                        <span className="font-extrabold text-primary">{p.porcentajeLlenado}% Llenado ({p.clasesDictadas} clases)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-primary to-purple-600 h-3 rounded-full transition-all"
                                            style={{ width: `${Math.max(5, p.porcentajeLlenado)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-1">
                                        <span>Retención: {p.alumnosUnicosAtendidos} alumnos únicos</span>
                                        <span>Asistencia efectiva: {p.porcentajeAsistencia}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
