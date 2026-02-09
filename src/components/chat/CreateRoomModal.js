import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Badge } from 'react-bootstrap';
import { Hash, X, People, PersonCircle } from 'react-bootstrap-icons';

const CreateRoomModal = ({ show, onHide, users = [] }) => {
    const [roomName, setRoomName] = useState('');
    const [roomDescription, setRoomDescription] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isPrivate, setIsPrivate] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!roomName.trim()) {
            setError('Room name is required');
            return;
        }

        // Create room data
        const roomData = {
            name: roomName,
            description: roomDescription,
            isPrivate: isPrivate,
            memberIds: selectedUsers.map(u => u.id)
        };

        // Here you would call your API to create the room
        console.log('Creating room:', roomData);
        
        // Reset form
        setRoomName('');
        setRoomDescription('');
        setSelectedUsers([]);
        setIsPrivate(false);
        setError('');
        
        onHide();
    };

    const toggleUserSelection = (user) => {
        setSelectedUsers(prev => {
            const isSelected = prev.some(u => u.id === user.id);
            if (isSelected) {
                return prev.filter(u => u.id !== user.id);
            } else {
                return [...prev, user];
            }
        });
    };

    const removeSelectedUser = (userId) => {
        setSelectedUsers(prev => prev.filter(u => u.id !== userId));
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <Hash className="me-2" /> Create New Chat Room
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    {/* Room Name */}
                    <Form.Group className="mb-3">
                        <Form.Label>Room Name *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g., General Chat, Project Discussion"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    {/* Description */}
                    <Form.Group className="mb-3">
                        <Form.Label>Description (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="What's this room about?"
                            value={roomDescription}
                            onChange={(e) => setRoomDescription(e.target.value)}
                        />
                    </Form.Group>

                    {/* Privacy Toggle */}
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="switch"
                            id="private-switch"
                            label={
                                <>
                                    <Badge bg={isPrivate ? "danger" : "success"} className="ms-1">
                                        {isPrivate ? "Private Room" : "Public Room"}
                                    </Badge>
                                </>
                            }
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                        />
                        <Form.Text className="text-muted">
                            {isPrivate 
                                ? "Only invited users can join this room" 
                                : "Anyone can join this room"}
                        </Form.Text>
                    </Form.Group>

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div className="mb-3">
                            <Form.Label>Selected Users ({selectedUsers.length})</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {selectedUsers.map(user => (
                                    <Badge 
                                        key={user.id} 
                                        bg="primary" 
                                        className="d-flex align-items-center p-2"
                                    >
                                        <PersonCircle className="me-1" /> {user.username}
                                        <Button 
                                            variant="link" 
                                            className="p-0 ms-2 text-white"
                                            onClick={() => removeSelectedUser(user.id)}
                                        >
                                            <X size={12} />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* User Selection (for private rooms) */}
                    {isPrivate && (
                        <Form.Group className="mb-3">
                            <Form.Label>Select Users to Invite</Form.Label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {users.filter(u => !selectedUsers.some(su => su.id === u.id)).map(user => (
                                    <div 
                                        key={user.id}
                                        className="d-flex align-items-center p-2 border-bottom hover-bg"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => toggleUserSelection(user)}
                                    >
                                        <div className="me-3">
                                            <PersonCircle 
                                                size={32} 
                                                className={user.online ? "text-success" : "text-secondary"} 
                                            />
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-medium">{user.username}</div>
                                            <div className="text-muted small">{user.name || user.email}</div>
                                        </div>
                                        <Badge bg={user.online ? "success" : "secondary"} pill>
                                            {user.online ? "Online" : "Offline"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                        Create Room
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CreateRoomModal;