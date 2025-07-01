import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Header, HeroSection, SearchFilter, TheaterListings, Footer } from './components';
import { AdminDashboard } from './admin-components';

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
    name: "ALAMO DRAFTHOUSE CINEMA - LA VISTA",
    chain: "ALAMO",
    address: "12100 WESTPORT PARKWAY, LA VISTA, NE, 68128",
    distance: 16,
    formats: [
      { type: "2D", times: ["9:30PM"] },
      { type: "DOLBY", times: ["10:15PM"] }
    ]
  },
  {
    name: "B & B OMAHA OAKVIEW PLAZA 14",
    chain: "B&B",
    address: "3005 SOUTH 144TH PLAZA, OMAHA, NE, 68144",
    distance: 18,
    formats: [
      { type: "2D", times: ["9:30PM", "9:45PM"] },
      { type: "SCREENX", times: ["10:30PM"] }
    ]
  },
  {
    name: "MARCUS MAJESTIC CINEMA OF OMAHA",
    chain: "MARCUS",
    address: "16021 MAPLE SQUARE, OMAHA, NE, 68116",
    distance: 18,
    formats: [
      { type: "2D", times: ["9:10PM", "10:30PM"] }
    ]
  },
  {
    name: "MARCUS VILLAGE POINTE CINEMA",
    chain: "MARCUS",
    address: "301 N. 171ST STREET, OMAHA, NE, 68118",
    distance: 21,
    formats: [
      { type: "2D", times: ["9:30PM", "10:30PM"] }
    ]
  },
  {
    name: "ACX CINEMA 12+",
    chain: "ACX",
    address: "2800 SOUTH 125TH PLAZA, OMAHA, NE, 68005",
    distance: 25,
    formats: [
      { type: "2D", times: ["9:30PM", "10:20PM"] },
      { type: "DOLBY", times: ["10:00PM"] }
    ]
  },
  {
    name: "FREMONT THEATERS",
    chain: "FREMONT",
    address: "449 NORTH 2700 STREET, FREMONT, NE, 68025",
    distance: 43,
    formats: [
      { type: "2D", times: ["9:40PM"] }
    ]
  }
];

// Movie Booking Page Component (Dynamic)
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
        
        setTheaters(response.data.theaters || []);
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
    <div className="App" style={{ 
      backgroundColor: movieConfig?.background_color || '#000000',
      color: movieConfig?.text_color || '#ffffff'
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

// Admin Route Component
const AdminRoute = () => {
  const [movieConfig, setMovieConfig] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Initialize presets first
      await axios.post(`${API_BASE}/initialize-presets`);
      
      // Check if we have a demo client, if not create one
      let demoClient = null;
      try {
        const clientsResponse = await axios.get(`${API_BASE}/clients/`);
        demoClient = clientsResponse.data.find(c => c.email === 'demo@movie-saas.com');
      } catch (error) {
        console.log('No existing clients found');
      }

      if (!demoClient) {
        const clientResponse = await axios.post(`${API_BASE}/clients/`, {
          name: 'Demo Client',
          email: 'demo@movie-saas.com',
          company: 'Movie SaaS Demo',
          subscription_tier: 'premium'
        });
        demoClient = clientResponse.data;
      }

      setClient(demoClient);

      // Check if we have a demo movie config
      const moviesResponse = await axios.get(`${API_BASE}/movies/?client_id=${demoClient.id}`);
      let demoMovie = moviesResponse.data[0];

      if (!demoMovie) {
        // Create demo movie configuration
        const movieResponse = await axios.post(`${API_BASE}/movies/`, {
          client_id: demoClient.id,
          movie_title: 'F1',
          movie_subtitle: 'THE MOVIE',
          description: 'From the director of Top Gun: Maverick comes an adrenaline-fueled experience starring Brad Pitt. Witness the high-octane world of Formula 1 racing like never before.',
          release_date: new Date('2025-06-27').toISOString(),
          director: 'Joseph Kosinski',
          cast: ['Brad Pitt', 'Damson Idris', 'Kerry Condon', 'Javier Bardem'],
          rating: 'PG-13',
          runtime: '150 min',
          genre: ['Action', 'Drama', 'Sports']
        });
        demoMovie = movieResponse.data;
      }

      setMovieConfig(demoMovie);
    } catch (error) {
      console.error('Initialization failed:', error);
      // Set default config if API fails
      setMovieConfig({
        id: 'demo',
        client_id: 'demo',
        movie_title: 'F1',
        movie_subtitle: 'THE MOVIE',
        description: 'From the director of Top Gun: Maverick comes an adrenaline-fueled experience starring Brad Pitt.',
        primary_gradient: { type: 'linear', direction: '135deg', colors: ['#ef4444', '#dc2626'], stops: [0, 100] },
        secondary_gradient: { type: 'linear', direction: '135deg', colors: ['#f97316', '#ea580c'], stops: [0, 100] },
        background_color: '#000000',
        text_color: '#ffffff',
        accent_color: '#ef4444',
        primary_button: { background_color: '#ef4444', text_color: '#ffffff', border_radius: 8, emoji: '🎬', emoji_position: 'left' },
        secondary_button: { background_color: '#374151', text_color: '#ffffff', border_radius: 8, emoji: '🎫', emoji_position: 'left' }
      });
      setClient({ id: 'demo', name: 'Demo Client' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (updatedConfig) => {
    try {
      if (updatedConfig.id && updatedConfig.id !== 'demo') {
        await axios.put(`${API_BASE}/movies/${updatedConfig.id}`, updatedConfig);
      }
      setMovieConfig(updatedConfig);
    } catch (error) {
      console.error('Failed to update config:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      movieConfig={movieConfig}
      onUpdateConfig={handleUpdateConfig}
      clientId={client?.id}
    />
  );
};

// Main App Component
function App() {
  const [movieConfig, setMovieConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For the public view, we'll use the demo movie config
    fetchPublicConfig();
  }, []);

  const fetchPublicConfig = async () => {
    try {
      // Try to get the first available movie config
      const response = await axios.get(`${API_BASE}/movies/?limit=1`);
      if (response.data && response.data.length > 0) {
        setMovieConfig(response.data[0]);
      } else {
        // Use default config if no movies found
        setMovieConfig({
          movie_title: 'F1',
          movie_subtitle: 'THE MOVIE',
          description: 'From the director of Top Gun: Maverick comes an adrenaline-fueled experience starring Brad Pitt.',
          primary_gradient: { type: 'linear', direction: '135deg', colors: ['#ef4444', '#dc2626'], stops: [0, 100] },
          secondary_gradient: { type: 'linear', direction: '135deg', colors: ['#f97316', '#ea580c'], stops: [0, 100] },
          background_color: '#000000',
          text_color: '#ffffff',
          accent_color: '#ef4444',
          primary_button: { background_color: '#ef4444', text_color: '#ffffff', border_radius: 8, emoji: '🎬', emoji_position: 'left' },
          secondary_button: { background_color: '#374151', text_color: '#ffffff', border_radius: 8, emoji: '🎫', emoji_position: 'left' }
        });
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
      // Use default config
      setMovieConfig({
        movie_title: 'F1',
        movie_subtitle: 'THE MOVIE',
        description: 'From the director of Top Gun: Maverick comes an adrenaline-fueled experience starring Brad Pitt.',
        primary_gradient: { type: 'linear', direction: '135deg', colors: ['#ef4444', '#dc2626'], stops: [0, 100] },
        secondary_gradient: { type: 'linear', direction: '135deg', colors: ['#f97316', '#ea580c'], stops: [0, 100] },
        background_color: '#000000',
        text_color: '#ffffff',
        accent_color: '#ef4444',
        primary_button: { background_color: '#ef4444', text_color: '#ffffff', border_radius: 8, emoji: '🎬', emoji_position: 'left' },
        secondary_button: { background_color: '#374151', text_color: '#ffffff', border_radius: 8, emoji: '🎫', emoji_position: 'left' }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading movie experience...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={<MovieBookingPage movieConfig={movieConfig} />} 
        />
        <Route 
          path="/admin" 
          element={<AdminRoute />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;