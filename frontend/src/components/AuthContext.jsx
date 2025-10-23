/**
 * Manages the state of the user's authentication, providing a context to descendant components containing the authentication information
 * @param {React.ReactNode} children - Descendents to provide the context to 
 * @returns {JSX.Element} - The context provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/me/`, {
          headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to load user');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('AuthProvider fetchUser error', err);
        setToken(null);
        localStorage.removeItem('token');
      }
    };

    fetchUser();
  }, [token]);

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/api-token-auth/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data.non_field_errors ? data.non_field_errors.join(' ') : (data.detail || 'Login failed');
      throw new Error(errMsg);
    }

    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data;
  };

  const register = async (username, email, password) => {
    const res = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw data;
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}