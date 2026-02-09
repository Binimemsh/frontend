import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, Badge, Image, Spinner } from 'react-bootstrap';
import { PersonCircle, Search, X } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';

const UserSearchModal = ({ show, onHide, onSelectUser }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (searchQuery.trim()) {
            searchUsers(searchQuery);
        } else {
            setUsers([]);
        }
    }, [searchQuery]);

    const searchUsers = async (query) => {
        setLoading(true);
        try {
            // Simulate API call - replace with actual API call
            setTimeout(() => {
                // Mock data
                const mockUsers = [
                    { id: 2, username: 'jane_doe', name: 'Jane Doe', online: true },
                    { id: 3, username: 'bob_smith', name: 'Bob Smith', online: false },
                    { id: 4, username: 'alice_wonder', name: 'Alice Wonder', online: true },
                    { id: 5, username: 'charlie_brown', name: 'Charlie Brown', online: true },
                ].filter(u => 
                    u.username.toLowerCase().includes(query.toLowerCase()) ||
                    u.name.toLowerCase().includes(query.toLowerCase())
                );
                setUsers(mockUsers);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Search error:', error);
            setLoading(false);
        }
    };

    const handleSelectUser = (selectedUser) => {
        if (onSelectUser) {
            onSelectUser(selectedUser);
        }
        setSearchQuery('');
        setUsers([]);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Search Users</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Search Input */}
                <div className="position-relative mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search by username or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    {searchQuery && (
                        <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => setSearchQuery('')}
                        >
                            <X />
                        </Button>
                    )}
                </div>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Searching users...</p>
                    </div>
                ) : searchQuery.trim() ? (
                    users.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <Search size={48} className="mb-2" />
                            <p>No users found for "{searchQuery}"</p>
                        </div>
                    ) : (
                        <ListGroup>
                            {users.map((resultUser) => (
                                <ListGroup.Item
                                    key={resultUser.id}
                                    action
                                    onClick={() => handleSelectUser(resultUser)}
                                    className="d-flex align-items-center"
                                >
                                    <div className="me-3">
                                        <PersonCircle 
                                            size={40} 
                                            className={resultUser.online ? "text-success" : "text-secondary"} 
                                        />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="fw-medium">{resultUser.username}</div>
                                        <div className="text-muted small">{resultUser.name}</div>
                                    </div>
                                    <div>
                                        {resultUser.online ? (
                                            <Badge bg="success" pill>Online</Badge>
                                        ) : (
                                            <Badge bg="secondary" pill>Offline</Badge>
                                        )}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )
                ) : (
                    <div className="text-center py-4 text-muted">
                        <Search size={48} className="mb-2" />
                        <p>Type to search for users</p>
                        <small>Search by username or display name</small>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserSearchModal;