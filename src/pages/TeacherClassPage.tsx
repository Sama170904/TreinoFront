import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { claseService } from '../services/claseService';
import { sedeService } from '../services/sedeService';
import { claseSchema, type ClaseSchemaType } from '../schemas/claseSchema';
import type { ClaseResponse } from '../types/clase.types';
import type { SedeResponse } from '../types/sede.types';
import { useNavigate } from 'react-router-dom';

const TeacherClassPage: React.FC = () => {
    const navigate = useNavigate();
    const [clases, setClases] = useState<ClaseResponse[]>([]);
    const [sedes, setSedes] = useState<SedeResponse[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingClase, setEditingClase] = useState<ClaseResponse | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ClaseSchemaType>({
        resolver: zodResolver(claseSchema),
        defaultValues: {
            sedeId: 1,
            disciplina: 'Pilates Reformer',
            descripcion: '',
            fechaHoraInicio: '',
            fechaHoraFin: '',
            cupoMaximo: 10
        }
    });

    const loadData = async () => {
        setIsLoading(true);
        try {
            const clasesData = await claseService.getAll();
            const sedesData = await sedeService.getAll();
            setClases(Array.isArray(clasesData) ? clasesData : []);
            setSedes(Array.isArray(sedesData) ? sedesData : []);
        } catch (err: any) {
            const errorText = err.response?.data?.message || err.message || 'Error al cargar clases o sedes';
            setMessage({ text: errorText, type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const openCreateModal = () => {
        setEditingClase(null);
        const now = new Date();
        const startStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        const endStr = new Date(now.getTime() + 3600000 - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

        form.reset({
            sedeId: sedes[0]?.sedeId || 1,
            disciplina: 'Pilates Reformer',
            descripcion: '',
            fechaHoraInicio: startStr,
            fechaHoraFin: endStr,
            cupoMaximo: 10
        });
        setShowModal(true);
    };

    const openEditModal = (c: ClaseResponse) => {
        setEditingClase(c);
        const start = c.fechaHoraInicio ? c.fechaHoraInicio.slice(0, 16) : new Date().toISOString().slice(0, 16);
        const end = c.fechaHoraFin ? c.fechaHoraFin.slice(0, 16) : new Date(Date.now() + 3600000).toISOString().slice(0, 16);

        form.reset({
            sedeId: c.sedeId || (c as any).sede?.sedeId || sedes[0]?.sedeId || 1,
            disciplina: c.disciplina || 'Pilates Reformer',
            descripcion: c.descripcion || '',
            fechaHoraInicio: start,
            fechaHoraFin: end,
            cupoMaximo: c.cupoMaximo || 10
        });
        setShowModal(true);
    };

    const onSubmit = async (data: ClaseSchemaType) => {
        setIsSubmitting(true);
        try {
            if (editingClase) {
                await claseService.update(editingClase.claseId, data);
                setMessage({ text: 'Clase actualizada exitosamente', type: 'success' });
            } else {
                await claseService.create(data);
                setMessage({ text: 'Clase programada exitosamente', type: 'success' });
            }
            setShowModal(false);
            loadData();
        } catch (err: any) {
            const errorText = err.response?.data?.message || err.message || 'Error al guardar la clase';
            setMessage({ text: errorText, type: 'danger' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de cancelar esta clase?')) return;
        try {
            await claseService.delete(id);
            setMessage({ text: 'Clase eliminada correctamente', type: 'success' });
            loadData();
        } catch (err: any) {
            const errorText = err.response?.data?.message || err.message || 'Error al eliminar la clase';
            setMessage({ text: errorText, type: 'danger' });
        }
    };

    return (
        <div className="min-h-screen bg-surface-container-high p-6 lg:p-10 font-body text-on-surface">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-headline text-2xl font-extrabold text-slate-900">Programación de Clases</h1>
                        <p className="text-on-surface-variant text-sm mt-0.5">Crea y administra tus clases, cupos y horarios de entrenamiento.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-label font-semibold rounded-xl hover:bg-primary-hover shadow-md transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        <span>Nueva Clase</span>
                    </button>
                </div>

                {/* Feedback Message */}
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

                {/* Class List Table */}
                <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                            <span className="animate-spin material-symbols-outlined text-3xl text-primary mb-2">progress_activity</span>
                            <span>Cargando clases...</span>
                        </div>
                    ) : clases.length === 0 ? (
                        <div className="p-12 text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-40">event_busy</span>
                            <p className="font-semibold text-slate-700">No hay clases programadas</p>
                            <p className="text-xs text-slate-500 mt-1">Haz clic en "Nueva Clase" para abrir una sesión.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-label uppercase tracking-wider text-on-surface-variant font-bold">
                                        <th className="py-3.5 px-6">Disciplina & Sede</th>
                                        <th className="py-3.5 px-6">Horario</th>
                                        <th className="py-3.5 px-6">Instructor</th>
                                        <th className="py-3.5 px-6">Cupos Reservados</th>
                                        <th className="py-3.5 px-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/60 text-sm">
                                    {clases.map((c) => (
                                        <tr key={c.claseId} className="hover:bg-surface-container-high/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-container text-primary flex items-center justify-center font-bold">
                                                        <span className="material-symbols-outlined">fitness_center</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{c.disciplina}</p>
                                                        <p className="text-xs text-on-surface-variant flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-xs">location_on</span>
                                                            {c.sedeNombre || c.sede?.nombre || 'Sede Principal'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="font-semibold text-slate-800">{c.fechaHoraInicio ? new Date(c.fechaHoraInicio).toLocaleDateString() : 'Sin fecha'}</p>
                                                <p className="text-xs text-slate-500 font-mono">
                                                    {c.fechaHoraInicio ? new Date(c.fechaHoraInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} - {c.fechaHoraFin ? new Date(c.fechaHoraFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </p>
                                            </td>
                                            <td className="py-4 px-6 text-slate-700 font-medium">
                                                {c.profesorNombre || (c.profesor ? `${c.profesor.nombre} ${c.profesor.apellido}` : 'Sin profesor')}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="w-36">
                                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                                        <span className="text-slate-700">{c.cuposReservados} / {c.cupoMaximo}</span>
                                                        <span className="text-slate-400">{Math.round((c.cuposReservados / c.cupoMaximo) * 100)}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-primary h-2 rounded-full transition-all"
                                                            style={{ width: `${Math.min(100, (c.cuposReservados / c.cupoMaximo) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <button
                                                    onClick={() => navigate(`/teacher/check-in?claseId=${c.claseId}`)}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Pase de Lista / Check-In"
                                                >
                                                    <span className="material-symbols-outlined text-lg">fact_check</span>
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(c)}
                                                    className="p-1.5 text-slate-600 hover:text-primary hover:bg-primary-container rounded-lg transition-colors"
                                                    title="Editar Clase"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.claseId)}
                                                    className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar Clase"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Crear / Editar Clase */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in">
                    <div className="bg-surface rounded-2xl shadow-xl border border-outline-variant max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline font-bold text-lg text-slate-900">
                                {editingClase ? 'Editar Clase' : 'Nueva Clase'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1 uppercase tracking-wider">Sede / Ubicación</label>
                                <select {...form.register('sedeId', { valueAsNumber: true })} className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface">
                                    {sedes.map((s) => (
                                        <option key={s.sedeId} value={s.sedeId}>{s.nombre} ({s.direccion})</option>
                                    ))}
                                </select>
                                {form.formState.errors.sedeId && (
                                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.sedeId.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1 uppercase tracking-wider">Disciplina</label>
                                <input {...form.register('disciplina')} placeholder="Ej. Pilates Reformer, Barre, Yoga" className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm" />
                                {form.formState.errors.disciplina && (
                                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.disciplina.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1 uppercase tracking-wider">Descripción (Opcional)</label>
                                <textarea {...form.register('descripcion')} rows={2} placeholder="Descripción del entrenamiento del día..." className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm" />
                                {form.formState.errors.descripcion && (
                                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.descripcion.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-label font-semibold text-slate-700 mb-1 uppercase tracking-wider">Fecha y Hora Inicio</label>
                                    <input type="datetime-local" {...form.register('fechaHoraInicio')} className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm" />
                                    {form.formState.errors.fechaHoraInicio && (
                                        <p className="text-red-500 text-xs mt-1">{form.formState.errors.fechaHoraInicio.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-label font-semibold text-slate-700 mb-1 uppercase tracking-wider">Fecha y Hora Fin</label>
                                    <input type="datetime-local" {...form.register('fechaHoraFin')} className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm" />
                                    {form.formState.errors.fechaHoraFin && (
                                        <p className="text-red-500 text-xs mt-1">{form.formState.errors.fechaHoraFin.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1 uppercase tracking-wider">Cupo Máximo de Alumnos</label>
                                <input type="number" {...form.register('cupoMaximo', { valueAsNumber: true })} className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm" />
                                {form.formState.errors.cupoMaximo && (
                                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.cupoMaximo.message}</p>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm flex items-center gap-2">
                                    {isSubmitting && <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>}
                                    <span>{editingClase ? 'Guardar Cambios' : 'Programar Clase'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherClassPage;
