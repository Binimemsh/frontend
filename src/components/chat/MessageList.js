import React, { useRef, useEffect } from 'react';
import { Card, Alert, Button } from 'react-bootstrap';
import { Lock, ClockHistory } from 'react-bootstrap-icons';
import MessageItem from './MessageItem';
import privateChatService from '../../services/privateChatService';

const MessageList = ({ messages, currentUser, selectedUser }) => {
    const messagesEndRef = useRef(null);
    const [loadingHistory, setLoadingHistory] = React.useState(false);
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const loadMoreHistory = async () => {
        if (!selectedUser || !currentUser) return;
        
        setLoadingHistory(true);
        try {
            const response = await privateChatService.getPrivateChatHistory(
                selectedUser.id, 
                50, 
                messages.length
            );
            
            if (response.success && response.data) {
                // Add older messages to the beginning
                const newMessages = [...response.data, ...messages];
                // Remove duplicates
                const uniqueMessages = Array.from(
                    new Map(newMessages.map(msg => [msg.id, msg])).values()
                );
                // Update state (you'll need to add a setMessages function to props)
                // For now, we'll just log
                console.log('Loaded more history:', response.data.length, 'messages');
            }
        } catch (error) {
            console.error('Failed to load more history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };
    
    if (!messages || messages.length === 0) {
        return (
            <div className="h-100 d-flex justify-content-center align-items-center">
                <div className="text-center text-muted p-5">
                    {selectedUser ? (
                        <>
                            <Lock size={48} className="text-primary mb-3" />
                            <h5>Private Chat with {selectedUser.username}</h5>
                            <p className="mb-3">Send a message to start the conversation</p>
                            <small>
                                🔒 End-to-end encrypted<br />
                                📱 Only visible to you and {selectedUser.username}
                            </small>
                        </>
                    ) : (
                        <>
                            <div className="mb-3" style={{ fontSize: '3rem' }}>💬</div>
                            <h5>Welcome to the chat!</h5>
                            <p className="mb-0">Be the first to send a message in this room</p>
                        </>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-100 d-flex flex-column">
            {/* Chat info banner */}
            {selectedUser && (
                <Alert variant="info" className="m-3">
                    <div className="d-flex align-items-center">
                        <div className="me-2"><Lock /></div>
                        <div className="flex-grow-1">
                            <strong>Private Chat with {selectedUser.username}</strong>
                            <p className="mb-0 small">
                                🔒 Encrypted • 📱 Only visible to you two • ⏰ {messages.length} messages
                            </p>
                        </div>
                    </div>
                </Alert>
            )}
            
            {/* Load more button for private chats */}
            {selectedUser && messages.length >= 20 && (
                <div className="text-center p-2">
                    <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={loadMoreHistory}
                        disabled={loadingHistory}
                    >
                        <ClockHistory className="me-2" />
                        {loadingHistory ? 'Loading...' : 'Load Older Messages'}
                    </Button>
                </div>
            )}
            
            {/* Messages */}
            <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
                {messages.map((message, index) => {
                    const isOwnMessage = message.sender === currentUser?.username;
                    const isPrivateMessage = selectedUser && 
                        (message.senderId === selectedUser.id || 
                         message.receiverId === selectedUser.id);
                    
                    return (
                        <MessageItem 
                            key={message.id || index}
                            message={message}
                            isOwnMessage={isOwnMessage}
                            isPrivateMessage={isPrivateMessage}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Message count */}
            <div className="p-3 border-top small text-muted text-center">
                {selectedUser ? '🔒 ' : '🌍 '}
                {messages.length} message{messages.length !== 1 ? 's' : ''}
                {selectedUser && ' in private chat'}
            </div>
        </div>
    );
};

export default MessageList;