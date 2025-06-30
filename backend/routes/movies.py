from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, time
import uuid

from ..models import (
    MovieConfiguration, MovieConfigurationCreate, MovieConfigurationUpdate,
    TheaterLocation, TheaterLocationCreate, CustomizationPreset,
    ScreeningCategory, ScreeningFormat, TimeSlot
)
from ..database import (
    get_database, insert_document, find_document, find_documents,
    update_document, delete_document, count_documents
)

router = APIRouter(prefix="/movies", tags=["movies"])

def categorize_time(time_str: str) -> str:
    """Automatically categorize a time string into morning, afternoon, evening, or late_night"""
    try:
        # Parse various time formats
        time_str = time_str.strip().upper()
        
        # Handle common formats
        if 'PM' in time_str or 'AM' in time_str:
            # 12-hour format
            time_part = time_str.replace('AM', '').replace('PM', '').strip()
            hour = int(time_part.split(':')[0])
            
            if 'PM' in time_str and hour != 12:
                hour += 12
            elif 'AM' in time_str and hour == 12:
                hour = 0
        else:
            # 24-hour format or just hour
            hour = int(time_str.split(':')[0])
        
        # Categorize based on hour
        if 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:
            return "late_night"
            
    except (ValueError, IndexError):
        # Default to evening if parsing fails
        return "evening"

@router.post("/", response_model=MovieConfiguration)
async def create_movie_configuration(movie_config: MovieConfigurationCreate):
    """Create a new movie configuration"""
    try:
        # Check if client exists
        client = await find_document("clients", {"id": movie_config.client_id})
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Check subscription limits
        existing_movies = await count_documents("movie_configurations", 
                                               {"client_id": movie_config.client_id, "is_active": True})
        if existing_movies >= client.get("max_movies", 1):
            raise HTTPException(status_code=400, detail="Movie limit reached for this subscription tier")
        
        # Create movie configuration
        movie_dict = movie_config.dict()
        movie_obj = MovieConfiguration(**movie_dict)
        
        await insert_document("movie_configurations", movie_obj.dict())
        return movie_obj
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create movie configuration: {str(e)}")

@router.get("/", response_model=List[MovieConfiguration])
async def get_movie_configurations(
    client_id: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    limit: int = Query(50, le=100)
):
    """Get movie configurations with optional filtering"""
    try:
        filter_dict = {}
        if client_id:
            filter_dict["client_id"] = client_id
        if is_active is not None:
            filter_dict["is_active"] = is_active
        
        movies = await find_documents("movie_configurations", filter_dict, limit)
        return [MovieConfiguration(**movie) for movie in movies]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve movie configurations: {str(e)}")

@router.get("/{movie_id}", response_model=MovieConfiguration)
async def get_movie_configuration(movie_id: str):
    """Get a specific movie configuration"""
    try:
        movie = await find_document("movie_configurations", {"id": movie_id})
        if not movie:
            raise HTTPException(status_code=404, detail="Movie configuration not found")
        
        return MovieConfiguration(**movie)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve movie configuration: {str(e)}")

@router.put("/{movie_id}", response_model=MovieConfiguration)
async def update_movie_configuration(movie_id: str, movie_update: MovieConfigurationUpdate):
    """Update a movie configuration"""
    try:
        # Check if movie exists
        existing_movie = await find_document("movie_configurations", {"id": movie_id})
        if not existing_movie:
            raise HTTPException(status_code=404, detail="Movie configuration not found")
        
        # Update only provided fields
        update_dict = movie_update.dict(exclude_unset=True)
        
        success = await update_document("movie_configurations", {"id": movie_id}, update_dict)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update movie configuration")
        
        # Return updated movie
        updated_movie = await find_document("movie_configurations", {"id": movie_id})
        return MovieConfiguration(**updated_movie)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update movie configuration: {str(e)}")

@router.delete("/{movie_id}")
async def delete_movie_configuration(movie_id: str):
    """Delete a movie configuration"""
    try:
        success = await delete_document("movie_configurations", {"id": movie_id})
        if not success:
            raise HTTPException(status_code=404, detail="Movie configuration not found")
        
        return {"message": "Movie configuration deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete movie configuration: {str(e)}")

@router.post("/{movie_id}/theaters", response_model=TheaterLocation)
async def add_theater_to_movie(movie_id: str, theater: TheaterLocationCreate):
    """Add a theater location to a movie"""
    try:
        # Check if movie exists
        movie = await find_document("movie_configurations", {"id": movie_id})
        if not movie:
            raise HTTPException(status_code=404, detail="Movie configuration not found")
        
        # Create theater object
        theater_obj = TheaterLocation(**theater.dict())
        
        # Add theater to movie's theaters list
        movie["theaters"].append(theater_obj.dict())
        
        success = await update_document("movie_configurations", {"id": movie_id}, 
                                      {"theaters": movie["theaters"]})
        if not success:
            raise HTTPException(status_code=500, detail="Failed to add theater")
        
        return theater_obj
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add theater: {str(e)}")

@router.get("/{movie_id}/theaters", response_model=List[TheaterLocation])
async def get_movie_theaters(movie_id: str):
    """Get all theaters for a movie"""
    try:
        movie = await find_document("movie_configurations", {"id": movie_id})
        if not movie:
            raise HTTPException(status_code=404, detail="Movie configuration not found")
        
        theaters = movie.get("theaters", [])
        return [TheaterLocation(**theater) for theater in theaters]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve theaters: {str(e)}")

@router.get("/public/{movie_id}", response_model=MovieConfiguration)
async def get_public_movie_configuration(movie_id: str):
    """Get a movie configuration for public viewing (frontend)"""
    try:
        movie = await find_document("movie_configurations", {"id": movie_id, "is_active": True})
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found or inactive")
        
        return MovieConfiguration(**movie)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve movie: {str(e)}")

@router.get("/presets/", response_model=List[CustomizationPreset])
async def get_customization_presets(category: Optional[str] = Query(None)):
    """Get customization presets"""
    try:
        filter_dict = {"is_public": True}
        if category:
            filter_dict["category"] = category
        
        presets = await find_documents("customization_presets", filter_dict)
        return [CustomizationPreset(**preset) for preset in presets]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve presets: {str(e)}")

@router.post("/{movie_id}/categories")
async def add_screening_category_to_movie(movie_id: str, category_id: str):
    """Add a screening category to a movie"""
    try:
        # Check if movie exists
        movie = await find_document("movie_configurations", {"id": movie_id})
        if not movie:
            raise HTTPException(status_code=404, detail="Movie configuration not found")
        
        # Check if category exists
        category = await find_document("screening_categories", {"id": category_id})
        if not category:
            raise HTTPException(status_code=404, detail="Screening category not found")
        
        # Check if category is already added to movie
        movie_categories = movie.get("screening_categories", [])
        if any(cat.get("id") == category_id for cat in movie_categories):
            raise HTTPException(status_code=400, detail="Category already added to movie")
        
        # Add category to movie
        category_obj = ScreeningCategory(**category)
        movie_categories.append(category_obj.dict())
        
        success = await update_document("movie_configurations", {"id": movie_id}, 
                                      {"screening_categories": movie_categories})
        if not success:
            raise HTTPException(status_code=500, detail="Failed to add category to movie")
        
        return {"message": "Screening category added to movie successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add category to movie: {str(e)}")

@router.delete("/{movie_id}/categories/{category_id}")
async def remove_screening_category_from_movie(movie_id: str, category_id: str):
    """Remove a screening category from a movie"""
    try:
        # Check if movie exists
        movie = await find_document("movie_configurations", {"id": movie_id})
        if not movie:
            raise HTTPException(status_code=404, detail="Movie configuration not found")
        
        # Remove category from movie
        movie_categories = movie.get("screening_categories", [])
        updated_categories = [cat for cat in movie_categories if cat.get("id") != category_id]
        
        if len(updated_categories) == len(movie_categories):
            raise HTTPException(status_code=404, detail="Category not found in movie")
        
        success = await update_document("movie_configurations", {"id": movie_id}, 
                                      {"screening_categories": updated_categories})
        if not success:
            raise HTTPException(status_code=500, detail="Failed to remove category from movie")
        
        return {"message": "Screening category removed from movie successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove category from movie: {str(e)}")

@router.get("/{movie_id}/categories", response_model=List[ScreeningCategory])
async def get_movie_screening_categories(movie_id: str):
    """Get all screening categories for a movie"""
    try:
        movie = await find_document("movie_configurations", {"id": movie_id})
        if not movie:
            raise HTTPException(status_code=404, detail="Movie configuration not found")
        
        categories = movie.get("screening_categories", [])
        return [ScreeningCategory(**category) for category in categories]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve movie categories: {str(e)}")

@router.get("/{movie_id}/showtimes/categorized")
async def get_categorized_showtimes(
    movie_id: str,
    time_category: Optional[str] = Query(None, description="Filter by time category: morning, afternoon, evening, late_night"),
    screening_category: Optional[str] = Query(None, description="Filter by screening category name")
):
    """Get categorized showtimes for a movie with filtering options"""
    try:
        movie = await find_document("movie_configurations", {"id": movie_id})
        if not movie:
            raise HTTPException(status_code=404, detail="Movie configuration not found")
        
        theaters = movie.get("theaters", [])
        categorized_data = []
        
        for theater in theaters:
            theater_data = {
                "theater_id": theater.get("id"),
                "theater_name": theater.get("name"),
                "theater_address": theater.get("address"),
                "screening_formats": []
            }
            
            for format_info in theater.get("formats", []):
                format_data = {
                    "category_name": format_info.get("category_name", "Unknown"),
                    "category_id": format_info.get("category_id"),
                    "times_by_category": {
                        "morning": [],
                        "afternoon": [], 
                        "evening": [],
                        "late_night": []
                    }
                }
                
                # Filter by screening category if specified
                if screening_category and format_info.get("category_name") != screening_category:
                    continue
                
                # Categorize times
                for time_slot in format_info.get("times", []):
                    time_str = time_slot.get("time") if isinstance(time_slot, dict) else str(time_slot)
                    time_cat = categorize_time(time_str)
                    
                    # Filter by time category if specified
                    if time_category and time_cat != time_category:
                        continue
                    
                    time_info = {
                        "time": time_str,
                        "category": time_cat,
                        "available_seats": time_slot.get("available_seats") if isinstance(time_slot, dict) else None,
                        "price_modifier": time_slot.get("price_modifier", 1.0) if isinstance(time_slot, dict) else 1.0
                    }
                    
                    format_data["times_by_category"][time_cat].append(time_info)
                
                # Only include formats that have times after filtering
                if any(format_data["times_by_category"].values()):
                    theater_data["screening_formats"].append(format_data)
            
            # Only include theaters that have formats after filtering
            if theater_data["screening_formats"]:
                categorized_data.append(theater_data)
        
        return {
            "movie_id": movie_id,
            "movie_title": movie.get("movie_title"),
            "total_theaters": len(categorized_data),
            "theaters": categorized_data,
            "filters_applied": {
                "time_category": time_category,
                "screening_category": screening_category
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve categorized showtimes: {str(e)}")