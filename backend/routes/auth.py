"""
Authentication routes for Movie Booking SDK
Handles JWT authentication, API key management, and user management
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Response
from typing import List, Optional
from datetime import datetime, timedelta
import hashlib

from ..models import (
    User, UserCreate, UserLogin, TokenResponse, 
    APIKey, APIKeyCreate, APIKeyResponse, Client
)
from ..database import (
    insert_document, find_document, find_documents, 
    update_document, delete_document
)
from ..security import (
    SecurityManager, get_current_user, get_admin_user,
    validate_string_input, validate_email_format,
    rate_limit_middleware
)

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=TokenResponse)
async def register_user(user_data: UserCreate, request: Request):
    """Register a new user (admin only in production)"""
    await rate_limit_middleware(request)
    
    # Validate input
    user_data.username = validate_string_input(user_data.username, 50, 3)
    user_data.email = validate_email_format(user_data.email)
    user_data.password = validate_string_input(user_data.password, 128, 8)
    
    # Check if user already exists
    existing_user = await find_document("users", {"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    existing_email = await find_document("users", {"email": user_data.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    password_hash = SecurityManager.hash_password(user_data.password)
    
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=password_hash,
        role=user_data.role
    )
    
    # Insert user into database
    await insert_document("users", user.dict())
    
    # Create access token
    access_token = SecurityManager.create_access_token(
        data={"sub": user.id, "username": user.username, "role": user.role.value}
    )
    
    return TokenResponse(access_token=access_token)

@router.post("/login", response_model=TokenResponse)
async def login_user(user_credentials: UserLogin, request: Request):
    """Authenticate user and return JWT token"""
    await rate_limit_middleware(request)
    
    # Validate input
    user_credentials.username = validate_string_input(user_credentials.username, 50, 3)
    user_credentials.password = validate_string_input(user_credentials.password, 128, 1)
    
    # Find user
    user_doc = await find_document("users", {"username": user_credentials.username})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**user_doc)
    
    # Check if account is locked
    if user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(
            status_code=423, 
            detail=f"Account locked until {user.locked_until}"
        )
    
    # Verify password
    if not SecurityManager.verify_password(user_credentials.password, user.password_hash):
        # Increment failed login attempts
        failed_attempts = user.failed_login_attempts + 1
        update_data = {"failed_login_attempts": failed_attempts}
        
        # Lock account after 5 failed attempts
        if failed_attempts >= 5:
            update_data["locked_until"] = datetime.utcnow() + timedelta(minutes=30)
        
        await update_document("users", {"id": user.id}, update_data)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Reset failed login attempts and update last login
    await update_document("users", {"id": user.id}, {
        "failed_login_attempts": 0,
        "locked_until": None,
        "last_login_at": datetime.utcnow()
    })
    
    # Create access token
    access_token = SecurityManager.create_access_token(
        data={"sub": user.id, "username": user.username, "role": user.role.value}
    )
    
    return TokenResponse(access_token=access_token)

@router.post("/api-keys", response_model=APIKeyResponse, dependencies=[Depends(get_admin_user)])
async def create_api_key(
    api_key_data: APIKeyCreate, 
    current_user: dict = Depends(get_admin_user),
    request: Request = None
):
    """Create a new API key for a client (admin only)"""
    
    # Get client ID from request or use current user
    client_id = current_user.get("client_id", current_user.get("sub"))
    
    # Generate API key
    raw_key = SecurityManager.create_api_key(client_id, api_key_data.name)
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    key_prefix = raw_key[:12] + "..."
    
    # Calculate expiration
    expires_at = None
    if api_key_data.expires_days:
        expires_at = datetime.utcnow() + timedelta(days=api_key_data.expires_days)
    
    # Create API key record
    api_key = APIKey(
        client_id=client_id,
        key_hash=key_hash,
        key_prefix=key_prefix,
        name=api_key_data.name,
        expires_at=expires_at,
        permissions=api_key_data.permissions,
        rate_limit=api_key_data.rate_limit
    )
    
    # Insert into database
    await insert_document("api_keys", api_key.dict())
    
    # Return response (only time the full key is shown)
    return APIKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key=raw_key,  # Only returned on creation
        key_prefix=key_prefix,
        is_active=api_key.is_active,
        created_at=api_key.created_at,
        expires_at=expires_at,
        permissions=api_key.permissions,
        rate_limit=api_key.rate_limit
    )

@router.get("/api-keys", response_model=List[APIKeyResponse], dependencies=[Depends(get_admin_user)])
async def list_api_keys(current_user: dict = Depends(get_admin_user)):
    """List all API keys for current user/client"""
    
    client_id = current_user.get("client_id", current_user.get("sub"))
    
    api_keys_docs = await find_documents("api_keys", {"client_id": client_id})
    
    api_keys = []
    for doc in api_keys_docs:
        api_key = APIKey(**doc)
        # Don't return the actual key, only metadata
        api_keys.append(APIKeyResponse(
            id=api_key.id,
            name=api_key.name,
            key="***",  # Never return the actual key
            key_prefix=api_key.key_prefix,
            is_active=api_key.is_active,
            created_at=api_key.created_at,
            expires_at=api_key.expires_at,
            permissions=api_key.permissions,
            rate_limit=api_key.rate_limit
        ))
    
    return api_keys

@router.delete("/api-keys/{key_id}", dependencies=[Depends(get_admin_user)])
async def revoke_api_key(
    key_id: str, 
    current_user: dict = Depends(get_admin_user)
):
    """Revoke an API key"""
    
    client_id = current_user.get("client_id", current_user.get("sub"))
    
    # Find and verify ownership
    api_key_doc = await find_document("api_keys", {"id": key_id, "client_id": client_id})
    if not api_key_doc:
        raise HTTPException(status_code=404, detail="API key not found")
    
    # Deactivate the key
    await update_document("api_keys", {"id": key_id}, {"is_active": False})
    
    return {"message": "API key revoked successfully"}

@router.get("/me", dependencies=[Depends(get_current_user)])
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    
    user_doc = await find_document("users", {"id": current_user["sub"]})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = User(**user_doc)
    
    # Return safe user info (no password hash)
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "last_login_at": user.last_login_at
    }

@router.post("/verify-token")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify if token is valid"""
    return {
        "valid": True,
        "user_id": current_user["sub"],
        "username": current_user["username"],
        "role": current_user["role"]
    }

@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """Refresh access token"""
    
    # Create new access token
    access_token = SecurityManager.create_access_token(
        data={
            "sub": current_user["sub"], 
            "username": current_user["username"], 
            "role": current_user["role"]
        }
    )
    
    return TokenResponse(access_token=access_token)