import { Link } from "react-router-dom";
import harmonyLogo from "../assets/logo.png";

export function Header() {
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
            <Link to="/login" className="text-gray-700 px-3 py-2 rounded hover:bg-gray-100">
                Login
            </Link>
            <Link to="/register" className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded">
                Register
            </Link>
            </div>
        </div>
        </header>
    );
}
