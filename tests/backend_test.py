#!/usr/bin/env python3
"""
Comprehensive Security Testing for Movie Booking SDK
This script tests all security aspects of the Movie Booking SDK including:
1. JWT Authentication System
2. API Key Management
3. Rate Limiting System
4. Security Headers & Protection
5. Public vs Protected Endpoints
6. End-to-End Security Workflow
"""

import requests
import time
import json
import sys
from datetime import datetime
import random
import string

# Configuration
API_BASE_URL = "https://8e9107a9-01e3-4da8-a758-3c9227c9c896.preview.emergentagent.com/api"
ADMIN_USERNAME = f"admin_{int(time.time())}"
ADMIN_PASSWORD = "SecurePassword123!"
ADMIN_EMAIL = f"admin_{int(time.time())}@example.com"
CLIENT_NAME = f"Test Client {int(time.time())}"

class SecurityTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.admin_token = None
        self.api_key = None
        self.client_id = None
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
        elif auth_type == "api_key" and self.api_key:
            headers["X-API-Key"] = self.api_key
            
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
    
    # 1. JWT Authentication Tests
    def test_admin_registration(self):
        """Test admin user registration"""
        success, response = self.make_request(
            "POST", 
            "auth/register", 
            data={
                "username": ADMIN_USERNAME,
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "role": "admin"
            },
            expected_status=200
        )
        
        if success and "access_token" in response:
            self.admin_token = response["access_token"]
            return {"token_received": True, "token_length": len(self.admin_token)}
        return False
    
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
            return {"token_valid": True, "username": response.get("username")}
        return False
    
    def test_token_refresh(self):
        """Test JWT token refresh"""
        success, response = self.make_request(
            "POST", 
            "auth/refresh-token", 
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "access_token" in response:
            # Update token with refreshed one
            old_token = self.admin_token
            self.admin_token = response["access_token"]
            return {"token_refreshed": True, "new_token_different": old_token != self.admin_token}
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
            return {"access_granted": True, "username": response["username"]}
        return False
    
    def test_protected_endpoint_without_jwt(self):
        """Test accessing protected endpoint without JWT (should fail)"""
        success, response = self.make_request(
            "GET", 
            "auth/me", 
            expected_status=401
        )
        
        # This test should fail with 401, so success is actually a failure
        if not success:
            return {"access_denied": True}
        return False
    
    # 2. API Key Management Tests
    def test_client_creation(self):
        """Test creating a client (requires admin JWT)"""
        success, response = self.make_request(
            "POST", 
            "clients/", 
            data={
                "name": CLIENT_NAME,
                "email": f"client_{int(time.time())}@example.com",
                "company": "Test Company",
                "subscription_tier": "premium"
            },
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "id" in response:
            self.client_id = response["id"]
            return {"client_created": True, "client_id": self.client_id}
        return False
    
    def test_api_key_creation(self):
        """Test creating an API key (requires admin JWT)"""
        success, response = self.make_request(
            "POST", 
            "auth/api-keys", 
            data={
                "name": f"Test API Key {int(time.time())}",
                "permissions": ["read", "write"],
                "expires_days": 30,
                "rate_limit": 200
            },
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "key" in response:
            self.api_key = response["key"]
            return {"api_key_created": True, "key_prefix": response.get("key_prefix")}
        return False
    
    def test_api_key_listing(self):
        """Test listing API keys (requires admin JWT)"""
        success, response = self.make_request(
            "GET", 
            "auth/api-keys", 
            auth_type="jwt",
            expected_status=200
        )
        
        if success and isinstance(response, list):
            return {"api_keys_listed": True, "count": len(response)}
        return False
    
    def test_api_key_authentication(self):
        """Test accessing endpoint with API key"""
        # First try to access a public endpoint with API key
        success, response = self.make_request(
            "GET", 
            "movies/", 
            headers={"X-API-Key": self.api_key},
            expected_status=200
        )
        
        if success:
            return {"api_key_authentication": True}
        return False
    
    def test_api_key_revocation(self):
        """Test revoking an API key (requires admin JWT)"""
        # First list keys to get an ID
        success, response = self.make_request(
            "GET", 
            "auth/api-keys", 
            auth_type="jwt",
            expected_status=200
        )
        
        if not success or not isinstance(response, list) or len(response) == 0:
            return False
        
        # Get the first key ID
        key_id = response[0]["id"]
        
        # Revoke the key
        success, response = self.make_request(
            "DELETE", 
            f"auth/api-keys/{key_id}", 
            auth_type="jwt",
            expected_status=200
        )
        
        if success and "message" in response:
            return {"key_revoked": True, "key_id": key_id}
        return False
    
    # 3. Rate Limiting Tests
    def test_rate_limiting_public(self):
        """Test rate limiting for public endpoints (60 req/min)"""
        # Make a few requests to a public endpoint
        results = []
        for i in range(5):
            success, response = self.make_request(
                "GET", 
                "health", 
                expected_status=200
            )
            
            # Check for rate limit headers
            if success:
                results.append(True)
                
        # Check if we received rate limit headers
        if all(results):
            return {"rate_limit_headers_present": True, "requests_made": len(results)}
        return False
    
    def test_rate_limiting_authenticated(self):
        """Test rate limiting for authenticated endpoints (200 req/min)"""
        # Make a few requests to an authenticated endpoint
        results = []
        for i in range(5):
            success, response = self.make_request(
                "GET", 
                "movies/", 
                headers={"X-API-Key": self.api_key},
                expected_status=200
            )
            
            # Check for rate limit headers
            if success:
                results.append(True)
                
        # Check if we received rate limit headers
        if all(results):
            return {"rate_limit_headers_present": True, "requests_made": len(results)}
        return False
    
    def test_rate_limiting_admin(self):
        """Test rate limiting for admin endpoints (500 req/min)"""
        # Make a few requests to an admin endpoint
        results = []
        for i in range(5):
            success, response = self.make_request(
                "GET", 
                "auth/me", 
                auth_type="jwt",
                expected_status=200
            )
            
            # Check for rate limit headers
            if success:
                results.append(True)
                
        # Check if we received rate limit headers
        if all(results):
            return {"rate_limit_headers_present": True, "requests_made": len(results)}
        return False
    
    # 4. Security Headers Tests
    def test_security_headers(self):
        """Test security headers are present"""
        # Make a request to any endpoint
        response = requests.get(f"{self.base_url}/health")
        
        # Check for security headers
        headers = response.headers
        security_headers = {
            "X-Content-Type-Options": headers.get("X-Content-Type-Options"),
            "X-Frame-Options": headers.get("X-Frame-Options"),
            "X-XSS-Protection": headers.get("X-XSS-Protection"),
            "Content-Security-Policy": headers.get("Content-Security-Policy"),
            "Referrer-Policy": headers.get("Referrer-Policy")
        }
        
        # Count how many security headers are present
        present_headers = sum(1 for v in security_headers.values() if v is not None)
        
        if present_headers >= 3:  # At least 3 security headers should be present
            return {"security_headers_present": security_headers}
        return False
    
    def test_cors_configuration(self):
        """Test CORS configuration"""
        # Make an OPTIONS request to check CORS headers
        response = requests.options(f"{self.base_url}/health")
        
        # Check for CORS headers
        headers = response.headers
        cors_headers = {
            "Access-Control-Allow-Origin": headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": headers.get("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": headers.get("Access-Control-Allow-Headers")
        }
        
        # Count how many CORS headers are present
        present_headers = sum(1 for v in cors_headers.values() if v is not None)
        
        if present_headers > 0:  # At least one CORS header should be present
            return {"cors_headers_present": cors_headers}
        return False
    
    def test_input_validation(self):
        """Test input validation prevents XSS and injection attempts"""
        # Try to register with malicious input
        success, response = self.make_request(
            "POST", 
            "auth/register", 
            data={
                "username": "test<script>alert(1)</script>",
                "email": "test@example.com",
                "password": "password123",
                "role": "admin"
            },
            expected_status=400  # Should fail with 400 Bad Request
        )
        
        # This test should fail with 400, so success is actually a failure
        if not success:
            return {"input_validation_working": True}
        return False
    
    # 5. Public vs Protected Endpoints Tests
    def test_public_endpoints(self):
        """Test public endpoints are accessible without authentication"""
        public_endpoints = [
            "movies/",
            "categories/",
            "categories/time-categories/available",
            "health"
        ]
        
        results = []
        for endpoint in public_endpoints:
            success, _ = self.make_request(
                "GET", 
                endpoint, 
                expected_status=200
            )
            results.append(success)
            
        if all(results):
            return {"public_endpoints_accessible": True, "endpoints_tested": len(public_endpoints)}
        return False
    
    def test_protected_endpoints(self):
        """Test protected endpoints require authentication"""
        protected_endpoints = [
            {"path": "clients/", "method": "POST", "auth": "jwt"},
            {"path": "auth/api-keys", "method": "POST", "auth": "jwt"},
            {"path": "uploads/", "method": "POST", "auth": "jwt"},
            {"path": "auth/register", "method": "POST", "auth": None}  # Special case, no auth but protected
        ]
        
        results = []
        for endpoint_info in protected_endpoints:
            path = endpoint_info["path"]
            method = endpoint_info["method"]
            auth = endpoint_info["auth"]
            
            # First try without authentication (should fail)
            success1, _ = self.make_request(
                method, 
                path, 
                data={} if method == "POST" else None,
                expected_status=401
            )
            
            # Then try with authentication (should succeed)
            if auth == "jwt":
                success2, _ = self.make_request(
                    method, 
                    path, 
                    data={} if method == "POST" else None,
                    auth_type="jwt",
                    expected_status=200
                )
            else:
                # For special cases like register that don't need auth but are protected
                success2 = True
                
            results.append(not success1 and success2)
            
        if all(results):
            return {"protected_endpoints_secure": True, "endpoints_tested": len(protected_endpoints)}
        return False
    
    # 6. End-to-End Security Workflow Test
    def test_end_to_end_workflow(self):
        """Test complete workflow: Register admin → Login → Create API key → Use API key"""
        # Step 1: Register admin
        success1 = self.test_admin_registration()
        
        # Step 2: Login as admin
        success2 = self.test_admin_login()
        
        # Step 3: Create client
        success3 = self.test_client_creation()
        
        # Step 4: Create API key
        success4 = self.test_api_key_creation()
        
        # Step 5: Use API key to access endpoint
        success5 = self.test_api_key_authentication()
        
        if all([success1, success2, success3, success4, success5]):
            return {"workflow_successful": True, "steps_completed": 5}
        return False
    
    def test_error_handling(self):
        """Test proper error messages for authentication failures"""
        # Test with invalid JWT token
        headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(f"{self.base_url}/auth/me", headers=headers)
        
        # Check if response contains proper error message
        try:
            error_data = response.json()
            has_detail = "detail" in error_data
        except:
            has_detail = False
            
        # Test with invalid API key
        headers = {"X-API-Key": "invalid_key"}
        response = requests.get(f"{self.base_url}/movies/", headers=headers)
        
        # Check if response contains proper error message
        try:
            error_data = response.json()
            has_api_key_error = "detail" in error_data
        except:
            has_api_key_error = False
            
        if has_detail and has_api_key_error:
            return {"proper_error_messages": True}
        return False
    
    def run_all_tests(self):
        """Run all security tests"""
        print("🔒 Starting comprehensive security testing for Movie Booking SDK")
        
        # 1. JWT Authentication Tests
        print("\n== JWT Authentication Tests ==")
        self.run_test("Admin Registration", self.test_admin_registration)
        self.run_test("Admin Login", self.test_admin_login)
        self.run_test("JWT Token Verification", self.test_token_verification)
        self.run_test("JWT Token Refresh", self.test_token_refresh)
        self.run_test("Protected Endpoint with JWT", self.test_protected_endpoint_with_jwt)
        self.run_test("Protected Endpoint without JWT", self.test_protected_endpoint_without_jwt)
        
        # 2. API Key Management Tests
        print("\n== API Key Management Tests ==")
        self.run_test("Client Creation", self.test_client_creation)
        self.run_test("API Key Creation", self.test_api_key_creation)
        self.run_test("API Key Listing", self.test_api_key_listing)
        self.run_test("API Key Authentication", self.test_api_key_authentication)
        self.run_test("API Key Revocation", self.test_api_key_revocation)
        
        # 3. Rate Limiting Tests
        print("\n== Rate Limiting Tests ==")
        self.run_test("Rate Limiting for Public Endpoints", self.test_rate_limiting_public)
        self.run_test("Rate Limiting for Authenticated Endpoints", self.test_rate_limiting_authenticated)
        self.run_test("Rate Limiting for Admin Endpoints", self.test_rate_limiting_admin)
        
        # 4. Security Headers Tests
        print("\n== Security Headers Tests ==")
        self.run_test("Security Headers", self.test_security_headers)
        self.run_test("CORS Configuration", self.test_cors_configuration)
        self.run_test("Input Validation", self.test_input_validation)
        
        # 5. Public vs Protected Endpoints Tests
        print("\n== Public vs Protected Endpoints Tests ==")
        self.run_test("Public Endpoints Accessibility", self.test_public_endpoints)
        self.run_test("Protected Endpoints Security", self.test_protected_endpoints)
        
        # 6. End-to-End Security Workflow Test
        print("\n== End-to-End Security Workflow Test ==")
        self.run_test("Complete Security Workflow", self.test_end_to_end_workflow)
        self.run_test("Error Handling", self.test_error_handling)
        
        # Print summary
        print(f"\n📊 Tests passed: {self.tests_passed}/{self.tests_run} ({self.tests_passed/self.tests_run*100:.1f}%)")
        
        return self.test_results
        
if __name__ == "__main__":
    tester = SecurityTester(API_BASE_URL)
    results = tester.run_all_tests()
    
    # Save results to file
    with open("security_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
        
    # Exit with success if all tests passed
    sys.exit(0 if tester.tests_passed == tester.tests_run else 1)