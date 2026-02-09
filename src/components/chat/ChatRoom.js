import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Container, Row, Col, Card, Button, Badge, Alert, 
    Spinner, Modal, Form, InputGroup, Dropdown, 
    OverlayTrigger, Tooltip, ListGroup, Image 
} from 'react-bootstrap';
import { 
    Send, People, Hash, Search, Bell, Pin, 
    Paperclip, EmojiLaughing, Mic, CameraVideo,
    ThreeDotsVertical, CheckDouble, Clock, 
    PersonCheck, PersonPlus, XCircle, 
    Camera, FileEarmark, MusicNote, 
    GeoAlt, Calendar, Gift, PersonCircle, ChatLeftText
} from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatSidebar from './ChatSidebar';
import EmojiPicker from './EmojiPicker';
import UserSearchModal from './UserSearchModal';
import CreateRoomModal from './CreateRoomModal';
import './ChatRoom.css';

const ChatRoom = () => {
    const { user, logout } = useAuth();
    const { 
        messages, activeUsers, rooms, selectedRoom, selectedUser,
        isConnected, loading, error, notifications,
        sendMessage, sendPrivateMessage, sendTypingIndicator,
        markAsRead, setSelectedRoom, setSelectedUser
    } = useChat();
    
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [theme, setTheme] = useState('light');
    const [attachments, setAttachments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    
    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 992) {
                setSidebarVisible(false);
            } else {
                setSidebarVisible(true);
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    // Typing indicator
    useEffect(() => {
        if (messageInput.trim() && !isTyping) {
            setIsTyping(true);
            // sendTypingIndicator(selectedUser?.id);
        }
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 1000);
        
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [messageInput, selectedUser]);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const handleSendMessage = useCallback((content, type = 'text') => {
        if (!content.trim() && attachments.length === 0) return;
        
        const messageData = {
            content: content.trim(),
            type: type
        };
        
        if (selectedUser) {
            sendPrivateMessage(messageData.content, selectedUser.id);
        } else {
            sendMessage(messageData.content);
        }
        
        setMessageInput('');
        setAttachments([]);
        setShowEmojiPicker(false);
    }, [selectedUser, sendMessage, sendPrivateMessage, attachments]);
    
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newAttachments = files.map(file => ({
            id: Date.now() + Math.random(),
            file,
            type: getFileType(file.type),
            name: file.name,
            size: file.size,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            uploadProgress: 0
        }));
        
        setAttachments(prev => [...prev, ...newAttachments]);
        
        // Simulate upload progress
        newAttachments.forEach(attachment => {
            simulateUpload(attachment.id);
        });
    };
    
    const simulateUpload = (attachmentId) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setAttachments(prev =>
                prev.map(att =>
                    att.id === attachmentId
                        ? { ...att, uploadProgress: progress }
                        : att
                )
            );
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 100);
    };
    
    const getFileType = (mimeType) => {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
        return 'file';
    };
    
    const removeAttachment = (attachmentId) => {
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    };
    
    const handleEmojiSelect = (emoji) => {
        setMessageInput(prev => prev + emoji.native);
    };
    
    const handleSearchUsers = (query) => {
        setSearchQuery(query);
    };
    
    const handleVideoCall = () => {
        if (selectedUser) {
            alert(`Initiating video call with ${selectedUser.username}`);
        } else {
            alert('Select a user to start a video call');
        }
    };
    
    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };
    
    const toggleThemeMode = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.body.setAttribute('data-theme', newTheme);
    };
    
    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSelectedRoom(null);
    };
    
    const handleSelectRoom = (room) => {
        setSelectedRoom(room.name);
        setSelectedUser(null);
    };
    
    // Format time utility
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    if (loading && !messages.length) {
        return (
            <div className="chat-loading-screen">
                <div className="loading-content">
                    <Spinner animation="border" variant="primary" />
                    <h4 className="mt-3">Loading chat...</h4>
                    <p className="text-muted">Setting up your chat environment</p>
                </div>
            </div>
        );
    }
    
    return (
        <Container fluid className={`chat-container ${theme}-theme`}>
            {/* Enhanced Chat Header */}
            <div className="chat-header">
                <Row className="align-items-center">
                    <Col xs={3} className="d-flex align-items-center">
                        <Button 
                            variant="dark" 
                            onClick={toggleSidebar}
                            className="me-2"
                        >
                            <People />
                        </Button>
                        <div>
                            <h5 className="mb-0">Chat App</h5>
                            <Badge bg={isConnected ? "success" : "danger"} className="ms-2">
                                {isConnected ? "Online" : "Offline"}
                            </Badge>
                        </div>
                    </Col>
                    
                    <Col xs={6} className="text-center">
                        <div className="chat-info">
                            {selectedUser ? (
                                <div className="d-flex align-items-center justify-content-center">
                                    <PersonCircle className="me-2" />
                                    <span className="fw-bold">Private: {selectedUser.username}</span>
                                </div>
                            ) : selectedRoom ? (
                                <div className="d-flex align-items-center justify-content-center">
                                    <Hash className="me-2" />
                                    <span className="fw-bold">Room: {selectedRoom}</span>
                                </div>
                            ) : (
                                <span className="text-muted">Select a chat to start messaging</span>
                            )}
                        </div>
                    </Col>
                    
                    <Col xs={3} className="d-flex align-items-center justify-content-end">
                        <div className="d-flex align-items-center">
                            <PersonCircle className="me-2 text-white" size={24} />
                            <div className="text-white me-3">
                                <div className="small">{user?.username}</div>
                                <div className="very-small" style={{ fontSize: '0.7rem' }}>
                                    {user?.email}
                                </div>
                            </div>
                            <Button 
                                variant="outline-light" 
                                size="sm" 
                                onClick={logout}
                            >
                                Logout
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
            
            <Row className="chat-content">
                {/* Enhanced Sidebar */}
                {sidebarVisible && (
                    <Col lg={3} md={4} className="chat-sidebar">
                        <ChatSidebar
                            user={user}
                            activeUsers={activeUsers}
                            rooms={rooms}
                            selectedRoom={selectedRoom}
                            selectedUser={selectedUser}
                            onSelectUser={handleSelectUser}
                            onSelectRoom={handleSelectRoom}
                            onCreateRoom={() => setShowCreateRoom(true)}
                            onSearchUsers={handleSearchUsers}
                            theme={theme}
                        />
                    </Col>
                )}
                
                {/* Main Chat Area */}
                <Col lg={sidebarVisible ? 9 : 12} md={sidebarVisible ? 8 : 12} className="chat-main">
                    {/* Connection Status Bar */}
                    {!isConnected && (
                        <Alert variant="warning" className="connection-alert">
                            <div className="d-flex align-items-center">
                                <Spinner animation="border" size="sm" className="me-2" />
                                <span>Reconnecting to chat server...</span>
                                <Button size="sm" variant="outline-warning" className="ms-auto">
                                    Retry Now
                                </Button>
                            </div>
                        </Alert>
                    )}
                    
                    {/* Chat Info Bar */}
                    <div className="chat-info-bar">
                        <div className="d-flex align-items-center">
                            {selectedUser ? (
                                <>
                                    <div className="user-avatar me-2">
                                        <PersonCircle size={40} className="text-primary" />
                                    </div>
                                    <div>
                                        <h5 className="mb-0">{selectedUser.username}</h5>
                                        <div className="user-status">
                                            <Badge bg={selectedUser.online ? "success" : "secondary"}>
                                                {selectedUser.online ? 'Online' : 'Offline'}
                                            </Badge>
                                            {selectedUser.lastSeen && (
                                                <span className="ms-2 text-muted">
                                                    Last seen {formatTime(selectedUser.lastSeen)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ms-auto d-flex gap-2">
                                        <Button variant="outline-primary" size="sm" onClick={handleVideoCall}>
                                            <CameraVideo className="me-1" /> Video Call
                                        </Button>
                                        <Button variant="outline-secondary" size="sm">
                                            <ThreeDotsVertical />
                                        </Button>
                                    </div>
                                </>
                            ) : selectedRoom ? (
                                <>
                                    <div className="room-icon me-2">
                                        <Hash size={24} />
                                    </div>
                                    <div>
                                        <h5 className="mb-0">#{selectedRoom}</h5>
                                        <div className="room-info">
                                            <span className="text-muted">
                                                {activeUsers.length || 0} members online
                                            </span>
                                            <Badge bg="info" className="ms-2">
                                                Public Room
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="ms-auto">
                                        <Button variant="outline-primary" size="sm">
                                            <People className="me-1" /> Invite
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="welcome-message">
                                    <h4>Welcome to ChatApp!</h4>
                                    <p className="text-muted">Select a chat to start messaging</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Message Area */}
                    <div className="message-area" ref={messagesEndRef}>
                        <MessageList 
                            messages={messages}
                            currentUser={user}
                            selectedUser={selectedUser}
                            typingUsers={typingUsers}
                            onMarkAsRead={() => {}}
                            theme={theme}
                        />
                        
                        {/* Typing Indicators */}
                        {typingUsers.length > 0 && (
                            <div className="typing-indicator">
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span className="ms-2">
                                    {typingUsers.map(u => u.username).join(', ')} is typing...
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                        <div className="attachments-preview">
                            <div className="d-flex flex-wrap gap-2">
                                {attachments.map(attachment => (
                                    <div key={attachment.id} className="attachment-item">
                                        {attachment.type === 'image' && attachment.preview && (
                                            <div className="attachment-image">
                                                <Image src={attachment.preview} thumbnail width={80} height={80} />
                                                <div className="upload-progress">
                                                    <div 
                                                        className="progress-bar" 
                                                        style={{ width: `${attachment.uploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {attachment.type !== 'image' && (
                                            <div className="attachment-file">
                                                <FileEarmark size={24} />
                                                <small>{attachment.name}</small>
                                                <div className="upload-progress">
                                                    <div 
                                                        className="progress-bar" 
                                                        style={{ width: `${attachment.uploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <Button 
                                            variant="link" 
                                            className="remove-attachment"
                                            onClick={() => removeAttachment(attachment.id)}
                                        >
                                            <XCircle />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Enhanced Message Input */}
                    <div className="message-input-container">
                        <div className="input-actions">
                            <Button 
                                variant="link" 
                                onClick={() => fileInputRef.current?.click()}
                                title="Attach files"
                            >
                                <Paperclip />
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                            />
                            
                            <Button variant="link" title="Record voice message" onClick={() => {}}>
                                <Mic />
                            </Button>
                            
                            <Button variant="link" title="Send gift" onClick={() => {}}>
                                <Gift />
                            </Button>
                            
                            <div className="ms-auto">
                                <Button 
                                    variant="link" 
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    title="Emoji"
                                >
                                    <EmojiLaughing />
                                </Button>
                            </div>
                        </div>
                        
                        {showEmojiPicker && (
                            <div className="emoji-picker-container">
                                <EmojiPicker onSelect={handleEmojiSelect} />
                            </div>
                        )}
                        
                        <div className="message-input-wrapper">
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder={
                                    selectedUser 
                                        ? `Message ${selectedUser.username}...`
                                        : "Type your message here..."
                                }
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(messageInput);
                                    }
                                }}
                                className="message-textarea"
                            />
                            
                            <Button
                                variant="primary"
                                className="send-button"
                                onClick={() => handleSendMessage(messageInput)}
                                disabled={!messageInput.trim() && attachments.length === 0}
                            >
                                <Send />
                            </Button>
                        </div>
                        
                        <div className="input-hints">
                            <small className="text-muted">
                                Press <kbd>Enter</kbd> to send • <kbd>Shift + Enter</kbd> for new line
                            </small>
                        </div>
                    </div>
                </Col>
            </Row>
            
            {/* Modals */}
            <UserSearchModal
                show={showUserSearch}
                onHide={() => setShowUserSearch(false)}
                onSelectUser={handleSelectUser}
            />
            
            <CreateRoomModal
                show={showCreateRoom}
                onHide={() => setShowCreateRoom(false)}
                users={activeUsers}
            />
            
            {/* Mobile Sidebar Toggle Button */}
            {!sidebarVisible && (
                <Button 
                    variant="primary" 
                    className="sidebar-toggle-btn"
                    onClick={toggleSidebar}
                >
                    <People size={20} />
                </Button>
            )}
        </Container>
    );
};

export default ChatRoom;