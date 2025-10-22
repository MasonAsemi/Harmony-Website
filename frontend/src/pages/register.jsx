import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataPopup from '../components/DataPopup';
import '../styles/register.css'; // added stylesheet

function Register() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const displayGrid = () => {
        setIsPopupOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !email || !password || !confirmPassword) {
        setMessage('Please fill in all fields');
        return;
        }
        if (password !== confirmPassword) {
        setMessage('Passwords do not match');
        return;
        }
        if (password.length < 8) {
        setMessage('Password must be at least 8 characters');
        return;
        }

        setIsLoading(true);
        setMessage('');

        try {
        const response = await fetch('https://harmony-backend-4080-0c4993847d89.herokuapp.com/api/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage('Registration successful! Redirecting to login...');
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => navigate('/login'), 1500);
        } else {
            if (data.username) setMessage(`Username: ${data.username[0]}`);
            else if (data.email) setMessage(`Email: ${data.email[0]}`);
            else if (data.password) setMessage(`Password: ${data.password[0]}`);
            else setMessage('Registration failed. Please try again.');
        }
        } catch (err) {
        console.error('Registration error:', err);
        setMessage('Network error. Please check your connection and try again.');
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <section className="relative h-screen pt-20 overflow-hidden bg-gradient-to-br from-rose-300 via-pink-400 to-rose-500 flex items-center justify-center">
        <div className="auth-panel mx-4">
            <h2 className="auth-title">Register</h2>

            <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
                <label className="">Name</label>
                <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                disabled={isLoading}
                className="auth-input"
                />
            </div>

            <div className="form-group">
                <label className="">Email</label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={isLoading}
                className="auth-input"
                />
            </div>

            <div className="form-group">
                <label className="">Password</label>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 8 characters)"
                required
                disabled={isLoading}
                className="auth-input"
                />
            </div>

            <div className="form-group">
                <label className="">Confirm Password</label>
                <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                disabled={isLoading}
                className="auth-input"
                />
            </div>

            <button
                type="submit"
                className="auth-btn"
                disabled={isLoading}
            >
                {isLoading ? 'Registering...' : 'Create account'}
            </button>

            {message && (
                <p className={`auth-message ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
                </p>
            )}
            </form>
        </div>

        <DataPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
        </section>
    );
}

export default Register;