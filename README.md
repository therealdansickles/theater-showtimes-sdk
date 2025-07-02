# Movie Booking SDK for Litebeem

A comprehensive, production-ready SDK for movie booking and theater management with enterprise-grade security, dynamic category filtering, and mobile optimization.

## 🎬 Overview

The Movie Booking SDK enables seamless integration of movie ticket booking functionality into web and mobile applications. Built for Litebeem's decentralized media distribution platform, it provides:

- **Dynamic Movie Booking**: Real-time theater listings with customizable showtimes
- **Advanced Filtering**: Category-based filtering (IMAX, Live Q&A, 4DX) and time-based selection
- **Enterprise Security**: JWT authentication, API key management, and rate limiting
- **Mobile Optimization**: React Native components with iOS/Android support
- **Customizable UI**: Branded themes, gradients, and button customization
- **Admin Dashboard**: Complete management interface for movie configurations

## 🚀 Quick Start

### Backend Installation

```bash
# Clone the repository
git clone <repository-url>
cd movie-booking-sdk

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the backend server
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Installation

```bash
# Install frontend dependencies
cd ../frontend
yarn install

# Start the development server
yarn start
```

### SDK Integration

```bash
# Install the SDK package
npm install movie-booking-sdk

# Or with yarn
yarn add movie-booking-sdk
```

## 📋 Features

### 🎭 Movie Booking Features
- Theater listings with real-time availability
- Multiple format support (2D, IMAX, DOLBY, 4DX, etc.)
- Time-based filtering (Morning, Afternoon, Evening, Late Night)
- Interactive seat selection and booking flow
- Custom branding and theming

### 🔒 Security Features
- **JWT Authentication**: Secure admin access with role-based permissions
- **API Key Management**: Individual client keys with usage tracking
- **Rate Limiting**: Tiered limits (60/200/500 requests per minute)
- **Input Validation**: XSS and injection attack prevention
- **Security Headers**: Comprehensive protection against common vulnerabilities

### 📱 SDK Components

#### React Web Components
```javascript
import { MovieBookingWidget, TheaterListings } from 'movie-booking-sdk';

function App() {
  return (
    <MovieBookingWidget
      movieId="your-movie-id"
      apiKey="your-api-key"
      theme={{
        primaryColor: "#ef4444",
        accentColor: "#dc2626"
      }}
    />
  );
}
```

#### React Native Components
```javascript
import { MovieBookingWidgetNative } from 'movie-booking-sdk/native';

function MobileApp() {
  return (
    <MovieBookingWidgetNative
      movieId="your-movie-id"
      apiKey="your-api-key"
      mobileOptimized={true}
    />
  );
}
```

## 🛠️ Configuration

### Environment Variables

#### Backend (.env)
```bash
# Security Settings
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database Configuration
MONGO_URL=mongodb://localhost:27017/movie_booking_saas

# Rate Limiting
RATE_LIMIT_PUBLIC=60
RATE_LIMIT_AUTHENTICATED=200
RATE_LIMIT_ADMIN=500
```

#### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=https://your-api-domain.com
```

### Movie Configuration

```javascript
const movieConfig = {
  movie_title: "Your Movie Title",
  description: "Movie description",
  primary_gradient: {
    type: "linear",
    direction: "135deg",
    colors: ["#ef4444", "#dc2626"]
  },
  screening_categories: [
    { name: "IMAX", type: "format" },
    { name: "Live Q&A", type: "special_event" },
    { name: "4DX", type: "experience" }
  ]
};
```

## 🔐 Authentication

### Admin Access
1. Navigate to `/admin` in your application
2. Use demo credentials:
   - Username: `admin`
   - Password: `SecurePassword123!`

### API Key Management
```bash
# Create an API key (requires admin authentication)
curl -X POST https://your-api.com/api/auth/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Client Key",
    "permissions": ["read", "write"],
    "rate_limit": 200
  }'
```

## 📊 API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/movies/` - List movies
- `GET /api/categories/` - Get screening categories
- `GET /api/categories/time-categories/available` - Get time categories
- `GET /api/health` - Health check

### Protected Endpoints (JWT Required)
- `POST /api/clients/` - Create client
- `POST /api/auth/api-keys` - Create API key
- `PUT /api/movies/{id}` - Update movie configuration
- `POST /api/uploads/image` - Upload images

### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register admin user
- `POST /api/auth/verify-token` - Verify JWT token
- `POST /api/auth/refresh-token` - Refresh access token

## 🎨 Customization

### Theme Configuration
```javascript
const theme = {
  primary_gradient: {
    type: "linear",
    direction: "135deg",
    colors: ["#ef4444", "#dc2626"]
  },
  background_color: "#000000",
  text_color: "#ffffff",
  accent_color: "#ef4444",
  typography: {
    font_family: "Inter, sans-serif",
    heading_font_size: "4rem",
    body_font_size: "1rem"
  },
  primary_button: {
    background_color: "#ef4444",
    text_color: "#ffffff",
    border_radius: 8
  }
};
```

### Category Management
```javascript
// Add custom screening categories
const categories = [
  { name: "IMAX", type: "format" },
  { name: "Live Q&A", type: "special_event" },
  { name: "Live Activations", type: "special_event" },
  { name: "4DX", type: "experience" },
  { name: "Premium", type: "experience" }
];
```

## 🏗️ Architecture

```
/app/
├── backend/           # FastAPI backend with MongoDB
│   ├── routes/       # API route handlers
│   ├── models.py     # Data models and schemas
│   ├── security.py   # Authentication and security
│   └── database.py   # Database connections
├── frontend/         # React frontend application
│   ├── src/
│   │   ├── components.js     # UI components
│   │   ├── admin-components.js # Admin dashboard
│   │   ├── AuthContext.js    # Authentication context
│   │   └── App.js           # Main application
├── sdk/              # Distributable SDK package
│   ├── src/
│   │   ├── react/           # React web components
│   │   ├── react-native/    # React Native components
│   │   └── types/           # TypeScript definitions
├── scripts/          # Utility and setup scripts
└── tests/            # Test suites
    └── security/     # Security tests
```

## 🧪 Testing

### Run Security Tests
```bash
# Backend security tests
cd tests/security
python test_security_comprehensive.py

# Authentication tests
python auth_test.py
```

### Manual Testing
1. **Public Access**: Navigate to `/` - should load without authentication
2. **Admin Protection**: Click "Admin" - should redirect to login
3. **Authentication**: Login with demo credentials
4. **Admin Dashboard**: Verify all admin functions work
5. **Logout**: Test logout clears authentication

## 📚 API Documentation

### Rate Limits
- **Public endpoints**: 60 requests/minute
- **Authenticated endpoints**: 200 requests/minute  
- **Admin endpoints**: 500 requests/minute

### Response Format
```javascript
{
  "theaters": [
    {
      "name": "AMC Century City",
      "chain": "AMC",
      "address": "10250 Santa Monica Blvd, Los Angeles, CA",
      "distance": 2.5,
      "formats": [
        {
          "category_name": "IMAX",
          "times": [
            {
              "time": "7:00 PM",
              "category": "evening"
            }
          ]
        }
      ]
    }
  ]
}
```

## 🔧 Development

### Setup Development Environment
```bash
# Start backend
cd backend
uvicorn main:app --reload

# Start frontend
cd frontend
yarn start

# Build SDK
cd sdk
npm run build
```

### Available Scripts
- `scripts/cleanup_and_setup.py` - Clean test data and setup production data
- `scripts/production_setup.py` - Prepare application for production
- `scripts/nuclear_cleanup.py` - Complete cleanup of all test data

## 🚀 Deployment

### Backend Deployment
```bash
# Production startup
uvicorn main:app --host 0.0.0.0 --port 8001

# With Docker
docker build -t movie-booking-backend .
docker run -p 8001:8001 movie-booking-backend
```

### Frontend Deployment
```bash
# Build for production
yarn build

# Serve static files
serve -s build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**"Theaters not displaying"**
- Verify backend is running on correct port
- Check API endpoint configuration
- Ensure CORS settings allow frontend domain

**"Authentication failing"**
- Verify JWT secret key is set
- Check user credentials are correct
- Ensure frontend and backend URLs match

**"Rate limit exceeded"**
- Check your API key rate limits
- Implement proper request throttling
- Contact admin to increase limits

### Getting Help
- 📧 Email: support@litebeem.com
- 📖 Documentation: [docs.litebeem.com](https://docs.litebeem.com)
- 🐛 Issues: [GitHub Issues](https://github.com/litebeem/movie-booking-sdk/issues)

## 🎯 Roadmap

- [ ] Real-time seat selection
- [ ] Payment integration
- [ ] Mobile app SDK
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Advanced booking rules

---

**Built with ❤️ for Litebeem's decentralized media platform**
