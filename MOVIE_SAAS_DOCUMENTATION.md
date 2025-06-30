# Movie Ticket Booking SaaS Platform

## 🎬 Overview

This is a comprehensive SaaS platform that allows any film distributor or movie studio to create a fully customized movie ticket booking experience. The platform provides extensive customization options including gradient selection, image uploads, button styling with emoji overlays, and much more.

## ✨ Key Features

### 🎨 **Comprehensive Customization System**
- **Gradient Editor**: Linear, radial, and conic gradients with real-time preview
- **Color Picker**: Full color customization for backgrounds, text, and accents
- **Button Designer**: Custom button styles with emoji overlay support
- **Image Management**: Upload and manage hero images, posters, and logos
- **Typography Controls**: Font family, sizes, and weight customization

### 🎭 **Pre-designed Themes**
- **Action Hero**: Bold reds and oranges for action movies
- **Horror Dark**: Dark theme with blood red accents
- **Romantic Blush**: Soft pinks and purples for romantic films
- **Sci-Fi Neon**: Futuristic blues and cyans for sci-fi movies

### 🏢 **Multi-tenant Architecture**
- **Client Management**: Support for multiple movie studios/distributors
- **Subscription Tiers**: Basic, Premium, and Enterprise with different limits
- **Usage Tracking**: Monitor movie configurations, image uploads, and theater counts

### 🎫 **Complete Booking System**
- **Theater Management**: Add and manage multiple theater locations
- **Format Support**: IMAX, 2D, Dolby, 4DX, ScreenX, and more
- **Showtime Management**: Flexible scheduling system
- **Location-based Search**: Find theaters by location and distance

## 🛠️ Technical Architecture

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── server.py              # Main FastAPI application
├── models.py              # Pydantic models and schemas
├── database.py            # MongoDB connection and utilities
└── routes/
    ├── movies.py          # Movie configuration endpoints
    ├── clients.py         # Client management endpoints
    └── uploads.py         # File upload and image management
```

### Frontend (React + TailwindCSS)
```
/app/frontend/src/
├── App.js                 # Main application with routing
├── components.js          # Public-facing movie booking components
├── admin-components.js    # Admin dashboard components
└── App.css               # Global styles and customizations
```

## 🚀 API Endpoints

### Movie Configuration
- `POST /api/movies/` - Create movie configuration
- `GET /api/movies/` - List movie configurations
- `GET /api/movies/{id}` - Get specific movie configuration
- `PUT /api/movies/{id}` - Update movie configuration
- `DELETE /api/movies/{id}` - Delete movie configuration

### Client Management
- `POST /api/clients/` - Create new client
- `GET /api/clients/` - List clients
- `GET /api/clients/{id}` - Get specific client
- `PUT /api/clients/{id}` - Update client
- `GET /api/clients/{id}/statistics` - Get usage statistics

### File Uploads
- `POST /api/uploads/image` - Upload single image
- `POST /api/uploads/multiple` - Upload multiple images
- `GET /api/uploads/images` - List uploaded images
- `DELETE /api/uploads/images/{id}` - Delete image

### Customization
- `GET /api/movies/presets/` - Get customization presets
- `POST /api/initialize-presets` - Initialize default presets

## 🎯 Usage Examples

### 1. Creating a New Movie Configuration
```javascript
const movieConfig = {
  client_id: "client-uuid",
  movie_title: "Top Gun: Maverick",
  movie_subtitle: "The Sequel",
  description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator.",
  release_date: "2025-05-27T00:00:00",
  director: "Joseph Kosinski",
  cast: ["Tom Cruise", "Miles Teller", "Jennifer Connelly"],
  rating: "PG-13",
  runtime: "131 min",
  genre: ["Action", "Drama"]
};

const response = await fetch('/api/movies/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(movieConfig)
});
```

### 2. Customizing Visual Theme
```javascript
const customization = {
  primary_gradient: {
    type: "linear",
    direction: "135deg",
    colors: ["#0ea5e9", "#0284c7"],
    stops: [0, 100]
  },
  background_color: "#020617",
  accent_color: "#0ea5e9",
  primary_button: {
    background_color: "#0ea5e9",
    text_color: "#ffffff",
    border_radius: 6,
    emoji: "🚀",
    emoji_position: "left"
  }
};

await fetch(`/api/movies/${movieId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(customization)
});
```

### 3. Uploading Custom Images
```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('category', 'hero');
formData.append('client_id', clientId);
formData.append('alt_text', 'Hero background image');

const response = await fetch('/api/uploads/image', {
  method: 'POST',
  body: formData
});
```

## 🔧 Customization Options

### Gradient Types
- **Linear**: Directional gradients with customizable angle
- **Radial**: Circular gradients from center outward
- **Conic**: Cone-shaped gradients rotating around center

### Button Emoji Options
🎬 🎫 🍿 🎭 🎪 🎨 🎯 ⭐ 🔥 💥 🚀 💫 💀 🎃 👻 🖤 💕 🌹 💖 🌟 🛸 🤖 👽 🌌

### Image Categories
- **Hero**: Main background images
- **Poster**: Movie poster images  
- **Logo**: Brand/movie logos
- **Background**: Additional background assets

### Subscription Tiers
- **Basic**: 1 movie, 10 images, 50 theaters
- **Premium**: 5 movies, 50 images, 200 theaters
- **Enterprise**: 50 movies, 500 images, 1000 theaters

## 🌐 Deployment

### Environment Variables
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=movie_saas
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Running the Platform
```bash
# Start all services
sudo supervisorctl restart all

# Access the application
# Public movie booking: http://localhost:3000
# Admin dashboard: http://localhost:3000/admin
# API documentation: http://localhost:8001/docs
```

## 📊 Admin Dashboard Features

### General Settings
- Movie title and subtitle configuration
- Description and metadata management
- Cast, crew, and rating information
- Release date and runtime settings

### Colors & Gradients
- Real-time gradient editor with preview
- Color picker for all theme elements
- Gradient type selection (linear/radial/conic)
- Multiple color stop management

### Button Customization
- Background and text color selection
- Border radius adjustment
- Emoji selection with position control
- Real-time button preview

### Image Management
- Drag-and-drop image upload
- Multiple image format support
- Automatic image optimization
- Category-based organization

### Design Presets
- Genre-specific preset themes
- One-click theme application
- Preview of preset styling
- Custom preset creation

## 🔒 Security & Limits

### File Upload Security
- Maximum file size: 10MB
- Allowed formats: JPG, PNG, WebP, GIF
- Automatic image optimization
- Virus scanning (configurable)

### Rate Limiting
- API request limits per client
- Upload frequency restrictions
- Subscription tier enforcement

### Data Validation
- Input sanitization
- Schema validation
- Type checking
- Required field enforcement

## 📈 Monetization Features

### Subscription Management
- Tier-based feature access
- Usage tracking and billing
- Upgrade/downgrade flows
- Usage analytics

### White-label Options
- Custom branding removal
- Domain customization
- API white-labeling
- Custom CSS injection

## 🎯 Future Enhancements

### Advanced Features
- Video background support
- Animation timeline editor
- A/B testing for designs
- Real-time collaboration
- Mobile app SDK
- Advanced analytics
- Integration marketplace

### AI-Powered Features
- Automatic color palette generation
- Smart image cropping
- Content optimization suggestions
- Predictive design recommendations

---

## 🏁 Getting Started

1. **Create a Client Account**: Use the admin interface to create a new client
2. **Configure Your Movie**: Set up title, description, and basic information
3. **Customize the Design**: Use presets or create custom styling
4. **Upload Assets**: Add hero images, posters, and logos
5. **Add Theaters**: Configure theater locations and showtimes
6. **Launch**: Your custom movie booking experience is ready!

The platform provides everything needed to create a professional, fully-customized movie ticket booking experience that matches your film's brand and aesthetic perfectly.