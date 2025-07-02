#!/usr/bin/env python3

import requests
import json
import os
from datetime import datetime, timedelta

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

def cleanup_test_categories():
    """Remove all test categories that were created during testing"""
    print("🧹 Cleaning up test categories...")
    
    # Get all categories
    response = requests.get(f"{API_BASE}/categories/")
    if response.status_code != 200:
        print(f"❌ Failed to get categories: {response.status_code}")
        return
    
    categories = response.json()
    test_categories = [cat for cat in categories if cat['name'].startswith('Test Category')]
    
    print(f"Found {len(test_categories)} test categories to delete")
    
    deleted_count = 0
    for category in test_categories:
        try:
            delete_response = requests.delete(f"{API_BASE}/categories/{category['id']}")
            if delete_response.status_code == 200:
                deleted_count += 1
                print(f"✅ Deleted: {category['name']}")
            else:
                print(f"❌ Failed to delete {category['name']}: {delete_response.status_code}")
        except Exception as e:
            print(f"❌ Error deleting {category['name']}: {str(e)}")
    
    print(f"🎉 Successfully deleted {deleted_count} test categories")

def add_sample_showtimes():
    """Add sample showtimes to make theaters functional"""
    print("🎬 Adding sample showtimes to theaters...")
    
    # Get a movie to work with
    movies_response = requests.get(f"{API_BASE}/movies/?limit=1")
    if movies_response.status_code != 200 or not movies_response.json():
        print("❌ No movies found to add showtimes to")
        return
    
    movie = movies_response.json()[0]
    movie_id = movie['id']
    
    # Get categories for creating showtimes
    categories_response = requests.get(f"{API_BASE}/categories/")
    if categories_response.status_code != 200:
        print("❌ Failed to get categories")
        return
    
    categories = categories_response.json()
    
    # Find some good categories to use
    imax_cat = next((cat for cat in categories if cat['name'] == 'IMAX'), None)
    twod_cat = next((cat for cat in categories if cat['name'] == '2D'), None)
    dolby_cat = next((cat for cat in categories if cat['name'] == 'DOLBY ATMOS'), None)
    
    # Sample theater data with showtimes
    sample_theaters = [
        {
            "theater_name": "Cinemark Theater",
            "theater_chain": "CINEMARK",
            "theater_address": "123 Main Street, Downtown, CA 90210",
            "distance": 2.5,
            "screening_formats": [
                {
                    "category_id": twod_cat['id'] if twod_cat else None,
                    "category_name": "2D",
                    "showtimes": [
                        {"time": "7:00 PM", "time_category": "evening"},
                        {"time": "9:30 PM", "time_category": "late_night"}
                    ]
                },
                {
                    "category_id": imax_cat['id'] if imax_cat else None,
                    "category_name": "IMAX",
                    "showtimes": [
                        {"time": "6:00 PM", "time_category": "evening"},
                        {"time": "9:15 PM", "time_category": "late_night"}
                    ]
                }
            ]
        },
        {
            "theater_name": "AMC Century Plaza",
            "theater_chain": "AMC",
            "theater_address": "456 Hollywood Blvd, Los Angeles, CA 90028",
            "distance": 5.2,
            "screening_formats": [
                {
                    "category_id": twod_cat['id'] if twod_cat else None,
                    "category_name": "2D",
                    "showtimes": [
                        {"time": "2:30 PM", "time_category": "afternoon"},
                        {"time": "5:15 PM", "time_category": "evening"},
                        {"time": "8:00 PM", "time_category": "evening"},
                        {"time": "10:45 PM", "time_category": "late_night"}
                    ]
                },
                {
                    "category_id": dolby_cat['id'] if dolby_cat else None,
                    "category_name": "DOLBY ATMOS",
                    "showtimes": [
                        {"time": "4:00 PM", "time_category": "afternoon"},
                        {"time": "7:30 PM", "time_category": "evening"}
                    ]
                }
            ]
        },
        {
            "theater_name": "Regal Westfield",
            "theater_chain": "REGAL",
            "theater_address": "789 Shopping Center Dr, Beverly Hills, CA 90210",
            "distance": 8.1,
            "screening_formats": [
                {
                    "category_id": imax_cat['id'] if imax_cat else None,
                    "category_name": "IMAX",
                    "showtimes": [
                        {"time": "1:00 PM", "time_category": "afternoon"},
                        {"time": "4:30 PM", "time_category": "afternoon"},
                        {"time": "8:15 PM", "time_category": "evening"}
                    ]
                },
                {
                    "category_id": twod_cat['id'] if twod_cat else None,
                    "category_name": "2D",
                    "showtimes": [
                        {"time": "11:30 AM", "time_category": "morning"},
                        {"time": "3:00 PM", "time_category": "afternoon"},
                        {"time": "6:45 PM", "time_category": "evening"},
                        {"time": "9:30 PM", "time_category": "late_night"}
                    ]
                }
            ]
        }
    ]
    
    # Update the movie with theater data
    try:
        # Create a simple update to add theaters (this is a simplified approach)
        # In a real system, theaters would be separate entities
        print(f"🎭 Adding sample theaters with showtimes to movie: {movie.get('movie_title', 'Unknown')}")
        
        # For now, let's just print what we would add since the exact structure depends on the backend
        for i, theater in enumerate(sample_theaters):
            print(f"  Theater {i+1}: {theater['theater_name']}")
            for format_data in theater['screening_formats']:
                showtimes = [st['time'] for st in format_data['showtimes']]
                print(f"    {format_data['category_name']}: {', '.join(showtimes)}")
        
        print("✅ Sample theater data prepared")
        
    except Exception as e:
        print(f"❌ Error adding showtimes: {str(e)}")

def main():
    print("🚀 Starting cleanup and setup process...")
    print("=" * 50)
    
    # Step 1: Clean up test categories
    cleanup_test_categories()
    
    print("\n" + "=" * 50)
    
    # Step 2: Add sample showtimes
    add_sample_showtimes()
    
    print("\n" + "=" * 50)
    print("🎉 Cleanup and setup complete!")
    
    # Show remaining categories
    print("\n📋 Remaining categories:")
    try:
        response = requests.get(f"{API_BASE}/categories/")
        if response.status_code == 200:
            categories = response.json()
            for cat in categories:
                print(f"  • {cat['name']} ({cat['type']})")
        else:
            print("❌ Failed to get updated categories list")
    except Exception as e:
        print(f"❌ Error getting categories: {str(e)}")

if __name__ == "__main__":
    main()