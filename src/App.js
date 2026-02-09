import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ChatRoom from './components/chat/ChatRoom';
import PrivateRoute from './components/common/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <Container fluid className="app-container p-0">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/chat" 
                element={
                  <PrivateRoute>
                    <ChatRoom />
                  </PrivateRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/chat" />} />
            </Routes>
            
            {/* Add debug panel in development */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 1000 }}>
                <button 
                  onClick={() => {
                    const token = localStorage.getItem('chat_token');
                    const ws = localStorage.getItem('ws_status');
                    console.log('Token:', token ? 'Present' : 'Missing');
                    console.log('WebSocket:', ws);
                  }}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer'
                  }}
                >
                  Debug
                </button>
              </div>
            )}
          </Container>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;