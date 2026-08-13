import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { usuarioService } from '../services/usuarioService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const updateProfileSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z.string().email('Correo no válido')
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

const ProfilePage: React.FC = () => {
    const { usuario, login, token } = useAuthStore();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateProfileFormData>({
        resolver: zodResolver(updateProfileSchema)
    });

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            try {
                const data = await usuarioService.getMe();
                setProfile(data);
                reset({
                    nombre: data.nombre || '',
                    apellido: data.apellido || '',
                    email: data.email || ''
                });
            } catch (err) {
                console.error('Error al cargar perfil:', err);
                setFeedback({ message: 'No se pudo cargar la información del perfil', type: 'danger' });
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, [reset]);

    const onSubmit = async (data: UpdateProfileFormData) => {
        if (!profile) return;
        setIsSubmitting(true);
        setFeedback(null);
        try {
            const updatedData = {
                ...profile,
                nombre: data.nombre,
                apellido: data.apellido
            };
            await usuarioService.update(profile.userId, updatedData);
            
            const freshData = await usuarioService.getMe();
            setProfile(freshData);
            
            if (token) {
                login(token);
            }

            setIsEditing(false);
            setFeedback({ message: '¡Perfil actualizado exitosamente!', type: 'success' });
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al actualizar el perfil';
            setFeedback({ message: errorMsg, type: 'danger' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold text-slate-600">Cargando tu perfil...</span>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const initials = `${profile.nombre ? profile.nombre.charAt(0) : ''}${profile.apellido ? profile.apellido.charAt(0) : ''}`.toUpperCase() || 'U';

    const getRolBadge = (rol: string) => {
        switch (rol) {
            case 'ADMINISTRADOR':
                return { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Administrador' };
            case 'PROFESOR':
                return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Profesor' };
            default:
                return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Cliente' };
        }
    };

    const rolBadge = getRolBadge(profile.rol);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pb-24 md:pb-12 font-sans">
            
            {/* Feedback Alert */}
            {feedback && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
                    feedback.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    <span className="material-symbols-outlined text-xl">
                        {feedback.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span className="text-sm font-semibold">{feedback.message}</span>
                </div>
            )}

            {/* Clean Human-Designed Profile Header */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
                    
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* Circular Avatar */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center shadow-md border-2 border-slate-100">
                                {initials}
                            </div>
                            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Activo"></span>
                        </div>

                        {/* Name, Email, Role */}
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                    {profile.nombre} {profile.apellido}
                                </h1>
                                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border tracking-wide ${rolBadge.bg}`}>
                                    {rolBadge.label}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                                <span className="material-symbols-outlined text-base text-slate-400">mail</span>
                                {profile.email}
                            </p>
                        </div>
                    </div>

                    {/* Edit Profile Action */}
                    <div>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined text-lg">edit</span>
                                Editar Perfil
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-xl">badge</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ID de Cuenta</span>
                        <p className="text-base font-bold text-slate-900 mt-0.5">#{profile.userId}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-xl">shield</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estado</span>
                        <p className="text-base font-bold text-emerald-600 mt-0.5">{profile.estado || 'ACTIVO'}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-xl">verified_user</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Permisos</span>
                        <p className="text-base font-bold text-slate-900 mt-0.5">{rolBadge.label}</p>
                    </div>
                </div>
            </div>

            {/* Personal Information Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">person</span>
                    </div>
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900">Información Personal</h2>
                        <p className="text-xs text-slate-500">Datos registrados de tu cuenta de usuario.</p>
                    </div>
                </div>

                {!isEditing ? (
                    /* Read-Only Details Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre</span>
                            <p className="text-base font-semibold text-slate-900">{profile.nombre}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Apellido</span>
                            <p className="text-base font-semibold text-slate-900">{profile.apellido}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1 sm:col-span-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</span>
                            <div className="flex items-center gap-2">
                                <p className="text-base font-semibold text-slate-900">{profile.email}</p>
                                <span className="material-symbols-outlined text-emerald-500 text-base" title="Verificado">verified</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Edit Form */
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nombre</label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none ${
                                        errors.nombre ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-white text-slate-900'
                                    }`}
                                    {...register('nombre')}
                                    placeholder="Tu nombre"
                                />
                                {errors.nombre && (
                                    <p className="text-xs font-medium text-rose-500">{errors.nombre.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Apellido</label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none ${
                                        errors.apellido ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-white text-slate-900'
                                    }`}
                                    {...register('apellido')}
                                    placeholder="Tu apellido"
                                />
                                {errors.apellido && (
                                    <p className="text-xs font-medium text-rose-500">{errors.apellido.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Correo Electrónico (No editable)</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed"
                                    {...register('email')}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">save</span>
                                        <span>Guardar Cambios</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
