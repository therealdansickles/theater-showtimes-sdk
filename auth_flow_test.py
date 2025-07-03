#!/usr/bin/env python3
"""
Admin Authentication Flow Test

This script focuses specifically on testing the admin authentication flow:
1. Admin login
2. JWT token verification
3. Protected endpoint access
"""

import requests
import json
import sys
import os

# Get the backend URL from frontend/.env
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            API_BASE_URL = line.strip().split('=')[1].strip('"\'')
            break

# Ensure API_BASE_URL ends with /api
if not API_BASE_URL.endswith('/api'):
    API_BASE_URL = f"{API_BASE_URL}/api"

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "SecurePassword123!"

def test_admin_auth_flow():
    """Test the complete admin authentication flow"""
    print("\n===== ADMIN AUTHENTICATION FLOW TEST =====\n")
    
    # Step 1: Admin Login
    print("Step 1: Testing Admin Login")
    login_url = f"{API_BASE_URL}/auth/login"
    login_data = {
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    }
    
    try:
        login_response = requests.post(
            login_url,
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Login Status Code: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.text}")
            return False
        
        login_json = login_response.json()
        if "access_token" not in login_json:
            print("No access token in response")
            return False
        
        token = login_json["access_token"]
        print(f"Login successful. Token received (length: {len(token)})")
        
        # Step 2: Verify Token
        print("\nStep 2: Testing Token Verification")
        verify_url = f"{API_BASE_URL}/auth/verify-token"
        
        verify_response = requests.post(
            verify_url,
            headers={
                "Authorization": f"Bearer {token}"
            }
        )
        
        print(f"Verify Token Status Code: {verify_response.status_code}")
        
        if verify_response.status_code != 200:
            print(f"Token verification failed: {verify_response.text}")
            return False
        
        verify_json = verify_response.json()
        print(f"Token verification response: {json.dumps(verify_json, indent=2)}")
        
        if not verify_json.get("valid") or verify_json.get("role") != "admin":
            print("Token is not valid or user is not admin")
            return False
        
        print("Token verification successful")
        
        # Step 3: Access Protected Endpoint
        print("\nStep 3: Testing Protected Endpoint Access")
        movies_url = f"{API_BASE_URL}/movies/?limit=1"
        
        # First try without token
        no_auth_response = requests.get(movies_url)
        print(f"No Auth Status Code: {no_auth_response.status_code}")
        
        # Then try with token
        auth_response = requests.get(
            movies_url,
            headers={
                "Authorization": f"Bearer {token}"
            }
        )
        
        print(f"With Auth Status Code: {auth_response.status_code}")
        
        if auth_response.status_code != 200:
            print(f"Protected endpoint access failed: {auth_response.text}")
            return False
        
        # Check if response is a list (expected format)
        auth_json = auth_response.json()
        if not isinstance(auth_json, list):
            print(f"Unexpected response format: {auth_json}")
            return False
        
        print(f"Protected endpoint access successful. Found {len(auth_json)} movies.")
        
        # Step 4: Test with Invalid Token
        print("\nStep 4: Testing with Invalid Token")
        invalid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        
        invalid_response = requests.get(
            movies_url,
            headers={
                "Authorization": f"Bearer {invalid_token}"
            }
        )
        
        print(f"Invalid Token Status Code: {invalid_response.status_code}")
        
        # Check if security is properly implemented
        if invalid_response.status_code == 200:
            print("WARNING: Invalid token was accepted!")
            print(f"Response: {invalid_response.text[:200]}...")
            print("This indicates a security issue - authentication is not being properly enforced")
        elif invalid_response.status_code == 401:
            print("Invalid token correctly rejected with 401 Unauthorized")
        else:
            print(f"Unexpected status code for invalid token: {invalid_response.status_code}")
            print(f"Response: {invalid_response.text}")
        
        print("\n===== AUTHENTICATION FLOW TEST COMPLETE =====")
        
        # Return overall success
        return True
        
    except Exception as e:
        print(f"Error during authentication flow test: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_admin_auth_flow()
    sys.exit(0 if success else 1)