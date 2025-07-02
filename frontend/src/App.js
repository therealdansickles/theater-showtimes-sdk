import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Header, HeroSection, SearchFilter, TheaterListings, Footer } from './components';
import { AdminDashboard } from './admin-components';
import { AuthProvider } from './AuthContext';
import LoginPage from './LoginPage';
import ProtectedRoute from './ProtectedRoute';

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

// Mock theater data (will be replaced with dynamic data)
const mockTheaters = [
  {
    name: "AMC COUNCIL BLUFFS 17",
    chain: "AMC",
    address: "2025 KENT AVENUE, COUNCIL BLUFFS, IA, 51503",
    distance: 4,
    formats: [
      { type: "IMAX 2D", times: ["10:30PM"] },
      { type: "AMC PRIME", times: ["9:30PM"] }
    ]
  },
  {
    name: "ACX AKSARBEN CINEMA",
    chain: "ACX",
    address: "2110 SOUTH 67TH STREET, OMAHA, NE, 68106",
    distance: 11,
    formats: [
      { type: "2D", times: ["9:15PM"] },
      { type: "DOLBY", times: ["10:00PM"] }
    ]
  },
  {
    name: "MARCUS TWIN CREEK CINEMA",
    chain: "MARCUS",
    address: "1000 SYCAMORE PARK BELLEVUE, NE, 68005",
    distance: 12,
    formats: [
      { type: "2D", times: ["9:30PM", "10:35PM"] }
    ]
  },
  {
    name: "AMC CLASSIC WESTROADS 14",
    chain: "AMC",
    address: "10000 CALIFORNIA STREET, OMAHA, NE, 68114",
    distance: 14,
    formats: [
      { type: "IMAX 2D", times: ["9:30PM"] }
    ]
  },
  {
    name: "B&B BELLEVUE CITY CINEMA 7",
    chain: "B&B",
    address: "1510 GALVIN ROAD SOUTH, BELLEVUE, NE, 68005",
    distance: 15,
    formats: [
      { type: "2D", times: ["9:00PM", "10:00PM"] }
    ]
  }
];

const MovieBookingPage = ({ movieConfig }) => {
  const [selectedLocation, setSelectedLocation] = useState("COUNCIL BLUFFS, IA");
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedDay, setSelectedDay] = useState({ day: 'SAT', date: 'JUN', num: '28' });
  const [selectedTime, setSelectedTime] = useState('EVENING');
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [theaters, setTheaters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [timeCategories, setTimeCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSelectTheater = (theater) => {
    setSelectedTheater(theater);
    alert(`Selected ${theater.name}. Proceeding to seat selection...`);
  };

  // Fetch categories and time categories on component mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch screening categories
        const categoriesResponse = await axios.get(`${API_BASE}/categories/`);
        setCategories(categoriesResponse.data);

        // Fetch time categories
        const timeCategoriesResponse = await axios.get(`${API_BASE}/categories/time-categories/available`);
        setTimeCategories(timeCategoriesResponse.data.time_categories);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilters();
  }, []);

  // Fetch theaters based on filters
  useEffect(() => {
    const fetchTheaters = async () => {
      if (!movieConfig?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Build query parameters for filtering
        const params = new URLSearchParams();
        
        // Map selectedTime to backend time categories
        const timeMapping = {
          'MORNING': 'morning',
          'AFTERNOON': 'afternoon', 
          'EVENING': 'evening',
          'LATE_NIGHT': 'late_night'
        };
        
        if (selectedTime && timeMapping[selectedTime]) {
          params.append('time_category', timeMapping[selectedTime]);
        }

        // Add screening category filters
        if (selectedFormats.length > 0) {
          selectedFormats.forEach(format => {
            params.append('screening_category', format);
          });
        }

        const response = await axios.get(
          `${API_BASE}/movies/${movieConfig.id}/showtimes/categorized?${params.toString()}`
        );
        
        // Transform API response to match frontend component expectations
        const apiTheaters = response.data.theaters || [];
        const transformedTheaters = apiTheaters.map(theater => ({
          name: theater.theater_name,
          chain: theater.theater_chain || 'THEATER',
          address: theater.theater_address,
          distance: theater.distance || 0,
          formats: theater.screening_formats?.map(format => ({
            type: format.category_name,
            times: format.times_by_category ? 
              // Flatten times_by_category into a single array
              Object.values(format.times_by_category).flat().map(timeObj => ({
                time: timeObj.time,
                category: timeObj.category
              })) :
              // Fallback to showtimes if available
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
        setTheaters(mockTheaters);
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, [movieConfig?.id, selectedFormats, selectedTime]);

  // Use fetched theaters instead of filtered mock data
  const filteredTheaters = theaters;

  return (
    <div className="min-h-screen text-white" 
         style={{ 
           background: movieConfig?.primary_gradient?.type === 'linear' 
             ? `linear-gradient(${movieConfig.primary_gradient.direction}, ${movieConfig.primary_gradient.colors.join(', ')})` 
             : movieConfig?.background_color || '#000000' 
         }}>
      <Header movieConfig={movieConfig} />
      <HeroSection movieConfig={movieConfig} />
      <SearchFilter 
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedFormats={selectedFormats}
        setSelectedFormats={setSelectedFormats}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        movieConfig={movieConfig}
        categories={categories}
        timeCategories={timeCategories}
      />
      <TheaterListings 
        theaters={filteredTheaters}
        onSelectTheater={handleSelectTheater}
        movieConfig={movieConfig}
        loading={loading}
      />
      <Footer movieConfig={movieConfig} />
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
          description: 'A thrilling movie experience',
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
          <p className="text-lg">Loading movie configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Public movie booking page */}
            <Route 
              path="/" 
              element={<MovieBookingPage movieConfig={movieConfig} />} 
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
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;