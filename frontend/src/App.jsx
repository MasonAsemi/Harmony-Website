import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import BottomNav from './components/dashboard/Bottomnav';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MatchSettings from './pages/MatchSettings'; 
import { useState } from 'react';

// Wrapper component to handle conditional BottomNav rendering
function AppContent() {
  const location = useLocation();
  const [showChatsOverlay, setShowChatsOverlay] = useState(false);
  
  // Pages where BottomNav should NOT appear (only Home and About)
  const excludedPages = ['/', '/about'];
  const shouldShowBottomNav = !excludedPages.includes(location.pathname);

  const handleChatsClick = () => {
    setShowChatsOverlay(!showChatsOverlay);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard 
                showChatsOverlay={showChatsOverlay}
                setShowChatsOverlay={setShowChatsOverlay}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/matchsettings"
          element={
            <ProtectedRoute>
              <MatchSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
      
      {/* Global Bottom Navigation - shown on all pages except Home and About */}
      {shouldShowBottomNav && (
        <BottomNav 
          onChatsClick={location.pathname === '/dashboard' ? handleChatsClick : null}
          showChatsOverlay={showChatsOverlay}
        />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
