import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sedeService } from '../services/sedeService';
import { sedeSchema, type SedeSchemaType } from '../schemas/sedeSchema';
import type { SedeResponse } from '../types/sede.types';

const AdminSedesPage: React.FC = () => {
    const [sedes, setSedes] = useState<SedeResponse[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingSede, setEditingSede] = useState<SedeResponse | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<SedeSchemaType>({
        resolver: zodResolver(sedeSchema),
        defaultValues: { nombre: '', direccion: '', capacidadMaxima: 20 }
    });

    const loadSedes = async () => {
        setIsLoading(true);
        try {
            const data = await sedeService.getAll();
            setSedes(Array.isArray(data) ? data : []);
        } catch (err) {
            setMessage({ text: 'Error al cargar las sedes', type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSedes();
    }, []);

    const openCreateModal = () => {
        setEditingSede(null);
        form.reset({ nombre: '', direccion: '', capacidadMaxima: 20 });
        setShowModal(true);
    };

    const openEditModal = (sede: SedeResponse) => {
        setEditingSede(sede);
        form.reset({
            nombre: sede.nombre,
            direccion: sede.direccion,
            capacidadMaxima: sede.capacidadMaxima
        });
        setShowModal(true);
    };

    const onSubmit = async (data: SedeSchemaType) => {
        try {
            if (editingSede) {
                await sedeService.update({
                    sedeId: editingSede.sedeId,
                    ...data
                });
                setMessage({ text: 'Sede actualizada exitosamente', type: 'success' });
            } else {
                await sedeService.create(data);
                setMessage({ text: 'Sede creada exitosamente', type: 'success' });
            }
            setShowModal(false);
            loadSedes();
        } catch (err: any) {
            const errorText = err.response?.data?.message || 'Error al guardar la sede';
            setMessage({ text: errorText, type: 'danger' });
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de desactivar esta sede?')) return;
        try {
            await sedeService.delete(id);
            setMessage({ text: 'Sede desactivada correctamente', type: 'success' });
            loadSedes();
        } catch (err) {
            setMessage({ text: 'Error al eliminar la sede', type: 'danger' });
        }
    };

    return (
        <div className="min-h-screen bg-surface-container-high p-6 lg:p-10 font-body text-on-surface">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-headline text-2xl font-extrabold text-slate-900">Gestión de Sedes</h1>
                        <p className="text-on-surface-variant text-sm mt-0.5">Administra los locales del estudio y sus capacidades máximas por sala.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-label font-semibold rounded-xl hover:bg-primary-hover shadow-md transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        <span>Nueva Sede</span>
                    </button>
                </div>

                {/* Feedback Message */}
                {message && (
                    <div className={`p-4 rounded-xl text-sm flex items-center justify-between ${
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

                {/* Venues Table Card */}
                <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                            <span className="animate-spin material-symbols-outlined text-3xl text-primary mb-2">progress_activity</span>
                            <span>Cargando sedes...</span>
                        </div>
                    ) : sedes.length === 0 ? (
                        <div className="p-12 text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-40">storefront</span>
                            <p className="font-semibold text-slate-700">No hay sedes registradas</p>
                            <p className="text-xs text-slate-500 mt-1">Haz clic en "Nueva Sede" para agregar el primer local.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-label uppercase tracking-wider text-on-surface-variant font-bold">
                                        <th className="py-3.5 px-6">ID</th>
                                        <th className="py-3.5 px-6">Nombre de Sede</th>
                                        <th className="py-3.5 px-6">Dirección</th>
                                        <th className="py-3.5 px-6">Capacidad Máxima</th>
                                        <th className="py-3.5 px-6">Estado</th>
                                        <th className="py-3.5 px-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/60 text-sm">
                                    {sedes.map((sede) => (
                                        <tr key={sede.sedeId} className="hover:bg-surface-container-high/50 transition-colors">
                                            <td className="py-4 px-6 font-mono text-xs text-slate-500">#{sede.sedeId}</td>
                                            <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary-container text-primary flex items-center justify-center font-bold text-xs">
                                                    {sede.nombre.charAt(0)}
                                                </div>
                                                <span>{sede.nombre}</span>
                                            </td>
                                            <td className="py-4 px-6 text-on-surface-variant">{sede.direccion}</td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                                                    <span className="material-symbols-outlined text-xs">groups</span>
                                                    {sede.capacidadMaxima} alumnos
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    {sede.estado || 'ACTIVO'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <button
                                                    onClick={() => openEditModal(sede)}
                                                    className="p-1.5 text-slate-600 hover:text-primary hover:bg-primary-container rounded-lg transition-colors"
                                                    title="Editar Sede"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sede.sedeId)}
                                                    className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Desactivar Sede"
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

            {/* Modal for Creating/Editing Sede */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in">
                    <div className="bg-surface rounded-2xl shadow-xl border border-outline-variant max-w-md w-full overflow-hidden">
                        
                        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline font-bold text-lg text-slate-900">
                                {editingSede ? 'Editar Sede' : 'Nueva Sede'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1 uppercase tracking-wider">Nombre de la Sede</label>
                                <input
                                    {...form.register('nombre')}
                                    placeholder="Ej. Sede Polanco Studio"
                                    className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                {form.formState.errors.nombre && (
                                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.nombre.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1 uppercase tracking-wider">Dirección Completa</label>
                                <input
                                    {...form.register('direccion')}
                                    placeholder="Ej. Av. Presidente Masaryk 123"
                                    className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                {form.formState.errors.direccion && (
                                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.direccion.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1 uppercase tracking-wider">Capacidad Máxima de Alumnos</label>
                                <input
                                    type="number"
                                    {...form.register('capacidadMaxima', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                {form.formState.errors.capacidadMaxima && (
                                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.capacidadMaxima.message}</p>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm"
                                >
                                    {editingSede ? 'Guardar Cambios' : 'Crear Sede'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSedesPage;
