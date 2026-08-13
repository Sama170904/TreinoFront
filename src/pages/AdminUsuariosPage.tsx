import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioService } from '../services/usuarioService';
import { creditoService } from '../services/creditoService';
import { usuarioSchema, type UsuarioSchemaType } from '../schemas/usuarioSchema';
import { creditAsignacionSchema, type CreditAsignacionSchemaType } from '../schemas/creditAsignacionSchema';
import type { UsuarioResponse } from '../types/usuario.types';

const AdminUsuariosPage: React.FC = () => {
    const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCreditoModal, setShowCreditoModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UsuarioResponse | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmittingUser, setIsSubmittingUser] = useState(false);
    const [isSubmittingCredito, setIsSubmittingCredito] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');

    const userForm = useForm<UsuarioSchemaType & { telefono?: string }>({
        resolver: zodResolver(usuarioSchema),
        defaultValues: { nombre: '', apellido: '', email: '', telefono: '', password: '', rol: 'CLIENTE' }
    });

    const creditoForm = useForm<CreditAsignacionSchemaType>({
        resolver: zodResolver(creditAsignacionSchema),
        defaultValues: { clienteId: 0, cantidad: 10, vigenciaTipo: 'MENSUAL' }
    });

    const loadUsuarios = async () => {
        setIsLoading(true);
        try {
            const data = await usuarioService.getAll();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (err: any) {
            const errorText = err.response?.data?.message || err.message || 'Error al cargar los usuarios';
            setMessage({ text: errorText, type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsuarios();
    }, []);

    const openCreateUserModal = () => {
        userForm.reset({ nombre: '', apellido: '', email: '', telefono: '', password: '', rol: 'CLIENTE' });
        setShowUserModal(true);
    };

    const openCreditoModal = (usuario: UsuarioResponse) => {
        setSelectedUser(usuario);
        creditoForm.reset({ clienteId: usuario.userId, cantidad: 10, vigenciaTipo: 'MENSUAL' });
        setShowCreditoModal(true);
    };

    const onUserSubmit = async (data: UsuarioSchemaType & { telefono?: string }) => {
        setIsSubmittingUser(true);
        try {
            await usuarioService.create(data);
            setMessage({ text: `Usuario ${data.nombre} ${data.apellido} creado exitosamente`, type: 'success' });
            setShowUserModal(false);
            loadUsuarios();
        } catch (err: any) {
            const errorText = err.response?.data?.message || err.message || 'Error al crear el usuario';
            setMessage({ text: errorText, type: 'danger' });
        } finally {
            setIsSubmittingUser(false);
        }
    };

    const onCreditoSubmit = async (data: CreditAsignacionSchemaType) => {
        setIsSubmittingCredito(true);
        try {
            await creditoService.asignar({
                clienteId: data.clienteId,
                cantidad: data.cantidad,
                vigenciaTipo: data.vigenciaTipo
            });
            setMessage({ text: `¡${data.cantidad} créditos asignados exitosamente a ${selectedUser?.email}!`, type: 'success' });
            setShowCreditoModal(false);
            loadUsuarios();
        } catch (err: any) {
            const errorText = err.response?.data?.message || err.message || 'Error al asignar créditos';
            setMessage({ text: errorText, type: 'danger' });
        } finally {
            setIsSubmittingCredito(false);
        }
    };

    const filteredUsuarios = usuarios.filter(u => 
        u.nombre.toLowerCase().includes(searchFilter.toLowerCase()) ||
        u.apellido.toLowerCase().includes(searchFilter.toLowerCase()) ||
        u.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (u.telefono && u.telefono.includes(searchFilter)) ||
        u.rol.toLowerCase().includes(searchFilter.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-surface-container-high p-6 lg:p-10 font-body text-on-surface">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-headline text-2xl font-extrabold text-slate-900">Gestión de Usuarios & Créditos</h1>
                        <p className="text-on-surface-variant text-sm mt-0.5">Administra los clientes, profesores, números de teléfono y paquetes de créditos.</p>
                    </div>
                    <button
                        onClick={openCreateUserModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-label font-semibold rounded-xl hover:bg-primary-hover shadow-md transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        <span>Nuevo Usuario</span>
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

                {/* Filter & Search Bar */}
                <div className="bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant flex items-center gap-4">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">search</span>
                        <input
                            type="text"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            placeholder="Buscar por nombre, email, teléfono o rol..."
                            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                            <span className="animate-spin material-symbols-outlined text-3xl text-primary mb-2">progress_activity</span>
                            <span>Cargando usuarios...</span>
                        </div>
                    ) : filteredUsuarios.length === 0 ? (
                        <div className="p-12 text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-40">group_off</span>
                            <p className="font-semibold text-slate-700">No se encontraron usuarios</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-label uppercase tracking-wider text-on-surface-variant font-bold">
                                        <th className="py-3.5 px-6">Usuario</th>
                                        <th className="py-3.5 px-6">Correo</th>
                                        <th className="py-3.5 px-6">Teléfono / WhatsApp</th>
                                        <th className="py-3.5 px-6">Rol</th>
                                        <th className="py-3.5 px-6">Estado</th>
                                        <th className="py-3.5 px-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/60 text-sm">
                                    {filteredUsuarios.map((u) => (
                                        <tr key={u.userId} className="hover:bg-surface-container-high/50 transition-colors">
                                            <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-sm">
                                                    {u.nombre ? u.nombre.charAt(0) : 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{u.nombre} {u.apellido}</p>
                                                    <p className="text-xs font-mono text-slate-400">ID: #{u.userId}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-on-surface-variant">{u.email}</td>
                                            <td className="py-4 px-6 font-mono text-xs text-slate-700 font-bold">
                                                {u.telefono || <span className="text-slate-400 font-normal italic">Sin registra</span>}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    u.rol === 'ADMINISTRADOR' ? 'bg-purple-100 text-purple-800' :
                                                    u.rol === 'PROFESOR' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    <span className="material-symbols-outlined text-xs">
                                                        {u.rol === 'ADMINISTRADOR' ? 'shield_person' : u.rol === 'PROFESOR' ? 'badge' : 'person'}
                                                    </span>
                                                    {u.rol}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    {u.estado || 'ACTIVO'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {u.rol === 'CLIENTE' && (
                                                    <button
                                                        onClick={() => openCreditoModal(u)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-container text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-semibold transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">add_card</span>
                                                        <span>Asignar Créditos</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Crear Usuario */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in">
                    <div className="bg-surface rounded-2xl shadow-xl border border-outline-variant max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline font-bold text-lg text-slate-900">Nuevo Usuario</h3>
                            <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-label font-semibold text-slate-700 mb-1">Nombre</label>
                                    <input {...userForm.register('nombre')} placeholder="Ej. Juan" className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    {userForm.formState.errors.nombre && (
                                        <p className="text-red-500 text-xs mt-1">{userForm.formState.errors.nombre.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-label font-semibold text-slate-700 mb-1">Apellido</label>
                                    <input {...userForm.register('apellido')} placeholder="Ej. Pérez" className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    {userForm.formState.errors.apellido && (
                                        <p className="text-red-500 text-xs mt-1">{userForm.formState.errors.apellido.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1">Correo electrónico</label>
                                <input type="email" {...userForm.register('email')} placeholder="juan@email.com" className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                {userForm.formState.errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{userForm.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                                <input type="text" {...userForm.register('telefono')} placeholder="Ej. 0987689886" className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                            </div>

                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1">Contraseña</label>
                                <input type="password" {...userForm.register('password')} placeholder="••••••••" className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                {userForm.formState.errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{userForm.formState.errors.password.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1">Rol</label>
                                <select {...userForm.register('rol')} className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option value="CLIENTE">CLIENTE</option>
                                    <option value="PROFESOR">PROFESOR</option>
                                    <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                                </select>
                                {userForm.formState.errors.rol && (
                                    <p className="text-red-500 text-xs mt-1">{userForm.formState.errors.rol.message}</p>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant">
                                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={isSubmittingUser} className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm flex items-center gap-2">
                                    {isSubmittingUser && <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>}
                                    <span>Crear Usuario</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Asignar Créditos */}
            {showCreditoModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in">
                    <div className="bg-surface rounded-2xl shadow-xl border border-outline-variant max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-headline font-bold text-lg text-slate-900">Asignar Créditos</h3>
                            <button onClick={() => setShowCreditoModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={creditoForm.handleSubmit(onCreditoSubmit)} className="p-6 space-y-4">
                            <div className="p-3 bg-primary-container/60 rounded-xl text-xs text-primary font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">person</span>
                                <span>Cliente: {selectedUser.nombre} {selectedUser.apellido} ({selectedUser.email})</span>
                            </div>

                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1">Cantidad de Créditos</label>
                                <input type="number" {...creditoForm.register('cantidad', { valueAsNumber: true })} className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                {creditoForm.formState.errors.cantidad && (
                                    <p className="text-red-500 text-xs mt-1">{creditoForm.formState.errors.cantidad.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-label font-semibold text-slate-700 mb-1">Tipo de Vigencia</label>
                                <select {...creditoForm.register('vigenciaTipo')} className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option value="SEMANAL">SEMANAL (7 Días)</option>
                                    <option value="MENSUAL">MENSUAL (30 Días)</option>
                                    <option value="TRIMESTRAL">TRIMESTRAL (90 Días)</option>
                                    <option value="SEMESTRAL">SEMESTRAL (180 Días)</option>
                                    <option value="ANUAL">ANUAL (365 Días)</option>
                                </select>
                                {creditoForm.formState.errors.vigenciaTipo && (
                                    <p className="text-red-500 text-xs mt-1">{creditoForm.formState.errors.vigenciaTipo.message}</p>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant">
                                <button type="button" onClick={() => setShowCreditoModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={isSubmittingCredito} className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm flex items-center gap-2">
                                    {isSubmittingCredito && <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>}
                                    <span>Asignar Créditos</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsuariosPage;
