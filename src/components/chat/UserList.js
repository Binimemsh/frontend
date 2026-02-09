import React, { useState } from 'react';
import { ListGroup, Badge, Button, Modal, Form } from 'react-bootstrap';
import { PersonCircle, PersonFill, ChatLeftText } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import privateChatService from '../../services/privateChatService';

const UserList = ({ activeUsers, selectedUser, onSelectUser }) => {
    const { user } = useAuth();
    const [showPrivateModal, setShowPrivateModal] = useState(false);
    const [selectedPrivateUser, setSelectedPrivateUser] = useState(null);
    
    const handleStartPrivateChat = async (otherUser) => {
        setSelectedPrivateUser(otherUser);
        
        try {
            // Load private chat history
            const response = await privateChatService.getPrivateChatHistory(otherUser.id);
            if (response.success) {
                // Select the user for private chat
                onSelectUser(otherUser);
                setShowPrivateModal(false);
                
                // Mark messages as read
                await privateChatService.markPrivateMessagesAsRead(otherUser.id);
            }
        } catch (error) {
            console.error('Failed to start private chat:', error);
            // Still select the user even if history fails
            onSelectUser(otherUser);
            setShowPrivateModal(false);
        }
    };
    
    if (!activeUsers || activeUsers.length === 0) {
        return (
            <div className="text-center text-muted p-3">
                <PersonCircle size={48} className="mb-2" />
                <p>No users online</p>
                <Button variant="outline-primary" size="sm">
                    Refresh List
                </Button>
            </div>
        );
    }
    
    // Filter out current user
    const filteredUsers = activeUsers
        .filter(activeUser => activeUser.username !== user?.username)
        .filter((user, index, self) => 
            index === self.findIndex((u) => u.id === user.id)
        );
    
    return (
        <>
            <div>
                <h5 className="mb-3 d-flex justify-content-between align-items-center">
                    <span>Online Users</span>
                    <Badge bg="success" pill>{filteredUsers.length}</Badge>
                </h5>
                
                <ListGroup>
                    {filteredUsers.map((activeUser, index) => (
                        <ListGroup.Item
                            key={activeUser.id || activeUser.username || index}
                            action
                            active={selectedUser?.id === activeUser.id}
                            onClick={() => handleStartPrivateChat(activeUser)}
                            className="d-flex justify-content-between align-items-center py-3"
                        >
                            <div className="d-flex align-items-center">
                                {activeUser.online ? (
                                    <PersonFill className="text-success me-2" size={20} />
                                ) : (
                                    <PersonCircle className="text-secondary me-2" size={20} />
                                )}
                                <div>
                                    <div className="fw-medium">{activeUser.username}</div>
                                    <small className="text-muted d-flex align-items-center">
                                        <ChatLeftText size={12} className="me-1" />
                                        Click to chat privately
                                    </small>
                                </div>
                            </div>
                            
                            <div>
                                {activeUser.unreadCount > 0 && (
                                    <Badge bg="danger" pill className="me-2">
                                        {activeUser.unreadCount}
                                    </Badge>
                                )}
                                <Badge bg="light" text="dark" pill>
                                    Private
                                </Badge>
                            </div>
                        </ListGroup.Item>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                        <ListGroup.Item className="text-center text-muted py-4">
                            <PersonCircle size={32} className="mb-2" />
                            <div>You're the only one online</div>
                            <small>Invite others to join!</small>
                        </ListGroup.Item>
                    )}
                </ListGroup>
                
                <div className="mt-3 small text-muted">
                    <div className="d-flex align-items-center mb-1">
                        <Badge bg="success" pill className="me-2">●</Badge>
                        <span>Online and available</span>
                    </div>
                    <div className="d-flex align-items-center">
                        <Badge bg="secondary" pill className="me-2">●</Badge>
                        <span>Recently online</span>
                    </div>
                </div>
            </div>
            
            {/* Private Chat Confirmation Modal */}
            <Modal show={showPrivateModal} onHide={() => setShowPrivateModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Start Private Chat</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPrivateUser && (
                        <div className="text-center">
                            <PersonFill size={48} className="text-primary mb-3" />
                            <h5>Chat with {selectedPrivateUser.username}</h5>
                            <p className="text-muted">
                                Messages are private and encrypted. Only you and {selectedPrivateUser.username} can see them.
                            </p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPrivateModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => {
                        if (selectedPrivateUser) {
                            onSelectUser(selectedPrivateUser);
                            setShowPrivateModal(false);
                        }
                    }}>
                        Start Private Chat
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UserList;