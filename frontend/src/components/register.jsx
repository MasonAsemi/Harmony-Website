import React, { useState } from 'react';
import DataPopup from './DataPopup';
import './register.css';

function Register() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const displayGrid = () => {
        setIsPopupOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (name && email && password && confirmPassword) {
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            setMessage('Password must be at least 6 characters');
            return;
        }
        
        console.log('Registration attempt:');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Password:', password);
        setMessage('Registration successful!');
        
        // Send to a backend API
        
        // Clear form from success
        setTimeout(() => {
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setMessage('');
        }, 2000);
        } else {
        setMessage('Please fill in all fields');
        }
    };

    return (
        <>
        <div className='register-box'>
            <div className='register-title'>Register</div>
            <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
            />

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

            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
            />

            <input type="submit" value="Register" style={{ backgroundColor: "#a1eafb", cursor: 'pointer' }} />
            
            {message && <p style={{ color: message.includes('successful') ? 'green' : 'red', marginTop: '10px' }}>{message}</p>}
            </form>
        </div>
        <DataPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
        </>
    );
    }

export default Register;