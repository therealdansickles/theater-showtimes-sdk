import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

// Color Picker Component
export const ColorPicker = ({ color, onChange, label }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 border border-gray-600 rounded cursor-pointer"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white flex-1"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

// Gradient Editor Component
export const GradientEditor = ({ gradient, onChange, label }) => {
  const updateGradient = (field, value) => {
    onChange({
      ...gradient,
      [field]: value
    });
  };

  const updateColor = (index, color) => {
    const newColors = [...gradient.colors];
    newColors[index] = color;
    onChange({
      ...gradient,
      colors: newColors
    });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h4 className="text-lg font-semibold text-white mb-3">{label}</h4>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
        <select
          value={gradient.type}
          onChange={(e) => updateGradient('type', e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
        >
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
          <option value="conic">Conic</option>
        </select>
      </div>

      {gradient.type === 'linear' && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-300 mb-2">Direction</label>
          <input
            type="text"
            value={gradient.direction}
            onChange={(e) => updateGradient('direction', e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
            placeholder="135deg"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">Colors</label>
        {gradient.colors.map((color, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="color"
              value={color}
              onChange={(e) => updateColor(index, e.target.value)}
              className="w-10 h-10 border border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => updateColor(index, e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white flex-1"
            />
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
        <div
          className="w-full h-16 rounded border border-gray-600"
          style={{
            background: `${gradient.type}-gradient(${gradient.type === 'linear' ? gradient.direction + ', ' : ''}${gradient.colors.join(', ')})`
          }}
        />
      </div>
    </div>
  );
};

// Button Style Editor
export const ButtonStyleEditor = ({ buttonStyle, onChange, label }) => {
  const updateButton = (field, value) => {
    onChange({
      ...buttonStyle,
      [field]: value
    });
  };

  const emojiOptions = ['🎬', '🎫', '🍿', '🎭', '🎪', '🎨', '🎯', '⭐', '🔥', '💥', '🚀', '💫', '💀', '🎃', '👻', '🖤', '💕', '🌹', '💖', '🌟', '🛸', '🤖', '👽', '🌌'];

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h4 className="text-lg font-semibold text-white mb-3">{label}</h4>
      
      <ColorPicker
        color={buttonStyle.background_color}
        onChange={(color) => updateButton('background_color', color)}
        label="Background Color"
      />
      
      <ColorPicker
        color={buttonStyle.text_color}
        onChange={(color) => updateButton('text_color', color)}
        label="Text Color"
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Border Radius (px)</label>
        <input
          type="number"
          value={buttonStyle.border_radius}
          onChange={(e) => updateButton('border_radius', parseInt(e.target.value))}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
          min="0"
          max="50"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Emoji</label>
        <div className="grid grid-cols-6 gap-2 mb-2">
          {emojiOptions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => updateButton('emoji', emoji)}
              className={`p-2 text-2xl rounded hover:bg-gray-600 transition-colors ${
                buttonStyle.emoji === emoji ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <button
          onClick={() => updateButton('emoji', null)}
          className="text-sm text-gray-400 hover:text-white"
        >
          Remove Emoji
        </button>
      </div>

      {buttonStyle.emoji && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Emoji Position</label>
          <select
            value={buttonStyle.emoji_position}
            onChange={(e) => updateButton('emoji_position', e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
      )}

      {/* Preview */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
        <button
          className="px-6 py-3 rounded font-semibold transition-colors"
          style={{
            backgroundColor: buttonStyle.background_color,
            color: buttonStyle.text_color,
            borderRadius: `${buttonStyle.border_radius}px`
          }}
        >
          {buttonStyle.emoji && buttonStyle.emoji_position === 'left' && (
            <span className="mr-2">{buttonStyle.emoji}</span>
          )}
          {buttonStyle.emoji && buttonStyle.emoji_position === 'top' && (
            <div className="flex flex-col items-center">
              <span className="mb-1">{buttonStyle.emoji}</span>
              <span>Sample Button</span>
            </div>
          )}
          {(!buttonStyle.emoji || ['left', 'right', 'bottom'].includes(buttonStyle.emoji_position)) && (
            <span>Sample Button</span>
          )}
          {buttonStyle.emoji && buttonStyle.emoji_position === 'right' && (
            <span className="ml-2">{buttonStyle.emoji}</span>
          )}
          {buttonStyle.emoji && buttonStyle.emoji_position === 'bottom' && (
            <div className="flex flex-col items-center">
              <span>Sample Button</span>
              <span className="mt-1">{buttonStyle.emoji}</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

// Image Upload Component
export const ImageUpload = ({ onUpload, category, clientId, currentImage }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('category', category);
      formData.append('client_id', clientId);
      formData.append('alt_text', `${category} image`);

      const response = await axios.post(`${API_BASE}/uploads/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUpload(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {category.charAt(0).toUpperCase() + category.slice(1)} Image
      </label>
      
      {currentImage && (
        <div className="mb-3">
          <img 
            src={process.env.REACT_APP_BACKEND_URL + currentImage} 
            alt={category}
            className="w-32 h-32 object-cover rounded border border-gray-600"
          />
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50 bg-opacity-10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Uploading...
          </div>
        ) : (
          <>
            <div className="text-gray-400 mb-3">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-gray-400">
              Drag and drop an image here, or{' '}
              <label className="text-blue-500 hover:text-blue-400 cursor-pointer">
                browse files
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </label>
            </p>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP up to 10MB</p>
          </>
        )}
      </div>
    </div>
  );
};

// Preset Selector Component
export const PresetSelector = ({ onApplyPreset }) => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const response = await axios.get(`${API_BASE}/movies/presets/`);
      setPresets(response.data);
    } catch (error) {
      console.error('Failed to fetch presets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-3"></div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h4 className="text-lg font-semibold text-white mb-3">Quick Presets</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
            onClick={() => onApplyPreset(preset)}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded"
                style={{
                  background: `linear-gradient(135deg, ${preset.primary_gradient.colors.join(', ')})`
                }}
              />
              <div>
                <h5 className="font-semibold text-white">{preset.name}</h5>
                <p className="text-sm text-gray-400">{preset.description}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-sm bg-gray-600 px-2 py-1 rounded text-gray-300">
                    {preset.category}
                  </span>
                  {preset.primary_button.emoji && (
                    <span className="text-lg">{preset.primary_button.emoji}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Admin Dashboard Main Component
export const AdminDashboard = ({ movieConfig, onUpdateConfig, clientId }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: '🎬' },
    { id: 'colors', name: 'Colors & Gradients', icon: '🎨' },
    { id: 'buttons', name: 'Buttons', icon: '🔘' },
    { id: 'images', name: 'Images', icon: '🖼️' },
    { id: 'presets', name: 'Presets', icon: '✨' }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateConfig(movieConfig);
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (field, value) => {
    onUpdateConfig({
      ...movieConfig,
      [field]: value
    });
  };

  const handleImageUpload = (field, uploadData) => {
    updateConfig(field, uploadData.url);
  };

  const handlePresetApply = (preset) => {
    onUpdateConfig({
      ...movieConfig,
      primary_gradient: preset.primary_gradient,
      secondary_gradient: preset.secondary_gradient,
      background_color: preset.background_color,
      text_color: preset.text_color,
      accent_color: preset.accent_color,
      typography: preset.typography,
      primary_button: preset.primary_button,
      secondary_button: preset.secondary_button
    });
    setActiveTab('colors');
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            Movie Configuration Dashboard
          </h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-4">General Settings</h2>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Movie Title</label>
                    <input
                      type="text"
                      value={movieConfig.movie_title || ''}
                      onChange={(e) => updateConfig('movie_title', e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={movieConfig.movie_subtitle || ''}
                      onChange={(e) => updateConfig('movie_subtitle', e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={movieConfig.description || ''}
                      onChange={(e) => updateConfig('description', e.target.value)}
                      rows={4}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Director</label>
                      <input
                        type="text"
                        value={movieConfig.director || ''}
                        onChange={(e) => updateConfig('director', e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                      <select
                        value={movieConfig.rating || 'PG-13'}
                        onChange={(e) => updateConfig('rating', e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full"
                      >
                        <option value="G">G</option>
                        <option value="PG">PG</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                        <option value="NC-17">NC-17</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'colors' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Colors & Gradients</h2>
                
                <GradientEditor
                  gradient={movieConfig.primary_gradient || { type: 'linear', direction: '135deg', colors: ['#ef4444', '#dc2626'], stops: [0, 100] }}
                  onChange={(gradient) => updateConfig('primary_gradient', gradient)}
                  label="Primary Gradient"
                />
                
                <GradientEditor
                  gradient={movieConfig.secondary_gradient || { type: 'linear', direction: '135deg', colors: ['#f97316', '#ea580c'], stops: [0, 100] }}
                  onChange={(gradient) => updateConfig('secondary_gradient', gradient)}
                  label="Secondary Gradient"
                />

                <div className="bg-gray-800 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-4">Solid Colors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ColorPicker
                      color={movieConfig.background_color || '#000000'}
                      onChange={(color) => updateConfig('background_color', color)}
                      label="Background Color"
                    />
                    <ColorPicker
                      color={movieConfig.text_color || '#ffffff'}
                      onChange={(color) => updateConfig('text_color', color)}
                      label="Text Color"
                    />
                    <ColorPicker
                      color={movieConfig.accent_color || '#ef4444'}
                      onChange={(color) => updateConfig('accent_color', color)}
                      label="Accent Color"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'buttons' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Button Styles</h2>
                
                <ButtonStyleEditor
                  buttonStyle={movieConfig.primary_button || { background_color: '#ef4444', text_color: '#ffffff', border_radius: 8, emoji: '🎬', emoji_position: 'left' }}
                  onChange={(style) => updateConfig('primary_button', style)}
                  label="Primary Button"
                />
                
                <ButtonStyleEditor
                  buttonStyle={movieConfig.secondary_button || { background_color: '#374151', text_color: '#ffffff', border_radius: 8, emoji: '🎫', emoji_position: 'left' }}
                  onChange={(style) => updateConfig('secondary_button', style)}
                  label="Secondary Button"
                />
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Image Assets</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUpload
                    category="hero"
                    clientId={clientId}
                    currentImage={movieConfig.hero_image}
                    onUpload={(data) => handleImageUpload('hero_image', data)}
                  />
                  
                  <ImageUpload
                    category="poster"
                    clientId={clientId}
                    currentImage={movieConfig.poster_image}
                    onUpload={(data) => handleImageUpload('poster_image', data)}
                  />
                  
                  <ImageUpload
                    category="logo"
                    clientId={clientId}
                    currentImage={movieConfig.logo_image}
                    onUpload={(data) => handleImageUpload('logo_image', data)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'presets' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Design Presets</h2>
                <p className="text-gray-400 mb-6">
                  Choose from pre-designed themes optimized for different movie genres.
                </p>
                
                <PresetSelector onApplyPreset={handlePresetApply} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};