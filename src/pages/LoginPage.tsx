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
                            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-8 space-y-5">
                        <div className="space-y-4">
                            
                            {/* Email / Person Field */}
                            <div>
                                <label className="block font-label text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-wider" htmlFor="email">
                                    Correo electrónico
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 z-10 flex items-center pointer-events-none text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@treino.com"
                                        className="block w-full border border-outline-variant rounded-xl bg-surface text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-body text-sm py-3"
                                        style={{ paddingLeft: '3rem', paddingRight: '1rem' }}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block font-label text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-wider" htmlFor="password">
                                    Contraseña
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3.5 z-10 flex items-center pointer-events-none text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="block w-full border border-outline-variant rounded-xl bg-surface text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-body text-sm py-3"
                                        style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 z-10 flex items-center text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                        title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.858A9.954 9.954 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.59-4.59a3 3 0 10-4.243-4.243m4.242 4.242L3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
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
                                        <svg className="w-5 h-5 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Iniciando sesión...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Iniciar Sesión</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
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
