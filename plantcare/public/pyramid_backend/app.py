from wsgiref.simple_server import make_server
from pyramid.config import Configurator
from pyramid.response import Response
from pyramid.view import view_config


def main(global_config, **settings):
    config = Configurator(settings=settings)
    from pyramid_backend.views import includeme, cors_tween_factory
    config.add_tween('pyramid_backend.views.cors_tween_factory')
    config.include(includeme)
    config.include('pyramid_jinja2')
    config.add_route('home', '/')
    config.add_route('dashboard_summary', '/dashboard')
    config.add_route('tanaman', '/tanaman')
    config.add_route('tanaman_detail', '/tanaman/{id}')
    config.add_route('jadwal', '/jadwal')
    config.add_route('jadwal_detail', '/jadwal/{id}')
    config.add_route('login', '/login')
    config.add_route('logout', '/logout')
    config.add_route('register', '/register')
    config.scan('pyramid_backend.views')
    return config.make_wsgi_app()

if __name__ == '__main__':
    with Configurator() as config:
        try:
            # Try absolute import first (for running as a module)
            from pyramid_backend.views import includeme, cors_tween_factory
        except ImportError:
            # Fallback to relative import (for direct script execution)
            from views import includeme, cors_tween_factory
        config.add_tween('pyramid_backend.views.cors_tween_factory')
        config.include(includeme)
        config.include('pyramid_jinja2')
        config.add_route('home', '/')
        config.add_route('dashboard_summary', '/dashboard')
        config.add_route('tanaman', '/tanaman')
        config.add_route('tanaman_detail', '/tanaman/{id}')
        config.add_route('jadwal', '/jadwal')
        config.add_route('jadwal_detail', '/jadwal/{id}')
        config.add_route('login', '/login')
        config.add_route('logout', '/logout')
        config.add_route('register', '/register')
        config.scan('pyramid_backend.views')
        app = config.make_wsgi_app()
    server = make_server('0.0.0.0', 6543, app)
    print('Pyramid app running on http://localhost:6543')
    server.serve_forever()
