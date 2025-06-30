import React from 'react';
import { MovieBookingWidget } from '@your-platform/movie-booking-sdk';
import './App.css';

function App() {
  const handleBookingComplete = (booking) => {
    console.log('Booking completed:', booking);
    alert('Booking completed successfully!');
  };

  const handleError = (error) => {
    console.error('Widget error:', error);
    alert('An error occurred. Please try again.');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Movie Booking SDK Demo</h1>
        <p>Experience the power of customizable movie ticket booking</p>
      </header>

      <main className="App-main">
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
        <p>Powered by Movie Booking SDK</p>
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