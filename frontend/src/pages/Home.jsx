import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FallingAnimation } from "../components/FallingAnimation";

const Home = () => {
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Stop header at the end of hero section (100vh)
      const heroHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      
      if (scrollPosition >= heroHeight - 80) { // 80px is header height
        setIsHeaderSticky(true);
      } else {
        setIsHeaderSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Header - Transparent with Sticky Behavior */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isHeaderSticky ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
        style={{ 
          position: isHeaderSticky ? 'absolute' : 'fixed',
          top: isHeaderSticky ? '100vh' : '0'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          {/* Left - About Link */}
          <Link 
            to="/about" 
            className={`text-lg transition-colors duration-300 ${
              isHeaderSticky ? 'text-gray-900 hover:text-gray-600' : 'text-white hover:text-gray-200'
            }`}
          >
            About
          </Link>

          {/* Center - Harmony with Custom Font */}
          <h1 
            className={`text-3xl font-bold transition-colors duration-300 ${
              isHeaderSticky ? 'text-gray-900' : 'text-white'
            }`}
            style={{ fontFamily: "'Motley Forces', cursive" }}
          >
            Harmony
          </h1>

          {/* Right - Dashboard Button */}
          <Link 
            to="/dashboard" 
            className={`text-lg transition-colors duration-300 ${
              isHeaderSticky ? 'text-gray-900 hover:text-gray-600' : 'text-white hover:text-gray-200'
            }`}
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Section with Animated Background - Hinge Style */}
      <section className="relative h-screen pt-20 overflow-hidden bg-gradient-to-br from-primary to-secondary">
        <FallingAnimation />
        <div className="relative h-full flex items-center justify-between px-12 max-w-7xl mx-auto">
          {/* Bottom Left Text - Hinge Style */}
          <div className="text-left text-white max-w-2xl self-middle pb-24">
            <h1 className="text-7xl text-center font-bold mb-4 leading-tight">
              <br />
              Where Music Meets <br />
              Heart
            </h1>
          </div>

          {/* Stacked Profile Cards - Right Side Center */}
          <div className="relative h-[500px] w-[450px] flex items-center justify-center">
            {/* Card 3 - Back */}
            <div className="absolute w-72 h-96 bg-white rounded-2xl shadow-2xl transform -rotate-6 translate-x-20">
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop" 
                alt="Profile" 
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-2xl">
                <h3 className="text-white text-xl font-semibold">Sarah, 24</h3>
                <p className="text-white text-sm">Student @ Cal Poly Pomona</p>
                <p className="text-white text-xs mt-1">📍 Fullerton, CA</p>
              </div>
            </div>

            {/* Card 2 - Middle */}
            <div className="absolute w-72 h-96 bg-white rounded-2xl shadow-2xl transform rotate-3 translate-x-0">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop" 
                alt="Profile" 
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-2xl">
                <h3 className="text-white text-xl font-semibold">Emily, 22</h3>
                <p className="text-white text-sm">Student @ Cal Poly Pomona</p>
                <p className="text-white text-xs mt-1">📍 Fullerton, CA</p>
              </div>
            </div>

            {/* Card 1 - Front */}
            <div className="absolute w-72 h-96 bg-white rounded-2xl shadow-2xl transform -rotate-2 -translate-x-20">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop" 
                alt="Profile" 
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-2xl">
                <h3 className="text-white text-xl font-semibold">Alex, 25</h3>
                <p className="text-white text-sm">Student @ Cal Poly Pomona</p>
                <p className="text-white text-xs mt-1">📍 Fullerton, CA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white">
        <div className="w-full">
          <div className="grid grid-cols-2 gap-0">
            {/* Left Side - Content */}
            <div className="flex flex-col items-center justify-center px-16 py-24">
              <div className="max-w-xl space-y-12">
                <h1 className="text-3xl text-center mb-16 text-gray-900">About Us</h1>

                <div className="space-y-12 text-gray-700">
                  <p className="text-center leading-relaxed">
                    Harmony is a revolutionary platform that brings together music lovers from around the world.
                    Our mission is to create meaningful connections through the universal language of music.
                  </p>

                  <div className="flex justify-center mt-16">
                    <div className="text-center p-6 rounded-lg bg-gray-50 max-w-xs">
                      <div className="text-4xl mb-4">❤️</div>
                      <h3 className="mb-3 text-gray-900">Share Love</h3>
                      <p className="text-sm">
                        Connect with others who share your passion and create lasting memories through music.
                      </p>
                    </div>
                  </div>

                  <div className="mt-16">
                    <h3 className="mb-6 text-gray-900 text-center">What We Offer</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <span className="text-rose-500 mr-3">•</span>
                        <span>Spotify API connection to kickstart your user experience</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-rose-500 mr-3">•</span>
                        <span>Connections with fellow music enthusiasts</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Gray Box */}
            <div className="bg-gray-200 flex items-center justify-center">
              {/* Placeholder for future content */}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-500">© 2025 Harmony. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Home;