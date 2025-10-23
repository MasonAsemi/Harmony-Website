import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    useEffect(() => {

    }, [])

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