import requests
import unittest
import json
import sys
from datetime import datetime

class CategoriesAPITest(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(CategoriesAPITest, self).__init__(*args, **kwargs)
        self.base_url = "https://f89fb794-9619-4452-9198-7d7904651861.preview.emergentagent.com/api"
        self.category_id = None

    def setUp(self):
        # Initialize default categories if needed
        response = requests.post(f"{self.base_url}/categories/initialize-defaults")
        print(f"Initialized default categories: {response.status_code}")

    def test_01_get_categories(self):
        """Test GET /api/categories/ - should return default categories"""
        response = requests.get(f"{self.base_url}/categories/")
        self.assertEqual(response.status_code, 200)
        categories = response.json()
        self.assertGreaterEqual(len(categories), 11)  # Should have at least 11 default categories
        print(f"Found {len(categories)} categories")
        print(f"Category types: {set([cat['type'] for cat in categories])}")
        
    def test_02_create_category(self):
        """Test POST /api/categories/ - create new category"""
        # Generate a unique name
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        category_name = f"Test Category {timestamp}"
            
        category_data = {
            "name": category_name,
            "type": "format",
            "description": "Test category for API testing",
            "is_active": True
        }
        response = requests.post(f"{self.base_url}/categories/", json=category_data)
        
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
        
    def test_06_delete_category(self):
        """Test DELETE /api/categories/{id} - delete category"""
        if not self.category_id:
            self.test_02_create_category()
            
        response = requests.delete(f"{self.base_url}/categories/{self.category_id}")
        self.assertEqual(response.status_code, 200)
        print(f"Deleted category {self.category_id}")
        
        # Verify it's deleted
        response = requests.get(f"{self.base_url}/categories/{self.category_id}")
        self.assertEqual(response.status_code, 404)
        print("Verified category was deleted")

if __name__ == "__main__":
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add tests in order
    suite.addTest(CategoriesAPITest('test_01_get_categories'))
    suite.addTest(CategoriesAPITest('test_02_create_category'))
    suite.addTest(CategoriesAPITest('test_03_update_category'))
    suite.addTest(CategoriesAPITest('test_04_get_category_types'))
    suite.addTest(CategoriesAPITest('test_05_get_time_categories'))
    suite.addTest(CategoriesAPITest('test_06_delete_category'))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Exit with appropriate code
    sys.exit(not result.wasSuccessful())