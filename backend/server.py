from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

# Import our custom modules
from .database import connect_to_mongo, close_mongo_connection
from .routes import movies, clients, uploads, categories, auth
from .models import CustomizationPreset, GradientConfig, ButtonStyle, TypographyConfig
from .security import rate_limit_middleware, add_security_headers

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(
    title="Movie Ticket Booking SaaS API",
    description="A comprehensive SaaS platform for movie ticket booking with extensive customization options",
    version="1.0.0"
)

# Security Middleware
class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Apply rate limiting
        try:
            await rate_limit_middleware(request)
        except HTTPException as e:
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail},
                headers=getattr(e, 'headers', {})
            )
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        response = add_security_headers(response)
        
        # Add rate limit headers if available
        if hasattr(request.state, 'rate_limit_headers'):
            for key, value in request.state.rate_limit_headers.items():
                response.headers[key] = value
        
        return response

app.add_middleware(SecurityMiddleware)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define basic models for backward compatibility
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Basic routes
@api_router.get("/")
async def root():
    return {
        "message": "Movie Ticket Booking SaaS API",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "clients": "/api/clients",
            "movies": "/api/movies",
            "uploads": "/api/uploads",
            "health": "/api/health"
        }
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "database": "connected",
            "file_storage": "available"
        }
    }

# Legacy status endpoints for backward compatibility
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    from .database import insert_document
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    await insert_document("status_checks", status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    from .database import find_documents
    status_checks = await find_documents("status_checks", {}, 100)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Initialize default customization presets
@api_router.post("/initialize-presets")
async def initialize_default_presets():
    """Initialize default customization presets"""
    try:
        from .database import find_documents, insert_document
        
        # Check if presets already exist
        existing_presets = await find_documents("customization_presets", {})
        if existing_presets:
            return {"message": "Presets already initialized"}
        
        # Default presets for different movie genres
        presets = [
            {
                "name": "Action Hero",
                "description": "Bold reds and oranges for action movies",
                "primary_gradient": {
                    "type": "linear",
                    "direction": "135deg",
                    "colors": ["#ef4444", "#dc2626"],
                    "stops": [0, 100]
                },
                "secondary_gradient": {
                    "type": "linear", 
                    "direction": "135deg",
                    "colors": ["#f97316", "#ea580c"],
                    "stops": [0, 100]
                },
                "background_color": "#000000",
                "text_color": "#ffffff",
                "accent_color": "#ef4444",
                "typography": {
                    "font_family": "Inter, sans-serif",
                    "heading_font_size": "4rem",
                    "body_font_size": "1rem",
                    "font_weights": {"light": 300, "normal": 400, "semibold": 600, "bold": 800}
                },
                "primary_button": {
                    "background_color": "#ef4444",
                    "text_color": "#ffffff",
                    "border_radius": 8,
                    "emoji": "🎬",
                    "emoji_position": "left"
                },
                "secondary_button": {
                    "background_color": "#374151",
                    "text_color": "#ffffff", 
                    "border_radius": 8,
                    "emoji": "🎫",
                    "emoji_position": "left"
                },
                "category": "action"
            },
            {
                "name": "Horror Dark",
                "description": "Dark theme with blood red accents for horror movies",
                "primary_gradient": {
                    "type": "linear",
                    "direction": "135deg", 
                    "colors": ["#7f1d1d", "#450a0a"],
                    "stops": [0, 100]
                },
                "secondary_gradient": {
                    "type": "linear",
                    "direction": "135deg",
                    "colors": ["#991b1b", "#7f1d1d"],
                    "stops": [0, 100]
                },
                "background_color": "#0c0c0c",
                "text_color": "#f3f4f6",
                "accent_color": "#dc2626",
                "typography": {
                    "font_family": "Creepster, cursive",
                    "heading_font_size": "3.5rem",
                    "body_font_size": "1rem",
                    "font_weights": {"light": 300, "normal": 400, "semibold": 600, "bold": 800}
                },
                "primary_button": {
                    "background_color": "#7f1d1d",
                    "text_color": "#ffffff",
                    "border_radius": 4,
                    "emoji": "💀",
                    "emoji_position": "left"
                },
                "secondary_button": {
                    "background_color": "#1f2937",
                    "text_color": "#ffffff",
                    "border_radius": 4,
                    "emoji": "🎃",
                    "emoji_position": "left"
                },
                "category": "horror"
            },
            {
                "name": "Romantic Blush",
                "description": "Soft pinks and purples for romantic movies",
                "primary_gradient": {
                    "type": "linear",
                    "direction": "135deg",
                    "colors": ["#ec4899", "#be185d"],
                    "stops": [0, 100]
                },
                "secondary_gradient": {
                    "type": "linear",
                    "direction": "135deg", 
                    "colors": ["#a855f7", "#7c3aed"],
                    "stops": [0, 100]
                },
                "background_color": "#1f1f1f",
                "text_color": "#ffffff",
                "accent_color": "#ec4899",
                "typography": {
                    "font_family": "Dancing Script, cursive",
                    "heading_font_size": "4.5rem",
                    "body_font_size": "1.1rem",
                    "font_weights": {"light": 300, "normal": 400, "semibold": 600, "bold": 800}
                },
                "primary_button": {
                    "background_color": "#ec4899",
                    "text_color": "#ffffff",
                    "border_radius": 20,
                    "emoji": "💕",
                    "emoji_position": "left"
                },
                "secondary_button": {
                    "background_color": "#6b21a8",
                    "text_color": "#ffffff",
                    "border_radius": 20,
                    "emoji": "🌹",
                    "emoji_position": "left"
                },
                "category": "romance"
            },
            {
                "name": "Sci-Fi Neon",
                "description": "Futuristic blues and cyans for sci-fi movies",
                "primary_gradient": {
                    "type": "linear",
                    "direction": "135deg",
                    "colors": ["#0ea5e9", "#0284c7"],
                    "stops": [0, 100]
                },
                "secondary_gradient": {
                    "type": "linear",
                    "direction": "135deg",
                    "colors": ["#06b6d4", "#0891b2"],
                    "stops": [0, 100]
                },
                "background_color": "#020617",
                "text_color": "#f0f9ff",
                "accent_color": "#0ea5e9",
                "typography": {
                    "font_family": "Orbitron, monospace",
                    "heading_font_size": "3.8rem",
                    "body_font_size": "1rem",
                    "font_weights": {"light": 300, "normal": 400, "semibold": 600, "bold": 800}
                },
                "primary_button": {
                    "background_color": "#0ea5e9",
                    "text_color": "#ffffff",
                    "border_radius": 6,
                    "emoji": "🚀",
                    "emoji_position": "left"
                },
                "secondary_button": {
                    "background_color": "#1e293b",
                    "text_color": "#ffffff",
                    "border_radius": 6,
                    "emoji": "🛸",
                    "emoji_position": "left"
                },
                "category": "sci-fi"
            }
        ]
        
        # Insert presets
        for preset_data in presets:
            preset = CustomizationPreset(**preset_data)
            await insert_document("customization_presets", preset.dict())
        
        return {"message": f"Initialized {len(presets)} default presets"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize presets: {str(e)}")

# Include routers
app.include_router(api_router)
app.include_router(movies.router, prefix="/api")
app.include_router(clients.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

# Mount static files for uploads
uploads_dir = Path("/app/uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# CORS middleware - Enhanced security configuration
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://*.emergentagent.com",
        "https://*.litebeem.com"
    ],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=[
        "Authorization", 
        "Content-Type", 
        "X-API-Key",
        "X-Requested-With",
        "X-CSRF-Token"
    ],
    expose_headers=[
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining", 
        "X-RateLimit-Reset"
    ]
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup and shutdown events
@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection and create indexes"""
    await connect_to_mongo()
    logger.info("Movie Ticket Booking SaaS API started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection"""
    await close_mongo_connection()
    logger.info("Movie Ticket Booking SaaS API shutdown complete")
