#!/usr/bin/env python3
"""
Admin Login Issue Testing Script
This script specifically tests the admin login flow and authentication issues
"""

import requests
import json
import sys
import time

# Configuration
API_BASE_URL = "https://8e9107a9-01e3-4da8-a758-3c9227c9c896.preview.emergentagent.com/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "SecurePassword123!"

class AdminLoginTester:
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
    
    def test_admin_login(self):
        """Test admin user login with provided credentials"""
        print(f"Attempting login with username: {ADMIN_USERNAME}")
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
                "token": self.admin_token[:10] + "..." # Show first 10 chars for debugging
            }
        return False
    
    def test_token_verification(self):
        """Test JWT token verification"""
        if not self.admin_token:
            print("No token available to verify")
            return False
            
        success, response = self.make_request(
            "POST", 
            "auth/verify-token", 
            auth_type="jwt",
            expected_status=200
        )
        
        if success:
            print(f"Token verification response: {json.dumps(response, indent=2)}")
            if response.get("valid") is True:
                return {
                    "token_valid": True, 
                    "username": response.get("username"),
                    "role": response.get("role")
                }
        return False
    
    def test_user_info(self):
        """Test getting user info with JWT"""
        if not self.admin_token:
            print("No token available to get user info")
            return False
            
        success, response = self.make_request(
            "GET", 
            "auth/me", 
            auth_type="jwt",
            expected_status=200
        )
        
        if success:
            print(f"User info response: {json.dumps(response, indent=2)}")
            if "username" in response and "role" in response:
                return {
                    "username": response["username"],
                    "role": response["role"],
                    "is_admin": response["role"] == "admin"
                }
        return False
    
    def test_admin_access(self):
        """Test accessing admin-only endpoints"""
        if not self.admin_token:
            print("No token available to test admin access")
            return False
            
        # Try to access clients endpoint (admin only)
        success, response = self.make_request(
            "GET", 
            "clients/", 
            auth_type="jwt",
            expected_status=200
        )
        
        if success:
            print(f"Admin access response: {json.dumps(response, indent=2)}")
            return {"admin_access": True}
        return False
    
    def test_movies_endpoint(self):
        """Test accessing movies endpoint (should be accessible with admin token)"""
        if not self.admin_token:
            print("No token available to test movies endpoint")
            return False
            
        success, response = self.make_request(
            "GET", 
            "movies/", 
            auth_type="jwt",
            expected_status=200
        )
        
        if success:
            print(f"Movies endpoint response: {json.dumps(response, indent=2)}")
            return {"movies_access": True, "count": len(response) if isinstance(response, list) else 0}
        return False
    
    def run_all_tests(self):
        """Run all admin login tests"""
        print("🔒 Starting admin login testing")
        
        # Login Tests
        self.run_test("Admin Login", self.test_admin_login)
        
        # Token Verification
        self.run_test("JWT Token Verification", self.test_token_verification)
        
        # User Info
        self.run_test("User Info", self.test_user_info)
        
        # Admin Access
        self.run_test("Admin Access", self.test_admin_access)
        
        # Movies Endpoint
        self.run_test("Movies Endpoint", self.test_movies_endpoint)
        
        # Print summary
        print(f"\n📊 Tests passed: {self.tests_passed}/{self.tests_run} ({self.tests_passed/self.tests_run*100:.1f}%)")
        
        return self.test_results
        
if __name__ == "__main__":
    tester = AdminLoginTester(API_BASE_URL)
    results = tester.run_all_tests()
    
    # Save results to file
    with open("admin_login_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
        
    # Exit with success if all tests passed
    sys.exit(0 if tester.tests_passed == tester.tests_run else 1)