import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import config from '../config';
import authService from './authService';

class WebSocketService {
    constructor() {
        this.client = null;
        this.messageCallbacks = new Set();
        this.connectionCallbacks = new Set();
        this.errorCallbacks = new Set();
        this.isConnecting = false;
        this.connectionTimeout = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }
    
   connect() {
    if (this.client && this.client.connected) {
        console.log('✅ Already connected');
        return;
    }
    
    if (this.isConnecting) {
        console.log('⏳ Already connecting...');
        return;
    }
    
    this.isConnecting = true;
    
    const token = authService.getToken();
    if (!token) {
        console.error('❌ No token found');
        this.isConnecting = false;
        return;
    }
    
    console.log('🔌 Connecting WebSocket...');
    console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');
    console.log('🔗 WebSocket URL:', config.WS_BASE_URL);
    
    try {
        const socket = new SockJS(config.WS_BASE_URL);
        
        // IMPORTANT: Create the client with proper headers
        this.client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            
            // CRITICAL: Headers must be in connectHeaders
            connectHeaders: {
                'Authorization': `Bearer ${token}`,
                'X-Client-Type': 'web',
                'X-Username': authService.getUser()?.username || 'unknown'
            },
            
            debug: (str) => {
                if (str.includes('CONNECT') || str.includes('ERROR')) {
                    console.log('🔍 STOMP Debug:', str);
                }
            },
            
            onConnect: (frame) => {
                console.log('✅✅✅ WebSocket CONNECTED!');
                console.log('📋 Connected headers:', frame.headers);
                console.log('🆔 Session ID:', frame.headers['session-id']);
                
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.notifyConnection(true);
                
                // Subscribe to topics
                this.subscribeToTopics();
                
                // Join chat with a small delay
                setTimeout(() => {
                    console.log('👋 Sending join message...');
                    this.joinChat();
                }, 300);
            },
            
            onStompError: (frame) => {
                console.error('❌ STOMP Error:', frame);
                console.error('❌ Error headers:', frame.headers);
                
                this.isConnecting = false;
                this.notifyError(new Error(frame.headers['message'] || 'STOMP error'));
            },
            
            onDisconnect: () => {
                console.log('🔌 Disconnected');
                this.isConnecting = false;
                this.notifyConnection(false);
            },
            
            onWebSocketError: (error) => {
                console.error('🌐 WebSocket Error:', error);
                this.isConnecting = false;
                this.notifyError(error);
            }
        });
        
        this.client.activate();
        
    } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        this.isConnecting = false;
        this.notifyError(error);
    }
}
    
    attemptReconnection() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            return;
        }
        
        const delay = Math.min(5000 * this.reconnectAttempts, 30000);
        console.log(`🔄 Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            const token = authService.getToken();
            if (token) {
                this.connect();
            } else {
                console.error('❌ No token available for reconnection');
            }
        }, delay);
    }
    
   subscribeToTopics() {
        if (!this.client || !this.client.connected) {
            console.error('❌ Cannot subscribe: WebSocket not connected');
            return;
        }
        
        console.log('📡 Subscribing to topics...');
        
        try {
            // Public messages
            const publicSubscription = this.client.subscribe('/topic/public', (message) => {
                console.log('📨 [PUBLIC] Received message');
                try {
                    const msg = JSON.parse(message.body);
                    this.notifyMessage(msg);
                } catch (e) {
                    console.error('❌ Failed to parse public message:', e);
                }
            });
            
            console.log('✅ Subscribed to /topic/public');
            
            // Private messages - CRITICAL: Use correct user destination
            const user = authService.getUser();
            if (user && user.id) {
                // User-specific private message queue
                const privateDestination = `/user/${user.id}/queue/private`;
                const privateSubscription = this.client.subscribe(privateDestination, (message) => {
                    console.log('📨 [PRIVATE] Received private message');
                    console.log('   Destination:', message.headers.destination);
                    
                    try {
                        const msg = JSON.parse(message.body);
                        console.log('   Private message from:', msg.sender);
                        console.log('   Content:', msg.content);
                        this.notifyMessage({...msg, isPrivate: true});
                    } catch (e) {
                        console.error('❌ Failed to parse private message:', e);
                    }
                });
                
                console.log(`✅ Subscribed to ${privateDestination} for user ${user.username}`);
            }
            
            // Active users updates
            const usersSubscription = this.client.subscribe('/topic/activeUsers', (message) => {
                console.log('👥 Received active users update');
                
                try {
                    const users = JSON.parse(message.body);
                    this.notifyMessage({
                        type: 'ACTIVE_USERS',
                        users: users
                    });
                } catch (e) {
                    console.error('❌ Failed to parse active users:', e);
                }
            });
            
            console.log('✅ Subscribed to /topic/activeUsers');
            
            // Typing indicators
            const typingSubscription = this.client.subscribe('/topic/typing', (message) => {
                try {
                    const msg = JSON.parse(message.body);
                    this.notifyMessage(msg);
                } catch (e) {
                    console.error('❌ Failed to parse typing message:', e);
                }
            });
            
            console.log('✅ All topics subscribed successfully');
            
        } catch (error) {
            console.error('❌ Failed to subscribe to topics:', error);
        }
    }
        
    sendMessage(destination, body) {
        if (!this.client || !this.client.connected) {
            console.error('❌ Cannot send: WebSocket not connected');
            console.error('Destination:', destination);
            console.error('Message body:', body);
            return false;
        }
        
        console.log(`📤 Sending message to ${destination}`);
        console.log('Message body:', body);
        
        try {
            this.client.publish({
                destination: destination,
                body: JSON.stringify(body),
                headers: {
                    'content-type': 'application/json'
                }
            });
            
            console.log('✅ Message sent successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            console.error('Error stack:', error.stack);
            return false;
        }
    }
    
    sendChatMessage(content, roomId = 'general') {
        const user = authService.getUser();
        if (!user) {
            console.error('❌ No user data');
            return false;
        }
        
        console.log('💬 Sending chat message as:', user.username);
        
        const message = {
            type: 'CHAT',
            content: content,
            sender: user.username,  // Send username in the message
            senderId: user.id,
            timestamp: new Date().toISOString(),
            roomId: roomId
        };
        
        console.log('📤 Message payload:', message);
        return this.sendMessage('/app/chat.sendMessage', message);
        }
    sendPrivateMessage(content, receiverId) {
        const user = authService.getUser();
        if (!user) {
            console.error('❌ Cannot send private message: No user data');
            return false;
        }
        
        console.log('🔒 Sending private message to user ID:', receiverId);
        
        const message = {
            type: 'CHAT',
            content: content,
            sender: user.username,
            senderId: user.id,
            receiverId: receiverId,
            timestamp: new Date().toISOString()
        };
        
        return this.sendMessage('/app/chat.private', message);
    }
    
    joinChat() {
        const user = authService.getUser();
        if (!user) {
            console.error('❌ Cannot join chat: No user data');
            return false;
        }
        
        console.log('👋 Joining chat as:', user.username);
        
        const message = {
            type: 'JOIN',
            sender: user.username,
            senderId: user.id,
            content: `${user.username} joined the chat`,
            timestamp: new Date().toISOString()
        };
        
        return this.sendMessage('/app/chat.addUser', message);
    }
    
    typing() {
        const user = authService.getUser();
        if (!user) return false;
        
        const message = {
            type: 'TYPING',
            sender: user.username,
            content: `${user.username} is typing...`,
            timestamp: new Date().toISOString()
        };
        
        return this.sendMessage('/app/chat.typing', message);
    }
    
    getActiveUsers() {
        console.log('👥 Requesting active users list');
        return this.sendMessage('/app/chat.getActiveUsers', {});
    }
    
    disconnect() {
        console.log('🛑 Disconnecting WebSocket...');
        
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }
        
        if (this.client) {
            try {
                this.client.deactivate();
            } catch (error) {
                console.error('Error during disconnect:', error);
            }
            this.client = null;
        }
        
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyConnection(false);
        
        console.log('✅ WebSocket disconnected');
    }
    
    // Event listeners
    onMessage(callback) {
        this.messageCallbacks.add(callback);
        return () => this.messageCallbacks.delete(callback);
    }
    
    onConnectionChange(callback) {
        this.connectionCallbacks.add(callback);
        return () => this.connectionCallbacks.delete(callback);
    }
    
    onError(callback) {
        this.errorCallbacks.add(callback);
        return () => this.errorCallbacks.delete(callback);
    }
    
    // Notify all listeners
    notifyMessage(message) {
        console.log('📢 Notifying', this.messageCallbacks.size, 'message listeners');
        this.messageCallbacks.forEach(callback => {
            try {
                callback(message);
            } catch (error) {
                console.error('❌ Error in message callback:', error);
            }
        });
    }
    
    notifyConnection(connected) {
        console.log('📢 Notifying', this.connectionCallbacks.size, 'connection listeners');
        console.log('Connection status:', connected ? 'CONNECTED' : 'DISCONNECTED');
        
        this.connectionCallbacks.forEach(callback => {
            try {
                callback(connected);
            } catch (error) {
                console.error('❌ Error in connection callback:', error);
            }
        });
    }
    
    notifyError(error) {
        console.log('📢 Notifying', this.errorCallbacks.size, 'error listeners');
        console.error('Error to notify:', error);
        
        this.errorCallbacks.forEach(callback => {
            try {
                callback(error);
            } catch (catchError) {
                console.error('❌ Error in error callback:', catchError);
            }
        });
    }
    
    isConnected() {
        const connected = this.client && this.client.connected;
        console.log('🔍 Connection check:', connected ? 'Connected' : 'Not connected');
        return connected;
    }
    
    // Debug methods
    getConnectionStatus() {
        return {
            isConnected: this.isConnected(),
            isConnecting: this.isConnecting,
            reconnectAttempts: this.reconnectAttempts,
            hasClient: !!this.client
        };
    }
    
    logDebugInfo() {
        console.group('🔧 WebSocket Service Debug Info');
        console.log('Connection Status:', this.getConnectionStatus());
        console.log('Message Listeners:', this.messageCallbacks.size);
        console.log('Connection Listeners:', this.connectionCallbacks.size);
        console.log('Error Listeners:', this.errorCallbacks.size);
        console.log('WebSocket URL:', config.WS_BASE_URL);
        
        const token = authService.getToken();
        console.log('Token exists:', !!token);
        if (token) {
            console.log('Token length:', token.length);
        }
        
        const user = authService.getUser();
        console.log('User data:', user);
        console.groupEnd();
    }
}

const websocketService = new WebSocketService();
export default websocketService;