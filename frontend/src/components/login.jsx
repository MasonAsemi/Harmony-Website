import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import DataPopup from './DataPopup';
import './login.css';

function Login() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const displayGrid = () => {
        setIsPopupOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!username || !password) {
        setMessage('Please fill in all fields');
        return;
        }

        setIsLoading(true);
        setMessage('');

        try {
        const response = await fetch('https://harmony-backend-4080-0c4993847d89.herokuapp.com/api/login/', {
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

        if (response.ok) {
            setMessage('Login successful! Redirecting...');
            
            // Store user and token in context
            login(data.user, data.token);
            
            console.log('Token:', data.token);
            console.log('User:', data.user);
            
            // Clear form
            setUsername('');
            setPassword('');
            
            // Redirect to home page after around 1 second to give loading time
            setTimeout(() => {
            navigate('/');
            }, 1000);
        } else {
            setMessage(data.detail || 'Login failed. Please check your credentials.');
        }
        } catch (error) {
        console.error('Login error:', error);
        setMessage('Network error. Please check your connection and try again.');
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <>
        <div className='login-box'>
            <div className='login-title'>Login</div>
            <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                disabled={isLoading}
            />

            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isLoading}
            />

            <input 
                type="submit" 
                value={isLoading ? "Logging in..." : "Login"} 
                style={{ backgroundColor: "#a1eafb", cursor: isLoading ? 'not-allowed' : 'pointer' }} 
                disabled={isLoading}
            />
            
            {message && (
                <p style={{ 
                color: message.includes('successful') ? 'green' : 'red', 
                marginTop: '10px',
                textAlign: 'center'
                }}>
                {message}
                </p>
            )}
            </form>
        </div>
        <DataPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
        </>
    );
}

export default Login;