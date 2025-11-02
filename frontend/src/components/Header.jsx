import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import harmonyLogo from "../assets/logo.png";

export function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 pointer-events-auto">
            <div className="w-full mx-auto px-6 py-4 flex items-center justify-between"> 
                {/* Logo and Brand */}
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3">
                        <img src={harmonyLogo} alt="Harmony Logo" className="h-12 w-12 object-contain" />
                        <span className="text-gray-900">Harmony</span>
                    </Link>
                </div>

                {/* Authentication Buttons */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <span className="text-gray-700">Welcome, {user.username}!</span>
                            <Link to="/dashboard" className="text-gray-700 px-3 py-2 rounded hover:bg-gray-100">
                                Dashboard
                            </Link>
                            <Link to="/profile" className="text-gray-700 px-3 py-2 rounded hover:bg-gray-100">
                                Profile
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-700 px-3 py-2 rounded hover:bg-gray-100">
                                Login
                            </Link>
                            <Link to="/register" className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}