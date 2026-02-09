import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import websocketService from '../services/websocketService';
import chatService from '../services/chatService';

const ChatContext = createContext({});

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [messages, setMessages] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [rooms, setRooms] = useState([{ id: 1, name: 'general' }]);
    const [selectedRoom, setSelectedRoom] = useState('general');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load message history from localStorage on initial load
    useEffect(() => {
        const saved = localStorage.getItem('chat_messages');
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved messages:', e);
            }
        }
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_messages', JSON.stringify(messages));
        }
    }, [messages]);

    // Load active users from API
    const loadActiveUsers = useCallback(async () => {
        if (isAuthenticated() && user) {
            try {
                const response = await chatService.getOnlineUsers();
                if (response.success && response.data) {
                    // Format users with required properties
                    const formattedUsers = response.data.map(userData => ({
                        id: userData.id,
                        username: userData.username,
                        email: userData.email,
                        online: userData.online || false,
                        lastSeen: userData.lastSeen,
                        profilePictureUrl: userData.profilePictureUrl,
                        unreadCount: 0 // You can update this from API if available
                    }));
                    setActiveUsers(formattedUsers);
                }
            } catch (error) {
                console.error('Failed to load active users:', error);
            }
        }
    }, [isAuthenticated, user]);

    // Load rooms from API
    const loadRooms = useCallback(async () => {
        if (isAuthenticated() && user) {
            try {
                const response = await chatService.getRooms();
                if (response.success && response.data) {
                    setRooms(response.data);
                }
            } catch (error) {
                console.error('Failed to load rooms:', error);
            }
        }
    }, [isAuthenticated, user]);

    const handleIncomingMessage = useCallback((message) => {
        if (!message) return;
        
        switch (message.type) {
            case 'CHAT':
            case 'JOIN':
            case 'LEAVE':
            case 'TYPING':
                setMessages(prev => {
                    // Check if message already exists
                    const exists = prev.some(existing => 
                        existing.id === message.id || 
                        (existing.content === message.content && 
                         existing.sender === message.sender &&
                         Math.abs(new Date(existing.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000)
                    );
                    
                    if (!exists) {
                        return [...prev, message];
                    }
                    return prev;
                });
                break;
                
            case 'ACTIVE_USERS':
                if (message.users) {
                    // Format users from WebSocket
                    const formattedUsers = message.users.map(userData => ({
                        id: userData.id,
                        username: userData.username,
                        email: userData.email,
                        online: userData.online || false,
                        lastSeen: userData.lastSeen,
                        profilePictureUrl: userData.profilePictureUrl,
                        unreadCount: userData.unreadCount || 0
                    }));
                    setActiveUsers(formattedUsers);
                }
                break;
                
            default:
                console.log('Unknown message type:', message);
        }
    }, []);

    const handleConnectionChange = useCallback((connected) => {
        setIsConnected(connected);
        if (connected) {
            // Load data when connected
            loadActiveUsers();
            loadRooms();
        }
    }, [loadActiveUsers, loadRooms]);

    useEffect(() => {
        if (isAuthenticated() && user) {
            // Set up listeners
            const unsubscribeMessages = websocketService.onMessage(handleIncomingMessage);
            const unsubscribeConnection = websocketService.onConnectionChange(handleConnectionChange);
            
            // Connect WebSocket
            websocketService.connect();
            
            // Load initial data
            loadActiveUsers();
            loadRooms();
            
            return () => {
                unsubscribeMessages();
                unsubscribeConnection();
                websocketService.disconnect();
                setActiveUsers([]);
                setIsConnected(false);
                setSelectedUser(null);
            };
        } else {
            websocketService.disconnect();
            setActiveUsers([]);
            setIsConnected(false);
        }
    }, [isAuthenticated, user, handleIncomingMessage, handleConnectionChange, loadActiveUsers, loadRooms]);

    const sendMessage = useCallback((content) => {
        if (!content || !content.trim()) {
            alert('Message cannot be empty');
            return;
        }
        
        if (!isConnected) {
            alert('Not connected to server');
            return;
        }
        
        if (selectedUser) {
            // Private message
            websocketService.sendPrivateMessage(content, selectedUser.id);
        } else {
            // Public message
            websocketService.sendChatMessage(content, selectedRoom);
        }
    }, [isConnected, selectedRoom, selectedUser]);

    const sendPrivateMessage = useCallback((content, receiverId) => {
        if (!content || !content.trim()) {
            alert('Message cannot be empty');
            return;
        }
        
        if (!isConnected) {
            alert('Not connected to server');
            return;
        }
        
        websocketService.sendPrivateMessage(content, receiverId);
    }, [isConnected]);

    const clearMessages = useCallback(() => {
        if (window.confirm('Are you sure you want to clear all chat messages?')) {
            setMessages([]);
            localStorage.removeItem('chat_messages');
        }
    }, []);

    const value = {
        messages,
        activeUsers,
        rooms,
        selectedRoom,
        selectedUser,
        isConnected,
        loading,
        error,
        setSelectedRoom,
        setSelectedUser,
        sendMessage,
        sendPrivateMessage,
        clearMessages,
        loadActiveUsers,
        loadRooms
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};