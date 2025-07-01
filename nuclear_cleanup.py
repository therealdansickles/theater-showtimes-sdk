#!/usr/bin/env python3

import requests
import json
import os
import time

BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

def nuclear_cleanup():
    """Nuclear option: delete ALL test data and start fresh"""
    print("☢️  NUCLEAR CLEANUP - Removing ALL test data...")
    
    # Step 1: Delete ALL categories that look like test data
    print("\n🗑️  Deleting ALL test categories...")
    
    for attempt in range(3):  # Try multiple times
        response = requests.get(f"{API_BASE}/categories/")
        if response.status_code != 200:
            print(f"❌ Failed to get categories: {response.status_code}")
            continue
        
        categories = response.json()
        test_categories = [cat for cat in categories if 
                          'Test' in cat['name'] or 
                          'test' in cat['name'] or 
                          '202507' in cat['name'] or
                          '202506' in cat['name']]
        
        if not test_categories:
            print("✅ No more test categories found!")
            break
            
        print(f"Attempt {attempt + 1}: Found {len(test_categories)} test categories")
        
        for cat in test_categories:
            try:
                delete_response = requests.delete(f"{API_BASE}/categories/{cat['id']}")
                if delete_response.status_code == 200:
                    print(f"✅ Deleted: {cat['name']}")
                else:
                    print(f"❌ Failed to delete {cat['name']}: {delete_response.status_code}")
            except Exception as e:
                print(f"❌ Error deleting {cat['name']}: {str(e)}")
        
        time.sleep(1)  # Wait between attempts
    
    # Step 2: Get movie and clear ALL theaters
    print("\n🎭 Clearing ALL theaters...")
    
    movies_response = requests.get(f"{API_BASE}/movies/?limit=1")
    if movies_response.status_code != 200 or not movies_response.json():
        print("❌ No movies found")
        return
    
    movie = movies_response.json()[0]
    movie_id = movie['id']
    
    # Clear theaters completely
    clear_data = {
        "theaters": [],
        "screening_categories": []
    }
    
    clear_response = requests.put(f"{API_BASE}/movies/{movie_id}", json=clear_data)
    if clear_response.status_code == 200:
        print("✅ Cleared all theaters and screening categories")
    else:
        print(f"❌ Failed to clear: {clear_response.status_code}")
    
    # Step 3: Verify cleanup
    print("\n🔍 Verifying cleanup...")
    
    # Check categories
    final_cats_response = requests.get(f"{API_BASE}/categories/")
    if final_cats_response.status_code == 200:
        final_cats = final_cats_response.json()
        remaining_test_cats = [cat for cat in final_cats if 'Test' in cat['name'] or 'test' in cat['name']]
        
        if remaining_test_cats:
            print(f"⚠️  {len(remaining_test_cats)} test categories still remain:")
            for cat in remaining_test_cats:
                print(f"   - {cat['name']}")
        else:
            print("✅ All test categories removed!")
            print(f"📋 Clean categories ({len(final_cats)}):")
            for cat in final_cats:
                print(f"   • {cat['name']} ({cat['type']})")
    
    # Check movie theaters
    verify_response = requests.get(f"{API_BASE}/movies/{movie_id}")
    if verify_response.status_code == 200:
        movie_data = verify_response.json()
        theaters = movie_data.get('theaters', [])
        print(f"🎭 Movie has {len(theaters)} theaters")
        if len(theaters) == 0:
            print("✅ All theaters cleared - frontend will use mock data")
    
    print("\n" + "=" * 60)
    print("☢️  NUCLEAR CLEANUP COMPLETE!")
    print("🔄 Frontend should now use clean mock data")

def add_clean_mock_override():
    """Ensure frontend uses clean mock data"""
    print("\n🔧 Ensuring frontend uses clean mock data...")
    
    # The frontend should automatically fall back to mock data when no API theaters are returned
    # Let's verify the mock data exists in the frontend
    
    try:
        with open('/app/frontend/src/App.js', 'r') as f:
            content = f.read()
        
        if 'mockTheaters' in content:
            print("✅ Mock theaters found in frontend")
        else:
            print("❌ Mock theaters not found in frontend")
    except Exception as e:
        print(f"❌ Error checking frontend: {str(e)}")

def main():
    print("☢️  NUCLEAR CLEANUP PROTOCOL")
    print("=" * 60)
    print("⚠️  WARNING: This will delete ALL test data!")
    print("=" * 60)
    
    nuclear_cleanup()
    add_clean_mock_override()
    
    print("\n" + "=" * 60)
    print("🎉 CLEANUP COMPLETE!")
    print("📱 Please restart frontend and test again")

if __name__ == "__main__":
    main()