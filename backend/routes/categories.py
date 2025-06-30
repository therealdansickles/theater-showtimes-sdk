from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import uuid

from ..models import (
    ScreeningCategory, ScreeningCategoryCreate, ScreeningCategoryUpdate,
    TimeSlot, ScreeningFormat
)
from ..database import (
    get_database, insert_document, find_document, find_documents,
    update_document, delete_document, count_documents
)

router = APIRouter(prefix="/categories", tags=["screening-categories"])

@router.post("/", response_model=ScreeningCategory)
async def create_screening_category(category_data: ScreeningCategoryCreate):
    """Create a new screening category"""
    try:
        # Check if category name already exists
        existing_category = await find_document("screening_categories", {"name": category_data.name})
        if existing_category:
            raise HTTPException(status_code=400, detail="Category name already exists")
        
        category_obj = ScreeningCategory(**category_data.dict())
        await insert_document("screening_categories", category_obj.dict())
        
        return category_obj
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create screening category: {str(e)}")

@router.get("/", response_model=List[ScreeningCategory])
async def get_screening_categories(
    type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    limit: int = Query(50, le=100)
):
    """Get screening categories with optional filtering"""
    try:
        filter_dict = {}
        if type:
            filter_dict["type"] = type
        if is_active is not None:
            filter_dict["is_active"] = is_active
        
        categories = await find_documents("screening_categories", filter_dict, limit)
        return [ScreeningCategory(**category) for category in categories]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve screening categories: {str(e)}")

@router.get("/{category_id}", response_model=ScreeningCategory)
async def get_screening_category(category_id: str):
    """Get a specific screening category"""
    try:
        category = await find_document("screening_categories", {"id": category_id})
        if not category:
            raise HTTPException(status_code=404, detail="Screening category not found")
        
        return ScreeningCategory(**category)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve screening category: {str(e)}")

@router.put("/{category_id}", response_model=ScreeningCategory)
async def update_screening_category(category_id: str, category_update: ScreeningCategoryUpdate):
    """Update a screening category"""
    try:
        # Check if category exists
        existing_category = await find_document("screening_categories", {"id": category_id})
        if not existing_category:
            raise HTTPException(status_code=404, detail="Screening category not found")
        
        # If updating name, check for duplicates
        if category_update.name and category_update.name != existing_category["name"]:
            duplicate = await find_document("screening_categories", {"name": category_update.name})
            if duplicate:
                raise HTTPException(status_code=400, detail="Category name already exists")
        
        # Update only provided fields
        update_dict = category_update.dict(exclude_unset=True)
        
        success = await update_document("screening_categories", {"id": category_id}, update_dict)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update screening category")
        
        # Return updated category
        updated_category = await find_document("screening_categories", {"id": category_id})
        return ScreeningCategory(**updated_category)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update screening category: {str(e)}")

@router.delete("/{category_id}")
async def delete_screening_category(category_id: str):
    """Delete a screening category"""
    try:
        # Check if category is being used by any theaters/movies
        # Note: In a production system, you might want to check references
        # before allowing deletion or implement soft deletes
        
        success = await delete_document("screening_categories", {"id": category_id})
        if not success:
            raise HTTPException(status_code=404, detail="Screening category not found")
        
        return {"message": "Screening category deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete screening category: {str(e)}")

@router.post("/initialize-defaults")
async def initialize_default_categories():
    """Initialize default screening categories"""
    try:
        # Check if categories already exist
        existing_categories = await find_documents("screening_categories", {})
        if existing_categories:
            return {"message": "Default categories already initialized"}
        
        # Default categories for different types of screenings
        default_categories = [
            {
                "name": "IMAX",
                "type": "format",
                "description": "Large format premium experience",
                "is_active": True
            },
            {
                "name": "DOLBY ATMOS",
                "type": "format", 
                "description": "Enhanced audio experience",
                "is_active": True
            },
            {
                "name": "4DX",
                "type": "format",
                "description": "Motion seats and environmental effects",
                "is_active": True
            },
            {
                "name": "2D",
                "type": "format",
                "description": "Standard digital projection",
                "is_active": True
            },
            {
                "name": "3D",
                "type": "format",
                "description": "Three-dimensional viewing experience",
                "is_active": True
            },
            {
                "name": "Live Q&A",
                "type": "special_event",
                "description": "Post-screening Q&A with cast/crew",
                "is_active": True
            },
            {
                "name": "Live Activations",
                "type": "special_event",
                "description": "Interactive experiences and activations",
                "is_active": True
            },
            {
                "name": "Early Access",
                "type": "special_event",
                "description": "Early access screenings for fans",
                "is_active": True
            },
            {
                "name": "Fan First Premieres",
                "type": "special_event",
                "description": "Exclusive premiere screenings",
                "is_active": True
            },
            {
                "name": "Premium",
                "type": "experience",
                "description": "Premium seating and amenities",
                "is_active": True
            },
            {
                "name": "VIP",
                "type": "experience",
                "description": "VIP lounge access and premium service",
                "is_active": True
            }
        ]
        
        # Insert categories
        for category_data in default_categories:
            category = ScreeningCategory(**category_data)
            await insert_document("screening_categories", category.dict())
        
        return {"message": f"Initialized {len(default_categories)} default screening categories"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize default categories: {str(e)}")

@router.get("/types/available")
async def get_available_category_types():
    """Get available category types"""
    return {
        "types": [
            {
                "value": "format",
                "label": "Format",
                "description": "Technical screening formats (IMAX, Dolby, etc.)"
            },
            {
                "value": "experience", 
                "label": "Experience",
                "description": "Premium experiences (VIP, Premium seating, etc.)"
            },
            {
                "value": "special_event",
                "label": "Special Event", 
                "description": "Special screenings (Q&A, Early Access, etc.)"
            }
        ]
    }

@router.get("/time-categories/available")
async def get_available_time_categories():
    """Get available time categories for scheduling"""
    return {
        "time_categories": [
            {
                "value": "morning",
                "label": "Morning",
                "description": "6:00 AM - 11:59 AM",
                "time_range": "06:00-11:59"
            },
            {
                "value": "afternoon",
                "label": "Afternoon", 
                "description": "12:00 PM - 4:59 PM",
                "time_range": "12:00-16:59"
            },
            {
                "value": "evening",
                "label": "Evening",
                "description": "5:00 PM - 9:59 PM", 
                "time_range": "17:00-21:59"
            },
            {
                "value": "late_night",
                "label": "Late Night",
                "description": "10:00 PM - 5:59 AM",
                "time_range": "22:00-05:59"
            }
        ]
    }