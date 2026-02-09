import axios from 'axios';
import config from '../config';

const api = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(config.TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem(config.REFRESH_TOKEN_KEY);
                if (refreshToken) {
                    const response = await axios.post(`${config.API_BASE_URL}/auth/refresh`, {
                        refreshToken
                    }, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (response.data.success) {
                        const { token, refreshToken: newRefreshToken } = response.data.data;
                        
                        localStorage.setItem(config.TOKEN_KEY, token);
                        localStorage.setItem(config.REFRESH_TOKEN_KEY, newRefreshToken);
                        
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        
        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }
        
        return Promise.reject(error);
    }
);

export default api;