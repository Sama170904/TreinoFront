import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';

import TreinoLogo from '../components/TreinoLogo';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const login = useAuthStore(state => state.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsLoading(true);

        try {
            const data = await authService.login({ email, password });
            login(data.token);
            
            // Redirección dinámica según el rol del usuario
            const currentUser = useAuthStore.getState().usuario;
            if (currentUser?.rol === 'ADMINISTRADOR') {
                navigate('/admin');
            } else if (currentUser?.rol === 'PROFESOR') {
                navigate('/teacher/clases');
            } else {
                navigate('/clases');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Error al iniciar sesión. Revisa tus credenciales.';
            setErrorMsg(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-container-high flex items-center justify-center font-body text-on-surface p-4">
            <main className="w-full max-w-md">
                <div className="bg-surface rounded-2xl shadow-xl overflow-hidden border border-outline-variant/50 relative">
                    
                    {/* Logo Section */}
                    <div className="pt-10 pb-4 flex justify-center">
                        <TreinoLogo size="lg" />
                    </div>

                    {/* Header */}
                    <div className="text-center px-6 sm:px-8 pb-6">
                        <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface mb-1">Bienvenido de nuevo</h1>
                        <p className="font-body text-on-surface-variant text-sm">Ingresa a tu cuenta para continuar.</p>
                    </div>

                    {/* Error Alert */}
                    {errorMsg && (
                        <div className="mx-6 sm:mx-8 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2 animate-in">
                            <span className="material-symbols-outlined text-red-500 text-lg shrink-0">error</span>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-8 space-y-5">
                        <div className="space-y-4">
                            
                            {/* Email / User Field */}
                            <div>
                                <label className="block font-label text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-wider" htmlFor="email">
                                    Correo electrónico
                                </label>
                                <div className="flex items-center w-full bg-surface border border-outline-variant rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden">
                                    <div className="pl-3.5 pr-2 text-on-surface-variant flex items-center justify-center shrink-0 pointer-events-none select-none">
                                        <span className="material-symbols-outlined text-xl">mail</span>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@treino.com"
                                        className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 py-3 pr-3.5 text-on-surface font-body text-sm placeholder-on-surface-variant/50"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block font-label text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-wider" htmlFor="password">
                                    Contraseña
                                </label>
                                <div className="flex items-center w-full bg-surface border border-outline-variant rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden">
                                    <div className="pl-3.5 pr-2 text-on-surface-variant flex items-center justify-center shrink-0 pointer-events-none select-none">
                                        <span className="material-symbols-outlined text-xl">lock</span>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 py-3 text-on-surface font-body text-sm placeholder-on-surface-variant/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="px-3.5 text-on-surface-variant hover:text-primary transition-colors focus:outline-none shrink-0 flex items-center justify-center"
                                        title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md font-label text-sm font-semibold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-95 duration-200 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="animate-spin material-symbols-outlined text-xl">progress_activity</span>
                                        <span>Iniciando sesión...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Iniciar Sesión</span>
                                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Quick Access Helper */}
                    <div className="bg-surface-container py-4 px-6 border-t border-outline-variant/30 text-xs text-on-surface-variant text-center space-y-1">
                        <p className="font-semibold text-slate-700 mb-1">Cuentas de prueba preconfiguradas:</p>
                        <p><span className="font-bold text-primary">Admin:</span> admin@treino.com | admin123</p>
                        <p><span className="font-bold text-primary">Profe:</span> profesor@treino.com | profe123</p>
                        <p><span className="font-bold text-primary">Cliente:</span> cliente@treino.com | cliente123</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
