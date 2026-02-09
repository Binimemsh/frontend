import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

const DebugPanel = () => {
    const { user, isAuthenticated } = useAuth();
    const { isConnected, messages, activeUsers, selectedRoom, selectedUser } = useChat();
    
    return (
        <Card className="mt-3">
            <Card.Header>
                Debug Panel 
                <Button 
                    size="sm" 
                    variant="outline-secondary" 
                    className="ms-2"
                    onClick={() => console.log({
                        user,
                        isAuthenticated: isAuthenticated(),
                        isConnected,
                        messages,
                        activeUsers,
                        selectedRoom,
                        selectedUser
                    })}
                >
                    Console Log
                </Button>
            </Card.Header>
            <Card.Body>
                <div className="row">
                    <div className="col-md-6">
                        <h6>Connection Status</h6>
                        <p>
                            Auth: <Badge bg={isAuthenticated() ? "success" : "danger"}>
                                {isAuthenticated() ? "Yes" : "No"}
                            </Badge>
                        </p>
                        <p>
                            WebSocket: <Badge bg={isConnected ? "success" : "danger"}>
                                {isConnected ? "Connected" : "Disconnected"}
                            </Badge>
                        </p>
                        <p>User: {user?.username || "None"}</p>
                        <p>Selected Room: {selectedRoom || "None"}</p>
                        <p>Selected User: {selectedUser?.username || "None"}</p>
                    </div>
                    <div className="col-md-6">
                        <h6>Counts</h6>
                        <p>Messages: {messages.length}</p>
                        <p>Active Users: {activeUsers.length}</p>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default DebugPanel;