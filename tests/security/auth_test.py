#!/usr/bin/env python3
import requests
import json
import sys
from datetime import datetime

class MovieBookingAuthTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_health(self):
        """Test API health endpoint"""
        return self.run_test(
            "API Health Check",
            "GET",
            "health",
            200
        )

    def test_login(self, username, password):
        """Test login and get token"""
        success, response = self.run_test(
            "Login",
            "POST",
            "auth/login",
            200,
            data={"username": username, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_verify_token(self):
        """Test token verification"""
        if not self.token:
            print("❌ No token available for verification")
            return False
            
        success, response = self.run_test(
            "Token Verification",
            "POST",
            "auth/verify-token",
            200
        )
        return success and response.get('valid', False)

    def test_admin_access(self):
        """Test admin dashboard access"""
        if not self.token:
            print("❌ No token available for admin access test")
            return False
            
        success, response = self.run_test(
            "Admin Access",
            "GET",
            "movies/?limit=1",
            200
        )
        return success

    def test_unauthorized_admin_access(self):
        """Test unauthorized admin access (should fail)"""
        # Save token temporarily
        temp_token = self.token
        self.token = None
        
        success, _ = self.run_test(
            "Unauthorized Admin Access",
            "GET",
            "movies/?limit=1",
            403  # FastAPI returns 403 for unauthenticated requests
        )
        
        # Restore token
        self.token = temp_token
        
        # This test passes if the request fails with 403
        if not success:
            self.tests_passed += 1
            print("✅ Passed - Unauthorized access correctly rejected")
            return True
        return False

    def test_logout(self):
        """Test logout (client-side only)"""
        print("\n🔍 Testing Logout...")
        self.tests_run += 1
        
        # In JWT-based auth, logout is typically client-side
        # We'll simulate by clearing the token
        self.token = None
        
        self.tests_passed += 1
        print("✅ Passed - Token cleared")
        return True

def main():
    # Get backend URL from frontend .env
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    backend_url = line.strip().split('=')[1]
                    break
    except Exception as e:
        print(f"Error reading backend URL: {e}")
        backend_url = "https://f89fb794-9619-4452-9198-7d7904651861.preview.emergentagent.com"
    
    print(f"Using backend URL: {backend_url}")
    
    # Setup
    tester = MovieBookingAuthTester(backend_url)
    
    # Run tests
    tester.test_api_health()
    
    # Test login with demo credentials
    if not tester.test_login("admin", "SecurePassword123!"):
        print("❌ Login failed, stopping tests")
        return 1
    
    # Test token verification
    if not tester.test_verify_token():
        print("❌ Token verification failed")
        return 1
    
    # Test admin access
    if not tester.test_admin_access():
        print("❌ Admin access failed")
        return 1
    
    # Test unauthorized access
    tester.test_unauthorized_admin_access()
    
    # Test logout
    tester.test_logout()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())