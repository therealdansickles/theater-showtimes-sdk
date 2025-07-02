import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

// Film Setup Wizard - Like a film festival entry form
export const FilmSetupWizard = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [filmData, setFilmData] = useState({
    // Basic Info
    movie_title: '',
    movie_subtitle: '',
    director: '',
    release_date: '',
    rating: 'PG-13',
    runtime: '',
    genre: [],
    
    // Film Details
    film_details: {
      logline: '',
      synopsis: '',
      production_notes: '',
      festival_selections: [],
      content_warnings: [],
      languages: ['English'],
      subtitles: []
    },
    
    // Assets
    film_assets: {
      poster_image: null,
      backdrop_image: null,
      trailer_url: '',
      gallery_images: [],
      press_kit_url: '',
      badge_images: []
    },
    
    // Social Links
    social_links: {
      instagram: '',
      twitter: '',
      tiktok: '',
      facebook: '',
      youtube: '',
      website: ''
    },
    
    // Pricing
    base_ticket_price: 15.00,
    format_pricing: {
      'IMAX': 5.00,
      '4DX': 8.00,
      'DOLBY': 3.00,
      'VIP': 10.00
    }
  });
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');
  const { token } = useAuth();

  const steps = [
    { id: 1, title: 'Basic Information', icon: '📝' },
    { id: 2, title: 'Story & Details', icon: '📖' },
    { id: 3, title: 'Visual Assets', icon: '🎨' },
    { id: 4, title: 'Social & Marketing', icon: '📢' },
    { id: 5, title: 'Pricing & Showtimes', icon: '🎫' },
    { id: 6, title: 'Review & Publish', icon: '🚀' }
  ];

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!filmData.movie_title.trim()) newErrors.movie_title = 'Title is required';
        if (!filmData.director.trim()) newErrors.director = 'Director is required';
        if (!filmData.release_date) newErrors.release_date = 'Release date is required';
        if (!filmData.runtime.trim()) newErrors.runtime = 'Runtime is required';
        break;
      
      case 2:
        if (!filmData.film_details.synopsis.trim()) newErrors.synopsis = 'Synopsis is required';
        if (!filmData.film_details.logline.trim()) newErrors.logline = 'Logline is recommended';
        break;
      
      case 3:
        if (!filmData.film_assets.poster_image) newErrors.poster_image = 'Poster image is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFilmData = (path, value) => {
    setFilmData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleImageUpload = async (field, file) => {
    if (!file) return;
    
    // Validate image
    if (!file.type.startsWith('image/')) {
      setErrors({ [field]: 'Please select a valid image file' });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrors({ [field]: 'Image size must be less than 10MB' });
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', field);
    
    try {
      const response = await axios.post(`${API_BASE}/uploads/image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      updateFilmData(`film_assets.${field}`, response.data.url);
      setErrors({ ...errors, [field]: null });
    } catch (error) {
      setErrors({ ...errors, [field]: 'Upload failed. Please try again.' });
    }
  };

  const saveFilm = async () => {
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE}/movies/`, filmData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const movieId = response.data.id;
      setPreviewUrl(`/film/${movieId}`);
      
      if (onComplete) {
        onComplete(response.data);
      }
    } catch (error) {
      console.error('Failed to save film:', error);
      setErrors({ general: 'Failed to save film. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🎬 Film Setup Wizard</h1>
          <p className="text-gray-300">Create your film's landing page in minutes</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id <= currentStep ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 ${
                    step.id <= currentStep
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                <span className="text-sm text-center">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gray-700 h-2 rounded-full">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          {currentStep === 1 && (
            <BasicInformationStep
              filmData={filmData}
              updateFilmData={updateFilmData}
              errors={errors}
            />
          )}
          
          {currentStep === 2 && (
            <StoryDetailsStep
              filmData={filmData}
              updateFilmData={updateFilmData}
              errors={errors}
            />
          )}
          
          {currentStep === 3 && (
            <VisualAssetsStep
              filmData={filmData}
              updateFilmData={updateFilmData}
              errors={errors}
              onImageUpload={handleImageUpload}
            />
          )}
          
          {currentStep === 4 && (
            <SocialMarketingStep
              filmData={filmData}
              updateFilmData={updateFilmData}
              errors={errors}
            />
          )}
          
          {currentStep === 5 && (
            <PricingShowtimesStep
              filmData={filmData}
              updateFilmData={updateFilmData}
              errors={errors}
            />
          )}
          
          {currentStep === 6 && (
            <ReviewPublishStep
              filmData={filmData}
              previewUrl={previewUrl}
              saving={saving}
              onSave={saveFilm}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            ← Previous
          </button>
          
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={saveFilm}
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Publishing...' : '🚀 Publish Film'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Step 1: Basic Information
const BasicInformationStep = ({ filmData, updateFilmData, errors }) => {
  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Documentary', 'Romance', 'Thriller', 'Animation', 'Family'];
  const ratings = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">📝 Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Film Title *</label>
          <input
            type="text"
            value={filmData.movie_title}
            onChange={(e) => updateFilmData('movie_title', e.target.value)}
            placeholder="Enter your film title"
            className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          {errors.movie_title && <p className="text-red-400 text-sm mt-1">{errors.movie_title}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Subtitle (Optional)</label>
          <input
            type="text"
            value={filmData.movie_subtitle}
            onChange={(e) => updateFilmData('movie_subtitle', e.target.value)}
            placeholder="Subtitle or tagline"
            className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Director *</label>
          <input
            type="text"
            value={filmData.director}
            onChange={(e) => updateFilmData('director', e.target.value)}
            placeholder="Director name"
            className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          {errors.director && <p className="text-red-400 text-sm mt-1">{errors.director}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Release Date *</label>
          <input
            type="date"
            value={filmData.release_date}
            onChange={(e) => updateFilmData('release_date', e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          {errors.release_date && <p className="text-red-400 text-sm mt-1">{errors.release_date}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Runtime *</label>
          <input
            type="text"
            value={filmData.runtime}
            onChange={(e) => updateFilmData('runtime', e.target.value)}
            placeholder="e.g., 120 min"
            className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          {errors.runtime && <p className="text-red-400 text-sm mt-1">{errors.runtime}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <select
            value={filmData.rating}
            onChange={(e) => updateFilmData('rating', e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            {ratings.map(rating => (
              <option key={rating} value={rating}>{rating}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Genres</label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {genres.map(genre => (
            <label key={genre} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filmData.genre.includes(genre)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateFilmData('genre', [...filmData.genre, genre]);
                  } else {
                    updateFilmData('genre', filmData.genre.filter(g => g !== genre));
                  }
                }}
                className="form-checkbox text-red-500"
              />
              <span className="text-sm">{genre}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Step 2: Story & Details
const StoryDetailsStep = ({ filmData, updateFilmData, errors }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">📖 Story & Details</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Logline * <span className="text-gray-400">(One compelling sentence that sells your film)</span>
        </label>
        <input
          type="text"
          value={filmData.film_details.logline}
          onChange={(e) => updateFilmData('film_details.logline', e.target.value)}
          placeholder="A thrilling story about..."
          maxLength={150}
          className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
        <div className="flex justify-between text-sm text-gray-400 mt-1">
          {errors.logline && <span className="text-red-400">{errors.logline}</span>}
          <span>{filmData.film_details.logline.length}/150</span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Synopsis * <span className="text-gray-400">(Full plot description)</span>
        </label>
        <textarea
          value={filmData.film_details.synopsis}
          onChange={(e) => updateFilmData('film_details.synopsis', e.target.value)}
          placeholder="Provide a detailed description of your film's plot..."
          rows={6}
          className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
        {errors.synopsis && <p className="text-red-400 text-sm mt-1">{errors.synopsis}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Production Notes <span className="text-gray-400">(Behind-the-scenes info, optional)</span>
        </label>
        <textarea
          value={filmData.film_details.production_notes}
          onChange={(e) => updateFilmData('film_details.production_notes', e.target.value)}
          placeholder="Share interesting behind-the-scenes information..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
      </div>
    </div>
  );
};

// Step 3: Visual Assets
const VisualAssetsStep = ({ filmData, updateFilmData, errors, onImageUpload }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">🎨 Visual Assets</h2>
      
      <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <span className="text-blue-400 text-xl">💡</span>
          <div>
            <h4 className="font-medium text-blue-200">Image Guidelines</h4>
            <ul className="text-sm text-blue-300 mt-2 space-y-1">
              <li>• Poster: 2:3 aspect ratio (e.g., 1200x1800px) - Required</li>
              <li>• Backdrop: 16:9 aspect ratio (e.g., 1920x1080px) - Recommended</li>
              <li>• Format: PNG or JPG, max 10MB</li>
              <li>• High resolution for best quality</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUploadField
          label="Film Poster *"
          description="Main poster image (2:3 ratio)"
          currentImage={filmData.film_assets.poster_image}
          onUpload={(file) => onImageUpload('poster_image', file)}
          error={errors.poster_image}
          required
        />
        
        <ImageUploadField
          label="Backdrop Image"
          description="Wide background image (16:9 ratio)"
          currentImage={filmData.film_assets.backdrop_image}
          onUpload={(file) => onImageUpload('backdrop_image', file)}
          error={errors.backdrop_image}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Trailer URL <span className="text-gray-400">(YouTube or Vimeo)</span>
        </label>
        <input
          type="url"
          value={filmData.film_assets.trailer_url}
          onChange={(e) => updateFilmData('film_assets.trailer_url', e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
      </div>
    </div>
  );
};

// Image Upload Field Component
const ImageUploadField = ({ label, description, currentImage, onUpload, error, required }) => {
  const [preview, setPreview] = useState(currentImage);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      onUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label} <span className="text-gray-400">({description})</span>
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          dragActive ? 'border-red-500 bg-red-500 bg-opacity-10' : 'border-gray-600'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt={label} className="w-full h-40 object-cover rounded-lg" />
            <button
              onClick={() => { setPreview(null); onUpload(null); }}
              className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
            <span className="text-4xl mb-2">📷</span>
            <span className="text-sm text-gray-400 text-center">
              Drag & drop or click to upload
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </label>
        )}
      </div>
      
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

// Step 4: Social & Marketing
const SocialMarketingStep = ({ filmData, updateFilmData, errors }) => {
  const socialPlatforms = [
    { key: 'instagram', label: 'Instagram', icon: '📷', placeholder: 'instagram.com/yourfilm' },
    { key: 'twitter', label: 'Twitter/X', icon: '🐦', placeholder: 'twitter.com/yourfilm' },
    { key: 'tiktok', label: 'TikTok', icon: '🎵', placeholder: 'tiktok.com/@yourfilm' },
    { key: 'facebook', label: 'Facebook', icon: '👥', placeholder: 'facebook.com/yourfilm' },
    { key: 'youtube', label: 'YouTube', icon: '📺', placeholder: 'youtube.com/yourfilm' },
    { key: 'website', label: 'Official Website', icon: '🌐', placeholder: 'yourfilm.com' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">📢 Social & Marketing</h2>
      
      <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <span className="text-green-400 text-xl">🚀</span>
          <div>
            <h4 className="font-medium text-green-200">Marketing Boost</h4>
            <p className="text-sm text-green-300 mt-1">
              Adding social links increases audience engagement by 40% and helps build your film's community.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {socialPlatforms.map(platform => (
          <div key={platform.key}>
            <label className="flex items-center space-x-2 text-sm font-medium mb-2">
              <span className="text-lg">{platform.icon}</span>
              <span>{platform.label}</span>
            </label>
            <input
              type="url"
              value={filmData.social_links[platform.key]}
              onChange={(e) => updateFilmData(`social_links.${platform.key}`, e.target.value)}
              placeholder={platform.placeholder}
              className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Step 5: Pricing & Showtimes
const PricingShowtimesStep = ({ filmData, updateFilmData, errors }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">🎫 Pricing & Showtimes</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">Base Ticket Price</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400">$</span>
          <input
            type="number"
            min="0"
            step="0.50"
            value={filmData.base_ticket_price}
            onChange={(e) => updateFilmData('base_ticket_price', parseFloat(e.target.value))}
            className="w-full pl-8 pr-4 py-3 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Format Premium Pricing</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(filmData.format_pricing).map(([format, price]) => (
            <div key={format} className="flex items-center space-x-3">
              <label className="flex-1 text-sm">{format} Premium</label>
              <div className="relative w-24">
                <span className="absolute left-2 top-3 text-gray-400 text-sm">+$</span>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={price}
                  onChange={(e) => updateFilmData(`format_pricing.${format}`, parseFloat(e.target.value))}
                  className="w-full pl-6 pr-2 py-2 bg-gray-700 rounded text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-yellow-400 text-xl">⏰</span>
          <div>
            <h4 className="font-medium text-yellow-200">Showtimes Setup</h4>
            <p className="text-sm text-yellow-300 mt-1">
              Showtimes will be configured after your film page is created. You'll be able to add theaters and specific screening times in the admin dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 6: Review & Publish
const ReviewPublishStep = ({ filmData, previewUrl, saving, onSave }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">🚀 Review & Publish</h2>
      
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Film Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Title:</span>
            <span className="ml-2 font-medium">{filmData.movie_title}</span>
          </div>
          <div>
            <span className="text-gray-400">Director:</span>
            <span className="ml-2">{filmData.director}</span>
          </div>
          <div>
            <span className="text-gray-400">Runtime:</span>
            <span className="ml-2">{filmData.runtime}</span>
          </div>
          <div>
            <span className="text-gray-400">Rating:</span>
            <span className="ml-2">{filmData.rating}</span>
          </div>
          <div>
            <span className="text-gray-400">Base Price:</span>
            <span className="ml-2">${filmData.base_ticket_price}</span>
          </div>
          <div>
            <span className="text-gray-400">Poster:</span>
            <span className="ml-2">{filmData.film_assets.poster_image ? '✅ Uploaded' : '❌ Missing'}</span>
          </div>
        </div>
      </div>
      
      {previewUrl && (
        <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-4">
          <h4 className="font-medium text-green-200 mb-2">🎉 Film Published Successfully!</h4>
          <p className="text-green-300 text-sm mb-3">Your film page is now live and ready to share.</p>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            <span>🔗 View Film Page</span>
            <span>↗</span>
          </a>
        </div>
      )}
      
      <div className="text-center">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Publishing Film...</span>
            </span>
          ) : (
            '🚀 Publish Film Page'
          )}
        </button>
      </div>
    </div>
  );
};

export default FilmSetupWizard;