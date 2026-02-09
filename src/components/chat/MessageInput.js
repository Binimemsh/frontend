import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { Send, Paperclip, EmojiSmile } from 'react-bootstrap-icons';

const MessageInput = ({ onSendMessage, selectedUser, disabled }) => {
    const [message, setMessage] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            // If selectedUser exists, send private message
            if (selectedUser) {
                onSendMessage(message.trim(), selectedUser.id);
            } else {
                // Send public message
                onSendMessage(message.trim());
            }
            setMessage('');
        }
    };
    
    return (
        <Form onSubmit={handleSubmit} className="mt-3">
            <InputGroup>
                <Form.Control
                    type="text"
                    placeholder={
                        selectedUser 
                            ? `Message ${selectedUser.username}... (Private)` 
                            : "Type your message..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={disabled}
                    autoFocus
                />
                
                <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={!message.trim() || disabled}
                >
                    {selectedUser ? 'Send Private' : 'Send'}
                </Button>
            </InputGroup>
            
            {selectedUser && (
                <small className="text-info mt-1 d-block">
                    🔒 Private chat with {selectedUser.username}
                </small>
            )}
        </Form>
    );
};

export default MessageInput;