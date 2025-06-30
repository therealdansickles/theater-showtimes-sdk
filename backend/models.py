from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from enum import Enum

class GradientType(str, Enum):
    LINEAR = "linear"
    RADIAL = "radial"
    CONIC = "conic"

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

class TheaterLocation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    chain: str
    address: str
    city: str
    state: str
    zip_code: str
    distance: Optional[float] = None
    formats: List[Dict[str, Any]] = []
    showtimes: List[str] = []

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
    available_formats: List[str] = ["2D", "IMAX", "DOLBY", "4DX"]
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
    available_formats: Optional[List[str]] = None
    is_active: Optional[bool] = None

class ClientCreate(BaseModel):
    name: str
    email: str
    company: str
    subscription_tier: str = "basic"

class TheaterLocationCreate(BaseModel):
    name: str
    chain: str
    address: str
    city: str
    state: str
    zip_code: str
    formats: List[Dict[str, Any]] = []
    showtimes: List[str] = []

class ImageUploadResponse(BaseModel):
    id: str
    name: str
    url: str
    message: str

class CustomizationPreset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    primary_gradient: GradientConfig
    secondary_gradient: GradientConfig
    background_color: str
    text_color: str
    accent_color: str
    typography: TypographyConfig
    primary_button: ButtonStyle
    secondary_button: ButtonStyle
    category: str = "general"  # action, horror, comedy, drama, sci-fi, etc.
    is_public: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)