import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

const HamburgerNavigation = ({ movieConfig, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();

  const accentColor = movieConfig?.accent_color || '#ef4444';
  const textColor = movieConfig?.text_color || '#ffffff';

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (action) => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate(action);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToShowtimes = () => {
    const showtimesSection = document.querySelector('.showtimes-section') || 
                            document.querySelector('[data-section="showtimes"]') ||
                            document.body;
    showtimesSection.scrollIntoView({ behavior: 'smooth' });
  };

  // Social links with fallbacks
  const socialLinks = [
    {
      name: 'TikTok',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
        </svg>
      ),
      url: movieConfig?.social_links?.tiktok || '#',
      tooltip: 'Follow on TikTok'
    },
    {
      name: 'Instagram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947C23.728 2.695 21.31.273 16.948.073 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
      url: movieConfig?.social_links?.instagram || '#',
      tooltip: 'Follow on Instagram'
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: movieConfig?.social_links?.facebook || '#',
      tooltip: 'Like on Facebook'
    },
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      url: movieConfig?.social_links?.twitter || '#',
      tooltip: 'Follow on X'
    },
    {
      name: 'Litebeem',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <defs>
            <radialGradient id="litebeem-gradient-nav" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.3"/>
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="6" fill="url(#litebeem-gradient-nav)"/>
          <circle cx="12" cy="6" r="0.5" fill="currentColor" opacity="0.8"/>
          <circle cx="12" cy="18" r="0.5" fill="currentColor" opacity="0.8"/>
          <circle cx="6" cy="12" r="0.5" fill="currentColor" opacity="0.8"/>
          <circle cx="18" cy="12" r="0.5" fill="currentColor" opacity="0.8"/>
          <circle cx="8.5" cy="8.5" r="0.4" fill="currentColor" opacity="0.7"/>
          <circle cx="15.5" cy="15.5" r="0.4" fill="currentColor" opacity="0.7"/>
          <circle cx="8.5" cy="15.5" r="0.4" fill="currentColor" opacity="0.7"/>
          <circle cx="15.5" cy="8.5" r="0.4" fill="currentColor" opacity="0.7"/>
        </svg>
      ),
      url: movieConfig?.social_links?.website || 'https://litebeem.com',
      tooltip: 'Visit Litebeem'
    }
  ];

  return (
    <>
      {/* Header with Hamburger */}
      <header className="hamburger-header">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center space-x-2">
            {movieConfig?.logo_image && (
              <img 
                src={process.env.REACT_APP_BACKEND_URL + movieConfig.logo_image} 
                alt="Logo" 
                className="h-6 w-auto"
              />
            )}
            <div className="text-lg md:text-xl font-bold" style={{ color: accentColor }}>
              {movieConfig?.movie_title || 'Litebeem'}
            </div>
          </div>

          {/* Hamburger Button - Mobile Optimized */}
          <button
            onClick={toggleMenu}
            className="hamburger-button p-3 rounded-lg transition-colors hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ color: textColor }}
            aria-label="Menu"
            aria-expanded={isOpen}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
            </div>
          </button>
        </div>
      </header>

      {/* Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm" onClick={toggleMenu} />
      )}

      {/* Slide-out Menu - Mobile Optimized */}
      <div className={`hamburger-menu-slide ${isOpen ? 'open' : ''}`}>
        <div className="hamburger-menu-content">
          
          {/* Close Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={toggleMenu}
              className="p-3 rounded-lg transition-colors hover:bg-white hover:bg-opacity-10 mobile-touch-target"
              style={{ color: textColor }}
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links - Mobile Optimized */}
          <nav className="flex-grow space-y-2">
            <div>
              <h3 className="text-sm font-medium opacity-60 mb-4 uppercase tracking-wider px-4" style={{ color: textColor }}>
                Navigation
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => {
                      handleNavClick('home');
                      scrollToTop();
                    }}
                    className="nav-item-mobile"
                    style={{ color: textColor }}
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick('videos')}
                    className="nav-item-mobile"
                    style={{ color: textColor }}
                  >
                    Videos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick('synopsis')}
                    className="nav-item-mobile"
                    style={{ color: textColor }}
                  >
                    Synopsis
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick('group-sales')}
                    className="nav-item-mobile"
                    style={{ color: textColor }}
                  >
                    Group Sales
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleNavClick('get-tickets');
                      scrollToShowtimes();
                    }}
                    className="nav-item-mobile"
                    style={{ color: accentColor }}
                  >
                    Get Tickets
                  </button>
                </li>
              </ul>
            </div>

            {/* Admin Links */}
            {isAuthenticated() && isAdmin() && (
              <div className="mt-8">
                <h3 className="text-sm font-medium opacity-60 mb-4 uppercase tracking-wider px-4" style={{ color: textColor }}>
                  Admin
                </h3>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="/admin"
                      className="nav-item-mobile"
                      style={{ color: textColor }}
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a
                      href="/setup"
                      className="nav-item-mobile"
                      style={{ color: textColor }}
                      onClick={() => setIsOpen(false)}
                    >
                      🎬 Setup Film
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </nav>

          {/* Social Links - Mobile Optimized */}
          <div className="mt-auto pt-6">
            <h3 className="text-sm font-medium opacity-60 mb-3 uppercase tracking-wider px-4" style={{ color: textColor }}>
              Connect
            </h3>
            <div className="social-grid-mobile">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-mobile hover:bg-white hover:bg-opacity-10"
                  style={{ color: textColor }}
                  title={social.tooltip}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            {/* Footer Text - Mobile Optimized */}
            <div className="mt-6 text-xs opacity-50 text-center px-4" style={{ color: textColor }}>
              <p>&copy; 2025 {movieConfig?.movie_title || 'Litebeem'}</p>
              <p className="mt-1">Powered by Litebeem SDK</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerNavigation;