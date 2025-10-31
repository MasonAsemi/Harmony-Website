/**
 * Manages the state of the user's authentication, providing a context to descendant components containing the authentication information
 * @param {React.ReactNode} children - Descendents to provide the context to 
 * @returns {JSX.Element} - The context provider
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { getUserData, requestLogin } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        console.log("Token: ", storedToken);

        if (storedToken) {
            // Verify token and get user data using /users/me/
            fetch(`${API_BASE_URL}users/me/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${storedToken}`,
                    'Content-Type': 'application/json',
                },
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Invalid token');
            })
            .then(userData => {
                setToken(storedToken);
                setUser(userData);
            })
            .catch(error => {
                console.error('Token validation failed:', error);
                localStorage.removeItem("token");
            })
            .finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        // Use api-token-auth endpoint
        const response = await requestLogin({username: username, password: password});

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.non_field_errors?.[0] || 'Login failed');
        }

        const data = await response.json();

        setToken(data.token);
        localStorage.setItem("token", data.token);
        
        // Get user data after login
        const userResponse = await getUserData();

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();

        setUser(userData);

        return response;
    };

    // login spotify users
    const loginToken = async (token) => {

        setToken(token) ;
        localStorage.setItem("token", token);
        
        // Get user data after login
        const userResponse = await getUserData();

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();

        setUser(userData);

        return response;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};