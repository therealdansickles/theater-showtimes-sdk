import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LoginPage from './LoginPage';
import ProtectedRoute from './ProtectedRoute';
import FilmSetupWizard from './FilmSetupWizard';
import { AdminDashboard } from './admin-components';

// New components
import HamburgerNavigation from './components/HamburgerNavigation';
import TwoPanelLayout from './components/TwoPanelLayout';
import VideosPage from './pages/VideosPage';
import SynopsisPage from './pages/SynopsisPage';
import GroupSalesPage from './pages/GroupSalesPage';

// Mock data for layout testing
import { mockMovieConfig } from './mockData';

// Main Showtimes Page with Two-Panel Layout
const ShowtimesPage = ({ movieConfig }) => {
  const [currentPage, setCurrentPage] = useState('showtimes');

  const handleSelectTheater = (theater) => {
    alert(`Selected ${theater.name}. Proceeding to seat selection...`);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Render different pages based on navigation
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'videos':
        return <VideosPage movieConfig={movieConfig} />;
      case 'synopsis':
        return <SynopsisPage movieConfig={movieConfig} />;
      case 'group-sales':
        return <GroupSalesPage movieConfig={movieConfig} />;
      case 'showtimes':
      case 'home':
      case 'get-tickets':
      default:
        return (
          <div className="pt-20 showtimes-section" data-section="showtimes">
            <TwoPanelLayout
              movieConfig={movieConfig}
              theaters={[]} // Using mock data inside component
              onSelectTheater={handleSelectTheater}
              loading={false}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: movieConfig?.background_color || '#0a0a0a' }}>
      <HamburgerNavigation movieConfig={movieConfig} onNavigate={handleNavigation} />
      {renderCurrentPage()}
    </div>
  );
};

const App = () => {
  const [movieConfig, setMovieConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use mock data for testing layout and styling
    setTimeout(() => {
      setMovieConfig(mockMovieConfig);
      setLoading(false);
    }, 500); // Simulate loading
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading Litebeem SDK...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Main Showtimes Page */}
            <Route 
              path="/" 
              element={<ShowtimesPage movieConfig={movieConfig} />} 
            />
            
            {/* Login page */}
            <Route 
              path="/login" 
              element={<LoginPage />} 
            />
            
            {/* Protected admin dashboard */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected film setup wizard */}
            <Route 
              path="/setup" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FilmSetupWizard />
                </ProtectedRoute>
              } 
            />
            
            {/* Legacy routes that redirect to main page with navigation */}
            <Route 
              path="/videos" 
              element={<ShowtimesPage movieConfig={movieConfig} />} 
            />
            <Route 
              path="/synopsis" 
              element={<ShowtimesPage movieConfig={movieConfig} />} 
            />
            <Route 
              path="/group-sales" 
              element={<ShowtimesPage movieConfig={movieConfig} />} 
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;