import axiosClient from '../config/axiosClient';
import type { SedeCreate, SedeUpdate } from '../types/sede.types';

export const sedeService = {
    getAll: async () => {
        const response = await axiosClient.get('/sedes');
        return response.data.data || response.data;
    },
    create: async (data: SedeCreate) => {
        const response = await axiosClient.post('/sedes', data);
        return response.data.data || response.data;
    },
    update: async (data: SedeUpdate) => {
        const response = await axiosClient.put(`/sedes/${data.sedeId}`, {
            id: data.sedeId,
            ...data
        });
        return response.data.data || response.data;
    },
    delete: async (id: number) => {
        const response = await axiosClient.delete(`/sedes/${id}`);
        return response.data.data || response.data;
    }
};
