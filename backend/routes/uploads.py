from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import List, Optional
import os
import uuid
from datetime import datetime
import shutil
from pathlib import Path
from PIL import Image
import logging

from ..models import ImageAsset, ImageUploadResponse
from ..database import insert_document, find_document, find_documents, delete_document

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/uploads", tags=["uploads"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_image(file: UploadFile) -> bool:
    """Validate uploaded image file"""
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in ALLOWED_EXTENSIONS:
        return False
    
    if file.size > MAX_FILE_SIZE:
        return False
    
    return True

def optimize_image(file_path: Path, max_width: int = 1920, quality: int = 85) -> None:
    """Optimize image size and quality"""
    try:
        with Image.open(file_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Resize if too large
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Save optimized image
            img.save(file_path, "JPEG", quality=quality, optimize=True)
            
    except Exception as e:
        logger.error(f"Failed to optimize image {file_path}: {e}")

@router.post("/image", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    category: str = Form(...),
    alt_text: str = Form(""),
    client_id: str = Form(...)
):
    """Upload and optimize an image"""
    try:
        # Validate file
        if not validate_image(file):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file. Only JPG, PNG, WebP, and GIF files under 10MB are allowed."
            )
        
        # Check client exists and limits
        client = await find_document("clients", {"id": client_id})
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Check image limits
        existing_images = len(await find_documents("image_assets", {"client_id": client_id}))
        if existing_images >= client.get("max_images", 10):
            raise HTTPException(status_code=400, detail="Image limit reached for this subscription tier")
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix.lower()
        filename = f"{file_id}{file_extension}"
        file_path = UPLOAD_DIR / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Optimize image
        optimize_image(file_path)
        
        # Create image asset record
        image_asset = ImageAsset(
            id=file_id,
            name=file.filename,
            url=f"/uploads/{filename}",
            alt_text=alt_text or file.filename,
            category=category
        )
        
        # Add client_id to the asset record
        asset_dict = image_asset.dict()
        asset_dict["client_id"] = client_id
        
        await insert_document("image_assets", asset_dict)
        
        return ImageUploadResponse(
            id=file_id,
            name=file.filename,
            url=f"/uploads/{filename}",
            message="Image uploaded successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/images", response_model=List[ImageAsset])
async def get_images(
    client_id: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50
):
    """Get uploaded images with optional filtering"""
    try:
        filter_dict = {}
        if client_id:
            filter_dict["client_id"] = client_id
        if category:
            filter_dict["category"] = category
        
        images = await find_documents("image_assets", filter_dict, limit)
        return [ImageAsset(**img) for img in images]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve images: {str(e)}")

@router.get("/images/{image_id}", response_model=ImageAsset)
async def get_image(image_id: str):
    """Get a specific image"""
    try:
        image = await find_document("image_assets", {"id": image_id})
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        return ImageAsset(**image)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve image: {str(e)}")

@router.delete("/images/{image_id}")
async def delete_image(image_id: str):
    """Delete an image"""
    try:
        # Get image record
        image = await find_document("image_assets", {"id": image_id})
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Delete file from filesystem
        filename = Path(image["url"]).name
        file_path = UPLOAD_DIR / filename
        
        if file_path.exists():
            file_path.unlink()
        
        # Delete from database
        success = await delete_document("image_assets", {"id": image_id})
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete image record")
        
        return {"message": "Image deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

@router.post("/multiple", response_model=List[ImageUploadResponse])
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    category: str = Form(...),
    client_id: str = Form(...)
):
    """Upload multiple images at once"""
    try:
        if len(files) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 files allowed per upload")
        
        # Check client exists and limits
        client = await find_document("clients", {"id": client_id})
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        existing_images = len(await find_documents("image_assets", {"client_id": client_id}))
        if existing_images + len(files) > client.get("max_images", 10):
            raise HTTPException(status_code=400, detail="Image limit would be exceeded")
        
        results = []
        
        for file in files:
            try:
                # Validate file
                if not validate_image(file):
                    results.append(ImageUploadResponse(
                        id="",
                        name=file.filename,
                        url="",
                        message=f"Skipped: Invalid file format or size"
                    ))
                    continue
                
                # Generate unique filename
                file_id = str(uuid.uuid4())
                file_extension = Path(file.filename).suffix.lower()
                filename = f"{file_id}{file_extension}"
                file_path = UPLOAD_DIR / filename
                
                # Save file
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                
                # Optimize image
                optimize_image(file_path)
                
                # Create image asset record
                image_asset = ImageAsset(
                    id=file_id,
                    name=file.filename,
                    url=f"/uploads/{filename}",
                    alt_text=file.filename,
                    category=category
                )
                
                # Add client_id to the asset record
                asset_dict = image_asset.dict()
                asset_dict["client_id"] = client_id
                
                await insert_document("image_assets", asset_dict)
                
                results.append(ImageUploadResponse(
                    id=file_id,
                    name=file.filename,
                    url=f"/uploads/{filename}",
                    message="Uploaded successfully"
                ))
                
            except Exception as e:
                results.append(ImageUploadResponse(
                    id="",
                    name=file.filename,
                    url="",
                    message=f"Failed: {str(e)}"
                ))
        
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk upload failed: {str(e)}")