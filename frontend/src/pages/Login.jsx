import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import '../styles/login.css';
import { API_BASE_URL } from '../config';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login, loginToken } = useAuth();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Check if there's a token in the URL query parameters
        const token = searchParams.get('token');
        
        if (token) {
            const loginSpotify = async () => {
                try {
                    setIsLoading(true);
                    setMessage('Logging in with Spotify...');
                    
                    console.log("Spotify Token received: ", token);
                    
                    // Use loginToken to authenticate with the Spotify token
                    await loginToken(token);
                    
                    setMessage('Login successful! Redirecting...');
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 1000);
                } catch (error) {
                    console.error('Spotify login error:', error);
                    setMessage('Spotify login failed: ' + error.message);
                    setIsLoading(false);
                    
                    // Clear the token from URL to allow retry
                    window.history.replaceState({}, document.title, '/login');
                }
            };
            
            loginSpotify();
        }
    }, []);

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
            
            // Redirect to dashboard
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            setMessage(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSpotifyLogin = () => {
        // Redirect to Spotify OAuth endpoint
        window.location.href = API_BASE_URL + "/api/spotify-auth/login/";
    };

    return (
        <section className="relative h-screen pt-20 overflow-hidden bg-gradient-to-br from-rose-300 via-pink-400 to-rose-500 flex items-center justify-center">
            <div className="flex flex-col gap-4 items-center w-full max-w-[520px] mx-4">
                <div className="auth-panel w-full">
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

                {/* Spotify Login Section */}
                <div className="w-full flex flex-col gap-3 items-center">
                    <div className="text-white text-2xl text-center">Or</div>
                    <button 
                        onClick={handleSpotifyLogin} 
                        disabled={isLoading}
                        className="flex flex-row items-center gap-4 rounded-2xl w-[75%] bg-black hover:bg-[#1DB954] text-white font-semibold p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <img className="absolute" width="32" alt="Spotify icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/512px-Spotify_icon.svg.png?20220821125323" />
                        <div className="text-center w-full">Login with Spotify</div>
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Login;