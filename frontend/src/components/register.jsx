import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataPopup from './DataPopup';
import './register.css';

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
        
        // Validation
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
            // Replace with your actual backend URL
            const response = await fetch('https://harmony-backend-4080-0c4993847d89.herokuapp.com/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });

        const data = await response.json();

            if (response.ok) {

                setMessage('Registration successful! Redirecting to login...');
                
                // Store the token
                console.log('Token:', data.token);
                console.log('User:', data.user);
                
                // Clear form
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                
                //Redirect user to the login page, give or take 2 seconds to allow for loading from database
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                // Handle validation errors
                if (data.username) {
                    setMessage(`Username: ${data.username[0]}`);
                } else if (data.email) {
                    setMessage(`Email: ${data.email[0]}`);
                } else if (data.password) {
                    setMessage(`Password: ${data.password[0]}`);
                } else {
                    setMessage('Registration failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            setMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className='register-box'>
                <div className='register-title'>Register</div>
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
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        disabled={isLoading}
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (min 8 characters)"
                        required
                        disabled={isLoading}
                    />

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                        disabled={isLoading}
                    />

                    <input 
                        type="submit" 
                        value={isLoading ? "Registering..." : "Register"} 
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

export default Register;