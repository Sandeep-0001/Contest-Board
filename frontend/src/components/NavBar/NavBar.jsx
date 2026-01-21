import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../image.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '#' },
    { name: 'Practice Platform', href: 'https://example.com/practice' },
    { name: 'Contests', href: 'https://example.com/contests' },
    { name: 'Resume Tools', href: 'https://example.com/resume' },
    { name: 'Study Material', href: 'https://example.com/study' },
    { name: 'Login', href: 'https://example.com/login' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <img 
                src={logo} 
                alt="CareerPrep AI Logo" 
                className="h-10 w-10 rounded-lg object-contain"
              />
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                CareerPrep AI
              </div>
            </div>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navItems.map((item) =>
                <a
                  key={item.name}
                  href={item.href}
                  className="relative text-gray-300 hover:text-cyan-400 font-semibold transition-all duration-300 hover:scale-105 transform group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                </a>
              )}
              <button className="ml-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                Get Started Free
              </button>
            </div>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800/95 backdrop-blur-lg">
          <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3">
            {navItems.map((item) =>
              <a
                key={item.name}
                href={item.href}
                className="relative text-gray-300 hover:text-cyan-400 font-semibold transition-all duration-300 hover:scale-105 transform group block px-3 py-2 rounded-md text-base"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            )}
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium mt-2">
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
