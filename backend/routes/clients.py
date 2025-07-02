from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime

from ..models import Client, ClientCreate
from ..database import (
    get_database, insert_document, find_document, find_documents,
    update_document, delete_document, count_documents
)
from ..security import get_admin_user, validate_string_input, validate_email_format

router = APIRouter(prefix="/clients", tags=["clients"])

@router.post("/", response_model=Client, dependencies=[Depends(get_admin_user)])
async def create_client(client_data: ClientCreate, current_user: dict = Depends(get_admin_user)):
    """Create a new client (admin only)"""
    try:
        # Validate input
        client_data.name = validate_string_input(client_data.name, 100, 1)
        client_data.email = validate_email_format(client_data.email)
        client_data.company = validate_string_input(client_data.company, 100, 1)
        
        # Check if email already exists
        existing_client = await find_document("clients", {"email": client_data.email})
        if existing_client:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Set subscription limits based on tier
        max_movies = 1
        max_images = 10
        max_theaters = 50
        
        if client_data.subscription_tier == "premium":
            max_movies = 5
            max_images = 50
            max_theaters = 200
        elif client_data.subscription_tier == "enterprise":
            max_movies = 50
            max_images = 500
            max_theaters = 1000
        
        client_dict = client_data.dict()
        client_dict.update({
            "max_movies": max_movies,
            "max_images": max_images,
            "max_theaters": max_theaters
        })
        
        client_obj = Client(**client_dict)
        await insert_document("clients", client_obj.dict())
        
        return client_obj
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create client: {str(e)}")

@router.get("/", response_model=List[Client])
async def get_clients(
    is_active: Optional[bool] = None,
    subscription_tier: Optional[str] = None,
    limit: int = 50
):
    """Get all clients with optional filtering"""
    try:
        filter_dict = {}
        if is_active is not None:
            filter_dict["is_active"] = is_active
        if subscription_tier:
            filter_dict["subscription_tier"] = subscription_tier
        
        clients = await find_documents("clients", filter_dict, limit)
        return [Client(**client) for client in clients]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve clients: {str(e)}")

@router.get("/{client_id}", response_model=Client)
async def get_client(client_id: str):
    """Get a specific client"""
    try:
        client = await find_document("clients", {"id": client_id})
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        return Client(**client)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve client: {str(e)}")

@router.put("/{client_id}", response_model=Client)
async def update_client(client_id: str, client_update: dict):
    """Update a client"""
    try:
        # Check if client exists
        existing_client = await find_document("clients", {"id": client_id})
        if not existing_client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Update subscription limits if tier changed
        if "subscription_tier" in client_update:
            tier = client_update["subscription_tier"]
            if tier == "basic":
                client_update.update({"max_movies": 1, "max_images": 10, "max_theaters": 50})
            elif tier == "premium":
                client_update.update({"max_movies": 5, "max_images": 50, "max_theaters": 200})
            elif tier == "enterprise":
                client_update.update({"max_movies": 50, "max_images": 500, "max_theaters": 1000})
        
        success = await update_document("clients", {"id": client_id}, client_update)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update client")
        
        # Return updated client
        updated_client = await find_document("clients", {"id": client_id})
        return Client(**updated_client)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update client: {str(e)}")

@router.delete("/{client_id}")
async def delete_client(client_id: str):
    """Delete a client"""
    try:
        # Check if client has active movies
        active_movies = await count_documents("movie_configurations", 
                                            {"client_id": client_id, "is_active": True})
        if active_movies > 0:
            raise HTTPException(status_code=400, 
                              detail="Cannot delete client with active movie configurations")
        
        success = await delete_document("clients", {"id": client_id})
        if not success:
            raise HTTPException(status_code=404, detail="Client not found")
        
        return {"message": "Client deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete client: {str(e)}")

@router.get("/{client_id}/statistics")
async def get_client_statistics(client_id: str):
    """Get client usage statistics"""
    try:
        client = await find_document("clients", {"id": client_id})
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Count active movies
        active_movies = await count_documents("movie_configurations", 
                                            {"client_id": client_id, "is_active": True})
        
        # Count total movies
        total_movies = await count_documents("movie_configurations", 
                                           {"client_id": client_id})
        
        # Count images
        total_images = await count_documents("image_assets", 
                                           {"client_id": client_id})
        
        return {
            "client_id": client_id,
            "active_movies": active_movies,
            "total_movies": total_movies,
            "total_images": total_images,
            "limits": {
                "max_movies": client.get("max_movies", 1),
                "max_images": client.get("max_images", 10),
                "max_theaters": client.get("max_theaters", 50)
            },
            "usage_percentage": {
                "movies": (active_movies / client.get("max_movies", 1)) * 100,
                "images": (total_images / client.get("max_images", 10)) * 100
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve statistics: {str(e)}")