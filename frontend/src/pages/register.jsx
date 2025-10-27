import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/register.css';
import { createUser, requestLogin } from '../api/auth';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
            // Use /api/users/ endpoint which returns token on creation
            const response = await createUser({ username, email, password });

            if (response.ok) {
                setMessage('Registration successful! Redirecting to login...');
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setTimeout(() => navigate('/login'), 1500);
            } else {
                const data = await response.json();
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

    const handleSpotify = () => {
        //TODO: test code 
        window.location.href = "https://harmony-backend-4800-3fc8f73b6cb5.herokuapp.com/api/spotify-auth/login/"; // redirect users to spotify
    }

    return (
        <section className="relative h-screen pt-20 overflow-hidden flex-col gap-y-2 bg-gradient-to-br from-rose-300 via-pink-400 to-rose-500 flex items-center justify-center">
            <div className="auth-panel mx-4">
                <h2 className="auth-title">Register</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Name</label>
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
                        <label>Email</label>
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
                        <label>Password</label>
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
                        <label>Confirm Password</label>
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
            <div className="w-full flex flex-col gap-y-3 items-center center max-w-[520px]">
                <div className="text-white text-2xl text-center">Or</div>
                <button onClick={handleSpotify} className="rounded-2xl w-[75%] bg-[#7f7] p-3">Sign up with Spotify</button>
            </div>
        </section>
    );
}

export default Register;