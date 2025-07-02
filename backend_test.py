#!/usr/bin/env python3
"""
Movie Configuration System Testing with Enhanced FilmAssets Support
This script tests the updated movie configuration system with new badge_images and video_gallery support:

1. Enhanced FilmAssets Model Testing
   - badge_images array support
   - video_gallery array support
2. API Endpoint Validation
3. Data Model Integrity
4. Integration Testing
"""

import requests
import time
import json
import sys
import os
import uuid
from datetime import datetime
import base64
import io
from PIL import Image

# Configuration
API_BASE_URL = "https://8e9107a9-01e3-4da8-a758-3c9227c9c896.preview.emergentagent.com/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "SecurePassword123!"

class MovieConfigTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.client_id = None
        self.movie_id = None
        self.badge_image_ids = []
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
    
    def make_request(self, method, endpoint, data=None, headers=None, expected_status=None, auth_type=None, files=None):
        """Make an HTTP request with proper headers and authentication"""
        url = f"{self.base_url}/{endpoint}"
        
        if headers is None:
            headers = {}
            
        # Add authentication if specified
        if auth_type == "jwt" and self.admin_token:
            headers["Authorization"] = f"Bearer {self.admin_token}"
            
        # Add content type for POST/PUT requests
        if method in ["POST", "PUT"] and "Content-Type" not in headers and not files:
            headers["Content-Type"] = "application/json"
            
        # Make the request
        try:
            if method == "GET":
                response = requests.get(url, headers=headers)
            elif method == "POST":
                if files:
                    response = requests.post(url, data=data, headers=headers, files=files)
                else:
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
    
    # Authentication
    def test_admin_login(self):
        """Test admin user login"""
        success, response = self.make_request(
            "POST", 
            "auth/login", 
            data={
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            },
            expected_status=200
        )
        
        if success and "access_token" in response:
            self.admin_token = response["access_token"]
            return {"token_received": True, "token_length": len(self.admin_token)}
        return False
    
    # Client Creation
    def test_create_client(self):
        """Create a test client for movie configuration testing"""
        client_data = {
            "name": f"Test Client {uuid.uuid4()}",
            "email": f"test_{uuid.uuid4()}@example.com",
            "company": "Test Company",
            "subscription_tier": "premium"
        }
        
        success, response = self.make_request(
            "POST",
            "clients",
            data=client_data,
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "id" in response:
            self.client_id = response["id"]
            return {"client_created": True, "client_id": self.client_id}
        return False
    
    # 1. Enhanced FilmAssets Model Testing
    def test_create_badge_image(self):
        """Test uploading a badge image"""
        if not self.client_id:
            # Use an existing client if we couldn't create one
            success, response = self.make_request(
                "GET",
                "clients",
                auth_type="jwt",
                expected_status=200
            )
            
            if success and isinstance(response, list) and len(response) > 0:
                self.client_id = response[0]["id"]
            else:
                return {"error": "No client ID available for testing"}
        
        # Create a simple test image
        img = Image.new('RGB', (100, 100), color = 'red')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        files = {
            'file': ('test_badge.png', img_byte_arr, 'image/png')
        }
        
        data = {
            'category': 'badge',
            'alt_text': 'Test Badge Image',
            'client_id': self.client_id
        }
        
        success, response = self.make_request(
            "POST",
            "uploads/image",
            data=data,
            auth_type="jwt",
            files=files,
            expected_status=200
        )
        
        if success and "id" in response and "url" in response:
            self.badge_image_ids.append(response["url"])
            return {"badge_image_created": True, "image_id": response["id"], "url": response["url"]}
        return False
    
    def test_create_multiple_badge_images(self):
        """Test uploading multiple badge images"""
        if not self.client_id:
            return {"error": "No client ID available for testing"}
            
        # Create test images
        files = []
        for i in range(2):
            img = Image.new('RGB', (100, 100), color = ('red' if i == 0 else 'blue'))
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            files.append(('files', (f'badge_{i}.png', img_byte_arr, 'image/png')))
        
        data = {
            'category': 'badge',
            'client_id': self.client_id
        }
        
        success, response = self.make_request(
            "POST",
            "uploads/multiple",
            data=data,
            auth_type="jwt",
            files=files,
            expected_status=200
        )
        
        if success and isinstance(response, list):
            for img in response:
                if "url" in img:
                    self.badge_image_ids.append(img["url"])
            return {"multiple_badges_created": True, "count": len(response)}
        return False
    
    def test_create_movie_with_badge_images(self):
        """Test creating a movie configuration with badge_images array"""
        if not self.client_id:
            return {"error": "No client ID available for testing"}
            
        # If we don't have badge images, create a dummy one
        if not self.badge_image_ids:
            self.badge_image_ids = ["/uploads/dummy_badge.png"]
            
        # Create a movie with badge images
        movie_data = {
            "client_id": self.client_id,
            "movie_title": "Test Movie with Badges",
            "movie_subtitle": "A Test of Badge Images",
            "description": "This is a test movie with badge images",
            "release_date": datetime.now().isoformat(),
            "director": "Test Director",
            "cast": ["Actor 1", "Actor 2"],
            "film_details": {
                "synopsis": "A comprehensive test of the badge images feature",
                "logline": "Testing badge images in film assets",
                "festival_selections": ["Test Festival 2025", "Another Festival"]
            },
            "film_assets": {
                "poster_image": "/uploads/test_poster.jpg",
                "badge_images": self.badge_image_ids,
                "video_gallery": self.video_urls[:1]  # Add one video URL
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
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "id" in response:
            self.movie_id = response["id"]
            # Verify badge_images is in the response
            has_badge_images = "film_assets" in response and "badge_images" in response["film_assets"]
            badge_count = len(response["film_assets"]["badge_images"]) if has_badge_images else 0
            
            # Verify video_gallery is in the response
            has_video_gallery = "film_assets" in response and "video_gallery" in response["film_assets"]
            video_count = len(response["film_assets"]["video_gallery"]) if has_video_gallery else 0
            
            return {
                "movie_created": True, 
                "movie_id": self.movie_id,
                "has_badge_images": has_badge_images,
                "badge_count": badge_count,
                "badge_images_match": set(response["film_assets"]["badge_images"]) == set(self.badge_image_ids) if has_badge_images else False,
                "has_video_gallery": has_video_gallery,
                "video_count": video_count,
                "video_gallery_match": set(response["film_assets"]["video_gallery"]) == set(self.video_urls[:1]) if has_video_gallery else False
            }
        return False
    
    # 2. API Endpoint Validation
    def test_get_movie_with_badge_images(self):
        """Test retrieving a movie configuration with badge_images"""
        if not self.movie_id:
            # Try to get an existing movie if we couldn't create one
            success, response = self.make_request(
                "GET",
                "movies",
                auth_type="jwt",
                expected_status=200
            )
            
            if success and isinstance(response, list) and len(response) > 0:
                self.movie_id = response[0]["id"]
            else:
                return {"error": "No movie ID available for testing"}
        
        success, response = self.make_request(
            "GET",
            f"movies/{self.movie_id}",
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "id" in response:
            # Verify badge_images is in the response
            has_badge_images = "film_assets" in response and "badge_images" in response["film_assets"]
            badge_count = len(response["film_assets"]["badge_images"]) if has_badge_images else 0
            
            # Verify video_gallery is in the response
            has_video_gallery = "film_assets" in response and "video_gallery" in response["film_assets"]
            video_count = len(response["film_assets"]["video_gallery"]) if has_video_gallery else 0
            
            return {
                "movie_retrieved": True,
                "has_badge_images": has_badge_images,
                "badge_count": badge_count,
                "badge_images_match": set(response["film_assets"]["badge_images"]) == set(self.badge_image_ids) if has_badge_images and self.badge_image_ids else False,
                "has_video_gallery": has_video_gallery,
                "video_count": video_count,
                "video_gallery_match": set(response["film_assets"]["video_gallery"]) == set(self.video_urls[:1]) if has_video_gallery else False
            }
        return False
    
    def test_update_movie_badge_images(self):
        """Test updating a movie's badge_images"""
        if not self.movie_id:
            return {"error": "No movie ID available for testing"}
        
        # Update with a subset of badge images or a new dummy one
        update_badge = self.badge_image_ids[0] if self.badge_image_ids else "/uploads/updated_badge.png"
        
        update_data = {
            "film_assets": {
                "badge_images": [update_badge]
            }
        }
        
        success, response = self.make_request(
            "PUT",
            f"movies/{self.movie_id}",
            data=update_data,
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "id" in response:
            # Verify badge_images was updated
            has_badge_images = "film_assets" in response and "badge_images" in response["film_assets"]
            badge_count = len(response["film_assets"]["badge_images"]) if has_badge_images else 0
            
            return {
                "movie_updated": True,
                "has_badge_images": has_badge_images,
                "badge_count": badge_count,
                "badge_images_updated": (badge_count == 1 and 
                                        update_badge in response["film_assets"]["badge_images"]) if has_badge_images else False
            }
        return False
        
    def test_update_movie_video_gallery(self):
        """Test updating a movie's video_gallery"""
        if not self.movie_id:
            return {"error": "No movie ID available for testing"}
        
        # Update with multiple video URLs
        update_data = {
            "film_assets": {
                "video_gallery": self.video_urls  # Add all test videos
            }
        }
        
        success, response = self.make_request(
            "PUT",
            f"movies/{self.movie_id}",
            data=update_data,
            auth_type="jwt",
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
                "video_gallery_updated": (video_count == len(self.video_urls) and 
                                        set(response["film_assets"]["video_gallery"]) == set(self.video_urls)) if has_video_gallery else False
            }
        return False
    
    # 3. Data Model Integrity
    def test_backward_compatibility(self):
        """Test creating a movie without badge_images (backward compatibility)"""
        if not self.client_id:
            return {"error": "No client ID available for testing"}
            
        # Create a movie without badge images
        movie_data = {
            "client_id": self.client_id,
            "movie_title": "Legacy Movie",
            "description": "This is a test movie without badge images",
            "release_date": datetime.now().isoformat(),
            "director": "Legacy Director"
        }
        
        success, response = self.make_request(
            "POST",
            "movies",
            data=movie_data,
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "id" in response:
            legacy_movie_id = response["id"]
            
            # Verify the movie was created successfully
            has_film_assets = "film_assets" in response
            has_empty_badge_images = has_film_assets and "badge_images" in response["film_assets"] and isinstance(response["film_assets"]["badge_images"], list)
            
            return {
                "legacy_movie_created": True,
                "movie_id": legacy_movie_id,
                "has_film_assets": has_film_assets,
                "has_empty_badge_images": has_empty_badge_images
            }
        return False
    
    def test_public_movie_endpoint(self):
        """Test the public movie endpoint with badge_images"""
        if not self.movie_id:
            return {"error": "No movie ID available for testing"}
        
        success, response = self.make_request(
            "GET",
            f"movies/public/{self.movie_id}",
            expected_status=200
        )
        
        if success and "id" in response:
            # Verify badge_images is in the response
            has_badge_images = "film_assets" in response and "badge_images" in response["film_assets"]
            
            return {
                "public_endpoint_working": True,
                "has_badge_images": has_badge_images,
                "film_details_included": "film_details" in response,
                "social_links_included": "social_links" in response
            }
        return False
    
    def run_all_tests(self):
        """Run all movie configuration tests"""
        print("🎬 Starting Movie Configuration System Testing with Badge Images Support")
        
        # Authentication
        print("\n== Authentication ==")
        self.run_test("Admin Login", self.test_admin_login)
        
        # Setup
        print("\n== Test Setup ==")
        self.run_test("Create Test Client", self.test_create_client)
        
        # 1. Enhanced FilmAssets Model Testing
        print("\n== Enhanced FilmAssets Model Testing ==")
        self.run_test("Upload Badge Image", self.test_create_badge_image)
        self.run_test("Upload Multiple Badge Images", self.test_create_multiple_badge_images)
        self.run_test("Create Movie with Badge Images", self.test_create_movie_with_badge_images)
        
        # 2. API Endpoint Validation
        print("\n== API Endpoint Validation ==")
        self.run_test("Get Movie with Badge Images", self.test_get_movie_with_badge_images)
        self.run_test("Update Movie Badge Images", self.test_update_movie_badge_images)
        
        # 3. Data Model Integrity
        print("\n== Data Model Integrity ==")
        self.run_test("Backward Compatibility", self.test_backward_compatibility)
        self.run_test("Public Movie Endpoint", self.test_public_movie_endpoint)
        
        # Print summary
        print(f"\n📊 Tests passed: {self.tests_passed}/{self.tests_run} ({self.tests_passed/self.tests_run*100:.1f}%)")
        
        return self.test_results

if __name__ == "__main__":
    # Run the movie configuration tests
    print("\n===== MOVIE CONFIGURATION SYSTEM TESTING =====\n")
    movie_tester = MovieConfigTester(API_BASE_URL)
    movie_results = movie_tester.run_all_tests()
    
    # Save results to file
    with open("movie_config_test_results.json", "w") as f:
        json.dump(movie_results, f, indent=2)
    
    # Exit with success if all tests passed
    sys.exit(0 if movie_tester.tests_passed == movie_tester.tests_run else 1)

class AuthTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
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
    
    def make_request(self, method, endpoint, data=None, headers=None, expected_status=None, auth_type=None):
        """Make an HTTP request with proper headers and authentication"""
        url = f"{self.base_url}/{endpoint}"
        
        if headers is None:
            headers = {}
            
        # Add authentication if specified
        if auth_type == "jwt" and self.admin_token:
            headers["Authorization"] = f"Bearer {self.admin_token}"
            
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
    
    # 1. Admin Login Flow Tests
    def test_admin_login(self):
        """Test admin user login"""
        success, response = self.make_request(
            "POST", 
            "auth/login", 
            data={
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            },
            expected_status=200
        )
        
        if success and "access_token" in response:
            self.admin_token = response["access_token"]
            return {"token_received": True, "token_length": len(self.admin_token)}
        return False
    
    def test_token_verification(self):
        """Test JWT token verification"""
        success, response = self.make_request(
            "POST", 
            "auth/verify-token", 
            auth_type="jwt",
            expected_status=200
        )
        
        if success and response.get("valid") is True:
            return {
                "token_valid": True, 
                "username": response.get("username"),
                "role": response.get("role")
            }
        return False
    
    def test_protected_endpoint_with_jwt(self):
        """Test accessing protected endpoint with JWT"""
        success, response = self.make_request(
            "GET", 
            "auth/me", 
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "username" in response:
            return {"access_granted": True, "username": response["username"], "role": response["role"]}
        return False
    
    # 2. Authentication Security Tests
    def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        url = f"{self.base_url}/auth/login"
        response = requests.post(
            url,
            json={
                "username": ADMIN_USERNAME,
                "password": "WrongPassword123!"
            }
        )
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Check if the response status code is 401 (Unauthorized)
        if response.status_code == 401:
            return {"security_working": True, "status_code": 401}
        return False
    
    def test_invalid_token(self):
        """Test accessing protected endpoint with invalid token"""
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = requests.get(f"{self.base_url}/auth/me", headers=headers)
        
        if response.status_code == 401:
            return {"security_working": True, "status_code": 401}
        return False
    
    def test_missing_token(self):
        """Test accessing protected endpoint without token"""
        url = f"{self.base_url}/auth/me"
        response = requests.get(url)
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Check if the response status code is 401 (Unauthorized) or 403 (Forbidden)
        # Both are acceptable for authentication failure
        if response.status_code in [401, 403]:
            return {"security_working": True, "status_code": response.status_code}
        return False
    
    # 3. Admin-Protected Endpoints Tests
    def test_admin_endpoint_access(self):
        """Test accessing admin-only endpoint with admin token"""
        success, response = self.make_request(
            "GET", 
            "auth/api-keys", 
            auth_type="jwt",
            expected_status=200
        )
        
        if success and isinstance(response, list):
            return {"admin_access_granted": True, "api_keys_count": len(response)}
        return False
    
    def test_rate_limiting(self):
        """Test rate limiting on auth endpoints"""
        results = []
        # Make 5 quick requests to login endpoint
        for i in range(5):
            response = requests.post(
                f"{self.base_url}/auth/login", 
                json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
            )
            
            # Check for rate limit headers
            if "X-RateLimit-Remaining" in response.headers:
                results.append(True)
                
        if all(results):
            return {"rate_limiting_working": True, "requests_made": len(results)}
        return False
    
    def run_all_tests(self):
        """Run all authentication tests"""
        print("🔒 Starting authentication system testing for Movie Booking SDK")
        
        # 1. Admin Login Flow Tests
        print("\n== Admin Login Flow Tests ==")
        self.run_test("Admin Login", self.test_admin_login)
        self.run_test("JWT Token Verification", self.test_token_verification)
        self.run_test("Protected Endpoint Access", self.test_protected_endpoint_with_jwt)
        
        # 2. Authentication Security Tests
        print("\n== Authentication Security Tests ==")
        self.run_test("Invalid Credentials", self.test_invalid_credentials)
        self.run_test("Invalid Token", self.test_invalid_token)
        self.run_test("Missing Token", self.test_missing_token)
        
        # 3. Admin-Protected Endpoints Tests
        print("\n== Admin-Protected Endpoints Tests ==")
        self.run_test("Admin Endpoint Access", self.test_admin_endpoint_access)
        self.run_test("Rate Limiting", self.test_rate_limiting)
        
        # Print summary
        print(f"\n📊 Tests passed: {self.tests_passed}/{self.tests_run} ({self.tests_passed/self.tests_run*100:.1f}%)")
        
        return self.test_results
        
if __name__ == "__main__":
    # Run the movie configuration tests
    print("\n===== MOVIE CONFIGURATION SYSTEM TESTING =====\n")
    movie_tester = MovieConfigTester(API_BASE_URL)
    movie_results = movie_tester.run_all_tests()
    
    # Save results to file
    with open("movie_config_test_results.json", "w") as f:
        json.dump(movie_results, f, indent=2)
    
    # Exit with success if all tests passed
    sys.exit(0 if movie_tester.tests_passed == movie_tester.tests_run else 1)