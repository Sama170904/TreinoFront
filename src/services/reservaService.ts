import axiosClient from '../config/axiosClient';
import type { EstadoAsistencia } from '../types/reserva.types';

export const reservaService = {
    getMisReservas: async () => {
        const response = await axiosClient.get('/reservas/mis-reservas');
        return response.data.data || response.data;
    },
    reservar: async (claseId: number) => {
        const response = await axiosClient.post('/reservas', { claseId });
        return response.data.data || response.data;
    },
    cancelar: async (reservaId: number) => {
        const response = await axiosClient.post(`/reservas/${reservaId}/cancelar`);
        return response.data.data || response.data;
    },
    checkIn: async (reservaId: number, estado: EstadoAsistencia) => {
        const response = await axiosClient.put(`/reservas/${reservaId}/check-in`, { estado });
        return response.data.data || response.data;
    }
};
