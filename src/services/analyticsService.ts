import axiosClient from '../config/axiosClient';
import type { AnalyticsDashboard } from '../types/analytics.types';

export const analyticsService = {
    getDashboardAnalytics: async (): Promise<AnalyticsDashboard> => {
        const response = await axiosClient.get('/analytics/dashboard');
        return response.data.data || response.data;
    },
    archivarAlumnoRiesgo: async (clienteId: number): Promise<void> => {
        await axiosClient.post(`/analytics/churn/archivar/${clienteId}`);
    }
};
