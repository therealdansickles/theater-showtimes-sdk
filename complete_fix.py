#!/usr/bin/env python3

import requests
import json
import os

BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

def complete_cleanup():
    """Complete cleanup of all test categories"""
    print("🧹 Running complete test category cleanup...")
    
    # Get all categories
    response = requests.get(f"{API_BASE}/categories/")
    if response.status_code != 200:
        print(f"❌ Failed to get categories: {response.status_code}")
        return
    
    categories = response.json()
    
    # Find ALL test categories (more comprehensive patterns)
    test_patterns = ['Test Category', 'test category', 'Test', 'TEST']
    test_categories = []
    
    for cat in categories:
        cat_name = cat['name']
        if any(pattern in cat_name for pattern in test_patterns):
            # Skip if it's a legitimate category that just happens to contain "test" 
            if cat_name not in ['Test Theater', 'Premium Test Screening']:  # Add legitimate exceptions
                test_categories.append(cat)
    
    print(f"Found {len(test_categories)} test categories to delete:")
    for cat in test_categories:
        print(f"  - {cat['name']}")
    
    # Delete them
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
    
    # Show final category list
    final_response = requests.get(f"{API_BASE}/categories/")
    if final_response.status_code == 200:
        final_categories = final_response.json()
        print(f"\n📋 Final category list ({len(final_categories)} categories):")
        for cat in final_categories:
            print(f"  • {cat['name']} ({cat['type']})")

def fix_theater_showtimes():
    """Fix the theater showtime display issue"""
    print("\n🎬 Fixing theater showtimes...")
    
    # Get the movie
    movies_response = requests.get(f"{API_BASE}/movies/?limit=1")
    if movies_response.status_code != 200 or not movies_response.json():
        print("❌ No movies found")
        return
    
    movie = movies_response.json()[0]
    movie_id = movie['id']
    
    print(f"🎭 Working with movie: {movie.get('movie_title', 'Unknown')}")
    
    # Clear existing theaters and add new ones with proper structure
    clear_data = {"theaters": []}
    clear_response = requests.put(f"{API_BASE}/movies/{movie_id}", json=clear_data)
    
    if clear_response.status_code == 200:
        print("✅ Cleared existing theaters")
    else:
        print(f"❌ Failed to clear theaters: {clear_response.status_code}")
        return
    
    # Get categories for proper IDs
    categories_response = requests.get(f"{API_BASE}/categories/")
    if categories_response.status_code != 200:
        print("❌ Failed to get categories")
        return
    
    categories = categories_response.json()
    category_map = {cat['name']: cat['id'] for cat in categories}
    
    # Create theaters with proper showtime structure
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
                    "category_id": category_map.get('2D', ''),
                    "category_name": "2D",
                    "times": [
                        {"time": "7:00 PM", "category": "evening"},
                        {"time": "9:30 PM", "category": "late_night"}
                    ]
                },
                {
                    "category_id": category_map.get('IMAX', ''),
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
                    "category_id": category_map.get('2D', ''),
                    "category_name": "2D",
                    "times": [
                        {"time": "2:30 PM", "category": "afternoon"},
                        {"time": "5:15 PM", "category": "evening"},
                        {"time": "8:00 PM", "category": "evening"},
                        {"time": "10:45 PM", "category": "late_night"}
                    ]
                },
                {
                    "category_id": category_map.get('DOLBY ATMOS', ''),
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
                    "category_id": category_map.get('IMAX', ''),
                    "category_name": "IMAX",
                    "times": [
                        {"time": "1:00 PM", "category": "afternoon"},
                        {"time": "4:30 PM", "category": "afternoon"},
                        {"time": "8:15 PM", "category": "evening"}
                    ]
                },
                {
                    "category_id": category_map.get('2D', ''),
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
    
    # Add the new theaters
    update_data = {"theaters": theaters_data}
    
    try:
        response = requests.put(f"{API_BASE}/movies/{movie_id}", json=update_data)
        if response.status_code == 200:
            print("✅ Successfully added theaters with showtimes!")
            
            # Verify
            verify_response = requests.get(f"{API_BASE}/movies/{movie_id}")
            if verify_response.status_code == 200:
                updated_movie = verify_response.json()
                theaters = updated_movie.get('theaters', [])
                print(f"🎭 Movie now has {len(theaters)} theaters:")
                
                for i, theater in enumerate(theaters, 1):
                    print(f"  {i}. {theater.get('name', 'Unknown')}")
                    for format_data in theater.get('formats', []):
                        times = [t.get('time', 'N/A') for t in format_data.get('times', [])]
                        print(f"     {format_data.get('category_name', 'Unknown')}: {', '.join(times)}")
            else:
                print("❌ Failed to verify update")
        else:
            print(f"❌ Failed to update movie: {response.status_code}")
            if response.text:
                print(f"Response: {response.text[:500]}")
    except Exception as e:
        print(f"❌ Error updating movie: {str(e)}")

def main():
    print("🚀 Running complete cleanup and fix...")
    print("=" * 60)
    
    # Step 1: Complete category cleanup
    complete_cleanup()
    
    # Step 2: Fix theater showtimes
    fix_theater_showtimes()
    
    print("\n" + "=" * 60)
    print("🎉 Cleanup and fix complete!")

if __name__ == "__main__":
    main()