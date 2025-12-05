import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import '../styles/register.css';
import { createUser } from '../api/auth';
import { API_BASE_URL } from '../config';
function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { loginToken } = useAuth();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Check if there's a token in the URL query parameters (from Spotify registration)
        const token = searchParams.get('token');
        
        if (token) {
            const registerSpotify = async () => {
                try {
                    setIsLoading(true);
                    setMessage('Registering with Spotify...');
                    
                    console.log("Spotify Token received: ", token);
                    
                    // Use loginToken to authenticate with the Spotify token
                    await loginToken(token);
                    
                    setMessage('Registration successful! Redirecting...');
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 1000);
                } catch (error) {
                    console.error('Spotify registration error:', error);
                    setMessage('Spotify registration failed: ' + error.message);
                    setIsLoading(false);
                    
                    // Clear the token from URL to allow retry
                    window.history.replaceState({}, document.title, '/register');
                }
            };
            
            registerSpotify();
        }
    }, [searchParams, loginToken, navigate]);

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
            const data = await response.json();
            console.log('Registration response Status:', response.status);
            console.log('Registration response data:', data);
            if (response.status == 201) {
                setMessage('Registration successful! Logging you in...');
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                loginToken(data.token);
                setTimeout(() => navigate('/dashboard'), 1500);
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

    const handleSpotify = () => {
        // Redirect to Spotify OAuth endpoint
        window.location.href = API_BASE_URL + "/api/spotify-auth/login/";
    };

    return (
        <section className="pt-5 min-h-screen overflow-auto bg-gradient-to-br from-secondary via-accent to-primary flex flex-col items-center justify-center">
            <div className="auth-panel mx-4">
                <h2 className="auth-title">Register</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>User Name</label>
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
                <button 
                    onClick={handleSpotify} 
                    disabled={isLoading}
                    className="flex flex-row items-center gap-4 rounded-2xl w-[75%] bg-black hover:bg-[#1DB954] text-white font-semibold p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <img className="absolute" width="32" alt="Spotify icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/512px-Spotify_icon.svg.png?20220821125323" />
                    <div className="text-center w-full">Sign Up with Spotify</div>
                </button>

                <p className="text-white text-center mt-4">
                    Already have an account?{' '}
                    <span 
                        onClick={() => navigate('/login')} 
                        className="underline cursor-pointer hover:text-rose-200"
                    >
                        Login here.
                    </span>
                </p>
            </div>
        </section>
    );
}

export default Register;