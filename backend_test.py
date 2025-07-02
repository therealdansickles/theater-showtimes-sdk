#!/usr/bin/env python3
"""
Authentication System Testing for Movie Booking SDK
This script tests the authentication system and admin login flow:
1. Admin Login Flow
2. Authentication Security
3. Admin-Protected Endpoints
"""

import requests
import time
import json
import sys
from datetime import datetime

# Configuration
API_BASE_URL = "https://8e9107a9-01e3-4da8-a758-3c9227c9c896.preview.emergentagent.com/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "SecurePassword123!"

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
        response = requests.get(f"{self.base_url}/auth/me")
        
        if response.status_code == 401:
            return {"security_working": True, "status_code": 401}
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
    tester = AuthTester(API_BASE_URL)
    results = tester.run_all_tests()
    
    # Save results to file
    with open("auth_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
        
    # Exit with success if all tests passed
    sys.exit(0 if tester.tests_passed == tester.tests_run else 1)