import React, { useState } from 'react';

const SynopsisPage = ({ movieConfig }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  
  const accentColor = movieConfig?.accent_color || '#ef4444';
  const textColor = movieConfig?.text_color || '#ffffff';
  const backgroundColor = movieConfig?.background_color || '#000000';

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor }}>
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: textColor }}>
            <span style={{ color: accentColor }}>{movieConfig?.movie_title || 'Synopsis'}</span>
          </h1>
          {movieConfig?.movie_subtitle && (
            <h2 className="text-2xl font-normal opacity-80 mb-6" style={{ color: textColor }}>
              {movieConfig.movie_subtitle}
            </h2>
          )}
          {movieConfig?.film_details?.logline && (
            <p className="text-xl italic opacity-90 max-w-3xl mx-auto" style={{ color: textColor }}>
              "{movieConfig.film_details.logline}"
            </p>
          )}
        </div>

        {/* Main Synopsis */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6" style={{ color: accentColor }}>
            Story
          </h3>
          <div className="prose prose-lg max-w-none">
            <p 
              className="text-lg leading-relaxed whitespace-pre-line"
              style={{ color: textColor, opacity: 0.9 }}
            >
              {movieConfig?.film_details?.synopsis || 
               movieConfig?.description || 
               'Synopsis will be available soon.'}
            </p>
          </div>
        </div>

        {/* Festival Selections */}
        {movieConfig?.film_details?.festival_selections?.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: accentColor }}>
              Festival Selections & Awards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movieConfig.film_details.festival_selections.map((festival, index) => (
                <div 
                  key={index}
                  className="bg-white bg-opacity-10 rounded-lg p-4 border border-opacity-20"
                  style={{ borderColor: accentColor }}
                >
                  <p className="font-medium" style={{ color: textColor }}>
                    🏆 {festival}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Warnings */}
        {movieConfig?.film_details?.content_warnings?.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: accentColor }}>
              Content Advisory
            </h3>
            <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <span className="text-yellow-400 text-xl">⚠️</span>
                <div>
                  <h4 className="font-medium text-yellow-200 mb-2">Content Warnings</h4>
                  <ul className="space-y-1">
                    {movieConfig.film_details.content_warnings.map((warning, index) => (
                      <li key={index} className="text-yellow-300">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Film Details */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6" style={{ color: accentColor }}>
            Film Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2" style={{ color: textColor }}>Director</h4>
              <p className="opacity-80" style={{ color: textColor }}>
                {movieConfig?.director || 'TBA'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: textColor }}>Rating</h4>
              <p className="opacity-80" style={{ color: textColor }}>
                {movieConfig?.rating || 'Not Rated'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: textColor }}>Runtime</h4>
              <p className="opacity-80" style={{ color: textColor }}>
                {movieConfig?.runtime || 'TBA'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: textColor }}>Genre</h4>
              <p className="opacity-80" style={{ color: textColor }}>
                {movieConfig?.genre?.join(', ') || 'TBA'}
              </p>
            </div>
          </div>
        </div>

        {/* Cast & Crew - Expandable Section */}
        {movieConfig?.cast?.length > 0 && (
          <div className="mb-12">
            <button
              onClick={() => toggleSection('cast')}
              className="flex items-center justify-between w-full text-left p-4 rounded-lg transition-colors bg-white bg-opacity-5 hover:bg-opacity-10"
            >
              <h3 className="text-2xl font-semibold" style={{ color: accentColor }}>
                Cast & Crew
              </h3>
              <span 
                className={`transform transition-transform ${expandedSection === 'cast' ? 'rotate-180' : ''}`}
                style={{ color: accentColor }}
              >
                ▼
              </span>
            </button>
            
            {expandedSection === 'cast' && (
              <div className="mt-6 p-6 bg-white bg-opacity-5 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {movieConfig.cast.map((actor, index) => (
                    <div key={index} className="text-center">
                      <p className="font-medium" style={{ color: textColor }}>
                        {actor}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Production Notes - Expandable Section */}
        {movieConfig?.film_details?.production_notes && (
          <div className="mb-12">
            <button
              onClick={() => toggleSection('production')}
              className="flex items-center justify-between w-full text-left p-4 rounded-lg transition-colors bg-white bg-opacity-5 hover:bg-opacity-10"
            >
              <h3 className="text-2xl font-semibold" style={{ color: accentColor }}>
                Production Notes
              </h3>
              <span 
                className={`transform transition-transform ${expandedSection === 'production' ? 'rotate-180' : ''}`}
                style={{ color: accentColor }}
              >
                ▼
              </span>
            </button>
            
            {expandedSection === 'production' && (
              <div className="mt-6 p-6 bg-white bg-opacity-5 rounded-lg">
                <p 
                  className="leading-relaxed whitespace-pre-line"
                  style={{ color: textColor, opacity: 0.9 }}
                >
                  {movieConfig.film_details.production_notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Languages & Subtitles */}
        {(movieConfig?.film_details?.languages?.length > 0 || movieConfig?.film_details?.subtitles?.length > 0) && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: accentColor }}>
              Languages & Accessibility
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {movieConfig.film_details.languages?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2" style={{ color: textColor }}>Spoken Languages</h4>
                  <p className="opacity-80" style={{ color: textColor }}>
                    {movieConfig.film_details.languages.join(', ')}
                  </p>
                </div>
              )}
              {movieConfig.film_details.subtitles?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2" style={{ color: textColor }}>Available Subtitles</h4>
                  <p className="opacity-80" style={{ color: textColor }}>
                    {movieConfig.film_details.subtitles.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SynopsisPage;