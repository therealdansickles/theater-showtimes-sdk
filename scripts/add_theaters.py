#!/usr/bin/env python3

import requests
import json
import os
from datetime import datetime

# Get backend URL from environment  
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

def add_theaters_with_showtimes():
    """Add theaters with proper showtimes to the movie"""
    print("🎬 Adding theaters with showtimes...")
    
    # Get the first movie
    movies_response = requests.get(f"{API_BASE}/movies/?limit=1")
    if movies_response.status_code != 200 or not movies_response.json():
        print("❌ No movies found")
        return
    
    movie = movies_response.json()[0]
    movie_id = movie['id']
    
    # Get categories
    categories_response = requests.get(f"{API_BASE}/categories/")
    if categories_response.status_code != 200:
        print("❌ Failed to get categories")
        return
    
    categories = categories_response.json()
    
    # Find category IDs
    category_map = {cat['name']: cat['id'] for cat in categories}
    
    # Create theaters with showtimes
    theaters_data = [
        {
            "name": "Cinemark Downtown",
            "chain": "CINEMARK", 
            "address": "123 Main Street, Downtown, CA 90210",
            "city": "Los Angeles",
            "state": "CA", 
            "zip_code": "90210",
            "distance": 2.5,
            "formats": [
                {
                    "category_id": category_map.get('2D', 'default-2d'),
                    "category_name": "2D",
                    "times": [
                        {"time": "7:00 PM", "category": "evening"},
                        {"time": "9:30 PM", "category": "late_night"}
                    ]
                },
                {
                    "category_id": category_map.get('IMAX', 'default-imax'),
                    "category_name": "IMAX", 
                    "times": [
                        {"time": "6:00 PM", "category": "evening"},
                        {"time": "9:15 PM", "category": "late_night"}
                    ]
                }
            ]
        },
        {
            "name": "AMC Century Plaza",
            "chain": "AMC",
            "address": "456 Hollywood Blvd, Los Angeles, CA 90028", 
            "city": "Los Angeles",
            "state": "CA",
            "zip_code": "90028",
            "distance": 5.2,
            "formats": [
                {
                    "category_id": category_map.get('2D', 'default-2d'),
                    "category_name": "2D",
                    "times": [
                        {"time": "2:30 PM", "category": "afternoon"},
                        {"time": "5:15 PM", "category": "evening"},
                        {"time": "8:00 PM", "category": "evening"},
                        {"time": "10:45 PM", "category": "late_night"}
                    ]
                },
                {
                    "category_id": category_map.get('DOLBY ATMOS', 'default-dolby'),
                    "category_name": "DOLBY ATMOS",
                    "times": [
                        {"time": "4:00 PM", "category": "afternoon"},
                        {"time": "7:30 PM", "category": "evening"}
                    ]
                }
            ]
        },
        {
            "name": "Regal Westfield",
            "chain": "REGAL",
            "address": "789 Shopping Center Dr, Beverly Hills, CA 90210",
            "city": "Beverly Hills", 
            "state": "CA",
            "zip_code": "90210",
            "distance": 8.1,
            "formats": [
                {
                    "category_id": category_map.get('IMAX', 'default-imax'),
                    "category_name": "IMAX",
                    "times": [
                        {"time": "1:00 PM", "category": "afternoon"},
                        {"time": "4:30 PM", "category": "afternoon"},
                        {"time": "8:15 PM", "category": "evening"}
                    ]
                },
                {
                    "category_id": category_map.get('2D', 'default-2d'),
                    "category_name": "2D",
                    "times": [
                        {"time": "11:30 AM", "category": "morning"},
                        {"time": "3:00 PM", "category": "afternoon"},
                        {"time": "6:45 PM", "category": "evening"},
                        {"time": "9:30 PM", "category": "late_night"}
                    ]
                }
            ]
        }
    ]
    
    # Update the movie with theaters
    update_data = {
        "theaters": theaters_data
    }
    
    try:
        response = requests.put(f"{API_BASE}/movies/{movie_id}", json=update_data)
        if response.status_code == 200:
            print("✅ Successfully added theaters with showtimes!")
            
            # Verify the update
            verify_response = requests.get(f"{API_BASE}/movies/{movie_id}")
            if verify_response.status_code == 200:
                updated_movie = verify_response.json()
                theaters_count = len(updated_movie.get('theaters', []))
                print(f"🎭 Movie now has {theaters_count} theaters")
                
                for i, theater in enumerate(updated_movie.get('theaters', [])[:3], 1):
                    print(f"  Theater {i}: {theater.get('name', 'Unknown')}")
                    for format_data in theater.get('formats', []):
                        times = [t.get('time', 'N/A') for t in format_data.get('times', [])]
                        print(f"    {format_data.get('category_name', 'Unknown')}: {', '.join(times)}")
            else:
                print("❌ Failed to verify update")
        else:
            print(f"❌ Failed to update movie: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error updating movie: {str(e)}")

def main():
    print("🚀 Adding theaters with showtimes...")
    print("=" * 50)
    
    add_theaters_with_showtimes()
    
    print("\n" + "=" * 50)
    print("🎉 Theater setup complete!")

if __name__ == "__main__":
    main()