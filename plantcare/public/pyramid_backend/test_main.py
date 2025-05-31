import unittest
import sys
import os
from pyramid import testing
from unittest.mock import patch, MagicMock

# Add the current directory to the path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Import views module
import views

# Mock database connection
views.pg_pool = MagicMock()
views.SESSIONS = set()
views.AUTH_CACHE = {}

class TestPlantCareViews(unittest.TestCase):
    
    def setUp(self):
        self.config = testing.setUp()
        
    def tearDown(self):
        testing.tearDown()

    @patch('views.get_db_conn')
    def test_login_view_success(self, mock_get_db_conn):
        """Test successful login with valid credentials"""
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = ('admin', '$2b$12$hash')
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db_conn.return_value = mock_conn
        
        with patch('views.bcrypt.checkpw', return_value=True):
            request = testing.DummyRequest(json_body={'username': 'admin', 'password': 'password'})
            response = views.login_view(request)
            
            self.assertIsInstance(response, dict)
            self.assertEqual(response['status'], 'success')

    @patch('views.get_db_conn')
    def test_get_tanaman(self, mock_get_db_conn):
        """Test get tanaman with pagination"""
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            (1, 'Plant1', 'Indoor', 'Room1', '2023-05-01'),
            (2, 'Plant2', 'Outdoor', 'Garden', '2023-05-02')
        ]
        mock_cursor.fetchone.return_value = (2,)
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db_conn.return_value = mock_conn

        request = testing.DummyRequest()
        request.GET = {'page': '1', 'per_page': '10'}
        response = views.get_tanaman(request)
        
        self.assertIsInstance(response, dict)
        self.assertIn('tanaman', response)

    @patch('views.get_db_conn')
    def test_add_tanaman(self, mock_get_db_conn):
        """Test add tanaman"""
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1, 'Test Plant', 'Indoor', 'Room', '2023-05-01')
        mock_cursor.rowcount = 1
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db_conn.return_value = mock_conn
        
        request = testing.DummyRequest(json_body={
            'nama': 'Test Plant',
            'jenis': 'Indoor',
            'lokasi': 'Room'
        })
        response = views.add_tanaman(request)
        
        self.assertIsInstance(response, dict)
        self.assertEqual(response['nama'], 'Test Plant')    @patch('views.get_db_conn')
    def test_register_view(self, mock_get_db_conn):
        """Test user registration"""
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None  # User doesn't exist
        mock_cursor.rowcount = 1
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db_conn.return_value = mock_conn
        
        with patch('views.hash_password', return_value=b'hashed_password'):
            request = testing.DummyRequest(json_body={
                'username': 'newuser',
                'password': 'password123',
                'email': 'newuser@example.com'
            })
            response = views.register_view(request)
            
            self.assertIsInstance(response, dict)
            self.assertEqual(response['status'], 'success')

    @patch('views.get_db_conn')
    def test_dashboard_summary_view(self, mock_get_db_conn):
        """Test dashboard summary endpoint"""
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (10, 5, 2, '[]', '[]', '[]')
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db_conn.return_value = mock_conn
        
        request = testing.DummyRequest()
        response = views.dashboard_summary_view(request)
        
        self.assertIsInstance(response, dict)
        self.assertIn('totalTanaman', response)

    @patch('views.get_db_conn')
    def test_get_jadwal(self, mock_get_db_conn):
        """Test get jadwal endpoint"""
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            (1, 'Plant1', 'Watering', '2023-05-01')
        ]
        mock_cursor.fetchone.return_value = (1,)
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db_conn.return_value = mock_conn
        
        request = testing.DummyRequest()
        request.GET = {'page': '1', 'per_page': '10'}
        response = views.get_jadwal(request)
        
        self.assertIsInstance(response, dict)
        self.assertIn('jadwal', response)

    @patch('views.get_db_conn')
    def test_add_jadwal(self, mock_get_db_conn):
        """Test add jadwal endpoint"""
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1, 'Plant1', 'Watering', '2023-05-01')
        mock_cursor.rowcount = 1
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db_conn.return_value = mock_conn
        
        request = testing.DummyRequest(json_body={
            'namaTanaman': 'Plant1',
            'kegiatan': 'Watering',
            'tanggal': '2023-05-01'
        })
        response = views.add_jadwal(request)
        
        self.assertIsInstance(response, dict)
        self.assertEqual(response['namaTanaman'], 'Plant1')

    @patch('views.get_db_conn')
    def test_update_tanaman(self, mock_get_db_conn):
        """Test update tanaman endpoint"""
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1, 'Updated Plant', 'Indoor', 'Room', '2023-05-01')
        mock_cursor.rowcount = 1
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db_conn.return_value = mock_conn
        
        request = testing.DummyRequest(json_body={
            'nama': 'Updated Plant',
            'jenis': 'Indoor',
            'lokasi': 'Room'
        })
        request.matchdict = {'id': '1'}
        response = views.update_tanaman(request)
        
        self.assertIsInstance(response, dict)
        self.assertEqual(response['nama'], 'Updated Plant')

    @patch('views.get_db_conn')
    def test_delete_tanaman(self, mock_get_db_conn):
        """Test delete tanaman endpoint"""
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1,)
        mock_cursor.rowcount = 1
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db_conn.return_value = mock_conn
        
        request = testing.DummyRequest()
        request.matchdict = {'id': '1'}
        response = views.delete_tanaman(request)
        
        self.assertIsInstance(response, dict)
        self.assertEqual(response['status'], 'success')

    def test_home_view(self):
        """Test home endpoint"""
        request = testing.DummyRequest()
        response = views.home_view(request)
        
        self.assertIsInstance(response, dict)
        self.assertIn('message', response)

    def test_logout_view(self):
        """Test logout endpoint"""
        request = testing.DummyRequest(json_body={'username': 'testuser'})
        response = views.logout_view(request)
        
        self.assertIsInstance(response, dict)
        self.assertEqual(response['status'], 'logout')

if __name__ == '__main__':
    unittest.main()
