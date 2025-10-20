/**
 * Manages the state of the user's authentication, providing a context to descendant components containing the authentication information
 * @param {React.ReactNode} children - Descendents to provide the context to 
 * @returns {JSX.Element} - The context provider
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { profileAPI } from '../services/api';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        if (storedToken)
        {
            const checkRes = profileAPI.checkAuth(storedToken);

            if (checkRes && checkRes.ok)
            {
                setToken(storedToken);
                // Also needs to set user from checkAuth response
                // setUser(...)
            }
        }
    }, [])

    const login = async (username, password) => {
        const response = await fetch(`${API_BASE_URL}/login/`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);

        return response;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
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