#!/usr/bin/env python3
"""
Video Gallery Feature Testing for LITEBEEM THEATER SHOWTIMES SDK
This script tests the video_gallery field in the FilmAssets model
"""

import requests
import json
import uuid
from datetime import datetime

# Configuration
API_BASE_URL = "https://8e9107a9-01e3-4da8-a758-3c9227c9c896.preview.emergentagent.com/api"

class VideoGalleryTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.client_id = None
        self.movie_id = None
        self.video_urls = [
            "https://example.com/videos/trailer1.mp4",
            "https://example.com/videos/behind_scenes.mp4",
            "https://example.com/videos/interview.mp4"
        ]
        
    def run_test(self, name, func, *args, **kwargs):
        """Run a test and record results"""
        self.tests_run += 1
        print(f"\n🔍 Testing: {name}")
        
        try:
            result = func(*args, **kwargs)
            if result:
                self.tests_passed += 1
                status = "✅ PASSED"
            else:
                status = "❌ FAILED"
                
            self.test_results.append({
                "name": name,
                "status": status,
                "details": result if isinstance(result, dict) else None
            })
            
            print(f"{status}: {name}")
            return result
        except Exception as e:
            self.test_results.append({
                "name": name,
                "status": "❌ ERROR",
                "details": str(e)
            })
            print(f"❌ ERROR: {name} - {str(e)}")
            return False
    
    def make_request(self, method, endpoint, data=None, headers=None, expected_status=None):
        """Make an HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        
        if headers is None:
            headers = {}
            
        # Add content type for POST/PUT requests
        if method in ["POST", "PUT"] and "Content-Type" not in headers:
            headers["Content-Type"] = "application/json"
            
        # Make the request
        try:
            if method == "GET":
                response = requests.get(url, headers=headers)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            # Check status code if expected
            if expected_status and response.status_code != expected_status:
                print(f"Expected status {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, None
                
            # Try to parse JSON response
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}
                
            return True, response_data
        except Exception as e:
            print(f"Request error: {str(e)}")
            return False, None
    
    # 1. Test creating a movie with video_gallery
    def test_create_movie_with_video_gallery(self):
        """Test creating a movie configuration with video_gallery array"""
        # Create a test client ID
        self.client_id = str(uuid.uuid4())
        
        # Create a movie with video gallery
        movie_data = {
            "client_id": self.client_id,
            "movie_title": "Test Movie with Video Gallery",
            "movie_subtitle": "A Test of Video Gallery Feature",
            "description": "This is a test movie with video gallery",
            "release_date": datetime.now().isoformat(),
            "director": "Test Director",
            "cast": ["Actor 1", "Actor 2"],
            "film_details": {
                "synopsis": "A comprehensive test of the video gallery feature",
                "logline": "Testing video gallery in film assets",
                "festival_selections": ["Test Festival 2025", "Another Festival"]
            },
            "film_assets": {
                "poster_image": "/uploads/test_poster.jpg",
                "video_gallery": self.video_urls
            },
            "social_links": {
                "instagram": "test_movie",
                "twitter": "test_movie",
                "website": "www.testmovie.com"
            }
        }
        
        success, response = self.make_request(
            "POST",
            "movies",
            data=movie_data,
            expected_status=200
        )
        
        if success and "id" in response:
            self.movie_id = response["id"]
            # Verify video_gallery is in the response
            has_video_gallery = "film_assets" in response and "video_gallery" in response["film_assets"]
            video_count = len(response["film_assets"]["video_gallery"]) if has_video_gallery else 0
            
            return {
                "movie_created": True, 
                "movie_id": self.movie_id,
                "has_video_gallery": has_video_gallery,
                "video_count": video_count,
                "video_gallery_match": set(response["film_assets"]["video_gallery"]) == set(self.video_urls) if has_video_gallery else False
            }
        return False
    
    # 2. Test retrieving a movie with video_gallery
    def test_get_movie_with_video_gallery(self):
        """Test retrieving a movie configuration with video_gallery"""
        if not self.movie_id:
            # Try to get an existing movie
            success, response = self.make_request(
                "GET",
                "movies",
                expected_status=200
            )
            
            if success and isinstance(response, list) and len(response) > 0:
                self.movie_id = response[0]["id"]
            else:
                return {"error": "No movie ID available for testing"}
        
        success, response = self.make_request(
            "GET",
            f"movies/{self.movie_id}",
            expected_status=200
        )
        
        if success and "id" in response:
            # Verify video_gallery is in the response
            has_video_gallery = "film_assets" in response and "video_gallery" in response["film_assets"]
            video_count = len(response["film_assets"]["video_gallery"]) if has_video_gallery else 0
            
            return {
                "movie_retrieved": True,
                "has_video_gallery": has_video_gallery,
                "video_count": video_count,
                "video_gallery_match": set(response["film_assets"]["video_gallery"]) == set(self.video_urls) if has_video_gallery else False
            }
        return False
    
    # 3. Test updating a movie's video_gallery
    def test_update_movie_video_gallery(self):
        """Test updating a movie's video_gallery"""
        if not self.movie_id:
            return {"error": "No movie ID available for testing"}
        
        # Update with a subset of videos
        update_data = {
            "film_assets": {
                "video_gallery": [self.video_urls[0]]  # Just one video
            }
        }
        
        success, response = self.make_request(
            "PUT",
            f"movies/{self.movie_id}",
            data=update_data,
            expected_status=200
        )
        
        if success and "id" in response:
            # Verify video_gallery was updated
            has_video_gallery = "film_assets" in response and "video_gallery" in response["film_assets"]
            video_count = len(response["film_assets"]["video_gallery"]) if has_video_gallery else 0
            
            return {
                "movie_updated": True,
                "has_video_gallery": has_video_gallery,
                "video_count": video_count,
                "video_gallery_updated": (video_count == 1 and 
                                        self.video_urls[0] in response["film_assets"]["video_gallery"]) if has_video_gallery else False
            }
        return False
    
    # 4. Test JSON serialization of video_gallery
    def test_video_gallery_json_serialization(self):
        """Test proper JSON serialization of video_gallery field"""
        if not self.movie_id:
            return {"error": "No movie ID available for testing"}
            
        success, response = self.make_request(
            "GET",
            f"movies/{self.movie_id}",
            expected_status=200
        )
        
        if success and "id" in response:
            # Convert response to JSON string and back to verify serialization
            json_str = json.dumps(response)
            parsed_response = json.loads(json_str)
            
            # Check if video_gallery is properly serialized
            has_video_gallery = ("film_assets" in parsed_response and 
                               "video_gallery" in parsed_response["film_assets"] and 
                               isinstance(parsed_response["film_assets"]["video_gallery"], list))
            
            # Check if all URLs in video_gallery are strings
            all_strings = all(isinstance(url, str) for url in parsed_response["film_assets"]["video_gallery"]) if has_video_gallery else False
            
            return {
                "serialization_test": True,
                "has_video_gallery": has_video_gallery,
                "all_urls_are_strings": all_strings,
                "video_count": len(parsed_response["film_assets"]["video_gallery"]) if has_video_gallery else 0
            }
        return False
    
    # 5. Test public movie endpoint with video_gallery
    def test_public_movie_endpoint(self):
        """Test the public movie endpoint with video_gallery"""
        if not self.movie_id:
            return {"error": "No movie ID available for testing"}
        
        success, response = self.make_request(
            "GET",
            f"movies/public/{self.movie_id}",
            expected_status=200
        )
        
        if success and "id" in response:
            # Verify video_gallery is in the response
            has_video_gallery = "film_assets" in response and "video_gallery" in response["film_assets"]
            
            return {
                "public_endpoint_working": True,
                "has_video_gallery": has_video_gallery,
                "film_details_included": "film_details" in response,
                "social_links_included": "social_links" in response
            }
        return False
    
    def run_all_tests(self):
        """Run all video gallery tests"""
        print("🎬 Starting Video Gallery Feature Testing")
        
        # 1. Enhanced FilmAssets Model Testing
        print("\n== Video Gallery Feature Testing ==")
        self.run_test("Create Movie with Video Gallery", self.test_create_movie_with_video_gallery)
        self.run_test("Get Movie with Video Gallery", self.test_get_movie_with_video_gallery)
        self.run_test("Update Movie Video Gallery", self.test_update_movie_video_gallery)
        self.run_test("Video Gallery JSON Serialization", self.test_video_gallery_json_serialization)
        self.run_test("Public Movie Endpoint with Video Gallery", self.test_public_movie_endpoint)
        
        # Print summary
        print(f"\n📊 Tests passed: {self.tests_passed}/{self.tests_run} ({self.tests_passed/self.tests_run*100:.1f}%)")
        
        return self.test_results

if __name__ == "__main__":
    # Run the video gallery tests
    print("\n===== VIDEO GALLERY FEATURE TESTING =====\n")
    tester = VideoGalleryTester(API_BASE_URL)
    results = tester.run_all_tests()
    
    # Save results to file
    with open("video_gallery_test_results.json", "w") as f:
        json.dump(results, f, indent=2)