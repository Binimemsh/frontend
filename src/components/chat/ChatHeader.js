import React from 'react';
import { Navbar, Container, Button, Badge } from 'react-bootstrap';
import { PersonCircle, Power, List, Globe, Lock } from 'react-bootstrap-icons';

const ChatHeader = ({ user, selectedRoom, selectedUser, isConnected, onLogout, onToggleSidebar }) => {
    return (
        <Navbar bg="dark" variant="dark" fixed="top" className="shadow-sm" style={{ height: '70px' }}>
            <Container fluid className="h-100">
                {/* Sidebar Toggle */}
                <Button 
                    variant="dark" 
                    onClick={onToggleSidebar}
                    className="h-100 px-3"
                >
                    <List size={20} />
                </Button>
                
                {/* Chat Info */}
                <Navbar.Brand className="mx-3 h-100 d-flex align-items-center">
                    <div>
                        <div className="d-flex align-items-center mb-1">
                            <span className="fw-bold">Chat App</span>
                            <Badge bg={isConnected ? "success" : "danger"} className="ms-2">
                                {isConnected ? "Online" : "Offline"}
                            </Badge>
                        </div>
                        
                        <div className="small">
                            {selectedUser ? (
                                <div className="d-flex align-items-center">
                                    <Lock size={12} className="me-1" />
                                    <span>Private: {selectedUser.username}</span>
                                </div>
                            ) : (
                                <div className="d-flex align-items-center">
                                    <Globe size={12} className="me-1" />
                                    <span>Room: {selectedRoom || 'general'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Navbar.Brand>
                
                {/* User Info & Logout */}
                <div className="d-flex align-items-center h-100">
                    <div className="text-light me-3 d-flex align-items-center">
                        <PersonCircle className="me-2" />
                        <div>
                            <div className="small">{user?.username}</div>
                            <div className="very-small text-light" style={{ fontSize: '0.7rem' }}>
                                {user?.email}
                            </div>
                        </div>
                    </div>
                    <Button 
                        variant="outline-light" 
                        size="sm" 
                        onClick={onLogout}
                        className="h-75"
                    >
                        <Power className="me-1" /> Logout
                    </Button>
                </div>
            </Container>
        </Navbar>
    );
};

export default ChatHeader;