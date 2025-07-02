import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

// Enhanced Film Page Component
export const FilmPage = ({ movieId }) => {
  const [movieConfig, setMovieConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE}/movies/${movieId}`);
        setMovieConfig(response.data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading film details...</p>
        </div>
      </div>
    );
  }

  if (!movieConfig) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Film Not Found</h2>
          <p className="text-gray-400">The requested film could not be found.</p>
        </div>
      </div>
    );
  }

  const { film_details, social_links, film_assets } = movieConfig;

  return (
    <div className="min-h-screen text-white" 
         style={{ backgroundColor: movieConfig.background_color || '#000000' }}>
      
      {/* Hero Section with Backdrop */}
      <FilmHeroSection movieConfig={movieConfig} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            
            {/* Navigation Tabs */}
            <div className="flex space-x-6 mb-8 border-b border-gray-700">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'gallery', name: 'Gallery' },
                { id: 'showtimes', name: 'Showtimes' },
                { id: 'cast', name: 'Cast & Crew' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{
                    borderBottomColor: activeTab === tab.id ? movieConfig.accent_color : 'transparent'
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <FilmOverview movieConfig={movieConfig} />
            )}
            {activeTab === 'gallery' && (
              <FilmGallery assets={film_assets} />
            )}
            {activeTab === 'showtimes' && (
              <FilmShowtimes movieConfig={movieConfig} />
            )}
            {activeTab === 'cast' && (
              <FilmCastCrew movieConfig={movieConfig} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Movie Poster */}
            <FilmPoster movieConfig={movieConfig} />
            
            {/* Social Links */}
            <SocialLinksWidget social_links={social_links} movieConfig={movieConfig} />
            
            {/* Movie Info */}
            <FilmInfoWidget movieConfig={movieConfig} />
            
            {/* Ticket Purchase CTA */}
            <TicketPurchaseCTA movieConfig={movieConfig} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Film Hero Section with Backdrop
const FilmHeroSection = ({ movieConfig }) => {
  const { film_assets, film_details } = movieConfig;
  
  return (
    <div className="relative h-96 lg:h-[500px] overflow-hidden">
      {/* Backdrop Image */}
      {film_assets?.backdrop_image && (
        <img
          src={film_assets.backdrop_image}
          alt={`${movieConfig.movie_title} backdrop`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${movieConfig.background_color}, transparent 50%, ${movieConfig.background_color}20)`
        }}
      />
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4" style={{ color: movieConfig.text_color }}>
              {movieConfig.movie_title}
              {movieConfig.movie_subtitle && (
                <span className="block text-2xl lg:text-3xl font-normal mt-2 opacity-80">
                  {movieConfig.movie_subtitle}
                </span>
              )}
            </h1>
            
            {film_details?.logline && (
              <p className="text-lg lg:text-xl opacity-90 mb-6">
                {film_details.logline}
              </p>
            )}
            
            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 text-sm opacity-75">
              <span>{movieConfig.rating}</span>
              <span>•</span>
              <span>{movieConfig.runtime}</span>
              <span>•</span>
              <span>{movieConfig.genre.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Film Overview Tab
const FilmOverview = ({ movieConfig }) => {
  const { film_details } = movieConfig;
  
  return (
    <div className="space-y-6">
      {/* Synopsis */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Synopsis</h3>
        <p className="text-gray-300 leading-relaxed text-lg">
          {film_details?.synopsis || movieConfig.description}
        </p>
      </div>
      
      {/* Production Notes */}
      {film_details?.production_notes && (
        <div>
          <h3 className="text-2xl font-bold mb-4">Production Notes</h3>
          <p className="text-gray-300 leading-relaxed">
            {film_details.production_notes}
          </p>
        </div>
      )}
      
      {/* Festival Selections */}
      {film_details?.festival_selections?.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4">Festival Selections & Awards</h3>
          <div className="flex flex-wrap gap-2">
            {film_details.festival_selections.map((festival, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                style={{ borderColor: movieConfig.accent_color }}
              >
                🏆 {festival}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Content Warnings */}
      {film_details?.content_warnings?.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4">Content Advisory</h3>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
              {film_details.content_warnings.map((warning, index) => (
                <span key={index} className="text-yellow-200 text-sm">
                  ⚠️ {warning}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Film Gallery Tab
const FilmGallery = ({ assets }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!assets?.gallery_images?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No gallery images available</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div className="relative">
        <img
          src={assets.gallery_images[selectedImage]}
          alt={`Gallery image ${selectedImage + 1}`}
          className="w-full h-80 object-cover rounded-lg"
        />
      </div>
      
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {assets.gallery_images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative h-20 rounded overflow-hidden ${
              selectedImage === index ? 'ring-2 ring-red-500' : ''
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// Social Links Widget
const SocialLinksWidget = ({ social_links, movieConfig }) => {
  if (!social_links || Object.values(social_links).every(link => !link)) {
    return null;
  }
  
  const socialPlatforms = [
    { key: 'instagram', icon: '📷', label: 'Instagram' },
    { key: 'twitter', icon: '🐦', label: 'Twitter' },
    { key: 'tiktok', icon: '🎵', label: 'TikTok' },
    { key: 'facebook', icon: '👥', label: 'Facebook' },
    { key: 'youtube', icon: '📺', label: 'YouTube' },
    { key: 'website', icon: '🌐', label: 'Website' }
  ];
  
  return (
    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4">Follow the Film</h3>
      <div className="space-y-3">
        {socialPlatforms.map(platform => {
          const url = social_links[platform.key];
          if (!url) return null;
          
          return (
            <a
              key={platform.key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-2 rounded hover:bg-gray-800 transition-colors"
              style={{ ':hover': { backgroundColor: movieConfig.accent_color + '20' } }}
            >
              <span className="text-xl">{platform.icon}</span>
              <span>{platform.label}</span>
              <span className="ml-auto text-gray-400">↗</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

// Film Poster Component
const FilmPoster = ({ movieConfig }) => {
  const posterSrc = movieConfig.film_assets?.poster_image || movieConfig.poster_image;
  
  if (!posterSrc) {
    return (
      <div className="aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No poster available</span>
      </div>
    );
  }
  
  return (
    <div className="sticky top-6">
      <img
        src={posterSrc}
        alt={`${movieConfig.movie_title} poster`}
        className="w-full aspect-[2/3] object-cover rounded-lg shadow-2xl"
      />
    </div>
  );
};

// Film Info Widget
const FilmInfoWidget = ({ movieConfig }) => {
  const { film_details } = movieConfig;
  
  return (
    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4">Film Information</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Director</span>
          <span>{movieConfig.director}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Rating</span>
          <span>{movieConfig.rating}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Runtime</span>
          <span>{movieConfig.runtime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Genre</span>
          <span>{movieConfig.genre.join(', ')}</span>
        </div>
        {film_details?.languages?.length > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Languages</span>
            <span>{film_details.languages.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Ticket Purchase CTA
const TicketPurchaseCTA = ({ movieConfig }) => {
  return (
    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4">Get Tickets</h3>
      <button
        className="w-full py-3 px-4 rounded-lg font-semibold transition-colors"
        style={{
          backgroundColor: movieConfig.accent_color,
          color: movieConfig.primary_button?.text_color || '#ffffff'
        }}
        onClick={() => {
          // Scroll to showtimes section
          document.querySelector('[data-tab="showtimes"]')?.click();
        }}
      >
        🎫 View Showtimes
      </button>
      
      <div className="mt-3 text-center text-sm text-gray-400">
        Starting at ${movieConfig.base_ticket_price || '15.00'}
      </div>
    </div>
  );
};

// Film Showtimes Tab  
const FilmShowtimes = ({ movieConfig }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Showtimes & Tickets</h3>
      {/* This would integrate with the existing TheaterListings component */}
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-300 mb-4">
          Book your tickets now for {movieConfig.movie_title}
        </p>
        <p className="text-sm text-gray-400">
          Select your preferred theater and showtime below
        </p>
      </div>
    </div>
  );
};

// Cast & Crew Tab
const FilmCastCrew = ({ movieConfig }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-4">Director</h3>
        <p className="text-lg">{movieConfig.director}</p>
      </div>
      
      {movieConfig.cast?.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4">Cast</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {movieConfig.cast.map((actor, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-2"></div>
                <p className="font-medium">{actor}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilmPage;