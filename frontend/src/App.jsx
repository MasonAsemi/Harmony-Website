// Dependencies
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

//Components
import DataPopup from './components/DataPopup';
import { AuthProvider, useAuth } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Header } from "./components/Header";
import { FallingAnimation } from "./components/FallingAnimation";

// Style


// Pages
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from './pages/profile';
import About from './pages/About';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';

function Home() {
  return (
    <>
      {/* Hero Section with Animated Background */}
      <section className="relative h-screen pt-20 overflow-hidden bg-linear-to-br from-rose-300 via-pink-400 to-rose-500">
        <FallingAnimation />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-6">
            <h1 className="text-6xl mb-6">Welcome to Harmony</h1>
            <p className="text-xl opacity-90">Where music meets the heart</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-center mb-12 text-gray-900">About Us</h2>

          <div className="space-y-8 text-gray-700">
            <p>
              Harmony is a revolutionary platform that brings together music lovers from around the world.
              Our mission is to create meaningful connections through the universal language of music.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center p-6 rounded-lg bg-gray-50">
                <div className="text-4xl mb-4">❤️</div>
                <h3 className="mb-3 text-gray-900">Share Love</h3>
                <p className="text-sm">
                  Connect with others who share your passion and create lasting memories through music.
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-gray-900">What We Offer</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-rose-500 mr-3">•</span>
                  <span>Curated playlists tailored to your mood and preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-500 mr-3">•</span>
                  <span>Community features to connect with fellow music enthusiasts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-400">© 2025 Harmony. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

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
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}