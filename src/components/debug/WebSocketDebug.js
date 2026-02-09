import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert } from 'react-bootstrap';
import websocketService from '../../services/websocketService';

const WebSocketDebug = () => {
    const [status, setStatus] = useState({});
    const [logs, setLogs] = useState([]);
    
    useEffect(() => {
        // Update status every second
        const interval = setInterval(() => {
            setStatus(websocketService.getConnectionStatus());
        }, 1000);
        
        // Initial update
        setStatus(websocketService.getConnectionStatus());
        
        return () => clearInterval(interval);
    }, []);
    
    const addLog = (message) => {
        setLogs(prev => [{
            time: new Date().toLocaleTimeString(),
            message
        }, ...prev.slice(0, 10)]); // Keep last 10 logs
    };
    
    const testConnection = () => {
        addLog('Testing connection...');
        websocketService.logDebugInfo();
        
        // Test direct WebSocket
        const ws = new WebSocket('ws://localhost:8080/ws');
        ws.onopen = () => {
            addLog('✅ Direct WebSocket test: Connected');
            ws.close();
        };
        ws.onerror = (e) => {
            addLog('❌ Direct WebSocket test: Failed - ' + e.type);
        };
    };
    
    const manuallyConnect = () => {
        addLog('Manually connecting...');
        websocketService.connect();
    };
    
    const manuallyDisconnect = () => {
        addLog('Manually disconnecting...');
        websocketService.disconnect();
    };
    
    return (
        <Card className="mt-3">
            <Card.Header>
                <h5 className="mb-0">
                    WebSocket Debug Panel
                    <Badge bg={status.isConnected ? "success" : "danger"} className="ms-2">
                        {status.isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                </h5>
            </Card.Header>
            <Card.Body>
                <div className="mb-3">
                    <h6>Status</h6>
                    <div className="row">
                        <div className="col-6">
                            <p><strong>Connected:</strong> {status.isConnected ? '✅ Yes' : '❌ No'}</p>
                            <p><strong>Connecting:</strong> {status.isConnecting ? '⏳ Yes' : 'No'}</p>
                        </div>
                        <div className="col-6">
                            <p><strong>Reconnect Attempts:</strong> {status.reconnectAttempts || 0}</p>
                            <p><strong>Client Exists:</strong> {status.hasClient ? '✅ Yes' : '❌ No'}</p>
                        </div>
                    </div>
                </div>
                
                <div className="mb-3">
                    <h6>Actions</h6>
                    <div className="d-flex gap-2 flex-wrap">
                        <Button variant="primary" size="sm" onClick={testConnection}>
                            Test Connection
                        </Button>
                        <Button variant="success" size="sm" onClick={manuallyConnect}>
                            Connect
                        </Button>
                        <Button variant="warning" size="sm" onClick={manuallyDisconnect}>
                            Disconnect
                        </Button>
                        <Button variant="info" size="sm" onClick={() => {
                            websocketService.logDebugInfo();
                            addLog('Debug info logged to console');
                        }}>
                            Log Debug Info
                        </Button>
                    </div>
                </div>
                
                <div>
                    <h6>Recent Logs</h6>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '12px' }}>
                        {logs.length === 0 ? (
                            <p className="text-muted">No logs yet</p>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="border-bottom py-1">
                                    <small className="text-muted">[{log.time}]</small>{' '}
                                    <span>{log.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default WebSocketDebug;