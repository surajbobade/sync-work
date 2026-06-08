import { apiClient } from './axios';

export const login = (data: { email: string; password: string }) => {
    return apiClient.post('/auth/login', data);
};

export const register = (data: { email: string; password: string }) => {
    return apiClient.post('/auth/register', data);
};

export const getMe = () => {
    return apiClient.get('/auth/me');
};

export const refreshToken = () => {
    return apiClient.post('/auth/refresh');
};

export const logout = () => {
    return apiClient.post('/auth/logout');
};
