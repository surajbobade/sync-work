import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
