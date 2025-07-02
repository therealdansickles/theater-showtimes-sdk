import React from 'react';

const GroupSalesPage = ({ movieConfig }) => {
  const accentColor = movieConfig?.accent_color || '#ef4444';
  const textColor = movieConfig?.text_color || '#ffffff';
  const backgroundColor = movieConfig?.background_color || '#000000';

  const handleContactClick = () => {
    const subject = encodeURIComponent(`Group Sales Inquiry - ${movieConfig?.movie_title || 'Film'}`);
    const body = encodeURIComponent(`Hi,

I'm interested in group sales for ${movieConfig?.movie_title || 'your film'}. Please provide information about:

- Group pricing and minimum requirements
- Available showtimes and theater locations
- Booking process and payment options
- Any special group benefits or packages

Thank you!`);
    
    window.open(`mailto:groupsales@litebeem.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12" style={{ backgroundColor }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Hero Block */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: textColor }}>
            Experience It
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold mb-8" style={{ color: accentColor }}>
            With Your Crew
          </h2>
          
          <p className="text-xl md:text-2xl leading-relaxed mb-8 max-w-3xl mx-auto" style={{ color: textColor, opacity: 0.9 }}>
            Bring your friends, family, colleagues, or organization for an unforgettable 
            cinematic experience with special group pricing and exclusive benefits.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-6">
            <div className="text-4xl mb-4">🎟️</div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: accentColor }}>
              Special Pricing
            </h3>
            <p style={{ color: textColor, opacity: 0.8 }}>
              Discounted rates for groups of 15 or more
            </p>
          </div>
          
          <div className="p-6">
            <div className="text-4xl mb-4">🍿</div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: accentColor }}>
              Premium Experience
            </h3>
            <p style={{ color: textColor, opacity: 0.8 }}>
              Reserved seating and concession packages available
            </p>
          </div>
          
          <div className="p-6">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: accentColor }}>
              Flexible Scheduling
            </h3>
            <p style={{ color: textColor, opacity: 0.8 }}>
              Special showtimes and private screening options
            </p>
          </div>
        </div>

        {/* Group Types */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-8" style={{ color: textColor }}>
            Perfect For
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🏢', label: 'Corporate Events' },
              { icon: '🎓', label: 'Schools & Universities' },
              { icon: '👨‍👩‍👧‍👦', label: 'Family Reunions' },
              { icon: '🎉', label: 'Birthday Parties' },
              { icon: '⛪', label: 'Religious Groups' },
              { icon: '🏃', label: 'Sports Teams' },
              { icon: '🎭', label: 'Community Groups' },
              { icon: '👥', label: 'Friend Groups' }
            ].map((item, index) => (
              <div key={index} className="text-center p-4">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-sm font-medium" style={{ color: textColor }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call-to-Action */}
        <div className="bg-white bg-opacity-5 rounded-2xl p-8 md:p-12 border border-white border-opacity-10">
          <h3 className="text-3xl font-bold mb-6" style={{ color: textColor }}>
            Ready to Book Your Group?
          </h3>
          
          <p className="text-lg mb-8 opacity-80" style={{ color: textColor }}>
            Contact our group sales team for personalized pricing and assistance with your booking.
          </p>
          
          <button
            onClick={handleContactClick}
            className="inline-flex items-center px-8 py-4 text-xl font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50"
            style={{ 
              backgroundColor: accentColor,
              color: 'white',
              boxShadow: `0 10px 25px rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.3)`
            }}
          >
            <span className="mr-3">📧</span>
            Contact Group Sales
          </button>
          
          <div className="mt-6 text-sm opacity-60" style={{ color: textColor }}>
            <p>Or call us at: <span className="font-medium">(555) 123-FILM</span></p>
            <p className="mt-1">Email: <span className="font-medium">groupsales@litebeem.com</span></p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm opacity-60" style={{ color: textColor }}>
            Group rates apply to parties of 15 or more. Advance booking required. 
            Terms and conditions apply. Contact us for complete details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupSalesPage;