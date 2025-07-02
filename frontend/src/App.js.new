import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
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

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

// Main Showtimes Page with Two-Panel Layout
const ShowtimesPage = ({ movieConfig }) => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('showtimes');

  const handleSelectTheater = (theater) => {
    alert(`Selected ${theater.name}. Proceeding to seat selection...`);
  };

  // Fetch theaters based on movie configuration
  useEffect(() => {
    const fetchTheaters = async () => {
      if (!movieConfig?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE}/movies/${movieConfig.id}/showtimes/categorized`
        );
        
        // Transform API response to match component expectations
        const apiTheaters = response.data.theaters || [];
        const transformedTheaters = apiTheaters.map(theater => ({
          name: theater.theater_name,
          chain: theater.theater_chain || 'THEATER',
          address: theater.theater_address,
          distance: theater.distance || 0,
          formats: theater.screening_formats?.map(format => ({
            type: format.category_name,
            times: format.times_by_category ? 
              Object.values(format.times_by_category).flat().map(timeObj => ({
                time: timeObj.time,
                category: timeObj.category
              })) :
              format.showtimes?.map(showtime => ({
                time: showtime.time,
                category: showtime.time_category
              })) || []
          })) || []
        }));
        
        setTheaters(transformedTheaters);
      } catch (error) {
        console.error('Error fetching theaters:', error);
        // Fall back to mock data if API fails
        setTheaters([
          {
            name: "AMC COUNCIL BLUFFS 17",
            chain: "AMC",
            address: "2025 KENT AVENUE, COUNCIL BLUFFS, IA, 51503",
            distance: 4,
            formats: [
              { type: "IMAX 2D", times: [{ time: "10:30PM", category: "evening" }] },
              { type: "AMC PRIME", times: [{ time: "9:30PM", category: "evening" }] }
            ]
          },
          {
            name: "ACX AKSARBEN CINEMA",
            chain: "ACX", 
            address: "2110 SOUTH 67TH STREET, OMAHA, NE, 68106",
            distance: 11,
            formats: [
              { type: "2D", times: [{ time: "9:15PM", category: "evening" }] },
              { type: "DOLBY", times: [{ time: "10:00PM", category: "evening" }] }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, [movieConfig?.id]);

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
              theaters={theaters}
              onSelectTheater={handleSelectTheater}
              loading={loading}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: movieConfig?.background_color || '#000000' }}>
      <HamburgerNavigation movieConfig={movieConfig} onNavigate={handleNavigation} />
      {renderCurrentPage()}
    </div>
  );
};

const App = () => {
  const [movieConfig, setMovieConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieConfig = async () => {
      try {
        const response = await axios.get(`${API_BASE}/movies/?limit=1`);
        if (response.data && response.data.length > 0) {
          setMovieConfig(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching movie config:', error);
        // Use default config if API fails
        setMovieConfig({
          id: 'default',
          movie_title: 'Sample Movie',
          movie_subtitle: 'A Cinematic Experience',
          description: 'A thrilling movie experience awaits you.',
          film_details: {
            logline: 'An unforgettable journey that will captivate audiences worldwide.'
          },
          film_assets: {
            poster_image: null,
            trailer_url: null,
            badge_images: [],
            video_gallery: []
          },
          social_links: {
            instagram: '',
            twitter: '',
            facebook: '',
            tiktok: '',
            website: 'https://litebeem.com'
          },
          primary_gradient: {
            type: 'linear',
            direction: '135deg',
            colors: ['#ef4444', '#dc2626']
          },
          background_color: '#000000',
          text_color: '#ffffff',
          accent_color: '#ef4444'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovieConfig();
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