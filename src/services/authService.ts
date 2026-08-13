import axiosClient from '../config/axiosClient';
import type { LoginFormData } from '../schemas/loginSchema';

export const authService = {
    login: async (data: LoginFormData) => {
        const response = await axiosClient.post('/auth/login', data);
        return response.data.data || response.data;
    }
};
