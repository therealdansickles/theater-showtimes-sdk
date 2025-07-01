import requests
import unittest
import json
import sys
from datetime import datetime

class MovieBookingAPITest(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(MovieBookingAPITest, self).__init__(*args, **kwargs)
        self.base_url = "https://f89fb794-9619-4452-9198-7d7904651861.preview.emergentagent.com/api"
        self.movie_id = None
        self.category_id = None

    def setUp(self):
        # Initialize default categories if needed
        response = requests.post(f"{self.base_url}/categories/initialize-defaults")
        print(f"Initialized default categories: {response.status_code}")
        
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

    def test_01_get_categories(self):
        """Test GET /api/categories/ - should return default categories"""
        response = requests.get(f"{self.base_url}/categories/")
        self.assertEqual(response.status_code, 200)
        categories = response.json()
        self.assertGreaterEqual(len(categories), 11)  # Should have at least 11 default categories
        print(f"Found {len(categories)} categories")
        
        # Verify category structure
        for category in categories:
            self.assertIn('id', category)
            self.assertIn('name', category)
            self.assertIn('type', category)
            self.assertIn('description', category)
            self.assertIn('is_active', category)
        
        return categories
        
    def test_02_create_category(self):
        """Test POST /api/categories/ - create new category"""
        # Get existing categories to avoid duplicate name error
        existing_response = requests.get(f"{self.base_url}/categories/")
        existing_names = [cat['name'] for cat in existing_response.json()]
        
        # Generate a unique name
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        category_name = f"Test Category {timestamp}"
        attempt = 1
        while category_name in existing_names and attempt < 5:
            category_name = f"Test Category {timestamp}_{attempt}"
            attempt += 1
            
        category_data = {
            "name": category_name,
            "type": "format",
            "description": "Test category for API testing",
            "is_active": True
        }
        response = requests.post(f"{self.base_url}/categories/", json=category_data)
        
        if response.status_code == 400 and "already exists" in response.text:
            print(f"Category name '{category_name}' already exists, trying to find an existing category to use")
            # If we can't create a new category, use an existing one
            existing_response = requests.get(f"{self.base_url}/categories/")
            if existing_response.status_code == 200 and existing_response.json():
                self.category_id = existing_response.json()[0]['id']
                print(f"Using existing category with ID: {self.category_id}")
                return
                
        self.assertEqual(response.status_code, 200)
        self.category_id = response.json()['id']
        print(f"Created category with ID: {self.category_id}")
        
    def test_03_update_category(self):
        """Test PUT /api/categories/{id} - update category"""
        if not self.category_id:
            self.test_02_create_category()
            
        update_data = {
            "description": "Updated test category description",
            "is_active": True
        }
        response = requests.put(f"{self.base_url}/categories/{self.category_id}", json=update_data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['description'], "Updated test category description")
        print(f"Updated category {self.category_id}")
        
    def test_04_get_category_types(self):
        """Test GET /api/categories/types/available - get category types"""
        response = requests.get(f"{self.base_url}/categories/types/available")
        self.assertEqual(response.status_code, 200)
        types = response.json()['types']
        self.assertEqual(len(types), 3)  # Should have 3 category types
        type_values = [t['value'] for t in types]
        self.assertIn('format', type_values)
        self.assertIn('experience', type_values)
        self.assertIn('special_event', type_values)
        print(f"Found category types: {type_values}")
        
    def test_05_get_time_categories(self):
        """Test GET /api/categories/time-categories/available - get time categories"""
        response = requests.get(f"{self.base_url}/categories/time-categories/available")
        self.assertEqual(response.status_code, 200)
        time_categories = response.json()['time_categories']
        self.assertEqual(len(time_categories), 4)  # Should have 4 time categories
        time_values = [t['value'] for t in time_categories]
        self.assertIn('morning', time_values)
        self.assertIn('afternoon', time_values)
        self.assertIn('evening', time_values)
        self.assertIn('late_night', time_values)
        print(f"Found time categories: {time_values}")
        
        # Verify time category structure
        for time_category in time_categories:
            self.assertIn('value', time_category)
            self.assertIn('label', time_category)
            self.assertIn('description', time_category)
            self.assertIn('time_range', time_category)
        
        return time_categories
        
    def test_06_add_category_to_movie(self):
        """Test POST /api/movies/{movie_id}/categories - add category to movie"""
        if not self.movie_id:
            self.skipTest("No movie ID available for testing")
        if not self.category_id:
            self.test_02_create_category()
            
        response = requests.post(f"{self.base_url}/movies/{self.movie_id}/categories?category_id={self.category_id}")
        self.assertEqual(response.status_code, 200)
        print(f"Added category {self.category_id} to movie {self.movie_id}")
        
    def test_07_get_movie_categories(self):
        """Test GET /api/movies/{movie_id}/categories - get movie categories"""
        if not self.movie_id:
            self.skipTest("No movie ID available for testing")
        if not self.category_id:
            self.test_06_add_category_to_movie()
            
        response = requests.get(f"{self.base_url}/movies/{self.movie_id}/categories")
        self.assertEqual(response.status_code, 200)
        categories = response.json()
        self.assertGreaterEqual(len(categories), 1)
        category_ids = [c['id'] for c in categories]
        self.assertIn(self.category_id, category_ids)
        print(f"Found {len(categories)} categories for movie {self.movie_id}")
        
    def test_08_get_categorized_showtimes(self):
        """Test GET /api/movies/{movie_id}/showtimes/categorized - get categorized showtimes"""
        if not self.movie_id:
            self.skipTest("No movie ID available for testing")
            
        # Test without filters
        response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['movie_id'], self.movie_id)
        print(f"Got categorized showtimes for movie {self.movie_id}")
        
        # Verify response structure
        self.assertIn('movie_id', data)
        self.assertIn('movie_title', data)
        self.assertIn('total_theaters', data)
        self.assertIn('theaters', data)
        self.assertIn('filters_applied', data)
        
        # Verify theater structure
        if data['theaters']:
            theater = data['theaters'][0]
            self.assertIn('theater_id', theater)
            self.assertIn('theater_name', theater)
            self.assertIn('theater_address', theater)
            self.assertIn('screening_formats', theater)
            
            # Verify screening format structure
            if theater['screening_formats']:
                format_info = theater['screening_formats'][0]
                self.assertIn('category_name', format_info)
                self.assertIn('category_id', format_info)
                self.assertIn('times_by_category', format_info)
                
                # Verify times_by_category structure
                times_by_category = format_info['times_by_category']
                self.assertIn('morning', times_by_category)
                self.assertIn('afternoon', times_by_category)
                self.assertIn('evening', times_by_category)
                self.assertIn('late_night', times_by_category)
        
        # Test with time_category filter
        response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized?time_category=evening")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['filters_applied']['time_category'], 'evening')
        print(f"Got evening showtimes for movie {self.movie_id}")
        
        # Test with screening_category filter
        if self.category_id:
            # First get the category name
            cat_response = requests.get(f"{self.base_url}/categories/{self.category_id}")
            if cat_response.status_code == 200:
                category_name = cat_response.json()['name']
                response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized?screening_category={category_name}")
                self.assertEqual(response.status_code, 200)
                data = response.json()
                self.assertEqual(data['filters_applied']['screening_category'], category_name)
                print(f"Got showtimes for category {category_name}")
        
    def test_09_remove_category_from_movie(self):
        """Test DELETE /api/movies/{movie_id}/categories/{category_id} - remove category"""
        if not self.movie_id or not self.category_id:
            self.skipTest("No movie ID or category ID available for testing")
            
        response = requests.delete(f"{self.base_url}/movies/{self.movie_id}/categories/{self.category_id}")
        self.assertEqual(response.status_code, 200)
        print(f"Removed category {self.category_id} from movie {self.movie_id}")
        
    def test_10_delete_category(self):
        """Test DELETE /api/categories/{id} - delete category"""
        if not self.category_id:
            self.skipTest("No category ID available for testing")
            
        response = requests.delete(f"{self.base_url}/categories/{self.category_id}")
        self.assertEqual(response.status_code, 200)
        print(f"Deleted category {self.category_id}")
        
    def test_11_time_categorization(self):
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
                    "category_id": "format_2d",
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
                    "category_id": "format_imax",
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
        print("Created test theater with various time formats")
        
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
    
    def test_12_comprehensive_api_check(self):
        """Comprehensive check of all API endpoints"""
        print("\n=== Comprehensive API Check ===")
        
        # 1. Check health endpoint
        response = requests.get(f"{self.base_url}/health")
        self.assertEqual(response.status_code, 200)
        health_data = response.json()
        self.assertEqual(health_data['status'], 'healthy')
        print("✅ Health endpoint working")
        
        # 2. Check root endpoint
        response = requests.get(f"{self.base_url}/")
        self.assertEqual(response.status_code, 200)
        root_data = response.json()
        self.assertEqual(root_data['status'], 'active')
        print("✅ Root endpoint working")
        
        # 3. Check categories endpoint
        categories = self.test_01_get_categories()
        print(f"✅ Found {len(categories)} categories")
        
        # 4. Check time categories endpoint
        time_categories = self.test_05_get_time_categories()
        print(f"✅ Found {len(time_categories)} time categories")
        
        # 5. Check movies endpoint
        if self.movie_id:
            response = requests.get(f"{self.base_url}/movies/{self.movie_id}")
            self.assertEqual(response.status_code, 200)
            movie_data = response.json()
            self.assertEqual(movie_data['id'], self.movie_id)
            print(f"✅ Movie endpoint working for ID: {self.movie_id}")
            
            # 6. Check showtimes endpoint
            response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized")
            self.assertEqual(response.status_code, 200)
            showtimes_data = response.json()
            self.assertEqual(showtimes_data['movie_id'], self.movie_id)
            print(f"✅ Showtimes endpoint working with {showtimes_data['total_theaters']} theaters")
            
            # 7. Check filtering by time category
            for time_cat in ["morning", "afternoon", "evening", "late_night"]:
                response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized?time_category={time_cat}")
                self.assertEqual(response.status_code, 200)
                print(f"✅ Time filtering working for {time_cat}")
            
            # 8. Check filtering by screening category
            if categories:
                category = categories[0]
                response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized?screening_category={category['name']}")
                self.assertEqual(response.status_code, 200)
                print(f"✅ Category filtering working for {category['name']}")
                
                # 9. Check combined filtering
                response = requests.get(f"{self.base_url}/movies/{self.movie_id}/showtimes/categorized?time_category=evening&screening_category={category['name']}")
                self.assertEqual(response.status_code, 200)
                print(f"✅ Combined filtering working for evening + {category['name']}")
        
        print("=== Comprehensive API Check Complete ===")

if __name__ == "__main__":
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add tests in order
    suite.addTest(MovieBookingAPITest('test_01_get_categories'))
    suite.addTest(MovieBookingAPITest('test_02_create_category'))
    suite.addTest(MovieBookingAPITest('test_03_update_category'))
    suite.addTest(MovieBookingAPITest('test_04_get_category_types'))
    suite.addTest(MovieBookingAPITest('test_05_get_time_categories'))
    suite.addTest(MovieBookingAPITest('test_06_add_category_to_movie'))
    suite.addTest(MovieBookingAPITest('test_07_get_movie_categories'))
    suite.addTest(MovieBookingAPITest('test_08_get_categorized_showtimes'))
    suite.addTest(MovieBookingAPITest('test_09_remove_category_from_movie'))
    suite.addTest(MovieBookingAPITest('test_10_delete_category'))
    suite.addTest(MovieBookingAPITest('test_11_time_categorization'))
    suite.addTest(MovieBookingAPITest('test_12_comprehensive_api_check'))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Exit with appropriate code
    sys.exit(not result.wasSuccessful())