// Dependencies
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

//Components
import DataPopup from './components/DataPopup';
import { AuthProvider, useAuth } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Style
import './styles/App.css';

// Pages
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from './pages/profile';
import About from './pages/About';

function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className='navbar'>
      <div className='navbar-container'>
        <div className='navbar-logoAndName'>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className='navbar-title'>Harmony</div>
          </Link>
        </div>
        <div className='navbar-loginAndRegister'>
          {user ? (
            <>
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <span className='navbar-welcome' style={{ cursor: 'pointer' }}>
                  Welcome, {user.username}
                </span>
              </Link>
              <button className='navbar-button logout' onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className='navbar-button login'>Login</button>
              </Link>
              <Link to="/register">
                <button className='navbar-button register'>Register</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const displayGrid = () => {
    setIsPopupOpen(true);
  };

  return (
    <AuthProvider>
      <Router>
        <NavBar />

        <div className="App">
          <header>
            
          </header>

          <main>
            <Routes>
              <Route path="/" element={<></>} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<ProtectedRoute ><Profile /></ProtectedRoute>} />
            </Routes>
          </main>

          <footer>
            <div className="container">
              <p>&copy; 2025 Harmony</p>
              <nav>
                <Link to="/about">About Us</Link>
              </nav>
            </div>
          </footer>

          <DataPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;