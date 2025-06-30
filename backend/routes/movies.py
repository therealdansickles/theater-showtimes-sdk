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