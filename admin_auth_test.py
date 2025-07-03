#!/usr/bin/env python3
"""
Admin Authentication and Dashboard API Testing

This script tests:
1. Admin login functionality
2. JWT token verification
3. Access to protected movie configuration API
4. Proper JSON responses and data structure
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

# Admin credentials for authentication testing
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "SecurePassword123!"

class AdminAuthTester:
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
    
    # 1. Admin Authentication Tests
    def test_admin_login(self):
        """Test admin user login with correct credentials"""
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
            return {
                "token_received": True, 
                "token_length": len(self.admin_token),
                "token_type": response.get("token_type", "unknown")
            }
        return False
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        success, response = self.make_request(
            "POST", 
            "auth/login", 
            data={
                "username": ADMIN_USERNAME,
                "password": "WrongPassword123!"
            },
            expected_status=401
        )
        
        # This should fail with 401 Unauthorized
        if not success and response.get("detail") == "Invalid credentials":
            return {"security_check": "passed"}
        return False
    
    def test_token_verification(self):
        """Test JWT token verification"""
        if not self.admin_token:
            return {"error": "No token available for testing"}
        
        success, response = self.make_request(
            "POST", 
            "auth/verify-token",
            auth_type="jwt",
            expected_status=200
        )
        
        if success and response.get("valid") and response.get("role") == "admin":
            return {
                "token_valid": True,
                "user_info": {
                    "username": response.get("username"),
                    "role": response.get("role"),
                    "user_id": response.get("user_id")
                }
            }
        return False
    
    def test_current_user_info(self):
        """Test getting current user information"""
        if not self.admin_token:
            return {"error": "No token available for testing"}
        
        success, response = self.make_request(
            "GET", 
            "auth/me",
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "username" in response and "role" in response:
            return {
                "user_info_retrieved": True,
                "username": response.get("username"),
                "role": response.get("role"),
                "email": response.get("email")
            }
        return False
    
    # 2. Admin Dashboard API Tests
    def test_movies_endpoint(self):
        """Test the movies endpoint with admin token"""
        if not self.admin_token:
            return {"error": "No token available for testing"}
        
        success, response = self.make_request(
            "GET", 
            "movies?limit=1",
            auth_type="jwt",
            expected_status=200
        )
        
        if success:
            if isinstance(response, list):
                return {
                    "endpoint_working": True,
                    "movies_count": len(response),
                    "data_structure_valid": len(response) == 0 or "movie_title" in response[0]
                }
            else:
                return {
                    "endpoint_working": True,
                    "movies_count": 0,
                    "data_structure_valid": True,
                    "note": "Empty array returned"
                }
        return False
    
    def test_movies_endpoint_without_auth(self):
        """Test the movies endpoint without authentication"""
        success, response = self.make_request(
            "GET", 
            "movies?limit=1",
            expected_status=401  # Should fail with 401 Unauthorized
        )
        
        # This should fail with 401 Unauthorized
        if not success and response.get("detail", "").startswith("Not authenticated"):
            return {"security_check": "passed"}
        return False
    
    def test_categories_endpoint(self):
        """Test the categories endpoint with admin token"""
        if not self.admin_token:
            return {"error": "No token available for testing"}
        
        success, response = self.make_request(
            "GET", 
            "categories",
            auth_type="jwt",
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
    
    def test_invalid_token(self):
        """Test access with an invalid token"""
        # Save the real token temporarily
        real_token = self.admin_token
        
        # Set an invalid token
        self.admin_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        
        success, response = self.make_request(
            "GET", 
            "movies",
            auth_type="jwt",
            expected_status=401  # Should fail with 401 Unauthorized
        )
        
        # Restore the real token
        self.admin_token = real_token
        
        # This should fail with 401 Unauthorized
        if not success and "detail" in response:
            return {"security_check": "passed", "error_message": response.get("detail")}
        return False
    
    def run_all_tests(self):
        """Run all admin authentication and API tests"""
        print("🔐 Starting Admin Authentication and Dashboard API Testing")
        
        # 1. Admin Authentication Tests
        print("\n== Admin Authentication Tests ==")
        self.run_test("Admin Login (Valid Credentials)", self.test_admin_login)
        self.run_test("Admin Login (Invalid Credentials)", self.test_admin_login_invalid_credentials)
        self.run_test("JWT Token Verification", self.test_token_verification)
        self.run_test("Current User Info", self.test_current_user_info)
        
        # 2. Admin Dashboard API Tests
        print("\n== Admin Dashboard API Tests ==")
        self.run_test("Movies Endpoint (Authenticated)", self.test_movies_endpoint)
        self.run_test("Movies Endpoint (Unauthenticated)", self.test_movies_endpoint_without_auth)
        self.run_test("Categories Endpoint", self.test_categories_endpoint)
        self.run_test("Invalid Token Test", self.test_invalid_token)
        
        # Print summary
        print(f"\n📊 Tests passed: {self.tests_passed}/{self.tests_run} ({self.tests_passed/self.tests_run*100:.1f}%)")
        
        return self.test_results

if __name__ == "__main__":
    # Run the admin authentication and API tests
    print("\n===== ADMIN AUTHENTICATION AND DASHBOARD API TESTING =====\n")
    auth_tester = AdminAuthTester(API_BASE_URL)
    auth_results = auth_tester.run_all_tests()
    
    # Save results to file
    with open("admin_auth_test_results.json", "w") as f:
        json.dump(auth_results, f, indent=2)
    
    # Exit with success if all tests passed
    sys.exit(0 if auth_tester.tests_passed == auth_tester.tests_run else 1)