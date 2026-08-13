import axiosClient from '../config/axiosClient';
import type { CreditoAsignar, CreditoQuitar } from '../types/credito.types';

export const creditoService = {
    asignar: async (data: CreditoAsignar) => {
        const response = await axiosClient.post('/creditos/asignar', data);
        return response.data.data || response.data;
    },
    quitar: async (data: CreditoQuitar) => {
        const response = await axiosClient.post('/creditos/quitar', data);
        return response.data.data || response.data;
    },
    getMiSaldo: async () => {
        const response = await axiosClient.get('/creditos/mi-saldo');
        return response.data.data || response.data;
    },
    getHistorial: async () => {
        const response = await axiosClient.get('/creditos/historial');
        return response.data.data || response.data;
    }
};
