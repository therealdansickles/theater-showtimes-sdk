"""
Security module for Movie Booking SDK
Implements JWT authentication, API key management, and rate limiting
"""

import os
import jwt
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
import time
from collections import defaultdict, deque
import asyncio

# Security configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
API_KEY_EXPIRE_DAYS = 365

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Security
security = HTTPBearer()

# Rate limiting storage (in production, use Redis)
rate_limit_storage = defaultdict(lambda: deque())

class RateLimiter:
    """Rate limiting implementation with sliding window"""
    
    def __init__(self):
        self.requests = defaultdict(lambda: deque())
    
    def is_allowed(self, key: str, limit: int, window: int = 60) -> bool:
        """Check if request is within rate limit"""
        now = time.time()
        requests = self.requests[key]
        
        # Remove old requests outside the window
        while requests and requests[0] <= now - window:
            requests.popleft()
        
        # Check if under limit
        if len(requests) < limit:
            requests.append(now)
            return True
        
        return False
    
    def get_remaining(self, key: str, limit: int, window: int = 60) -> int:
        """Get remaining requests in current window"""
        now = time.time()
        requests = self.requests[key]
        
        # Remove old requests
        while requests and requests[0] <= now - window:
            requests.popleft()
        
        return max(0, limit - len(requests))

# Global rate limiter instance
rate_limiter = RateLimiter()

class SecurityManager:
    """Central security manager for authentication and authorization"""
    
    @staticmethod
    def create_api_key(client_id: str, client_name: str) -> str:
        """Generate a new API key for a client"""
        timestamp = str(int(time.time()))
        data = f"{client_id}:{client_name}:{timestamp}"
        hash_object = hashlib.sha256(data.encode())
        return f"sk_live_{hash_object.hexdigest()[:32]}"
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password for storage"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

# Security dependencies for FastAPI
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract and validate JWT token from Authorization header"""
    try:
        payload = SecurityManager.verify_token(credentials.credentials)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    """Ensure current user has admin privileges"""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403, 
            detail="Admin privileges required"
        )
    return current_user

async def validate_api_key(request: Request):
    """Validate API key from header and return client info"""
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        return None
    
    # In production, verify API key against database
    # For now, we'll implement basic validation
    if not api_key.startswith("sk_live_"):
        raise HTTPException(status_code=401, detail="Invalid API key format")
    
    # TODO: Implement database lookup for API key validation
    # For now, return basic client info
    return {
        "api_key": api_key,
        "client_id": "extracted_from_key",
        "rate_limit": 200  # authenticated user limit
    }

def get_rate_limit_key(request: Request, api_key_info: Optional[dict] = None) -> tuple:
    """Generate rate limit key and determine limits based on request type"""
    client_ip = request.client.host
    
    # Determine if this is an admin, authenticated, or public request
    auth_header = request.headers.get("Authorization")
    is_admin_endpoint = any(path in str(request.url) for path in ["/clients", "/uploads", "/initialize"])
    
    if auth_header and is_admin_endpoint:
        # Admin endpoint with JWT
        return f"admin:{client_ip}", 500
    elif api_key_info:
        # Authenticated with API key
        return f"api_key:{api_key_info['api_key']}", api_key_info['rate_limit']
    else:
        # Public endpoint
        return f"public:{client_ip}", 60

async def rate_limit_middleware(request: Request):
    """Rate limiting middleware"""
    # Skip rate limiting for health checks and static files
    if str(request.url.path) in ["/api/health", "/api/"]:
        return
    
    # Get API key info if present
    api_key_info = None
    try:
        api_key_info = await validate_api_key(request)
    except:
        pass  # No API key or invalid - will use public limits
    
    # Determine rate limit key and limits
    rate_key, limit = get_rate_limit_key(request, api_key_info)
    
    # Check rate limit
    if not rate_limiter.is_allowed(rate_key, limit):
        remaining = rate_limiter.get_remaining(rate_key, limit)
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Limit: {limit} requests/minute. Try again later.",
            headers={
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": str(remaining),
                "X-RateLimit-Reset": str(int(time.time() + 60))
            }
        )
    
    # Add rate limit headers to response
    remaining = rate_limiter.get_remaining(rate_key, limit)
    request.state.rate_limit_headers = {
        "X-RateLimit-Limit": str(limit),
        "X-RateLimit-Remaining": str(remaining),
        "X-RateLimit-Reset": str(int(time.time() + 60))
    }

# Input validation helpers
def validate_string_input(value: str, max_length: int = 255, min_length: int = 1) -> str:
    """Validate string input for length and basic safety"""
    if not isinstance(value, str):
        raise HTTPException(status_code=400, detail="Invalid input type")
    
    if len(value) < min_length or len(value) > max_length:
        raise HTTPException(
            status_code=400, 
            detail=f"Input length must be between {min_length} and {max_length} characters"
        )
    
    # Basic XSS prevention
    dangerous_chars = ["<script", "javascript:", "onload=", "onerror="]
    value_lower = value.lower()
    for char in dangerous_chars:
        if char in value_lower:
            raise HTTPException(status_code=400, detail="Invalid characters in input")
    
    return value.strip()

def validate_email_format(email: str) -> str:
    """Validate email format"""
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    return email.lower().strip()

# Security headers middleware
def add_security_headers(response):
    """Add security headers to response"""
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    # Content Security Policy
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' https:; "
        "connect-src 'self' https:; "
        "frame-ancestors 'none';"
    )
    response.headers["Content-Security-Policy"] = csp
    
    return response