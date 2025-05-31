from wsgiref.simple_server import make_server
import sys
import os

# Add parent directory to import path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pyramid.config import Configurator
from pyramid.response import Response
# Import directly from local path instead of as a module
import pyramid_backend.views as views

# Define cors_tween_factory if it doesn't exist
try:
    cors_tween_factory = views.cors_tween_factory
except:
    # Create one if missing
    def cors_tween_factory(handler, registry):
        def cors_tween(request):
            response = handler(request)
            response.headers.update({
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Credentials': 'true',
            })
            return response
        return cors_tween

if __name__ == '__main__':
    with Configurator() as config:
        # Register CORS tween directly
        config.add_tween(__name__ + '.cors_tween_factory')
        # Add CORS subscriber
        config.include(views.includeme)
        config.include('pyramid_jinja2')
        config.add_route('home', '/')
        config.add_route('tanaman', '/tanaman')
        config.add_route('tanaman_detail', '/tanaman/{id}')
        config.add_route('jadwal', '/jadwal')
        config.add_route('jadwal_detail', '/jadwal/{id}')
        config.add_route('login', '/login')
        config.add_route('logout', '/logout')
        config.add_route('register', '/register')
        config.add_route('dashboard_summary', '/dashboard')
        config.scan('pyramid_backend.views')
        app = config.make_wsgi_app()
    
    server = make_server('0.0.0.0', 6543, app)
    print('Pyramid app running on http://localhost:6543')
    server.serve_forever()
