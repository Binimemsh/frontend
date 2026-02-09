import api from './api';

const privateChatService = {
    // Start a private chat with another user
    startPrivateChat: async (otherUserId) => {
        try {
            const response = await api.post(`/chat/private/start`, {
                otherUserId: otherUserId
            });
            return response.data;
        } catch (error) {
            console.error('Failed to start private chat:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get private chat history
    getPrivateChatHistory: async (otherUserId, limit = 50, offset = 0) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('chat_user'));
            if (!currentUser || !currentUser.id) {
                throw new Error('User not logged in');
            }
            
            const response = await api.get(
                `/chat/messages/private/${currentUser.id}?otherUserId=${otherUserId}&limit=${limit}&offset=${offset}`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to get private chat history:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Mark private messages as read
    markPrivateMessagesAsRead: async (otherUserId) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('chat_user'));
            if (!currentUser || !currentUser.id) {
                throw new Error('User not logged in');
            }
            
            const response = await api.post(
                `/chat/messages/read-all?userId=${currentUser.id}&otherUserId=${otherUserId}`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get unread message count
    getUnreadCount: async (otherUserId) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('chat_user'));
            if (!currentUser || !currentUser.id) {
                throw new Error('User not logged in');
            }
            
            const response = await api.get(
                `/chat/messages/unread/count?userId=${currentUser.id}&otherUserId=${otherUserId}`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to get unread count:', error);
            return { success: false, error: error.message };
        }
    }
};

export default privateChatService;