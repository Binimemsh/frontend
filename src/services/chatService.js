import api from './api';

const chatService = {
    getRooms: async () => {
        const response = await api.get('/chat/rooms');
        return response.data;
    },
    
    getRoomMessages: async (roomId, limit = 50, offset = 0) => {
        const response = await api.get(`/chat/messages/${roomId}?limit=${limit}&offset=${offset}`);
        return response.data;
    },
    
    getPrivateMessages: async (userId, otherUserId, limit = 50, offset = 0) => {
        const response = await api.get(`/chat/messages/private/${userId}?otherUserId=${otherUserId}&limit=${limit}&offset=${offset}`);
        return response.data;
    },
    
    getOnlineUsers: async () => {
        const response = await api.get('/chat/users/online');
        return response.data;
    },
    
    searchUsers: async (query) => {
        const response = await api.get(`/chat/users/search?query=${query}`);
        return response.data;
    },
    
    markMessageAsRead: async (messageId) => {
        const response = await api.post(`/chat/messages/${messageId}/read`);
        return response.data;
    },
    
    markAllMessagesAsRead: async (userId, otherUserId) => {
        const response = await api.post(`/chat/messages/read-all?userId=${userId}&otherUserId=${otherUserId}`);
        return response.data;
    },
    
    getUnreadCount: async (userId, otherUserId) => {
        const response = await api.get(`/chat/messages/unread/count?userId=${userId}&otherUserId=${otherUserId}`);
        return response.data;
    }
};

export default chatService;