import axiosClient from '../config/axiosClient';

export const usuarioService = {
    getMe: async () => {
        const response = await axiosClient.get('/usuarios/me');
        return response.data.data || response.data;
    },
    getAll: async () => {
        const response = await axiosClient.get('/usuarios');
        return response.data.data || response.data;
    },
    create: async (data: any) => {
        const response = await axiosClient.post('/usuarios', data);
        return response.data.data || response.data;
    },
    update: async (idOrData: any, optionalData?: any) => {
        const userId = typeof idOrData === 'object' ? idOrData.userId : idOrData;
        const body = optionalData || idOrData;
        const response = await axiosClient.put(`/usuarios/${userId}`, body);
        return response.data.data || response.data;
    }
};
