#!/usr/bin/env python3
"""
Backend API Testing for Movie Booking SDK
This script tests the backend APIs after filter layout optimizations:

1. Core API Health Check
2. Movie Configuration API
3. Categories API
4. Theater Listings API
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get the backend URL from frontend/.env
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            API_BASE_URL = line.strip().split('=')[1].strip('"\'')
            break

# Ensure API_BASE_URL ends with /api
if not API_BASE_URL.endswith('/api'):
    API_BASE_URL = f"{API_BASE_URL}/api"

# Admin credentials for authenticated endpoints
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "SecurePassword123!"

class BackendAPITester:
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
    
    # 1. Core API Health Check
    def test_api_root(self):
        """Test the API root endpoint"""
        success, response = self.make_request(
            "GET", 
            "",
            expected_status=200
        )
        
        if success and "message" in response and "endpoints" in response:
            return {
                "status": "healthy",
                "message": response["message"],
                "version": response.get("version"),
                "endpoints": list(response["endpoints"].keys())
            }
        return False
    
    def test_health_endpoint(self):
        """Test the health check endpoint"""
        success, response = self.make_request(
            "GET", 
            "health",
            expected_status=200
        )
        
        if success and response.get("status") == "healthy":
            return {
                "status": response["status"],
                "services": response.get("services", {})
            }
        return False
    
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
    
    # 2. Movie Configuration API
    def test_movie_config_endpoint(self):
        """Test the movie configuration endpoint"""
        # First get a movie ID
        success, response = self.make_request(
            "GET", 
            "movies",
            auth_type="jwt",
            expected_status=200
        )
        
        if not success or not isinstance(response, list) or not response:
            return {"error": "No movies available for testing"}
        
        movie_id = response[0]["id"]
        
        # Now get the specific movie configuration
        success, response = self.make_request(
            "GET", 
            f"movies/{movie_id}",
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "id" in response:
            return {
                "endpoint_working": True,
                "movie_id": movie_id,
                "movie_title": response.get("movie_title"),
                "data_structure_valid": isinstance(response, dict) and "film_assets" in response
            }
        return False
    
    # 3. Categories API
    def test_categories_endpoint(self):
        """Test the categories endpoint"""
        success, response = self.make_request(
            "GET", 
            "categories",
            expected_status=200
        )
        
        if success and isinstance(response, list):
            categories = [cat.get("name") for cat in response if "name" in cat]
            category_types = set(cat.get("type") for cat in response if "type" in cat)
            
            return {
                "endpoint_working": True,
                "categories_count": len(response),
                "sample_categories": categories[:5] if len(categories) > 5 else categories,
                "category_types": list(category_types)
            }
        return False
    
    def test_category_types_endpoint(self):
        """Test the category types endpoint"""
        success, response = self.make_request(
            "GET", 
            "categories/types/available",
            expected_status=200
        )
        
        if success and "types" in response:
            return {
                "endpoint_working": True,
                "types_count": len(response["types"]),
                "available_types": [t.get("value") for t in response["types"] if "value" in t]
            }
        return False
    
    def test_time_categories_endpoint(self):
        """Test the time categories endpoint"""
        success, response = self.make_request(
            "GET", 
            "categories/time-categories/available",
            expected_status=200
        )
        
        if success and "time_categories" in response:
            return {
                "endpoint_working": True,
                "categories_count": len(response["time_categories"]),
                "available_categories": [t.get("value") for t in response["time_categories"] if "value" in t]
            }
        return False
    
    # 4. Theater Listings API
    def test_movies_endpoint(self):
        """Test the movies endpoint"""
        success, response = self.make_request(
            "GET", 
            "movies",
            auth_type="jwt",
            expected_status=200
        )
        
        if success and isinstance(response, list):
            # Get the first movie ID for further testing
            if response and "id" in response[0]:
                self.movie_id = response[0]["id"]
                
            return {
                "endpoint_working": True,
                "movies_count": len(response),
                "data_structure_valid": all("movie_title" in movie for movie in response)
            }
        return False
    
    def test_movie_theaters_endpoint(self):
        """Test the movie theaters endpoint"""
        if not hasattr(self, 'movie_id'):
            return {"error": "No movie ID available for testing"}
            
        success, response = self.make_request(
            "GET", 
            f"movies/{self.movie_id}/theaters",
            auth_type="jwt",
            expected_status=200
        )
        
        if success and isinstance(response, list):
            return {
                "endpoint_working": True,
                "theaters_count": len(response),
                "data_structure_valid": all("name" in theater for theater in response)
            }
        return False
    
    def test_categorized_showtimes_endpoint(self):
        """Test the categorized showtimes endpoint"""
        if not hasattr(self, 'movie_id'):
            return {"error": "No movie ID available for testing"}
            
        success, response = self.make_request(
            "GET", 
            f"movies/{self.movie_id}/showtimes/categorized",
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "theaters" in response:
            # Check if the response has the expected structure
            has_time_categories = False
            if response["theaters"]:
                for theater in response["theaters"]:
                    if "screening_formats" in theater and theater["screening_formats"]:
                        for format_info in theater["screening_formats"]:
                            if "times_by_category" in format_info:
                                has_time_categories = True
                                break
            
            return {
                "endpoint_working": True,
                "theaters_count": len(response["theaters"]),
                "has_time_categories": has_time_categories,
                "movie_title": response.get("movie_title")
            }
        return False
    
    def test_filtered_showtimes(self):
        """Test the categorized showtimes endpoint with filters"""
        if not hasattr(self, 'movie_id'):
            return {"error": "No movie ID available for testing"}
            
        # Test with time category filter
        success1, response1 = self.make_request(
            "GET", 
            f"movies/{self.movie_id}/showtimes/categorized?time_category=evening",
            auth_type="jwt",
            expected_status=200
        )
        
        # Test with screening category filter (using IMAX as an example)
        success2, response2 = self.make_request(
            "GET", 
            f"movies/{self.movie_id}/showtimes/categorized?screening_category=IMAX",
            auth_type="jwt",
            expected_status=200
        )
        
        # Test with both filters
        success3, response3 = self.make_request(
            "GET", 
            f"movies/{self.movie_id}/showtimes/categorized?time_category=evening&screening_category=IMAX",
            auth_type="jwt",
            expected_status=200
        )
        
        if success1 and success2 and success3:
            return {
                "time_filter_working": success1 and "filters_applied" in response1 and response1["filters_applied"]["time_category"] == "evening",
                "screening_filter_working": success2 and "filters_applied" in response2 and response2["filters_applied"]["screening_category"] == "IMAX",
                "combined_filters_working": success3 and "filters_applied" in response3 and 
                                          response3["filters_applied"]["time_category"] == "evening" and 
                                          response3["filters_applied"]["screening_category"] == "IMAX"
            }
        return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🎬 Starting Backend API Testing for Movie Booking SDK")
        
        # 1. Core API Health Check
        print("\n== Core API Health Check ==")
        self.run_test("API Root Endpoint", self.test_api_root)
        self.run_test("Health Check Endpoint", self.test_health_endpoint)
        
        # Authentication
        print("\n== Authentication ==")
        self.run_test("Admin Login", self.test_admin_login)
        
        # 2. Movie Configuration API
        print("\n== Movie Configuration API ==")
        self.run_test("Movie Configuration Endpoint", self.test_movie_config_endpoint)
        
        # 3. Categories API
        print("\n== Categories API ==")
        self.run_test("Categories Endpoint", self.test_categories_endpoint)
        self.run_test("Category Types Endpoint", self.test_category_types_endpoint)
        self.run_test("Time Categories Endpoint", self.test_time_categories_endpoint)
        
        # 4. Theater Listings API
        print("\n== Theater Listings API ==")
        self.run_test("Movies Endpoint", self.test_movies_endpoint)
        self.run_test("Movie Theaters Endpoint", self.test_movie_theaters_endpoint)
        self.run_test("Categorized Showtimes Endpoint", self.test_categorized_showtimes_endpoint)
        self.run_test("Filtered Showtimes", self.test_filtered_showtimes)
        
        # Print summary
        print(f"\n📊 Tests passed: {self.tests_passed}/{self.tests_run} ({self.tests_passed/self.tests_run*100:.1f}%)")
        
        return self.test_results

if __name__ == "__main__":
    # Run the backend API tests
    print("\n===== BACKEND API TESTING =====\n")
    api_tester = BackendAPITester(API_BASE_URL)
    api_results = api_tester.run_all_tests()
    
    # Save results to file
    with open("backend_api_test_results.json", "w") as f:
        json.dump(api_results, f, indent=2)
    
    # Exit with success if all tests passed
    sys.exit(0 if api_tester.tests_passed == api_tester.tests_run else 1)