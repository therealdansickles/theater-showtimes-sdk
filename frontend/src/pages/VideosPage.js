import React, { useState } from 'react';

const VideosPage = ({ movieConfig }) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  
  // Combine trailer and gallery videos
  const videos = [];
  if (movieConfig?.film_assets?.trailer_url) {
    videos.push({
      url: movieConfig.film_assets.trailer_url,
      title: 'Official Trailer',
      type: 'trailer'
    });
  }
  
  if (movieConfig?.film_assets?.video_gallery) {
    videos.push(...movieConfig.film_assets.video_gallery.map((url, index) => ({
      url,
      title: `Video ${index + 2}`,
      type: 'gallery'
    })));
  }

  const accentColor = movieConfig?.accent_color || '#ef4444';
  const textColor = movieConfig?.text_color || '#ffffff';
  const backgroundColor = movieConfig?.background_color || '#000000';

  if (videos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            No Videos Available
          </h2>
          <p style={{ color: textColor, opacity: 0.7 }}>
            Videos will appear here once they are uploaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: textColor }}>
            <span style={{ color: accentColor }}>{movieConfig?.movie_title || 'Videos'}</span>
          </h1>
          <p className="text-lg opacity-80" style={{ color: textColor }}>
            Watch trailers, behind-the-scenes content, and exclusive footage
          </p>
        </div>

        {/* Main Video Player */}
        <div className="mb-8">
          <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <video
              key={videos[currentVideo]?.url}
              className="w-full h-full object-cover"
              controls
              poster={movieConfig?.film_assets?.poster_image ? 
                process.env.REACT_APP_BACKEND_URL + movieConfig.film_assets.poster_image : 
                undefined
              }
              preload="metadata"
            >
              <source 
                src={process.env.REACT_APP_BACKEND_URL + videos[currentVideo]?.url} 
                type="video/mp4" 
              />
              <p style={{ color: textColor }}>
                Your browser does not support the video element. 
                <a href={process.env.REACT_APP_BACKEND_URL + videos[currentVideo]?.url} style={{ color: accentColor }}>
                  Download the video
                </a>
              </p>
            </video>
          </div>
          
          {/* Current Video Title */}
          <div className="mt-4">
            <h3 className="text-xl font-semibold" style={{ color: textColor }}>
              {videos[currentVideo]?.title}
            </h3>
          </div>
        </div>

        {/* Video Thumbnails */}
        {videos.length > 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
              More Videos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map((video, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVideo(index)}
                  className={`relative aspect-video rounded-lg overflow-hidden transition-all duration-200 ${
                    currentVideo === index 
                      ? 'ring-2 scale-105' 
                      : 'hover:scale-105 hover:ring-1'
                  }`}
                  style={{ 
                    ringColor: accentColor,
                    backgroundColor: 'rgba(0,0,0,0.3)'
                  }}
                >
                  {/* Thumbnail placeholder or video preview */}
                  <div 
                    className="w-full h-full bg-gray-800 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                  >
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                        style={{ backgroundColor: accentColor }}
                      >
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-xs font-medium" style={{ color: textColor }}>
                        {video.title}
                      </p>
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {currentVideo === index && (
                    <div 
                      className="absolute inset-0 border-2 rounded-lg"
                      style={{ borderColor: accentColor }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosPage;