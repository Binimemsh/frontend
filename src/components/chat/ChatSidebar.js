import React, { useState } from 'react';
import { 
    Card, ListGroup, Badge, Button, Form, 
    InputGroup, Tab, Nav 
} from 'react-bootstrap';
import { 
    People, Hash, Search, PlusCircle, 
    PersonCircle, ChatLeftText, PersonFill 
} from 'react-bootstrap-icons';

const ChatSidebar = ({ 
    user, 
    activeUsers = [], 
    rooms = [], 
    selectedRoom, 
    selectedUser,
    onSelectUser,
    onSelectRoom,
    onCreateRoom,
    onSearchUsers,
    theme = 'light'
}) => {
    const [activeTab, setActiveTab] = useState('users');
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (onSearchUsers) {
            onSearchUsers(query);
        }
    };

    // Filter users based on search
    const filteredUsers = searchQuery 
        ? activeUsers.filter(user => 
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : activeUsers;

    // Filter rooms based on search
    const filteredRooms = searchQuery 
        ? rooms.filter(room => 
            room.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : rooms;

    return (
        <div className={`sidebar-${theme}`} style={{ height: '100%', overflowY: 'auto' }}>
            {/* User Profile Card */}
            <Card className="mb-3 border-0 shadow-sm">
                <Card.Body className="p-3">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            {user?.profilePictureUrl ? (
                                <img 
                                    src={user.profilePictureUrl} 
                                    alt={user.username}
                                    className="rounded-circle"
                                    width={40}
                                    height={40}
                                />
                            ) : (
                                <PersonFill size={40} className="text-primary" />
                            )}
                        </div>
                        <div className="flex-grow-1">
                            <h6 className="mb-0 fw-bold">{user?.username || 'User'}</h6>
                            <small className="text-muted">
                                {user?.email || 'user@example.com'}
                            </small>
                            <Badge bg="success" className="ms-2" pill>Online</Badge>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Search */}
            <InputGroup className="mb-3">
                <Form.Control
                    placeholder="Search users or rooms..."
                    value={searchQuery}
                    onChange={handleSearch}
                    size="sm"
                />
                <Button variant="outline-secondary" size="sm">
                    <Search />
                </Button>
            </InputGroup>

            {/* Tabs */}
            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Nav variant="tabs" className="mb-3" fill>
                    <Nav.Item>
                        <Nav.Link eventKey="users" className="py-2">
                            <People className="me-1" /> Users
                            <Badge bg="secondary" className="ms-1" pill>
                                {filteredUsers.length}
                            </Badge>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="rooms" className="py-2">
                            <Hash className="me-1" /> Rooms
                            <Badge bg="secondary" className="ms-1" pill>
                                {filteredRooms.length}
                            </Badge>
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    {/* Users Tab */}
                    <Tab.Pane eventKey="users">
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-0">
                                {filteredUsers.length === 0 ? (
                                    <div className="text-center p-4 text-muted">
                                        <People size={48} className="mb-2" />
                                        <p>No users found</p>
                                        {searchQuery && <p>Try a different search term</p>}
                                    </div>
                                ) : (
                                    <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {filteredUsers.map((activeUser, index) => {
                                            // Skip current user
                                            if (activeUser.username === user?.username) return null;
                                            
                                            return (
                                                <ListGroup.Item
                                                    key={activeUser.id || activeUser.username || index}
                                                    action
                                                    active={selectedUser?.username === activeUser.username}
                                                    onClick={() => onSelectUser && onSelectUser(activeUser)}
                                                    className="d-flex align-items-center py-2 px-3"
                                                    style={{ 
                                                        backgroundColor: selectedUser?.username === activeUser.username ? '#e9ecef' : 'transparent'
                                                    }}
                                                >
                                                    <div className="me-2">
                                                        <PersonCircle 
                                                            size={32} 
                                                            className={activeUser.online ? "text-success" : "text-secondary"} 
                                                        />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="fw-medium">{activeUser.username}</div>
                                                        <small className="text-muted d-flex align-items-center">
                                                            <ChatLeftText size={12} className="me-1" />
                                                            Click to chat privately
                                                        </small>
                                                    </div>
                                                    <div className="d-flex flex-column align-items-end">
                                                        {activeUser.online ? (
                                                            <Badge bg="success" pill size="sm">Online</Badge>
                                                        ) : (
                                                            <Badge bg="secondary" pill size="sm">Offline</Badge>
                                                        )}
                                                        {activeUser.unreadCount > 0 && (
                                                            <Badge bg="danger" pill className="mt-1">
                                                                {activeUser.unreadCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </ListGroup.Item>
                                            );
                                        })}
                                    </ListGroup>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab.Pane>

                    {/* Rooms Tab */}
                    <Tab.Pane eventKey="rooms">
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-0">
                                <div className="p-3 border-bottom">
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        className="w-100"
                                        onClick={onCreateRoom}
                                    >
                                        <PlusCircle className="me-1" /> Create Room
                                    </Button>
                                </div>
                                
                                {filteredRooms.length === 0 ? (
                                    <div className="text-center p-4 text-muted">
                                        <Hash size={48} className="mb-2" />
                                        <p>No rooms available</p>
                                        {searchQuery && <p>Try a different search term</p>}
                                    </div>
                                ) : (
                                    <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {filteredRooms.map((room, index) => (
                                            <ListGroup.Item
                                                key={room.id || room.name || index}
                                                action
                                                active={selectedRoom === room.name}
                                                onClick={() => onSelectRoom && onSelectRoom(room)}
                                                className="d-flex align-items-center py-2 px-3"
                                                style={{ 
                                                    backgroundColor: selectedRoom === room.name ? '#e9ecef' : 'transparent'
                                                }}
                                            >
                                                <div className="me-2">
                                                    <Hash size={20} className="text-secondary" />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="fw-medium">{room.name}</div>
                                                    <small className="text-muted">
                                                        {room.description || 'Public chat room'}
                                                    </small>
                                                </div>
                                                <div>
                                                    {selectedRoom === room.name && (
                                                        <Badge bg="primary" pill size="sm">Active</Badge>
                                                    )}
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            {/* Quick Stats */}
            <Card className="mt-3 border-0 shadow-sm">
                <Card.Body className="p-3">
                    <h6 className="mb-3">Chat Stats</h6>
                    <div className="row small">
                        <div className="col-6">
                            <div className="text-muted">Online Users</div>
                            <div className="fw-bold">{activeUsers.filter(u => u.online).length}</div>
                        </div>
                        <div className="col-6">
                            <div className="text-muted">Total Rooms</div>
                            <div className="fw-bold">{rooms.length}</div>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ChatSidebar;