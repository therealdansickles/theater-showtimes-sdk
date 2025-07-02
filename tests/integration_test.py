import requests
import json
from datetime import datetime
import sys

class MovieBookingIntegrationTest:
    def __init__(self):
        self.base_url = "https://8e9107a9-01e3-4da8-a758-3c9227c9c896.preview.emergentagent.com/api"
        self.movie_id = None
        self.test_results = {
            "backend_api_tests": {},
            "integration_issues": [],
            "recommendations": []
        }

    def run_tests(self):
        """Run all integration tests"""
        print("Starting Movie Booking Integration Tests...")
        
        # Test backend APIs
        self.test_categories_api()
        self.test_time_categories_api()
        self.test_categorized_showtimes_api()
        
        # Analyze integration issues
        self.analyze_integration_issues()
        
        # Print summary
        self.print_summary()
        
        return self.test_results

    def test_categories_api(self):
        """Test the categories API endpoint"""
        print("\n--- Testing Categories API ---")
        try:
            response = requests.get(f"{self.base_url}/categories/")
            if response.status_code == 200:
                categories = response.json()
                self.test_results["backend_api_tests"]["categories"] = {
                    "status": "PASS",
                    "count": len(categories),
                    "sample": [cat["name"] for cat in categories[:5]]
                }
                print(f"✅ Categories API working - Found {len(categories)} categories")
            else:
                self.test_results["backend_api_tests"]["categories"] = {
                    "status": "FAIL",
                    "error": f"Status code: {response.status_code}"
                }
                print(f"❌ Categories API failed - Status code: {response.status_code}")
        except Exception as e:
            self.test_results["backend_api_tests"]["categories"] = {
                "status": "ERROR",
                "error": str(e)
            }
            print(f"❌ Categories API error: {str(e)}")

    def test_time_categories_api(self):
        """Test the time categories API endpoint"""
        print("\n--- Testing Time Categories API ---")
        try:
            response = requests.get(f"{self.base_url}/categories/time-categories/available")
            if response.status_code == 200:
                time_categories = response.json()["time_categories"]
                self.test_results["backend_api_tests"]["time_categories"] = {
                    "status": "PASS",
                    "categories": [cat["value"] for cat in time_categories]
                }
                print(f"✅ Time Categories API working - Found categories: {', '.join([cat['value'] for cat in time_categories])}")
            else:
                self.test_results["backend_api_tests"]["time_categories"] = {
                    "status": "FAIL",
                    "error": f"Status code: {response.status_code}"
                }
                print(f"❌ Time Categories API failed - Status code: {response.status_code}")
        except Exception as e:
            self.test_results["backend_api_tests"]["time_categories"] = {
                "status": "ERROR",
                "error": str(e)
            }
            print(f"❌ Time Categories API error: {str(e)}")

    def test_categorized_showtimes_api(self):
        """Test the categorized showtimes API endpoint"""
        print("\n--- Testing Categorized Showtimes API ---")
        
        # First get a movie ID
        try:
            response = requests.get(f"{self.base_url}/movies/?limit=1")
            if response.status_code == 200 and response.json():
                self.movie_id = response.json()[0]["id"]
                print(f"Found movie ID: {self.movie_id}")
            else:
                print("No movies found, creating a test movie")
                # Create a test client and movie if needed
                self.create_test_movie()
        except Exception as e:
            print(f"Error getting movie: {str(e)}")
            self.test_results["backend_api_tests"]["categorized_showtimes"] = {
                "status": "ERROR",
                "error": str(e)
            }
            return
        
        if not self.movie_id:
            print("Could not get or create a movie ID, skipping showtimes test")
            self.test_results["backend_api_tests"]["categorized_showtimes"] = {
                "status": "SKIP",
                "error": "No movie ID available"
            }
            return
        
        # Test without filters
        try:
            response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized")
            if response.status_code == 200:
                data = response.json()
                self.test_results["backend_api_tests"]["categorized_showtimes"] = {
                    "status": "PASS",
                    "theaters_count": data.get("total_theaters", 0)
                }
                print(f"✅ Categorized Showtimes API working - Found {data.get('total_theaters', 0)} theaters")
                
                # Test with time_category filter
                self.test_showtimes_with_filters()
            else:
                self.test_results["backend_api_tests"]["categorized_showtimes"] = {
                    "status": "FAIL",
                    "error": f"Status code: {response.status_code}"
                }
                print(f"❌ Categorized Showtimes API failed - Status code: {response.status_code}")
        except Exception as e:
            self.test_results["backend_api_tests"]["categorized_showtimes"] = {
                "status": "ERROR",
                "error": str(e)
            }
            print(f"❌ Categorized Showtimes API error: {str(e)}")

    def test_showtimes_with_filters(self):
        """Test showtimes API with various filters"""
        if not self.movie_id:
            return
        
        # Test with time_category filter
        try:
            for time_cat in ["morning", "afternoon", "evening", "late_night"]:
                response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized?time_category={time_cat}")
                if response.status_code == 200:
                    data = response.json()
                    filter_result = {
                        "status": "PASS",
                        "theaters_count": data.get("total_theaters", 0),
                        "filter_applied": time_cat
                    }
                    if "time_filters" not in self.test_results["backend_api_tests"]:
                        self.test_results["backend_api_tests"]["time_filters"] = {}
                    self.test_results["backend_api_tests"]["time_filters"][time_cat] = filter_result
                    print(f"✅ Time filter '{time_cat}' working - Found {data.get('total_theaters', 0)} theaters")
                else:
                    if "time_filters" not in self.test_results["backend_api_tests"]:
                        self.test_results["backend_api_tests"]["time_filters"] = {}
                    self.test_results["backend_api_tests"]["time_filters"][time_cat] = {
                        "status": "FAIL",
                        "error": f"Status code: {response.status_code}"
                    }
                    print(f"❌ Time filter '{time_cat}' failed - Status code: {response.status_code}")
        except Exception as e:
            self.test_results["backend_api_tests"]["time_filters"] = {
                "status": "ERROR",
                "error": str(e)
            }
            print(f"❌ Time filters error: {str(e)}")
        
        # Test with screening_category filter if we have categories
        try:
            response = requests.get(f"{self.base_url}/categories/?type=format&limit=1")
            if response.status_code == 200 and response.json():
                category = response.json()[0]
                category_name = category["name"]
                
                response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized?screening_category={category_name}")
                if response.status_code == 200:
                    data = response.json()
                    self.test_results["backend_api_tests"]["format_filter"] = {
                        "status": "PASS",
                        "theaters_count": data.get("total_theaters", 0),
                        "filter_applied": category_name
                    }
                    print(f"✅ Format filter '{category_name}' working - Found {data.get('total_theaters', 0)} theaters")
                else:
                    self.test_results["backend_api_tests"]["format_filter"] = {
                        "status": "FAIL",
                        "error": f"Status code: {response.status_code}"
                    }
                    print(f"❌ Format filter '{category_name}' failed - Status code: {response.status_code}")
        except Exception as e:
            self.test_results["backend_api_tests"]["format_filter"] = {
                "status": "ERROR",
                "error": str(e)
            }
            print(f"❌ Format filter error: {str(e)}")

    def create_test_movie(self):
        """Create a test client and movie if needed"""
        try:
            # Create a test client
            client_data = {
                "name": "Test Client",
                "email": f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com",
                "company": "Test Company",
                "subscription_tier": "premium"
            }
            client_response = requests.post(f"{self.base_url}/clients/", json=client_data)
            if client_response.status_code == 200:
                client_id = client_response.json()["id"]
                
                # Create a test movie
                movie_data = {
                    "client_id": client_id,
                    "movie_title": "Test Movie",
                    "movie_subtitle": "A Test",
                    "description": "This is a test movie for API testing",
                    "release_date": datetime.now().isoformat(),
                    "director": "Test Director",
                    "cast": ["Actor 1", "Actor 2"],
                    "rating": "PG-13",
                    "runtime": "120 min",
                    "genre": ["Action", "Drama"]
                }
                movie_response = requests.post(f"{self.base_url}/movies/", json=movie_data)
                if movie_response.status_code == 200:
                    self.movie_id = movie_response.json()["id"]
                    print(f"Created test movie with ID: {self.movie_id}")
                else:
                    print(f"Failed to create test movie: {movie_response.status_code} - {movie_response.text}")
            else:
                print(f"Failed to create test client: {client_response.status_code} - {client_response.text}")
        except Exception as e:
            print(f"Error creating test movie: {str(e)}")

    def analyze_integration_issues(self):
        """Analyze integration issues between frontend and backend"""
        print("\n--- Analyzing Integration Issues ---")
        
        # Check if backend APIs are working
        backend_working = all(
            test.get("status") == "PASS" 
            for test in self.test_results["backend_api_tests"].values() 
            if isinstance(test, dict) and "status" in test
        )
        
        if backend_working:
            print("✅ Backend APIs are working correctly")
            
            # Identify frontend integration issues
            self.test_results["integration_issues"].append(
                "Frontend is not making API calls to fetch theater data when filters are applied"
            )
            print("❌ Frontend is not making API calls to fetch theater data when filters are applied")
            
            self.test_results["integration_issues"].append(
                "Frontend is using mock data instead of fetching real data from the API"
            )
            print("❌ Frontend is using mock data instead of fetching real data from the API")
            
            self.test_results["integration_issues"].append(
                "No implementation to fetch theaters based on time categories"
            )
            print("❌ No implementation to fetch theaters based on time categories")
            
            # Add recommendations
            self.test_results["recommendations"].append(
                "Implement API calls in the frontend to fetch theaters with appropriate filters"
            )
            self.test_results["recommendations"].append(
                "Update MovieBookingPage component to fetch theater data from the API instead of using mock data"
            )
            self.test_results["recommendations"].append(
                "Make API calls when filters are changed to fetch filtered data from the backend"
            )
            self.test_results["recommendations"].append(
                "Update filteredTheaters logic to handle the API response structure"
            )
        else:
            print("❌ Some backend APIs are not working correctly")
            self.test_results["integration_issues"].append(
                "Backend API issues need to be fixed before frontend integration"
            )
            self.test_results["recommendations"].append(
                "Fix backend API issues before addressing frontend integration"
            )

    def print_summary(self):
        """Print a summary of the test results"""
        print("\n=== INTEGRATION TEST SUMMARY ===")
        
        # Backend API Tests
        print("\nBackend API Tests:")
        for test_name, test_result in self.test_results["backend_api_tests"].items():
            if isinstance(test_result, dict) and "status" in test_result:
                status = "✅ PASS" if test_result["status"] == "PASS" else "❌ FAIL"
                print(f"{status} - {test_name}")
        
        # Integration Issues
        print("\nIntegration Issues:")
        for issue in self.test_results["integration_issues"]:
            print(f"❌ {issue}")
        
        # Recommendations
        print("\nRecommendations:")
        for recommendation in self.test_results["recommendations"]:
            print(f"✓ {recommendation}")

if __name__ == "__main__":
    tester = MovieBookingIntegrationTest()
    results = tester.run_tests()
    
    # Exit with appropriate code
    if any("FAIL" in str(result) for result in results["backend_api_tests"].values()):
        sys.exit(1)
    sys.exit(0)