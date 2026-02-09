import api from './api';
import config from '../config';

const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.success) {
            const { token, refreshToken, username, userId } = response.data.data;
            localStorage.setItem(config.TOKEN_KEY, token);
            localStorage.setItem(config.REFRESH_TOKEN_KEY, refreshToken);
            localStorage.setItem(config.USER_KEY, JSON.stringify({ username, userId }));
        }
        return response.data;
    },
    
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.clear();
        }
    },
    
    getCurrentUser: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            return null;
        }
    },
    
    updateProfile: async (profileData) => {
        const response = await api.put('/users/profile', profileData);
        return response.data;
    },
    
    isAuthenticated: () => {
        return !!localStorage.getItem(config.TOKEN_KEY);
    },
    
    getToken: () => {
        return localStorage.getItem(config.TOKEN_KEY);
    },
    
    getUser: () => {
        const userStr = localStorage.getItem(config.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }
};

export default authService;