from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List, Dict, Any
import os
from datetime import datetime
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None

database = Database()

async def get_database():
    return database.db

async def connect_to_mongo():
    """Create database connection"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        db_name = os.environ.get('DB_NAME', 'movie_saas')
        
        database.client = AsyncIOMotorClient(mongo_url)
        database.db = database.client[db_name]
        
        # Test the connection
        await database.client.admin.command('ping')
        logger.info("Connected to MongoDB successfully")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if database.client:
        database.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        db = database.db
        
        # Movie configurations indexes
        await db.movie_configurations.create_index("client_id")
        await db.movie_configurations.create_index("movie_title")
        await db.movie_configurations.create_index("is_active")
        await db.movie_configurations.create_index([("client_id", 1), ("is_active", 1)])
        
        # Clients indexes
        await db.clients.create_index("email", unique=True)
        await db.clients.create_index("is_active")
        
        # Theater locations indexes
        await db.theater_locations.create_index([("city", 1), ("state", 1)])
        await db.theater_locations.create_index("chain")
        
        # Image assets indexes
        await db.image_assets.create_index("category")
        await db.image_assets.create_index("uploaded_at")
        
        # Customization presets indexes
        await db.customization_presets.create_index("category")
        await db.customization_presets.create_index("is_public")
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")

# Helper functions for ObjectId conversion
def convert_object_id(data):
    """Convert ObjectId to string in MongoDB documents"""
    if isinstance(data, list):
        return [convert_object_id(item) for item in data]
    elif isinstance(data, dict):
        for key, value in data.items():
            if key == "_id" and isinstance(value, ObjectId):
                data[key] = str(value)
            elif isinstance(value, (dict, list)):
                data[key] = convert_object_id(value)
        return data
    return data

async def insert_document(collection: str, document: dict) -> str:
    """Insert a document and return its ID"""
    db = database.db
    result = await db[collection].insert_one(document)
    return str(result.inserted_id)

async def find_document(collection: str, filter_dict: dict) -> Optional[dict]:
    """Find a single document"""
    db = database.db
    document = await db[collection].find_one(filter_dict)
    if document:
        return convert_object_id(document)
    return None

async def find_documents(collection: str, filter_dict: dict = None, limit: int = 100) -> List[dict]:
    """Find multiple documents"""
    db = database.db
    if filter_dict is None:
        filter_dict = {}
    
    cursor = db[collection].find(filter_dict).limit(limit)
    documents = await cursor.to_list(length=limit)
    return [convert_object_id(doc) for doc in documents]

async def update_document(collection: str, filter_dict: dict, update_dict: dict) -> bool:
    """Update a document"""
    db = database.db
    update_dict["updated_at"] = datetime.utcnow()
    result = await db[collection].update_one(filter_dict, {"$set": update_dict})
    return result.modified_count > 0

async def delete_document(collection: str, filter_dict: dict) -> bool:
    """Delete a document"""
    db = database.db
    result = await db[collection].delete_one(filter_dict)
    return result.deleted_count > 0

async def count_documents(collection: str, filter_dict: dict = None) -> int:
    """Count documents in collection"""
    db = database.db
    if filter_dict is None:
        filter_dict = {}
    return await db[collection].count_documents(filter_dict)