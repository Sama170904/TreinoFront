import React, { useState, useEffect } from 'react';
import { reservaService } from '../services/reservaService';
import type { ReservaResponse } from '../types/reserva.types';

const MyReservationsPage: React.FC = () => {
    const [reservas, setReservas] = useState<ReservaResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const loadReservas = async () => {
        setIsLoading(true);
        try {
            const data = await reservaService.getMisReservas();
            setReservas(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorMsg('Error al cargar tus reservas');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReservas();
    }, []);

    const handleCancelar = async (reservaId: number) => {
        if (!window.confirm('¿Deseas cancelar esta reserva? Recuerda que si faltan menos de 15 minutos para el inicio no recibirás la devolución del crédito.')) {
            return;
        }

        setErrorMsg(null);
        setSuccessMsg(null);
        setCancellingId(reservaId);

        try {
            await reservaService.cancelar(reservaId);
            setSuccessMsg('Reserva cancelada. Revisa la actualización de tu crédito.');
            loadReservas();
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Error al cancelar la reserva';
            setErrorMsg(msg);
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-surface-container-high p-6 lg:p-10 font-body text-on-surface">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-headline text-2xl font-extrabold text-slate-900">Mis Reservas</h1>
                        <p className="text-on-surface-variant text-sm mt-0.5">Consulta tus clases agendadas y gestiona tus cancelaciones con devolución de crédito.</p>
                    </div>
                </div>

                {/* Feedback Alerts */}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between animate-in">
                        <div className="flex items-center gap-2 font-semibold">
                            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                            <span>{successMsg}</span>
                        </div>
                        <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                )}

                {errorMsg && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center justify-between animate-in">
                        <div className="flex items-center gap-2 font-semibold">
                            <span className="material-symbols-outlined text-red-600">error</span>
                            <span>{errorMsg}</span>
                        </div>
                        <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                )}

                {/* Policy Notice */}
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-start gap-3 shadow-sm">
                    <span className="material-symbols-outlined text-amber-600 text-lg mt-0.5">info</span>
                    <div>
                        <p className="font-bold text-amber-900 mb-0.5">Política de Devolución de Créditos:</p>
                        <p>Puedes cancelar una clase hasta <strong>15 minutos antes</strong> de su hora de inicio para recibir la devolución automática de tu crédito. Si cancelas con menos de 15 minutos de anticipación, la clase se marcará como <em>Cancelada fuera de tiempo</em> y el crédito no será reembolsado.</p>
                    </div>
                </div>

                {/* Reservations List */}
                <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                            <span className="animate-spin material-symbols-outlined text-3xl text-primary mb-2">progress_activity</span>
                            <span>Cargando tus reservas...</span>
                        </div>
                    ) : reservas.length === 0 ? (
                        <div className="p-12 text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-40">confirmation_number</span>
                            <p className="font-semibold text-slate-700">No tienes reservas registradas</p>
                            <p className="text-xs text-slate-500 mt-1">Explora los horarios de clases y reserva tu primera sesión.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-label uppercase tracking-wider text-on-surface-variant font-bold">
                                        <th className="py-3.5 px-6">Clase & Disciplina</th>
                                        <th className="py-3.5 px-6">Fecha & Hora</th>
                                        <th className="py-3.5 px-6">Sede</th>
                                        <th className="py-3.5 px-6">Estado Reserva</th>
                                        <th className="py-3.5 px-6">Asistencia</th>
                                        <th className="py-3.5 px-6 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/60 text-sm">
                                    {reservas.map((r) => {
                                        const disciplina = (r as any).claseDisciplina || r.clase?.disciplina || 'Clase';
                                        const fechaInicioStr = (r as any).fechaHoraInicio || r.clase?.fechaHoraInicio;
                                        const sedeNombre = (r as any).sedeNombre || r.clase?.sede?.nombre || 'Sede Principal';

                                        return (
                                            <tr key={r.reservaId} className="hover:bg-surface-container-high/50 transition-colors">
                                                <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary-container text-primary flex items-center justify-center font-bold text-xs">
                                                        <span className="material-symbols-outlined text-sm">fitness_center</span>
                                                    </div>
                                                    <span>{disciplina}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <p className="font-semibold text-slate-800">
                                                        {fechaInicioStr ? new Date(fechaInicioStr).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' }) : '-'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-mono">
                                                        {fechaInicioStr ? new Date(fechaInicioStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-6 text-slate-700 font-medium">{sedeNombre}</td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        r.estadoReserva === 'CONFIRMADA' ? 'bg-emerald-50 text-emerald-700' :
                                                        r.estadoReserva === 'CANCELADA_TIEMPO' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                                    }`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                        {r.estadoReserva}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                        {r.estadoAsistencia || 'PENDIENTE'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    {r.estadoReserva === 'CONFIRMADA' && (
                                                        <button
                                                            onClick={() => handleCancelar(r.reservaId)}
                                                            disabled={cancellingId === r.reservaId}
                                                            className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center gap-1"
                                                        >
                                                            {cancellingId === r.reservaId ? (
                                                                <span>Cancelando...</span>
                                                            ) : (
                                                                <>
                                                                    <span className="material-symbols-outlined text-sm">cancel</span>
                                                                    <span>Cancelar Reserva</span>
                                                                </>
                                                            )}
                                                        </button>
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

export default MyReservationsPage;
