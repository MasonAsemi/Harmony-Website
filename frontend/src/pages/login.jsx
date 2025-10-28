import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import '../styles/login.css';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login, loginToken } = useAuth();
    let { token } = useParams(); 

    useEffect(()=>{
        //if there is a token in the params then send to prof
        if(token){
            const loginSpotify = async () =>{ 
                //TODO: REMOVE
                console.log("Spotify Token: ", token)   
                await loginToken(token)
                
                setMessage('Login successful! Redirecting...');
                
                // Clear form
                setUsername('');
                setPassword('');
                
                // Redirect to profile page
                setTimeout(() => {
                    navigate('/profile');
                }, 1000);
            }
            
            loginSpotify(); 
        }
    },[token])
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!username || !password) {
            setMessage('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            await login(username, password);
            setMessage('Login successful! Redirecting...');
            
            // Clear form
            setUsername('');
            setPassword('');
            
            // Redirect to profile page
            setTimeout(() => {
                navigate('/profile');
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            setMessage(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="relative h-screen pt-20 overflow-hidden bg-gradient-to-br from-rose-300 via-pink-400 to-rose-500 flex items-center justify-center">
            <div className="auth-panel mx-4">
                <h2 className="auth-title">Login</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Username</label>
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
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
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
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                    
                    {message && (
                        <p className={`auth-message ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
}

export default Login;