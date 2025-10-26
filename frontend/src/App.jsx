// Dependencies
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

//Components
import { AuthProvider, useAuth } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Header } from "./components/Header";
// Style


// Pages
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from './pages/profile';
import About from './pages/About';
import Chat from './pages/Chat';
import Home from './pages/Home';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen pt-20">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}