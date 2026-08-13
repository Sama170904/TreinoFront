import React, { useState, useEffect } from 'react';
import { creditoService } from '../services/creditoService';
import type { HistorialCredito } from '../types/credito.types';

const CreditBalanceDashboard: React.FC = () => {
    const [saldo, setSaldo] = useState<number>(0);
    const [historial, setHistorial] = useState<HistorialCredito[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const saldoData = await creditoService.getMiSaldo();
                // El backend retorna un número primitivo (ej. 10) o un objeto. Extraemos la cantidad de forma segura:
                const cantidadSaldo = typeof saldoData === 'number' 
                    ? saldoData 
                    : (saldoData?.totalCreditos ?? saldoData?.saldo ?? (Number(saldoData) || 0));
                setSaldo(cantidadSaldo);

                const historialData = await creditoService.getHistorial();
                setHistorial(Array.isArray(historialData) ? historialData : []);
            } catch (err) {
                console.error('Error cargando información de créditos:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-surface-container-high p-6 lg:p-10 font-body text-on-surface">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div>
                    <h1 className="font-headline text-2xl font-extrabold text-slate-900">Mis Créditos</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Consulta tu saldo de créditos disponibles y el historial detallado de tus movimientos.</p>
                </div>

                {/* Credit Balance Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-primary to-primary-hover text-white rounded-2xl p-6 shadow-xl relative overflow-hidden md:col-span-2 flex flex-col justify-between">
                        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs uppercase font-label font-bold tracking-wider text-white/80">Saldo Actual de Créditos</p>
                                <h2 className="text-5xl font-headline font-extrabold mt-2">
                                    {isLoading ? '...' : saldo} <span className="text-xl font-normal text-white/80">créditos</span>
                                </h2>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <span className="material-symbols-outlined text-2xl text-white">account_balance_wallet</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-white/20 text-xs text-white/90">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">bolt</span>
                                Cada crédito te permite reservar 1 clase
                            </span>
                            <span className="flex items-center gap-1 ml-auto">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                Devolución hasta 15 min antes
                            </span>
                        </div>
                    </div>

                    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                                <span className="material-symbols-outlined">help</span>
                                <span>¿Cómo funcionan tus créditos?</span>
                            </div>
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                Los créditos son asignados por el Administrador del estudio según el paquete adquirido.
                                Se consumen de manera **FIFO** (los más próximos a vencer se usan primero).
                            </p>
                        </div>
                        <div className="mt-4 p-3 bg-surface-container-low rounded-xl text-xs text-slate-600 font-semibold">
                            💡 Tip: Mantén tus créditos activos consultando la fecha de vencimiento.
                        </div>
                    </div>
                </div>

                {/* History Log Section */}
                <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
                    <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                        <h2 className="font-headline font-bold text-base text-slate-900">Historial de Movimientos</h2>
                        <span className="text-xs text-slate-500 font-mono">{historial.length} registros</span>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                            <span className="animate-spin material-symbols-outlined text-3xl text-primary mb-2">progress_activity</span>
                            <span>Cargando historial de créditos...</span>
                        </div>
                    ) : historial.length === 0 ? (
                        <div className="p-12 text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-40">history</span>
                            <p className="font-semibold text-slate-700">No hay movimientos registrados</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-label uppercase tracking-wider text-on-surface-variant font-bold">
                                        <th className="py-3.5 px-6">Tipo Movimiento</th>
                                        <th className="py-3.5 px-6">Descripción</th>
                                        <th className="py-3.5 px-6">Cantidad</th>
                                        <th className="py-3.5 px-6">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/60 text-sm">
                                    {historial.map((h) => {
                                        const isPositive = h.cantidad > 0;

                                        return (
                                            <tr key={h.historialId} className="hover:bg-surface-container-high/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        h.tipoMovimiento === 'ASIGNACION' || h.tipoMovimiento === 'DEVOLUCION_CANCELACION'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-xs">
                                                            {isPositive ? 'add_circle' : 'remove_circle'}
                                                        </span>
                                                        {h.tipoMovimiento}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-slate-800 font-medium">{h.descripcion}</td>
                                                <td className={`py-4 px-6 font-bold font-mono ${isPositive ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                    {isPositive ? `+${h.cantidad}` : h.cantidad}
                                                </td>
                                                <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                                                    {new Date(h.fechaMovimiento).toLocaleString()}
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

export default CreditBalanceDashboard;
