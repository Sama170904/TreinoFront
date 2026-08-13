import React from 'react';
import type { ClaseResponse } from '../types/clase.types';

interface Props {
    clase: ClaseResponse;
    onReserve?: (id: number) => void;
    isReserving?: boolean;
}

const ClassCard: React.FC<Props> = ({ clase, onReserve, isReserving = false }) => {
    const isFull = clase.cuposReservados >= clase.cupoMaximo;
    const progress = (clase.cuposReservados / clase.cupoMaximo) * 100;

    return (
        <div className="card shadow-sm h-100">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary fs-6">{clase.disciplina}</span>
                    <small className="text-muted">{new Date(clase.fechaHoraInicio).toLocaleDateString()}</small>
                </div>
                
                <h5 className="card-title mt-3">{new Date(clase.fechaHoraInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(clase.fechaHoraFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h5>
                <p className="card-text text-muted mb-2">{clase.sede?.nombre || 'Sede'}</p>
                <p className="card-text mb-3"><i className="bi bi-person"></i> Prof. {clase.profesor?.nombre || 'N/A'}</p>

                <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                        <span>Cupos: {clase.cuposReservados}/{clase.cupoMaximo}</span>
                        {isFull && <span className="text-danger fw-bold">LLENO</span>}
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                        <div 
                            className={`progress-bar ${isFull ? 'bg-danger' : 'bg-success'}`} 
                            role="progressbar" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                </div>

                {onReserve && (
                    <button 
                        className={`btn w-100 ${isFull ? 'btn-secondary' : 'btn-dark'}`}
                        onClick={() => onReserve(clase.claseId)}
                        disabled={isFull || isReserving}
                    >
                        {isReserving ? 'Reservando...' : isFull ? 'Sin Cupos' : 'Reservar'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ClassCard;
