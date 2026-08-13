import React, { useState, useEffect } from 'react';
import { claseService } from '../services/claseService';
import { reservaService } from '../services/reservaService';
import { sedeService } from '../services/sedeService';
import type { ClaseResponse } from '../types/clase.types';
import type { ReservaResponse } from '../types/reserva.types';
import type { SedeResponse } from '../types/sede.types';

// Utility to get YYYY-MM-DD string in local timezone
const getLocalDateString = (dateObj: Date = new Date()): string => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ClassSchedulePage: React.FC = () => {
    const [clases, setClases] = useState<ClaseResponse[]>([]);
    const [misReservas, setMisReservas] = useState<ReservaResponse[]>([]);
    const [sedesList, setSedesList] = useState<SedeResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isReserving, setIsReserving] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Filter States (Default selectedDate to TODAY)
    const [searchFilter, setSearchFilter] = useState('');
    const [selectedSede, setSelectedSede] = useState<string>('');
    const [selectedProfesor, setSelectedProfesor] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

    const loadData = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const clasesData = await claseService.getAll();
            setClases(Array.isArray(clasesData) ? clasesData : []);

            try {
                const sedesData = await sedeService.getAll();
                setSedesList(Array.isArray(sedesData) ? sedesData : []);
            } catch (sedeErr) {
                console.warn('No se pudo cargar la lista completa de sedes:', sedeErr);
            }

            try {
                const reservasData = await reservaService.getMisReservas();
                setMisReservas(Array.isArray(reservasData) ? reservasData : []);
            } catch (reservaErr) {
                setMisReservas([]);
            }
        } catch (err) {
            console.error('Error al cargar la información de clases:', err);
            setErrorMsg('Error al cargar la información de clases');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleReservar = async (claseId: number) => {
        setErrorMsg(null);
        setSuccessMsg(null);
        setIsReserving(claseId);
        try {
            await reservaService.reservar(claseId);
            setSuccessMsg('¡Reserva realizada exitosamente! Se descontó 1 crédito.');
            await loadData();
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'No fue posible completar la reserva. Verifica tus créditos o disponibilidad.';
            setErrorMsg(msg);
        } finally {
            setIsReserving(null);
        }
    };

    const handleClearFilters = () => {
        setSearchFilter('');
        setSelectedSede('');
        setSelectedProfesor('');
        setSelectedDate('');
    };

    const handleSetToday = () => {
        setSelectedDate(getLocalDateString());
    };

    const handleSetTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(getLocalDateString(tomorrow));
    };

    // Set of numeric class IDs reserved by current user with CONFIRMADA status
    const reservadasIds = new Set(
        misReservas
            .filter(r => r.estadoReserva === 'CONFIRMADA')
            .map(r => Number(r.claseId || (r.clase as any)?.claseId))
            .filter(id => !isNaN(id) && id > 0)
    );

    // Extract dynamic unique Sede options
    const uniqueSedes = Array.from(
        new Set([
            ...sedesList.map(s => s.nombre),
            ...clases.map(c => c.sedeNombre || c.sede?.nombre)
        ].filter((s): s is string => Boolean(s)))
    ).sort();

    // Extract dynamic unique Profesor options
    const uniqueProfesores = Array.from(
        new Set(
            clases
                .map(c => c.profesorNombre || (c.profesor ? `${c.profesor.nombre} ${c.profesor.apellido}`.trim() : ''))
                .filter(Boolean)
        )
    ).sort();

    // Filter and strictly sort by start date (fechaHoraInicio ASC)
    const filteredClases = clases
        .filter(c => {
            const disc = c.disciplina || '';
            const sede = c.sedeNombre || c.sede?.nombre || '';
            const prof = c.profesorNombre || (c.profesor ? `${c.profesor.nombre} ${c.profesor.apellido}`.trim() : '');
            const query = searchFilter.toLowerCase();

            // Date filtering
            let classDateStr = '';
            if (c.fechaHoraInicio) {
                const d = new Date(c.fechaHoraInicio);
                classDateStr = getLocalDateString(d);
            }

            const matchesQuery = !query || disc.toLowerCase().includes(query) || sede.toLowerCase().includes(query) || prof.toLowerCase().includes(query);
            const matchesSede = !selectedSede || sede === selectedSede;
            const matchesProfesor = !selectedProfesor || prof === selectedProfesor;
            const matchesDate = !selectedDate || classDateStr === selectedDate;

            return matchesQuery && matchesSede && matchesProfesor && matchesDate;
        })
        .sort((a, b) => {
            const timeA = a.fechaHoraInicio ? new Date(a.fechaHoraInicio).getTime() : 0;
            const timeB = b.fechaHoraInicio ? new Date(b.fechaHoraInicio).getTime() : 0;
            return timeA - timeB;
        });

    const isTodaySelected = selectedDate === getLocalDateString();
    const hasActiveFilters = Boolean(searchFilter || selectedSede || selectedProfesor || selectedDate);

    return (
        <div className="min-h-screen bg-surface-container-high p-4 sm:p-6 lg:p-10 font-body text-on-surface pb-24 md:pb-12">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-headline text-2xl font-extrabold text-slate-900">Horarios de Clases</h1>
                        <p className="text-on-surface-variant text-sm mt-0.5">Explora y reserva tus sesiones de entrenamiento ordenadas por horario.</p>
                    </div>

                    {/* Quick Date Shortcuts */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSetToday}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                                isTodaySelected
                                    ? 'bg-primary text-white shadow-primary/20'
                                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-base">today</span>
                            <span>Clases de Hoy</span>
                        </button>

                        <button
                            onClick={handleSetTomorrow}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                                selectedDate === getLocalDateString(new Date(Date.now() + 86400000))
                                    ? 'bg-primary text-white shadow-primary/20'
                                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-base">event</span>
                            <span>Mañana</span>
                        </button>

                        <button
                            onClick={() => setSelectedDate('')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                                !selectedDate
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-base">date_range</span>
                            <span>Todas las Fechas</span>
                        </button>
                    </div>
                </div>

                {/* Feedback Alerts */}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between animate-in shadow-sm">
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
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center justify-between animate-in shadow-sm">
                        <div className="flex items-center gap-2 font-semibold">
                            <span className="material-symbols-outlined text-red-600">error</span>
                            <span>{errorMsg}</span>
                        </div>
                        <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                )}

                {/* Filter Toolbar */}
                <div className="bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant flex flex-col md:flex-row items-center gap-3">
                    
                    {/* Text Search Input */}
                    <div className="relative flex-1 w-full">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">search</span>
                        <input
                            type="text"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            placeholder="Buscar disciplina..."
                            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-900"
                        />
                    </div>

                    {/* Date Picker Filter */}
                    <div className="relative w-full md:w-48">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">calendar_today</span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            aria-label="Filtrar por Fecha"
                            className="w-full pl-10 pr-3 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-900 cursor-pointer"
                        />
                    </div>

                    {/* Sede Dropdown Filter */}
                    <div className="relative w-full md:w-52">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">location_on</span>
                        <select
                            value={selectedSede}
                            onChange={(e) => setSelectedSede(e.target.value)}
                            aria-label="Filtrar por Sede"
                            className="w-full pl-10 pr-8 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-900 appearance-none cursor-pointer"
                        >
                            <option value="">Todas las Sedes</option>
                            {uniqueSedes.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none text-lg">expand_more</span>
                    </div>

                    {/* Profesor Dropdown Filter */}
                    <div className="relative w-full md:w-52">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">person</span>
                        <select
                            value={selectedProfesor}
                            onChange={(e) => setSelectedProfesor(e.target.value)}
                            aria-label="Filtrar por Instructor"
                            className="w-full pl-10 pr-8 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-900 appearance-none cursor-pointer"
                        >
                            <option value="">Todos los Instructores</option>
                            {uniqueProfesores.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none text-lg">expand_more</span>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            title="Limpiar filtros"
                            className="w-full md:w-auto px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 flex-shrink-0"
                        >
                            <span className="material-symbols-outlined text-base">filter_alt_off</span>
                            <span>Limpiar</span>
                        </button>
                    )}
                </div>

                {/* Classes Grid */}
                {isLoading ? (
                    <div className="p-16 text-center text-on-surface-variant flex flex-col items-center">
                        <span className="animate-spin material-symbols-outlined text-4xl text-primary mb-2">progress_activity</span>
                        <span>Cargando clases disponibles...</span>
                    </div>
                ) : filteredClases.length === 0 ? (
                    <div className="p-16 text-center bg-surface rounded-2xl border border-outline-variant text-on-surface-variant space-y-3">
                        <span className="material-symbols-outlined text-5xl opacity-40">event_busy</span>
                        <div>
                            <p className="font-semibold text-slate-700 text-base">
                                {selectedDate
                                    ? `No se encontraron clases programadas para ${isTodaySelected ? 'el día de hoy' : selectedDate}`
                                    : 'No se encontraron clases con los filtros aplicados'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Intenta cambiar la fecha, seleccionar otra sede o ver todas las clases disponibles.</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate('')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-sm">date_range</span>
                                    Ver Clases de Todas las Fechas
                                </button>
                            )}
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                                    Restablecer Todos los Filtros
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClases.map((c) => {
                            const isFull = c.cuposReservados >= c.cupoMaximo;
                            const yaReservada = reservadasIds.has(Number(c.claseId));
                            const porcentaje = Math.min(100, Math.round((c.cuposReservados / c.cupoMaximo) * 100));
                            const sedeNombre = c.sedeNombre || c.sede?.nombre || 'Sede Principal';
                            const profesorNombre = c.profesorNombre || (c.profesor ? `${c.profesor.nombre} ${c.profesor.apellido}` : 'Instructor Asignado');

                            return (
                                <div key={c.claseId} className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-all flex flex-col justify-between group">
                                    <div>
                                        {/* Top Badge & Venue */}
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container text-primary rounded-full text-xs font-bold font-label">
                                                <span className="material-symbols-outlined text-sm">fitness_center</span>
                                                {c.disciplina}
                                            </span>
                                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">location_on</span>
                                                {sedeNombre}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                                            {c.descripcion || 'Entrenamiento dinámico diseñado para mejorar fuerza y flexibilidad.'}
                                        </p>

                                        {/* Schedule */}
                                        <div className="p-3 bg-surface-container-low rounded-xl mb-4 space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                                                <span className="material-symbols-outlined text-primary text-base">calendar_today</span>
                                                <span>{c.fechaHoraInicio ? new Date(c.fechaHoraInicio).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Fecha por confirmar'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono pl-6">
                                                <span>{c.fechaHoraInicio ? new Date(c.fechaHoraInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} {c.fechaHoraFin ? `- ${new Date(c.fechaHoraFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
                                            </div>
                                        </div>

                                        {/* Instructor */}
                                        <div className="flex items-center gap-2.5 text-xs text-slate-600 mb-4">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600">
                                                {profesorNombre.charAt(0)}
                                            </div>
                                            <span>Instructor: <strong className="text-slate-800">{profesorNombre}</strong></span>
                                        </div>

                                        {/* Capacity Bar */}
                                        <div className="mb-6">
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-slate-600">Disponibilidad</span>
                                                <span className={isFull ? 'text-red-600 font-bold' : 'text-slate-500'}>
                                                    {c.cuposReservados} / {c.cupoMaximo} cupos
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-primary'}`}
                                                    style={{ width: `${porcentaje}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleReservar(c.claseId)}
                                        disabled={isFull || yaReservada || isReserving === c.claseId}
                                        className={`w-full py-3 px-4 rounded-xl text-sm font-label font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                                            yaReservada
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default font-bold'
                                                : isFull
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-md'
                                        }`}
                                    >
                                        {isReserving === c.claseId ? (
                                            <>
                                                <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                                <span>Reservando...</span>
                                            </>
                                        ) : yaReservada ? (
                                            <>
                                                <span className="material-symbols-outlined text-lg text-emerald-600">task_alt</span>
                                                <span>✓ Clase Reservada</span>
                                            </>
                                        ) : isFull ? (
                                            <>
                                                <span className="material-symbols-outlined text-lg">block</span>
                                                <span>Cupo Lleno</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Reservar Clase (1 Crédito)</span>
                                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassSchedulePage;
