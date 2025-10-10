import React, { useState } from 'react';
import DataPopup from './DataPopup';
import './login.css';

function Login() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const displayGrid = () => {
    setIsPopupOpen(true);
    };

    const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation for now
    if (email && password) {
        console.log('Login attempt:');
        console.log('Email:', email);
        console.log('Password:', password);
        setMessage('Login successful!');
        
      // send to a backend API HERE
    } else {
        setMessage('Please fill in all fields');
        }
    };

    return (
    <>
        <div className='login-box'>
            <div className='login-title'>Login</div>
            <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />

            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />

            <input type="submit" value="Login" style={{ backgroundColor: "#a1eafb", cursor: 'pointer' }} />
            
            {message && <p style={{ color: message.includes('successful') ? 'green' : 'red', marginTop: '10px' }}>{message}</p>}
            </form>
        </div>
        <DataPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </>
    );
}

export default Login;