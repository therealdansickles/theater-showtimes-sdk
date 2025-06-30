import requests
import unittest
import json
import sys
from datetime import datetime

class MovieTimeCategorizationTest(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(MovieTimeCategorizationTest, self).__init__(*args, **kwargs)
        self.base_url = "https://f89fb794-9619-4452-9198-7d7904651861.preview.emergentagent.com/api"
        self.movie_id = None
        self.theater_id = None
        self.category_ids = []

    def setUp(self):
        # Get a movie ID to use for testing
        response = requests.get(f"{self.base_url}/movies/?limit=1")
        if response.status_code == 200 and response.json():
            self.movie_id = response.json()[0]['id']
            print(f"Using movie ID: {self.movie_id}")
        else:
            print("No movies found, creating a test client and movie")
            # Create a test client
            client_data = {
                "name": "Test Client",
                "email": f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com",
                "company": "Test Company",
                "subscription_tier": "premium"
            }
            client_response = requests.post(f"{self.base_url}/clients/", json=client_data)
            if client_response.status_code == 200:
                client_id = client_response.json()['id']
                
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
                    self.movie_id = movie_response.json()['id']
                    print(f"Created test movie with ID: {self.movie_id}")
                else:
                    print(f"Failed to create test movie: {movie_response.status_code} - {movie_response.text}")
            else:
                print(f"Failed to create test client: {client_response.status_code} - {client_response.text}")
        
        # Get category IDs for testing
        response = requests.get(f"{self.base_url}/categories/")
        if response.status_code == 200:
            categories = response.json()
            for category in categories[:2]:  # Get first two categories
                self.category_ids.append(category['id'])
            print(f"Using category IDs: {self.category_ids}")

    def test_01_time_categorization(self):
        """Test time categorization with various formats"""
        if not self.movie_id:
            self.skipTest("No movie ID available for testing")
            
        # Create a test theater with various time formats
        theater_data = {
            "name": "Test Theater",
            "chain": "TEST",
            "address": "123 Test St",
            "city": "Test City",
            "state": "TS",
            "zip_code": "12345",
            "formats": [
                {
                    "category_id": self.category_ids[0] if self.category_ids else "format_2d",
                    "category_name": "2D",
                    "times": [
                        {
                            "time": "7:00 AM",
                            "category": "morning"
                        },
                        {
                            "time": "12:30 PM",
                            "category": "afternoon"
                        },
                        {
                            "time": "7:00 PM",
                            "category": "evening"
                        },
                        {
                            "time": "10:30 PM",
                            "category": "late_night"
                        }
                    ]
                },
                {
                    "category_id": self.category_ids[1] if len(self.category_ids) > 1 else "format_imax",
                    "category_name": "IMAX",
                    "times": [
                        {
                            "time": "09:30",
                            "category": "morning"
                        },
                        {
                            "time": "14:00",
                            "category": "afternoon"
                        },
                        {
                            "time": "19:00",
                            "category": "evening"
                        },
                        {
                            "time": "22:30",
                            "category": "late_night"
                        }
                    ]
                }
            ]
        }
        
        response = requests.post(f"{self.base_url}/movies/{self.movie_id}/theaters", json=theater_data)
        self.assertEqual(response.status_code, 200)
        self.theater_id = response.json()['id']
        print(f"Created test theater with ID: {self.theater_id} and various time formats")
        
    def test_02_filter_by_time_category(self):
        """Test filtering by time category"""
        if not self.movie_id:
            self.skipTest("No movie ID available for testing")
        
        if not self.theater_id:
            self.test_01_time_categorization()
            
        # Test filtering by time category
        for time_cat in ["morning", "afternoon", "evening", "late_night"]:
            response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized?time_category={time_cat}")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            
            # Verify that only the requested time category is included
            for theater in data['theaters']:
                for format_info in theater['screening_formats']:
                    # The requested time category should have times, others should be empty
                    self.assertGreater(len(format_info['times_by_category'][time_cat]), 0)
                    for other_cat in ["morning", "afternoon", "evening", "late_night"]:
                        if other_cat != time_cat:
                            self.assertEqual(len(format_info['times_by_category'][other_cat]), 0)
            
            print(f"Successfully filtered showtimes by time category: {time_cat}")
            
    def test_03_filter_by_screening_category(self):
        """Test filtering by screening category"""
        if not self.movie_id or not self.category_ids:
            self.skipTest("No movie ID or category IDs available for testing")
            
        if not self.theater_id:
            self.test_01_time_categorization()
            
        # Get the category name for the first category
        response = requests.get(f"{self.base_url}/categories/{self.category_ids[0]}")
        if response.status_code == 200:
            category_name = response.json()['name']
            
            # Test filtering by screening category
            response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized?screening_category={category_name}")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            
            # Verify that only the requested screening category is included
            for theater in data['theaters']:
                for format_info in theater['screening_formats']:
                    self.assertEqual(format_info['category_name'], category_name)
            
            print(f"Successfully filtered showtimes by screening category: {category_name}")
            
    def test_04_combined_filtering(self):
        """Test combined filtering by time and screening category"""
        if not self.movie_id or not self.category_ids:
            self.skipTest("No movie ID or category IDs available for testing")
            
        if not self.theater_id:
            self.test_01_time_categorization()
            
        # Get the category name for the first category
        response = requests.get(f"{self.base_url}/categories/{self.category_ids[0]}")
        if response.status_code == 200:
            category_name = response.json()['name']
            
            # Test combined filtering
            response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized?screening_category={category_name}&time_category=evening")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            
            # Verify that only the requested screening category and time category are included
            for theater in data['theaters']:
                for format_info in theater['screening_formats']:
                    self.assertEqual(format_info['category_name'], category_name)
                    self.assertGreater(len(format_info['times_by_category']['evening']), 0)
                    for other_cat in ["morning", "afternoon", "late_night"]:
                        self.assertEqual(len(format_info['times_by_category'][other_cat]), 0)
            
            print(f"Successfully filtered showtimes by screening category: {category_name} and time category: evening")

if __name__ == "__main__":
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add tests in order
    suite.addTest(MovieTimeCategorizationTest('test_01_time_categorization'))
    suite.addTest(MovieTimeCategorizationTest('test_02_filter_by_time_category'))
    suite.addTest(MovieTimeCategorizationTest('test_03_filter_by_screening_category'))
    suite.addTest(MovieTimeCategorizationTest('test_04_combined_filtering'))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Exit with appropriate code
    sys.exit(not result.wasSuccessful())