import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const { login, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        setLoading(true);
        
        const result = await login(credentials);
        
        if (result.success) {
            navigate('/chat');
        }
        
        setLoading(false);
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <div className="w-100" style={{ maxWidth: '400px' }}>
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Login</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={credentials.username}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            
                            <Button 
                                disabled={loading} 
                                className="w-100" 
                                type="submit"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                        </Form>
                        
                        <div className="text-center mt-3">
                            <Link to="/register">Don't have an account? Register</Link>
                        </div>
                    </Card.Body>
                </Card>
                
                <div className="text-center mt-3">
                    <p className="text-muted">
                        <strong>Test Credentials:</strong><br />
                        Username: john_doe<br />
                        Password: password123
                    </p>
                </div>
            </div>
        </Container>
    );
};

export default Login;