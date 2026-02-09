import React from 'react';
import { PersonCircle, PersonFill, ArrowRight, Lock } from 'react-bootstrap-icons';

const MessageItem = ({ message, isOwnMessage, isPrivateMessage }) => {
    const getMessageClass = () => {
        switch (message.type) {
            case 'JOIN':
                return 'bg-success text-white';
            case 'LEAVE':
                return 'bg-danger text-white';
            case 'TYPING':
                return 'bg-info text-white';
            case 'CHAT':
                return isOwnMessage ? 'bg-primary text-white' : 'bg-light text-dark';
            default:
                return 'bg-light text-dark';
        }
    };
    
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    };
    
    const getIcon = () => {
        switch (message.type) {
            case 'JOIN':
                return <PersonFill className="me-2" />;
            case 'LEAVE':
                return <ArrowRight className="me-2" />;
            case 'TYPING':
                return <span className="me-2">✍️</span>;
            default:
                return <PersonCircle className="me-2" />;
        }
    };
    
    return (
        <div className={`mb-3 ${isOwnMessage ? 'text-end' : ''}`}>
            <div 
                className={`d-inline-block p-3 rounded-4 ${getMessageClass()} position-relative`}
                style={{ 
                    maxWidth: '80%',
                    borderBottomRightRadius: isOwnMessage ? '4px' : '16px',
                    borderBottomLeftRadius: isOwnMessage ? '16px' : '4px'
                }}
            >
                {/* Private message indicator */}
                {isPrivateMessage && message.type === 'CHAT' && (
                    <div className="position-absolute top-0 end-0 mt-1 me-2">
                        <Lock size={12} className={isOwnMessage ? 'text-white-50' : 'text-muted'} />
                    </div>
                )}
                
                {/* Message header */}
                <div className="d-flex align-items-center mb-2">
                    {!isOwnMessage && getIcon()}
                    <div className="d-flex flex-column">
                        <span className={`fw-bold ${isOwnMessage ? 'text-white' : 'text-dark'}`}>
                            {message.sender}
                            {isOwnMessage && ' (You)'}
                        </span>
                        <small className={`${isOwnMessage ? 'text-white-50' : 'text-muted'}`}>
                            {formatTime(message.timestamp)}
                        </small>
                    </div>
                </div>
                
                {/* Message content */}
                <div className={`${message.type !== 'CHAT' ? 'fw-bold' : ''}`}>
                    {message.content}
                </div>
                
                {/* Message type indicator */}
                {message.type !== 'CHAT' && (
                    <div className="mt-2 small opacity-75">
                        {message.type === 'JOIN' && 'joined the chat'}
                        {message.type === 'LEAVE' && 'left the chat'}
                        {message.type === 'TYPING' && 'is typing...'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageItem;