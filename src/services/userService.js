import api from './api';

const userService = {
    getUserById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    
    getOnlineUsers: async () => {
        const response = await api.get('/users/online');
        return response.data;
    },
    
    searchUsers: async (query) => {
        const response = await api.get(`/users/search?query=${query}`);
        return response.data;
    },
    
    updateProfile: async (profileData) => {
        const response = await api.put('/users/profile', profileData);
        return response.data;
    }
};

export default userService;