// Dependencies
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

//Components
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Header } from "./components/Header";

// Pages
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from "./pages/profile";
import About from "./pages/About";
import Chat from "./pages/Chat";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import { useEffect, useState } from "react";

function AppContent() {
  const location = useLocation();
  const [currentLocation, setCurrentLocation] = useState("/");

  useEffect(() => {
    setCurrentLocation(location.pathname);
  })

  return (
    <>
      {(currentLocation === "/") ? <Header /> : <Sidebar />}
      <div className={!(currentLocation === "/") ? "" : "min-h-screen pt-20"}>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route path="/about" element={<About />} />
            <Route path="/chat" element={<Chat />} />
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
            </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
