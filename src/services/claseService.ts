import axiosClient from '../config/axiosClient';

export const claseService = {
    getAll: async (params?: any) => {
        const response = await axiosClient.get('/clases', { params });
        return response.data.data || response.data;
    },
    create: async (data: any) => {
        const response = await axiosClient.post('/clases', data);
        return response.data.data || response.data;
    },
    update: async (id: number, data: any) => {
        const response = await axiosClient.put(`/clases/${id}`, data);
        return response.data.data || response.data;
    },
    delete: async (id: number) => {
        const response = await axiosClient.delete(`/clases/${id}`);
        return response.data.data || response.data;
    }
};
