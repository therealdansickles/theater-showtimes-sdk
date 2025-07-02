#!/usr/bin/env python3

import requests
import json
import os
from datetime import datetime

BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

def final_cleanup():
    """Final comprehensive cleanup of all test categories"""
    print("🧹 Running FINAL test category cleanup...")
    
    # Get all categories
    response = requests.get(f"{API_BASE}/categories/")
    if response.status_code != 200:
        print(f"❌ Failed to get categories: {response.status_code}")
        return
    
    categories = response.json()
    
    # Find ALL categories that look like test data
    test_categories = []
    
    for cat in categories:
        cat_name = cat['name']
        # More aggressive cleanup - look for timestamp patterns
        if any(pattern in cat_name for pattern in [
            'Test Category',
            'test category', 
            'TEST CATEGORY',
            '202507',  # Any 2025 year date pattern
            '202506',
            '202505'
        ]):
            test_categories.append(cat)
    
    print(f"Found {len(test_categories)} test categories to delete:")
    for cat in test_categories:
        print(f"  - {cat['name']} (ID: {cat['id']})")
    
    if len(test_categories) == 0:
        print("✅ No test categories found!")
        return
    
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
                print(f"   Response: {delete_response.text}")
        except Exception as e:
            print(f"❌ Error deleting {category['name']}: {str(e)}")
    
    print(f"🎉 Successfully deleted {deleted_count} test categories")
    
    # Show final category list
    final_response = requests.get(f"{API_BASE}/categories/")
    if final_response.status_code == 200:
        final_categories = final_response.json()
        print(f"\n📋 Final clean category list ({len(final_categories)} categories):")
        for cat in final_categories:
            print(f"  • {cat['name']} ({cat['type']})")
    else:
        print("❌ Failed to get final categories list")

def fix_theater_data():
    """Replace test theaters with proper named theaters"""
    print("\n🎭 Replacing test theaters with proper theaters...")
    
    # Get the movie
    movies_response = requests.get(f"{API_BASE}/movies/?limit=1")
    if movies_response.status_code != 200 or not movies_response.json():
        print("❌ No movies found")
        return
    
    movie = movies_response.json()[0]
    movie_id = movie['id']
    
    # Get categories for proper IDs
    categories_response = requests.get(f"{API_BASE}/categories/")
    if categories_response.status_code != 200:
        print("❌ Failed to get categories")
        return
    
    categories = categories_response.json()
    category_map = {cat['name']: cat['id'] for cat in categories}
    
    # Create REAL theaters with proper names and showtimes
    theaters_data = [
        {
            "name": "AMC Century City",
            "chain": "AMC",
            "address": "10250 Santa Monica Blvd, Los Angeles, CA 90067",
            "city": "Los Angeles",
            "state": "CA",
            "zip_code": "90067",
            "distance": 2.5,
            "formats": [
                {
                    "category_id": category_map.get('2D', ''),
                    "category_name": "2D",
                    "times": [
                        {"time": "1:15 PM", "category": "afternoon"},
                        {"time": "4:30 PM", "category": "afternoon"},
                        {"time": "7:45 PM", "category": "evening"},
                        {"time": "10:20 PM", "category": "late_night"}
                    ]
                },
                {
                    "category_id": category_map.get('IMAX', ''),
                    "category_name": "IMAX",
                    "times": [
                        {"time": "2:00 PM", "category": "afternoon"},
                        {"time": "6:15 PM", "category": "evening"},
                        {"time": "9:30 PM", "category": "late_night"}
                    ]
                }
            ]
        },
        {
            "name": "Regal LA Live",
            "chain": "REGAL",
            "address": "1000 W Olympic Blvd, Los Angeles, CA 90015",
            "city": "Los Angeles",
            "state": "CA",
            "zip_code": "90015",
            "distance": 5.8,
            "formats": [
                {
                    "category_id": category_map.get('2D', ''),
                    "category_name": "2D",
                    "times": [
                        {"time": "12:30 PM", "category": "afternoon"},
                        {"time": "3:45 PM", "category": "afternoon"},
                        {"time": "7:00 PM", "category": "evening"},
                        {"time": "10:15 PM", "category": "late_night"}
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
            "name": "TCL Chinese Theatre",
            "chain": "TCL",
            "address": "6925 Hollywood Blvd, Hollywood, CA 90028",
            "city": "Hollywood",
            "state": "CA",
            "zip_code": "90028",
            "distance": 8.2,
            "formats": [
                {
                    "category_id": category_map.get('IMAX', ''),
                    "category_name": "IMAX",
                    "times": [
                        {"time": "1:00 PM", "category": "afternoon"},
                        {"time": "4:45 PM", "category": "afternoon"},
                        {"time": "8:30 PM", "category": "evening"}
                    ]
                },
                {
                    "category_id": category_map.get('Premium', ''),
                    "category_name": "Premium",
                    "times": [
                        {"time": "3:30 PM", "category": "afternoon"},
                        {"time": "6:45 PM", "category": "evening"}
                    ]
                }
            ]
        },
        {
            "name": "Cinemark Baldwin Hills",
            "chain": "CINEMARK",
            "address": "4020 Marlton Ave, Los Angeles, CA 90008",
            "city": "Los Angeles",
            "state": "CA",
            "zip_code": "90008",
            "distance": 12.1,
            "formats": [
                {
                    "category_id": category_map.get('2D', ''),
                    "category_name": "2D",
                    "times": [
                        {"time": "11:00 AM", "category": "morning"},
                        {"time": "2:15 PM", "category": "afternoon"},
                        {"time": "5:30 PM", "category": "evening"},
                        {"time": "8:45 PM", "category": "evening"}
                    ]
                },
                {
                    "category_id": category_map.get('4DX', ''),
                    "category_name": "4DX",
                    "times": [
                        {"time": "3:00 PM", "category": "afternoon"},
                        {"time": "6:30 PM", "category": "evening"}
                    ]
                }
            ]
        }
    ]
    
    # Clear existing and add new theaters
    update_data = {"theaters": theaters_data}
    
    try:
        response = requests.put(f"{API_BASE}/movies/{movie_id}", json=update_data)
        if response.status_code == 200:
            print("✅ Successfully replaced with real theaters!")
            
            # Verify
            verify_response = requests.get(f"{API_BASE}/movies/{movie_id}")
            if verify_response.status_code == 200:
                updated_movie = verify_response.json()
                theaters = updated_movie.get('theaters', [])
                print(f"🎭 Movie now has {len(theaters)} real theaters:")
                
                for i, theater in enumerate(theaters, 1):
                    print(f"  {i}. {theater.get('name', 'Unknown')} ({theater.get('distance', 0)} miles)")
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
    print("🚀 FINAL CLEANUP AND REAL THEATER SETUP")
    print("=" * 60)
    
    # Step 1: Final category cleanup
    final_cleanup()
    
    # Step 2: Replace test theaters with real ones
    fix_theater_data()
    
    print("\n" + "=" * 60)
    print("🎉 FINAL CLEANUP COMPLETE!")
    print("📱 The movie booking page should now be production-ready")
    print("   with clean categories and real theater data!")

if __name__ == "__main__":
    main()