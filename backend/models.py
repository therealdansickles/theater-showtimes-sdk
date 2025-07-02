from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from enum import Enum

class GradientType(str, Enum):
    LINEAR = "linear"
    RADIAL = "radial"
    CONIC = "conic"

class UserRole(str, Enum):
    ADMIN = "admin"
    CLIENT = "client"
    PUBLIC = "public"

class ButtonStyle(BaseModel):
    background_color: str = "#ef4444"
    text_color: str = "#ffffff"
    border_radius: int = 8
    emoji: Optional[str] = None
    emoji_position: str = "left"  # left, right, top, bottom

class GradientConfig(BaseModel):
    type: GradientType = GradientType.LINEAR
    direction: str = "135deg"  # for linear gradients
    colors: List[str] = ["#ef4444", "#dc2626"]
    stops: List[int] = [0, 100]

class TypographyConfig(BaseModel):
    font_family: str = "Inter, sans-serif"
    heading_font_size: str = "4rem"
    body_font_size: str = "1rem"
    font_weights: Dict[str, int] = {
        "light": 300,
        "normal": 400,
        "semibold": 600,
        "bold": 800
    }

class ImageAsset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    url: str
    alt_text: str
    category: str  # hero, poster, background, logo, etc.
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class ScreeningCategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # e.g., "IMAX", "Live Q&A", "Live Activations", "Premium"
    type: str  # e.g., "format", "experience", "special_event"
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TimeSlot(BaseModel):
    time: str  # e.g., "7:00 PM"
    category: str  # "morning", "afternoon", "evening", "late_night"
    available_seats: Optional[int] = None
    price_modifier: Optional[float] = 1.0  # Price multiplier for this time slot

class ScreeningFormat(BaseModel):
    category_id: str
    category_name: str
    times: List[TimeSlot] = []
    price: Optional[float] = None
    special_notes: Optional[str] = None

class TheaterLocation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    chain: str
    address: str
    city: str
    state: str
    zip_code: str
    distance: Optional[float] = None
    formats: List[ScreeningFormat] = []  # Updated to use new ScreeningFormat
    showtimes: List[str] = []  # Legacy field for backwards compatibility
    amenities: List[str] = []
    phone: Optional[str] = None
    website: Optional[str] = None

class APIKey(BaseModel):
    """API Key model for client authentication"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    key_hash: str  # Hashed version of the API key
    key_prefix: str  # First 8 characters for identification
    name: str  # Human-readable name for the key
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    permissions: List[str] = []  # List of allowed operations
    rate_limit: int = 200  # Requests per minute
    usage_count: int = 0

class User(BaseModel):
    """User model for admin authentication"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    role: UserRole = UserRole.CLIENT
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = None
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None

class MovieConfiguration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    movie_title: str
    movie_subtitle: Optional[str] = None
    description: str
    
    # Visual Customization
    primary_gradient: GradientConfig = GradientConfig()
    secondary_gradient: GradientConfig = GradientConfig(colors=["#f97316", "#ea580c"])
    background_color: str = "#000000"
    text_color: str = "#ffffff"
    accent_color: str = "#ef4444"
    
    # Typography
    typography: TypographyConfig = TypographyConfig()
    
    # Button Styles
    primary_button: ButtonStyle = ButtonStyle()
    secondary_button: ButtonStyle = ButtonStyle(background_color="#374151")
    
    # Images
    hero_image: Optional[str] = None
    poster_image: Optional[str] = None
    logo_image: Optional[str] = None
    background_images: List[str] = []
    
    # Movie Details
    release_date: datetime
    rating: str = "PG-13"
    runtime: str = "120 min"
    genre: List[str] = ["Action", "Drama"]
    director: str
    cast: List[str] = []
    
    # Booking Configuration
    available_formats: List[str] = ["2D", "IMAX", "DOLBY", "4DX"]  # Legacy field
    screening_categories: List[ScreeningCategory] = []  # New dynamic categories
    theaters: List[TheaterLocation] = []
    
    # Status
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    company: str
    subscription_tier: str = "basic"  # basic, premium, enterprise
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Customization limits based on tier
    max_movies: int = 1
    max_images: int = 10
    max_theaters: int = 50
    
    # Security
    api_keys: List[str] = []  # List of API key IDs

class CustomizationPreset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    primary_gradient: GradientConfig
    secondary_gradient: GradientConfig
    background_color: str
    text_color: str
    accent_color: str
    typography: TypographyConfig
    primary_button: ButtonStyle
    secondary_button: ButtonStyle
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Request/Response Models
class MovieConfigurationCreate(BaseModel):
    client_id: str
    movie_title: str
    movie_subtitle: Optional[str] = None
    description: str
    release_date: datetime
    director: str
    cast: List[str] = []
    rating: str = "PG-13"
    runtime: str = "120 min"
    genre: List[str] = ["Action", "Drama"]
    
    @validator('movie_title', 'director')
    def validate_required_strings(cls, v):
        if not v or not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()

class MovieConfigurationUpdate(BaseModel):
    movie_title: Optional[str] = None
    movie_subtitle: Optional[str] = None
    description: Optional[str] = None
    primary_gradient: Optional[GradientConfig] = None
    secondary_gradient: Optional[GradientConfig] = None
    background_color: Optional[str] = None
    text_color: Optional[str] = None
    accent_color: Optional[str] = None
    typography: Optional[TypographyConfig] = None
    primary_button: Optional[ButtonStyle] = None
    secondary_button: Optional[ButtonStyle] = None
    hero_image: Optional[str] = None
    poster_image: Optional[str] = None
    logo_image: Optional[str] = None
    background_images: Optional[List[str]] = None
    release_date: Optional[datetime] = None
    rating: Optional[str] = None
    runtime: Optional[str] = None
    genre: Optional[List[str]] = None
    director: Optional[str] = None
    cast: Optional[List[str]] = None
    available_formats: Optional[List[str]] = None
    screening_categories: Optional[List[ScreeningCategory]] = None
    theaters: Optional[List[TheaterLocation]] = None
    is_active: Optional[bool] = None

class ClientCreate(BaseModel):
    name: str
    email: str
    company: str
    subscription_tier: str = "basic"
    
    @validator('name', 'company')
    def validate_required_strings(cls, v):
        if not v or not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()
    
    @validator('email')
    def validate_email(cls, v):
        if not v or '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower().strip()

class TheaterLocationCreate(BaseModel):
    name: str
    chain: str
    address: str
    city: str
    state: str
    zip_code: str
    distance: Optional[float] = None
    formats: List[ScreeningFormat] = []
    showtimes: List[str] = []
    amenities: List[str] = []
    phone: Optional[str] = None
    website: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole = UserRole.CLIENT
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3 or len(v) > 50:
            raise ValueError('Username must be between 3 and 50 characters')
        return v.strip()
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutes

class APIKeyCreate(BaseModel):
    name: str
    permissions: List[str] = []
    expires_days: Optional[int] = 365
    rate_limit: int = 200
    
    @validator('name')
    def validate_name(cls, v):
        if not v or len(v.strip()) < 3:
            raise ValueError('API key name must be at least 3 characters')
        return v.strip()

class APIKeyResponse(BaseModel):
    id: str
    name: str
    key: str  # Only returned on creation
    key_prefix: str
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime]
    permissions: List[str]
    rate_limit: int