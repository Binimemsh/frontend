class ChatHistoryService {
    constructor() {
        this.STORAGE_KEY = 'chat_history';
    }
    
    saveMessage(message) {
        try {
            const history = this.getHistory();
            const timestamp = new Date().getTime();
            
            // Add unique ID if not present
            if (!message.id) {
                message.id = `local_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
            }
            
            // Add timestamp if not present
            if (!message.timestamp) {
                message.timestamp = new Date().toISOString();
            }
            
            // Save to history
            history.messages.push(message);
            
            // Keep only last 1000 messages
            if (history.messages.length > 1000) {
                history.messages = history.messages.slice(-1000);
            }
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('Failed to save message to history:', error);
            return false;
        }
    }
    
    getHistory() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
        
        // Return default structure
        return {
            messages: [],
            lastUpdated: new Date().toISOString()
        };
    }
    
    clearHistory() {
        localStorage.removeItem(this.STORAGE_KEY);
        return this.getHistory();
    }
    
    getMessagesByRoom(roomId) {
        const history = this.getHistory();
        return history.messages.filter(msg => 
            msg.roomId === roomId && !msg.receiverId
        );
    }
    
    getPrivateMessages(userId, otherUserId) {
        const history = this.getHistory();
        return history.messages.filter(msg => 
            (msg.senderId === userId && msg.receiverId === otherUserId) ||
            (msg.senderId === otherUserId && msg.receiverId === userId)
        );
    }
}

const chatHistoryService = new ChatHistoryService();
export default chatHistoryService;