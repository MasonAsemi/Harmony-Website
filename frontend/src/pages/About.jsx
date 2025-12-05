import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FallingAnimation } from '../components/FallingAnimation';

function About() {
    const [isHeaderSticky, setIsHeaderSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const heroHeight = window.innerHeight;
            const scrollPosition = window.scrollY;
            
            if (scrollPosition >= heroHeight - 80) {
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
            {/* Header - Matching Home Page Style */}
            <header 
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isHeaderSticky ? 'bg-white shadow-md' : 'bg-transparent'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                    <Link 
                        to="/about" 
                        className={`text-lg transition-colors duration-300 ${
                            isHeaderSticky ? 'text-gray-900 hover:text-gray-600' : 'text-white hover:text-gray-200'
                        }`}
                    >
                        About
                    </Link>

                    <Link 
                        to="/"
                        className={`text-3xl font-bold transition-colors duration-300 ${
                            isHeaderSticky ? 'text-gray-900' : 'text-white'
                        }`}
                        style={{ fontFamily: "'Motley Forces', cursive" }}
                    >
                        Harmony
                    </Link>

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

            {/* Hero Section with Gradient Background */}
            <section className="relative h-screen pt-20 overflow-hidden bg-linear-to-br from-primary to-secondary">
                <FallingAnimation />
                <div className="relative h-full flex items-center justify-center px-12 max-w-7xl mx-auto">
                    <div className="text-center text-white w-full">
                        <h1 className="text-7xl font-bold mb-6">Meet Our Team</h1>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="bg-white py-24">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Top row - 3 cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                        {/* Mason Orton */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Mason Orton</h3>
                            <p className="text-blue-600 font-semibold mb-1">Lead Designer</p>
                            <p className="text-gray-500 italic mb-4">3rd Year</p>
                            <p className="text-gray-700 leading-relaxed">
                                I have experience in self-made projects as well as research groups at schools such as Cal State Fullerton.
                            </p>
                        </div>

                        {/* Kelechi Duru */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Kelechi Duru</h3>
                            <p className="text-blue-600 font-semibold mb-1">CEO & Lead Back-End Engineer</p>
                            <p className="text-gray-500 italic mb-4">4th Year</p>
                            <p className="text-gray-700 leading-relaxed">
                                Experienced in full-stack development with a passion for building scientific simulations.
                            </p>
                        </div>

                        {/* Jack Woline */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Jack Woline</h3>
                            <p className="text-blue-600 font-semibold mb-1">Lead Front-End Developer</p>
                            <p className="text-gray-500 italic mb-4">*** Year</p>
                        </div>
                    </div>

                    {/* Bottom row - 2 cards centered */}
                    <div className="flex justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
                            {/* Helena Crowley */}
                            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Helena Crowley</h3>
                                <p className="text-blue-600 font-semibold mb-1">Back-End Engineer</p>
                                <p className="text-gray-500 italic mb-4">*** Year</p>
                            </div>

                            {/* Daniel Castillo */}
                            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Daniel Castillo</h3>
                                <p className="text-blue-600 font-semibold mb-1">Back-End Engineer</p>
                                <p className="text-gray-500 italic mb-4">*** Year</p>
                            </div>
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

export default About;