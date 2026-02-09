import React from 'react';
import { Alert, Button, Container } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <Container className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
                    <div className="text-center">
                        <Alert variant="danger" className="mb-4">
                            <Alert.Heading>Something went wrong!</Alert.Heading>
                            <p>The application encountered an unexpected error.</p>
                            <hr />
                            <p className="mb-0">
                                {this.state.error && this.state.error.toString()}
                            </p>
                        </Alert>
                        <div className="d-grid gap-2">
                            <Button variant="primary" onClick={this.handleReset}>
                                Reload Application
                            </Button>
                            <Button variant="outline-primary" onClick={() => window.location.href = '/login'}>
                                Go to Login
                            </Button>
                        </div>
                    </div>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;