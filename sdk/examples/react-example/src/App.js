import React from 'react';
import { MovieBookingWidget, TheaterListings } from '@your-platform/movie-booking-sdk';
import './App.css';

// Example data showcasing enhanced features
const exampleTheaters = [
  {
    id: '1',
    name: 'AMC Empire 25',
    chain: 'AMC',
    address: '234 W 42nd St, New York, NY 10036',
    city: 'New York',
    state: 'NY',
    zip_code: '10036',
    distance: 0.5,
    formats: [
      {
        category_id: 'imax-id',
        category_name: 'IMAX',
        times: [
          { time: '10:00 AM', category: 'morning', available_seats: 120, price_modifier: 1.5 },
          { time: '1:30 PM', category: 'afternoon', available_seats: 85, price_modifier: 1.5 },
          { time: '7:15 PM', category: 'evening', available_seats: 200, price_modifier: 1.5 },
          { time: '10:45 PM', category: 'late_night', available_seats: 150, price_modifier: 1.2 }
        ],
        price: 18.99,
        special_notes: 'Premium large format experience'
      },
      {
        category_id: 'live-qa-id',
        category_name: 'Live Q&A',
        times: [
          { time: '7:00 PM', category: 'evening', available_seats: 300, price_modifier: 2.0 }
        ],
        price: 25.99,
        special_notes: 'Special screening with cast Q&A session'
      }
    ],
    showtimes: ['10:00 AM', '1:30 PM', '7:15 PM', '10:45 PM']
  },
  {
    id: '2',
    name: 'Regal Union Square',
    chain: 'Regal',
    address: '850 Broadway, New York, NY 10003',
    city: 'New York',
    state: 'NY',
    zip_code: '10003',
    distance: 1.2,
    formats: [
      {
        category_id: '2d-id',
        category_name: '2D',
        times: [
          { time: '11:00 AM', category: 'morning', available_seats: 150 },
          { time: '2:00 PM', category: 'afternoon', available_seats: 120 },
          { time: '5:30 PM', category: 'evening', available_seats: 180 },
          { time: '8:45 PM', category: 'evening', available_seats: 160 },
          { time: '11:30 PM', category: 'late_night', available_seats: 90 }
        ],
        price: 12.99
      },
      {
        category_id: 'dolby-id',
        category_name: 'DOLBY ATMOS',
        times: [
          { time: '3:15 PM', category: 'afternoon', available_seats: 100, price_modifier: 1.3 },
          { time: '6:30 PM', category: 'evening', available_seats: 140, price_modifier: 1.3 }
        ],
        price: 16.99
      },
      {
        category_id: 'live-activations-id',
        category_name: 'Live Activations',
        times: [
          { time: '6:00 PM', category: 'evening', available_seats: 200, price_modifier: 1.8 }
        ],
        price: 22.99,
        special_notes: 'Interactive experience with live activations'
      }
    ],
    showtimes: ['11:00 AM', '2:00 PM', '5:30 PM', '8:45 PM', '11:30 PM']
  }
];

function App() {
  const [selectedFormats, setSelectedFormats] = React.useState([]);
  const [selectedTimeCategories, setSelectedTimeCategories] = React.useState([]);

  const handleBookingComplete = (booking) => {
    console.log('Booking completed:', booking);
    alert('Booking completed successfully!');
  };

  const handleError = (error) => {
    console.error('Widget error:', error);
    alert('An error occurred. Please try again.');
  };

  const handleTheaterSelect = (theater) => {
    console.log('Selected theater:', theater);
    alert(`Selected: ${theater.name}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Movie Booking SDK Demo</h1>
        <p>Experience the power of customizable movie ticket booking with enhanced search & categories</p>
      </header>

      <main className="App-main">
        {/* Enhanced Theater Listings Demo */}
        <section className="demo-section">
          <h2>🎬 Enhanced Theater Listings with Dynamic Categories</h2>
          <p>New features: Dynamic screening categories, time-based filtering, mobile optimization</p>
          <div style={{ backgroundColor: '#000', padding: '20px', borderRadius: '12px' }}>
            <TheaterListings
              theaters={exampleTheaters}
              selectedFormats={selectedFormats}
              selectedTimeCategories={selectedTimeCategories}
              onTheaterSelect={handleTheaterSelect}
              onFormatFilter={setSelectedFormats}
              onTimeCategoryFilter={setSelectedTimeCategories}
              theme={{
                background_color: '#000000',
                text_color: '#ffffff',
                accent_color: '#ef4444',
                surface: '#1a1a1a'
              }}
              mobileOptimized={true}
              availableScreeningCategories={[
                { id: 'imax-id', name: 'IMAX', type: 'format', description: 'Large format premium experience', is_active: true, created_at: '2025-06-30T20:22:07.621Z' },
                { id: '2d-id', name: '2D', type: 'format', description: 'Standard digital projection', is_active: true, created_at: '2025-06-30T20:22:07.677Z' },
                { id: 'dolby-id', name: 'DOLBY ATMOS', type: 'format', description: 'Enhanced audio experience', is_active: true, created_at: '2025-06-30T20:22:07.675Z' },
                { id: 'live-qa-id', name: 'Live Q&A', type: 'special_event', description: 'Post-screening Q&A with cast/crew', is_active: true, created_at: '2025-06-30T20:22:07.679Z' },
                { id: 'live-activations-id', name: 'Live Activations', type: 'special_event', description: 'Interactive experiences and activations', is_active: true, created_at: '2025-06-30T20:22:07.679Z' }
              ]}
            />
          </div>
        </section>

        {/* Basic Usage */}
        <section className="demo-section">
          <h2>Basic Widget</h2>
          <MovieBookingWidget
            movieId="f1-movie-2025"
            apiKey="demo-api-key"
            onBookingComplete={handleBookingComplete}
            onError={handleError}
            mobileOptimized={true}
          />
        </section>

        {/* Action Theme */}
        <section className="demo-section">
          <h2>Action Hero Theme</h2>
          <MovieBookingWidget
            movieId="action-movie-demo"
            apiKey="demo-api-key"
            theme="action-hero"
            onBookingComplete={handleBookingComplete}
            onError={handleError}
            mobileOptimized={true}
          />
        </section>

        {/* Horror Theme */}
        <section className="demo-section">
          <h2>Horror Dark Theme</h2>
          <MovieBookingWidget
            movieId="horror-movie-demo"
            apiKey="demo-api-key"
            theme="horror-dark"
            onBookingComplete={handleBookingComplete}
            onError={handleError}
            mobileOptimized={true}
          />
        </section>

        {/* Custom Theme */}
        <section className="demo-section">
          <h2>Custom Theme</h2>
          <MovieBookingWidget
            movieId="custom-movie-demo"
            apiKey="demo-api-key"
            theme={{
              colors: {
                primary: '#8b5cf6',
                secondary: '#a855f7',
                background: '#1e1b4b',
                text: '#e0e7ff',
                accent: '#8b5cf6'
              },
              gradients: {
                primary: {
                  type: 'linear',
                  direction: '135deg',
                  colors: ['#8b5cf6', '#7c3aed'],
                  stops: [0, 100]
                }
              }
            }}
            onBookingComplete={handleBookingComplete}
            onError={handleError}
            mobileOptimized={true}
          />
        </section>
      </main>

      <footer className="App-footer">
        <p>Powered by Movie Booking SDK - Enhanced with Dynamic Categories & Time Filtering</p>
        <div className="links">
          <a href="https://github.com/your-platform/movie-booking-sdk" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://docs.your-platform.com" target="_blank" rel="noopener noreferrer">
            Documentation
          </a>
          <a href="https://npmjs.com/package/@your-platform/movie-booking-sdk" target="_blank" rel="noopener noreferrer">
            NPM
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;