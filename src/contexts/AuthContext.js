import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = authService.getUser();
        return storedUser || null;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            if (authService.isAuthenticated()) {
                const response = await authService.getCurrentUser();
                if (response?.success && response.data) {
                    const userData = response.data;
                    setUser(userData);
                    
                    // Update localStorage with full user data
                    localStorage.setItem('chat_user', JSON.stringify({
                        id: userData.id,
                        username: userData.username,
                        email: userData.email,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        profilePictureUrl: userData.profilePictureUrl,
                        online: userData.online,
                        lastSeen: userData.lastSeen,
                        createdAt: userData.createdAt,
                        roles: userData.roles
                    }));
                } else {
                    await authService.logout();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            setLoading(true);
            const result = await authService.login(credentials);
            
            if (result.success) {
                // Extract user data from login response
                const userData = result.data.user || {
                    id: result.data.userId,
                    username: result.data.username,
                    email: result.data.email
                };
                setUser(userData);
                return { success: true };
            } else {
                setError(result.message || 'Login failed');
                return { success: false, error: result.message };
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);
            const result = await authService.register(userData);
            if (result.success) {
                return { success: true };
            } else {
                setError(result.message);
                return { success: false, error: result.message };
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setError(null);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: authService.isAuthenticated,
        clearError: () => setError(null)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};