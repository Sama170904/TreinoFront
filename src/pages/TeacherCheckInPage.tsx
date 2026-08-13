import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reservaService } from '../services/reservaService';
import { EstadoAsistencia } from '../types/reserva.types';
import { useAuthStore } from '../store/useAuthStore';
import axiosClient from '../config/axiosClient';

const TeacherCheckInPage: React.FC = () => {
    const { usuario } = useAuthStore();
    const esAdmin = usuario?.rol === 'ADMINISTRADOR';

    const [searchParams] = useSearchParams();
    const claseIdParam = searchParams.get('claseId');
    
    const [claseId, setClaseId] = useState<string>(claseIdParam || '');
    const [reservas, setReservas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [updatingReservaId, setUpdatingReservaId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

    const loadReservas = async () => {
        if (!claseId) return;
        setIsLoading(true);
        setMessage(null);
        try {
            const response = await axiosClient.get(`/clases/${claseId}/reservas`);
            const data = response.data.data || response.data;
            setReservas(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Error al cargar reservas de la clase:', err);
            const errorText = err.response?.data?.message || err.message || 'Error al cargar los alumnos anotados en esta clase';
            setMessage({ text: errorText, type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (claseIdParam) {
            loadReservas();
        }
    }, [claseIdParam]);

    const handleCheckIn = async (reservaId: number, estado: EstadoAsistencia) => {
        setUpdatingReservaId(reservaId);
        setMessage(null);
        try {
            await reservaService.checkIn(reservaId, estado);
            setReservas(reservas.map(r => r.reservaId === reservaId ? { ...r, estadoAsistencia: estado } : r));
            setMessage({ text: `Asistencia actualizada a ${estado}`, type: 'success' });
        } catch (err: any) {
            const errorText = err.response?.data?.message || err.message || 'Error al actualizar la asistencia';
            setMessage({ text: errorText, type: 'danger' });
        } finally {
            setUpdatingReservaId(null);
        }
    };

    return (
        <div className="min-h-screen bg-surface-container-high p-6 lg:p-10 font-body text-on-surface">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-headline text-2xl font-extrabold text-slate-900">Pase de Lista</h1>
                        <p className="text-on-surface-variant text-sm mt-0.5">Controla la asistencia de los alumnos registrados en cada una de tus clases.</p>
                    </div>
                    {esAdmin && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold flex items-center gap-1 self-start sm:self-auto">
                            <span className="material-symbols-outlined text-sm">shield_person</span>
                            Modo Administrador (Edición ilimitada)
                        </span>
                    )}
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-sm flex items-center justify-between animate-in ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                            <span>{message.text}</span>
                        </div>
                        <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                )}

                {/* Filter / Class Selector Card */}
                <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant">
                    <label className="block text-xs font-label font-bold text-slate-700 uppercase tracking-wider mb-2">ID de la Clase</label>
                    <div className="flex gap-3 max-w-md">
                        <input
                            type="text"
                            value={claseId}
                            onChange={(e) => setClaseId(e.target.value)}
                            placeholder="Ej. 1"
                            className="flex-1 px-4 py-2.5 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <button
                            onClick={loadReservas}
                            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover shadow-sm transition-all flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-lg">search</span>
                            <span>Buscar</span>
                        </button>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                            <span className="animate-spin material-symbols-outlined text-3xl text-primary mb-2">progress_activity</span>
                            <span>Cargando lista de alumnos...</span>
                        </div>
                    ) : reservas.length === 0 ? (
                        <div className="p-12 text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-40">checklist</span>
                            <p className="font-semibold text-slate-700">No hay reservas registradas para esta clase</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-label uppercase tracking-wider text-on-surface-variant font-bold">
                                        <th className="py-3.5 px-6">Alumno</th>
                                        <th className="py-3.5 px-6">Estado Clase & Horario</th>
                                        <th className="py-3.5 px-6">Estado Asistencia</th>
                                        <th className="py-3.5 px-6 text-right">Marcar Asistencia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/60 text-sm">
                                    {reservas.map((r) => {
                                        const nombreCompleto = r.clienteNombre || (r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : 'Alumno');

                                        const fechaInicioStr = r.fechaHoraInicio || (r.clase as any)?.fechaHoraInicio;
                                        const fechaFinStr = r.fechaHoraFin || (r.clase as any)?.fechaHoraFin;
                                        const ahora = new Date();

                                        const haComenzado = fechaInicioStr ? ahora >= new Date(fechaInicioStr) : true;
                                        const haFinalizado = fechaFinStr ? ahora > new Date(fechaFinStr) : false;
                                        const puedeEditar = haComenzado && (!haFinalizado || esAdmin);

                                        return (
                                            <tr key={r.reservaId} className="hover:bg-surface-container-high/50 transition-colors">
                                                <td className="py-4 px-6 font-semibold text-slate-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary-container text-primary font-bold flex items-center justify-center text-sm">
                                                            {nombreCompleto.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{nombreCompleto}</p>
                                                            <p className="text-xs text-slate-400 font-mono">Reserva #{r.reservaId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {!haComenzado ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold border border-amber-200">
                                                            <span className="material-symbols-outlined text-xs">schedule</span>
                                                            No iniciada (Inicia {fechaInicioStr ? new Date(fechaInicioStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''})
                                                        </span>
                                                    ) : haFinalizado ? (
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                            esAdmin ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}>
                                                            <span className="material-symbols-outlined text-xs">{esAdmin ? 'edit_calendar' : 'lock'}</span>
                                                            Finalizada {esAdmin ? '(Admin)' : '(Cerrado)'}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            En Curso / Abierta
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        r.estadoAsistencia === 'ASISTIO' ? 'bg-emerald-100 text-emerald-800' :
                                                        r.estadoAsistencia === 'NO_SHOW' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {r.estadoAsistencia}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    {!puedeEditar ? (
                                                        <span className="text-xs text-slate-400 italic">
                                                            {!haComenzado ? 'Pase de lista abre al iniciar' : 'Solo Admin puede editar tras finalizar'}
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleCheckIn(r.reservaId, EstadoAsistencia.ASISTIO)}
                                                                disabled={updatingReservaId === r.reservaId}
                                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                                                            >
                                                                {updatingReservaId === r.reservaId ? (
                                                                    <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                                )}
                                                                <span>Asistió</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleCheckIn(r.reservaId, EstadoAsistencia.NO_SHOW)}
                                                                disabled={updatingReservaId === r.reservaId}
                                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                                                            >
                                                                {updatingReservaId === r.reservaId ? (
                                                                    <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                                )}
                                                                <span>No Show</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherCheckInPage;
