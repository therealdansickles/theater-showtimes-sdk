import React, { useState } from 'react';
import { useAuth } from './AuthContext';

// Main Header Component
export const Header = ({ movieConfig }) => {
  const accentColor = movieConfig?.accent_color || '#ef4444';
  const { isAuthenticated, isAdmin } = useAuth();
  
  return (
    <header className="bg-black text-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            {movieConfig?.logo_image && (
              <img 
                src={process.env.REACT_APP_BACKEND_URL + movieConfig.logo_image} 
                alt="Logo" 
                className="h-8 w-auto"
              />
            )}
            <div className="text-2xl font-bold" style={{ color: accentColor }}>
              {movieConfig?.movie_title || 'F1'}
            </div>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="transition-colors" style={{ color: 'white' }} 
               onMouseEnter={(e) => e.target.style.color = accentColor}
               onMouseLeave={(e) => e.target.style.color = 'white'}>
              Home
            </a>
            <a href="#" className="transition-colors" style={{ color: 'white' }}
               onMouseEnter={(e) => e.target.style.color = accentColor}
               onMouseLeave={(e) => e.target.style.color = 'white'}>
              Videos
            </a>
            <a href="#" className="transition-colors" style={{ color: 'white' }}
               onMouseEnter={(e) => e.target.style.color = accentColor}
               onMouseLeave={(e) => e.target.style.color = 'white'}>
              Get Tickets
            </a>
            {/* Setup wizard for film teams - only show for authenticated admins */}
            {isAuthenticated() && isAdmin() && (
              <a href="/setup" className="transition-colors" style={{ color: 'white' }}
                 onMouseEnter={(e) => e.target.style.color = accentColor}
                 onMouseLeave={(e) => e.target.style.color = 'white'}>
                <span className="flex items-center">
                  <span className="mr-1">🎬</span>
                  Setup Film
                </span>
              </a>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search button */}
          <button className="p-2 transition-colors" style={{ color: 'white' }}
                  onMouseEnter={(e) => e.target.style.color = accentColor}
                  onMouseLeave={(e) => e.target.style.color = 'white'}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </button>
          {/* Hidden admin access for development */}
          {isAuthenticated() && isAdmin() && (
            <a href="/admin" className="opacity-30 hover:opacity-100 transition-opacity text-xs">
              Admin
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
