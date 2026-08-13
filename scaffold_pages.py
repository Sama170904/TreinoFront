import os
import json

base_dir = r"C:\Users\rsama\OneDrive\Documentos\visual\Treino\frontend\src"

files = {
    "pages/ClassSchedulePage.tsx": """import React, { useState, useEffect } from 'react';
import { claseService } from '../services/claseService';
import { reservaService } from '../services/reservaService';
import ClassCard from '../components/ClassCard';
import { ClaseResponse } from '../types/clase.types';

const ClassSchedulePage: React.FC = () => {
    const [clases, setClases] = useState<ClaseResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isReserving, setIsReserving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Filters
    const [dateFilter, setDateFilter] = useState('');
    const [disciplineFilter, setDisciplineFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    const loadClases = async () => {
        setIsLoading(true);
        try {
            const data = await claseService.getAll();
            setClases(data);
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || 'Error al cargar clases');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadClases();
    }, []);

    const handleReserve = async (claseId: number) => {
        setIsReserving(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        try {
            await reservaService.reservar(claseId);
            setSuccessMsg('Reserva exitosa');
            loadClases(); // reload to update cupos
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || 'Error al reservar');
        } finally {
            setIsReserving(false);
        }
    };

    const filteredClases = clases.filter(c => {
        const matchesDate = dateFilter ? c.fechaHoraInicio.startsWith(dateFilter) : true;
        const matchesDiscipline = disciplineFilter ? c.disciplina === disciplineFilter : true;
        const matchesSearch = searchFilter ? 
            (c.profesor?.nombre.toLowerCase().includes(searchFilter.toLowerCase()) || 
             c.sede?.nombre.toLowerCase().includes(searchFilter.toLowerCase())) : true;
        return matchesDate && matchesDiscipline && matchesSearch;
    });

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Horario de Clases</h2>
            
            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <input type="date" className="form-control" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                        </div>
                        <div className="col-md-4">
                            <select className="form-select" value={disciplineFilter} onChange={(e) => setDisciplineFilter(e.target.value)}>
                                <option value="">Todas las disciplinas</option>
                                <option value="Pilates">Pilates</option>
                                <option value="Barre">Barre</option>
                                <option value="Yoga">Yoga</option>
                                <option value="Funcional">Funcional</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <input type="text" className="form-control" placeholder="Buscar por Profesor o Sede" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div>Cargando...</div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {filteredClases.map(clase => (
                        <div className="col" key={clase.claseId}>
                            <ClassCard clase={clase} onReserve={() => handleReserve(clase.claseId)} isReserving={isReserving} />
                        </div>
                    ))}
                    {filteredClases.length === 0 && <div className="col-12"><p className="text-muted">No hay clases que coincidan con los filtros.</p></div>}
                </div>
            )}
        </div>
    );
};

export default ClassSchedulePage;
""",
    "pages/MyReservationsPage.tsx": """import React, { useState, useEffect } from 'react';
import { reservaService } from '../services/reservaService';
import { ReservaResponse, EstadoReserva, EstadoAsistencia } from '../types/reserva.types';
import axiosClient from '../config/axiosClient';

const MyReservationsPage: React.FC = () => {
    const [reservas, setReservas] = useState<ReservaResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const loadReservas = async () => {
        setIsLoading(true);
        try {
            // Asumiendo que el backend tiene un endpoint para mis reservas
            const response = await axiosClient.get('/reservas/mis-reservas');
            setReservas(response.data.data || response.data);
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || 'Error al cargar reservas');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReservas();
    }, []);

    const handleCancelar = async (reservaId: number) => {
        if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) return;
        setErrorMsg(null);
        setSuccessMsg(null);
        try {
            await reservaService.cancelar(reservaId);
            setSuccessMsg('Reserva cancelada correctamente');
            loadReservas();
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || 'Error al cancelar reserva');
        }
    };

    const getBadgeClass = (estado: EstadoReserva | EstadoAsistencia) => {
        switch (estado) {
            case EstadoReserva.CONFIRMADA: return 'bg-success';
            case EstadoReserva.CANCELADA_TIEMPO: return 'bg-warning text-dark';
            case EstadoReserva.CANCELADA_FUERA_TIEMPO: return 'bg-danger';
            case EstadoAsistencia.ASISTIO: return 'bg-primary';
            case EstadoAsistencia.NO_SHOW: return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    const upcoming = reservas.filter(r => new Date(r.clase?.fechaHoraInicio || '') > new Date() && r.estadoReserva === EstadoReserva.CONFIRMADA);
    const history = reservas.filter(r => new Date(r.clase?.fechaHoraInicio || '') <= new Date() || r.estadoReserva !== EstadoReserva.CONFIRMADA);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Mis Reservas</h2>
            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <ul className="nav nav-tabs mb-4" id="reservasTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="upcoming-tab" data-bs-toggle="tab" data-bs-target="#upcoming" type="button" role="tab">Próximas Clases</button>
                </li>
                <li className="nav-item" role="presentation">
                    <button className="nav-link" id="history-tab" data-bs-toggle="tab" data-bs-target="#history" type="button" role="tab">Historial</button>
                </li>
            </ul>

            <div className="tab-content" id="reservasTabContent">
                <div className="tab-pane fade show active" id="upcoming" role="tabpanel">
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {upcoming.map(reserva => (
                            <div className="col" key={reserva.reservaId}>
                                <div className="card shadow-sm h-100">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="badge bg-primary">{reserva.clase?.disciplina}</span>
                                            <span className={`badge ${getBadgeClass(reserva.estadoReserva)}`}>{reserva.estadoReserva}</span>
                                        </div>
                                        <h5 className="card-title">{reserva.clase ? new Date(reserva.clase.fechaHoraInicio).toLocaleString() : ''}</h5>
                                        <p className="card-text mb-1">Sede: {reserva.clase?.sede?.nombre}</p>
                                        <p className="card-text mb-3">Profesor: {reserva.clase?.profesor?.nombre}</p>
                                        <button className="btn btn-outline-danger btn-sm w-100" onClick={() => handleCancelar(reserva.reservaId)}>Cancelar Reserva</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {upcoming.length === 0 && <p className="text-muted">No tienes próximas clases.</p>}
                    </div>
                </div>
                <div className="tab-pane fade" id="history" role="tabpanel">
                    <div className="table-responsive">
                        <table className="table table-striped align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Disciplina</th>
                                    <th>Sede</th>
                                    <th>Estado Reserva</th>
                                    <th>Asistencia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(reserva => (
                                    <tr key={reserva.reservaId}>
                                        <td>{reserva.clase ? new Date(reserva.clase.fechaHoraInicio).toLocaleString() : ''}</td>
                                        <td>{reserva.clase?.disciplina}</td>
                                        <td>{reserva.clase?.sede?.nombre}</td>
                                        <td><span className={`badge ${getBadgeClass(reserva.estadoReserva)}`}>{reserva.estadoReserva}</span></td>
                                        <td><span className={`badge ${getBadgeClass(reserva.estadoAsistencia)}`}>{reserva.estadoAsistencia}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {history.length === 0 && <p className="text-muted">No hay historial de reservas.</p>}
                </div>
            </div>
        </div>
    );
};

export default MyReservationsPage;
""",
    "pages/CreditBalanceDashboard.tsx": """import React, { useState, useEffect } from 'react';
import { creditoService } from '../services/creditoService';
import { HistorialCredito } from '../types/credito.types';

const CreditBalanceDashboard: React.FC = () => {
    const [saldo, setSaldo] = useState<number>(0);
    const [historial, setHistorial] = useState<HistorialCredito[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const saldoData = await creditoService.getMiSaldo();
                setSaldo(saldoData?.totalCreditos || 0);
                const histData = await creditoService.getHistorial();
                setHistorial(histData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Mis Créditos</h2>
            
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm bg-warning text-dark border-0">
                        <div className="card-body text-center p-4">
                            <i className="bi bi-coin fs-1 mb-2"></i>
                            <h3>{saldo}</h3>
                            <p className="mb-0 fw-bold">Créditos Disponibles</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Historial de Transacciones</h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo Movimiento</th>
                                    <th>Cantidad</th>
                                    <th>Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map(h => (
                                    <tr key={h.historialId}>
                                        <td>{new Date(h.fechaMovimiento).toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${h.cantidad > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                {h.tipoMovimiento}
                                            </span>
                                        </td>
                                        <td className={`fw-bold ${h.cantidad > 0 ? 'text-success' : 'text-danger'}`}>
                                            {h.cantidad > 0 ? '+' : ''}{h.cantidad}
                                        </td>
                                        <td>{h.descripcion}</td>
                                    </tr>
                                ))}
                                {historial.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-3">No hay transacciones registradas</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditBalanceDashboard;
""",
    "pages/ProfilePage.tsx": """import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { usuarioService } from '../services/usuarioService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioSchema, UsuarioFormData } from '../schemas/usuarioSchema';

const ProfilePage: React.FC = () => {
    const { usuario } = useAuthStore();
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // In a real app, you would omit password and role for basic profile edit, 
    // but we use the requested schema to adapt
    const { register, handleSubmit, formState: { errors }, reset } = useForm<UsuarioFormData>({
        resolver: zodResolver(usuarioSchema)
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await usuarioService.getMe();
                setProfile(data);
                reset({
                    nombre: data.nombre,
                    apellido: data.apellido,
                    email: data.email,
                    rol: data.rol
                });
            } catch (err) {
                console.error(err);
            }
        };
        loadProfile();
    }, [reset]);

    const onSubmit = async (data: UsuarioFormData) => {
        try {
            await usuarioService.update({ ...data, userId: profile.userId });
            setIsEditing(false);
            const updated = await usuarioService.getMe();
            setProfile(updated);
        } catch (err) {
            console.error(err);
        }
    };

    if (!profile) return <div className="container mt-4">Cargando...</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Mi Perfil</h2>
            
            <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
                <div className="card-body">
                    {!isEditing ? (
                        <div>
                            <p><strong>Nombre:</strong> {profile.nombre} {profile.apellido}</p>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Rol:</strong> <span className="badge bg-secondary">{profile.rol}</span></p>
                            <p><strong>Estado:</strong> <span className="badge bg-success">{profile.estado}</span></p>
                            <button className="btn btn-dark" onClick={() => setIsEditing(true)}>Editar Perfil</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-3">
                                <label className="form-label">Nombre</label>
                                <input type="text" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} {...register('nombre')} />
                                {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Apellido</label>
                                <input type="text" className={`form-control ${errors.apellido ? 'is-invalid' : ''}`} {...register('apellido')} />
                                {errors.apellido && <div className="invalid-feedback">{errors.apellido.message}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register('email')} disabled />
                            </div>
                            
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary">Guardar</button>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
""",
    "pages/TeacherClassPage.tsx": """import React, { useState, useEffect } from 'react';
import { claseService } from '../services/claseService';
import { ClaseResponse } from '../types/clase.types';
import { useNavigate } from 'react-router-dom';

const TeacherClassPage: React.FC = () => {
    const [clases, setClases] = useState<ClaseResponse[]>([]);
    const navigate = useNavigate();

    const loadClases = async () => {
        try {
            const data = await claseService.getAll();
            setClases(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadClases();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Seguro de eliminar esta clase?')) return;
        try {
            await claseService.delete(id);
            loadClases();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Mis Clases</h2>
                <button className="btn btn-primary" onClick={() => {/* Open modal */}}>+ Nueva Clase</button>
            </div>
            
            <div className="table-responsive shadow-sm rounded">
                <table className="table table-striped table-hover mb-0 align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>Fecha</th>
                            <th>Disciplina</th>
                            <th>Sede</th>
                            <th>Cupos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clases.map(clase => (
                            <tr key={clase.claseId}>
                                <td>{new Date(clase.fechaHoraInicio).toLocaleString()}</td>
                                <td>{clase.disciplina}</td>
                                <td>{clase.sede?.nombre}</td>
                                <td>{clase.cuposReservados}/{clase.cupoMaximo}</td>
                                <td>
                                    <div className="btn-group">
                                        <button className="btn btn-sm btn-outline-primary">Editar</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(clase.claseId)}>Eliminar</button>
                                        <button className="btn btn-sm btn-success" onClick={() => navigate(`/teacher/check-in?claseId=${clase.claseId}`)}>Pase de Lista</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherClassPage;
""",
    "pages/TeacherCheckInPage.tsx": """import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reservaService } from '../services/reservaService';
import { EstadoAsistencia } from '../types/reserva.types';
import axiosClient from '../config/axiosClient';

const TeacherCheckInPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const claseIdParam = searchParams.get('claseId');
    
    const [claseId, setClaseId] = useState<string>(claseIdParam || '');
    const [reservas, setReservas] = useState<any[]>([]);

    useEffect(() => {
        if (claseId) {
            const loadReservas = async () => {
                try {
                    const response = await axiosClient.get(`/clases/${claseId}/reservas`);
                    setReservas(response.data.data || response.data);
                } catch (err) {
                    console.error(err);
                }
            };
            loadReservas();
        }
    }, [claseId]);

    const handleCheckIn = async (reservaId: number, estado: EstadoAsistencia) => {
        try {
            await reservaService.checkIn(reservaId, estado);
            setReservas(reservas.map(r => r.reservaId === reservaId ? { ...r, estadoAsistencia: estado } : r));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Pase de Lista</h2>
            
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <label className="form-label fw-bold">Seleccionar Clase (ID)</label>
                    <div className="d-flex gap-2">
                        <input type="text" className="form-control" value={claseId} onChange={(e) => setClaseId(e.target.value)} placeholder="Ej: 1" />
                        <button className="btn btn-dark" onClick={() => setClaseId(claseId)}>Buscar</button>
                    </div>
                </div>
            </div>

            {reservas.length > 0 && (
                <div className="table-responsive shadow-sm rounded">
                    <table className="table table-striped align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Alumno</th>
                                <th>Email</th>
                                <th>Estado Reserva</th>
                                <th>Estado Asistencia</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservas.map(reserva => (
                                <tr key={reserva.reservaId}>
                                    <td>{reserva.cliente?.nombre} {reserva.cliente?.apellido}</td>
                                    <td>{reserva.cliente?.email}</td>
                                    <td>{reserva.estadoReserva}</td>
                                    <td><span className={`badge ${reserva.estadoAsistencia === 'ASISTIO' ? 'bg-success' : reserva.estadoAsistencia === 'NO_SHOW' ? 'bg-danger' : 'bg-secondary'}`}>{reserva.estadoAsistencia}</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-success me-2" onClick={() => handleCheckIn(reserva.reservaId, EstadoAsistencia.ASISTIO)}>Asistió</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleCheckIn(reserva.reservaId, EstadoAsistencia.NO_SHOW)}>No Show</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TeacherCheckInPage;
""",
    "pages/AdminDashboardPage.tsx": """import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Dashboard Administrador</h2>
            
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm bg-primary text-white border-0">
                        <div className="card-body">
                            <h5>Total Clientes</h5>
                            <h2 className="mb-0">156</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm bg-success text-white border-0">
                        <div className="card-body">
                            <h5>Clases Activas Hoy</h5>
                            <h2 className="mb-0">24</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm bg-warning text-dark border-0">
                        <div className="card-body">
                            <h5>Créditos Asignados Este Mes</h5>
                            <h2 className="mb-0">4,250</h2>
                        </div>
                    </div>
                </div>
            </div>

            <h4 className="mb-3">Accesos Rápidos</h4>
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-body text-center d-flex flex-column justify-content-center">
                            <i className="bi bi-building fs-1 mb-2"></i>
                            <h5 className="card-title">Gestión de Sedes</h5>
                            <Link to="/admin/sedes" className="btn btn-outline-dark mt-2">Ir a Sedes</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-body text-center d-flex flex-column justify-content-center">
                            <i className="bi bi-people fs-1 mb-2"></i>
                            <h5 className="card-title">Gestión de Usuarios</h5>
                            <Link to="/admin/usuarios" className="btn btn-outline-dark mt-2">Ir a Usuarios</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
""",
    "pages/AdminSedesPage.tsx": """import React, { useState, useEffect } from 'react';
import { sedeService } from '../services/sedeService';
import { SedeResponse } from '../types/sede.types';

const AdminSedesPage: React.FC = () => {
    const [sedes, setSedes] = useState<SedeResponse[]>([]);

    const loadSedes = async () => {
        try {
            const data = await sedeService.getAll();
            setSedes(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadSedes();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Seguro de desactivar esta sede?')) return;
        try {
            await sedeService.delete(id);
            loadSedes();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Sedes</h2>
                <button className="btn btn-dark">+ Crear Sede</button>
            </div>
            
            <div className="table-responsive shadow-sm rounded">
                <table className="table table-striped align-middle mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Capacidad</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sedes.map(sede => (
                            <tr key={sede.sedeId}>
                                <td>{sede.sedeId}</td>
                                <td>{sede.nombre}</td>
                                <td>{sede.direccion}</td>
                                <td>{sede.capacidadMaxima}</td>
                                <td><span className={`badge ${sede.estado === 'ACTIVO' ? 'bg-success' : 'bg-danger'}`}>{sede.estado}</span></td>
                                <td>
                                    <button className="btn btn-sm btn-outline-primary me-2">Editar</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(sede.sedeId)}>Desactivar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSedesPage;
""",
    "pages/AdminUsuariosPage.tsx": """import React, { useState, useEffect } from 'react';
import { usuarioService } from '../services/usuarioService';
import { UsuarioResponse } from '../types/usuario.types';

const AdminUsuariosPage: React.FC = () => {
    const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);

    const loadUsuarios = async () => {
        try {
            const data = await usuarioService.getAll();
            setUsuarios(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadUsuarios();
    }, []);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Usuarios</h2>
                <button className="btn btn-dark">+ Crear Usuario</button>
            </div>
            
            <div className="table-responsive shadow-sm rounded">
                <table className="table table-striped align-middle mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(u => (
                            <tr key={u.userId}>
                                <td>{u.userId}</td>
                                <td>{u.nombre} {u.apellido}</td>
                                <td>{u.email}</td>
                                <td><span className="badge bg-secondary">{u.rol}</span></td>
                                <td><span className="badge bg-success">{u.estado}</span></td>
                                <td>
                                    <button className="btn btn-sm btn-outline-warning me-2">Créditos</button>
                                    <button className="btn btn-sm btn-outline-primary">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsuariosPage;
""",
    "routes/AppRouter.tsx": """import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import LoginPage from '../pages/LoginPage';
import ClassSchedulePage from '../pages/ClassSchedulePage';
import MyReservationsPage from '../pages/MyReservationsPage';
import CreditBalanceDashboard from '../pages/CreditBalanceDashboard';
import ProfilePage from '../pages/ProfilePage';
import TeacherClassPage from '../pages/TeacherClassPage';
import TeacherCheckInPage from '../pages/TeacherCheckInPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminSedesPage from '../pages/AdminSedesPage';
import AdminUsuariosPage from '../pages/AdminUsuariosPage';

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                
                <Route element={
                    <>
                        <Navbar />
                        <ProtectedRoute />
                    </>
                }>
                    <Route path="/" element={<Navigate to="/profile" replace />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    
                    {/* Rutas Cliente */}
                    <Route element={<ProtectedRoute allowedRoles={['CLIENTE']} />}>
                        <Route path="/clases" element={<ClassSchedulePage />} />
                        <Route path="/mis-reservas" element={<MyReservationsPage />} />
                        <Route path="/creditos" element={<CreditBalanceDashboard />} />
                    </Route>

                    {/* Rutas Profesor */}
                    <Route element={<ProtectedRoute allowedRoles={['PROFESOR', 'ADMINISTRADOR']} />}>
                        <Route path="/teacher/clases" element={<TeacherClassPage />} />
                        <Route path="/teacher/check-in" element={<TeacherCheckInPage />} />
                    </Route>

                    {/* Rutas Administrador */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} />}>
                        <Route path="/admin" element={<AdminDashboardPage />} />
                        <Route path="/admin/sedes" element={<AdminSedesPage />} />
                        <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
                    </Route>
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Successfully created Fase 5 pages.")
