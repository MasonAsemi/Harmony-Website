import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FallingAnimation } from "../components/FallingAnimation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// Genre Rotator Component with 3D Cube Effect
const GenreRotator = () => {
  const genres = ['Rock', 'Jazz', 'Hip-Hop', 'Classical', 'EDM', 'R&B', 'Country', 'Pop'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger animation first
      setAnimationKey(prev => prev + 1);
      
      // Then change the index after animation completes
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % genres.length);
      }, 800); // Match animation duration (0.8s)
    }, 3000); // Change genre every 3 seconds

    return () => clearInterval(interval);
  }, [genres.length]);

  const getPrevIndex = () => (currentIndex - 1 + genres.length) % genres.length;
  const getNextIndex = () => (currentIndex + 1) % genres.length;

  return (
    <>
      <style>{`
        @keyframes rotateUp {
          0% {
            transform: rotateX(0deg) translateZ(60px);
          }
          100% {
            transform: rotateX(90deg) translateZ(60px);
          }
        }
        
        .genre-container {
          display: inline-block;
          position: relative;
          height: 1em;
          min-height: 1em;
          width: 300px;
          vertical-align: baseline;
          perspective: 1000px;
          perspective-origin: 50% 50%;
        }
        
        .genre-underline {
          position: absolute;
          bottom: -0.1em;
          left: 0;
          right: 0;
          height: 3px;
          background-color: rgba(255, 255, 255, 0.4);
          border-radius: 2px;
        }
        
        .genre-rotator {
          display: inline-block;
          position: relative;
          transform-style: preserve-3d;
          animation: rotateUp 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95);
        }
        
        .genre-face {
          display: inline-block;
          white-space: nowrap;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          font-weight: bold;
          color: white;
        }
        
        .genre-prev {
          position: absolute;
          top: 0;
          left: 0;
          transform: rotateX(-90deg) translateZ(60px);
          opacity: 0.3;
        }
        
        .genre-current {
          position: relative;
          transform: rotateX(0deg) translateZ(60px);
        }
        
        .genre-next {
          position: absolute;
          top: 0;
          left: 0;
          transform: rotateX(90deg) translateZ(60px);
          opacity: 0.3;
        }
      `}</style>
      
      <span className="genre-container">
        <span 
          key={animationKey}
          className="genre-rotator"
        >
          {/* Next Genre - Top (faded) */}
          <span className="genre-face genre-prev">
            {genres[getNextIndex()]}
          </span>

          {/* Current Genre - Front */}
          <span className="genre-face genre-current">
            {genres[currentIndex]}
          </span>

          {/* Previous Genre - Bottom (faded) */}
          <span className="genre-face genre-next">
            {genres[getPrevIndex()]}
          </span>
        </span>
        {/* Underline for genre text */}
        <span className="genre-underline"></span>
      </span>
    </>
  );
};

// Animated Swipe Demo Component
const SwipeDemo = () => {
  const x = useMotionValue(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  
  const rotateRaw = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const rejectOpacity = useTransform(x, [-200, -50, 0], [1, 0.5, 0]);
  const acceptOpacity = useTransform(x, [0, 50, 200], [0, 0.5, 1]);

  // Mock profile data for Sarah (the last card from the original stack)
  const profileData = {
    name: "Sarah",
    age: 24,
    school: "Student @ Cal Poly Pomona",
    location: "Fullerton, CA",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop"
  };

  useEffect(() => {
    const animateSwipe = async () => {
      if (isAnimating) return;
      
      setIsAnimating(true);
      
      // Wait 2 seconds before starting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Swipe left
      setSwipeDirection('left');
      await animate(x, -250, { duration: 0.5 });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reset
      x.set(0);
      setSwipeDirection(null);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Swipe right
      setSwipeDirection('right');
      await animate(x, 250, { duration: 0.5 });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reset
      x.set(0);
      setSwipeDirection(null);
      
      setIsAnimating(false);
    };

    const interval = setInterval(() => {
      animateSwipe();
    }, 5000);

    // Start first animation immediately
    animateSwipe();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center px-4 py-2">
      <div className="relative w-full max-w-lg h-[700px]">
        <motion.div
          className="absolute w-full h-full"
          style={{
            x,
            rotate: rotateRaw,
            opacity,
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative h-full flex flex-col">
            {/* Reject overlay (red) */}
            <motion.div 
              className="absolute inset-0 bg-red-500 flex items-center justify-center z-10 pointer-events-none"
              style={{ opacity: rejectOpacity }}
            >
              <div className="text-white text-9xl font-bold rotate-12">✖</div>
            </motion.div>
            
            {/* Accept overlay (green) */}
            <motion.div 
              className="absolute inset-0 bg-green-500 flex items-center justify-center z-10 pointer-events-none"
              style={{ opacity: acceptOpacity }}
            >
              <div className="text-white text-9xl font-bold -rotate-12">✓</div>
            </motion.div>

            {/* Profile image */}
            <div className="flex-1 bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center min-h-0">
              <img 
                src={profileData.image}
                alt={profileData.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile info */}
            <div className="shrink-0 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {profileData.name}, {profileData.age}
              </h2>
              <p className="text-gray-700 text-lg mb-1">{profileData.school}</p>
              <p className="text-gray-600 text-lg">📍 {profileData.location}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

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
      <section className="relative h-screen pt-20 overflow-hidden bg-linear-to-br from-primary to-secondary">
        <FallingAnimation />
        <div className="relative h-full flex items-center justify-center px-12 max-w-7xl mx-auto">
          {/* Bottom Left Text - Hinge Style with Rotating Genres */}
          <div className="text-center text-white w-full">
            <div className="inline-flex items-baseline justify-center text-7xl font-bold">
              <span>Love is in:&nbsp;</span>
              <GenreRotator />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white">
        <div className="w-full">
          <div className="grid grid-cols-2 gap-0">
            {/* Left Side - Content with Match Cards */}
            <div className="flex flex-col items-center justify-center px-16 py-24">
              <div className="max-w-xl space-y-12">
                <h1 className="text-3xl text-center mb-8 text-gray-900">About Us</h1>

                <div className="space-y-8 text-gray-700">
                  <p className="text-center leading-relaxed">
                    Harmony is a revolutionary music-based dating platform that brings together music lovers from around the world.
                    Our mission is to create meaningful connections through the universal language of music.
                  </p>

                  <div className="flex justify-center mt-12">
                    <div className="text-center p-6 rounded-lg bg-gray-50 max-w-xs">
                      <div className="text-4xl mb-4">❤️</div>
                      <h3 className="mb-3 text-gray-900 font-semibold">Share Love Through Music</h3>
                      <p className="text-sm">
                        Connect with others who share your passion and create lasting memories through music.
                      </p>
                    </div>
                  </div>

                  {/* Match Cards Display */}
                  <div className="mt-12">
                    <h3 className="mb-6 text-gray-900 text-center font-semibold text-xl">Discover Your Perfect Match</h3>
                    <p className="text-center text-sm text-gray-600 mb-8">
                      Swipe through profiles of music enthusiasts who share your taste. Each match is based on your favorite artists, genres, and songs.
                    </p>
                    
                    {/* Stacked Match Cards */}
                    <div className="relative h-80 flex items-center justify-center mb-8">
                      {/* Card 3 - Back */}
                      <div className="absolute w-48 h-64 bg-white rounded-xl shadow-xl transform -rotate-6 translate-x-12">
                        <img 
                          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop" 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-3 rounded-b-xl">
                          <h3 className="text-white text-sm font-semibold">Sarah, 24</h3>
                          <p className="text-white text-xs">📍 Fullerton, CA</p>
                        </div>
                      </div>

                      {/* Card 2 - Middle */}
                      <div className="absolute w-48 h-64 bg-white rounded-xl shadow-xl transform rotate-3 translate-x-0">
                        <img 
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop" 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-3 rounded-b-xl">
                          <h3 className="text-white text-sm font-semibold">Emily, 22</h3>
                          <p className="text-white text-xs">📍 Fullerton, CA</p>
                        </div>
                      </div>

                      {/* Card 1 - Front */}
                      <div className="absolute w-48 h-64 bg-white rounded-xl shadow-xl transform -rotate-2 -translate-x-12">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop" 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-3 rounded-b-xl">
                          <h3 className="text-white text-sm font-semibold">Alex, 25</h3>
                          <p className="text-white text-xs">📍 Fullerton, CA</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12">
                    <h3 className="mb-6 text-gray-900 text-center font-semibold">What We Offer</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <span className="text-rose-500 mr-3 text-xl">•</span>
                        <span>Spotify API integration for personalized music profiles</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-rose-500 mr-3 text-xl">•</span>
                        <span>Smart matching based on musical compatibility</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-rose-500 mr-3 text-xl">•</span>
                        <span>Connect with fellow music enthusiasts</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Swipe Demo */}
            <div className="bg-gray-200 flex flex-col items-center justify-center py-6 px-4">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">How It Works</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white text-lg font-bold">
                      ✖
                    </div>
                    <p className="text-left text-sm">Swipe <span className="font-semibold">left</span> to pass</p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-lg font-bold">
                      ✓
                    </div>
                    <p className="text-left text-sm">Swipe <span className="font-semibold">right</span> to match</p>
                  </div>
                </div>
              </div>
              <SwipeDemo />
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