from pyramid.events import NewRequest
from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPFound, HTTPUnauthorized, HTTPNotFound, HTTPOk
import json
import psycopg2
import logging
import bcrypt
import time
from psycopg2 import pool
try:
    from .caching import cached, clear_all_cache
except ImportError:
    # For testing purposes, create dummy decorators
    def cached(key_prefix="", expiry=300):
        def decorator(func):
            return func
        return decorator
    def clear_all_cache():
        pass

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Enhanced session management with cache for authentication performance
SESSIONS = set()
# Simple auth cache to avoid repeated database lookups
AUTH_CACHE = {}
AUTH_CACHE_TTL = 300  # 5 minutes cache for successful authentications

def is_auth_cached(username, password):
    """Check if authentication is cached and still valid"""
    cache_key = f"{username}:{hash(password)}"
    cached_entry = AUTH_CACHE.get(cache_key)
    if cached_entry and time.time() - cached_entry['timestamp'] < AUTH_CACHE_TTL:
        logger.info(f"Auth cache hit for user: {username}")
        return True
    return False

def cache_auth(username, password):
    """Cache successful authentication"""
    cache_key = f"{username}:{hash(password)}"
    AUTH_CACHE[cache_key] = {
        'timestamp': time.time(),
        'username': username
    }
    logger.info(f"Auth cached for user: {username}")

# Create a connection pool
pg_pool = None
try:
    pg_pool = pool.SimpleConnectionPool(
        minconn=2,  # Increased minimum connections
        maxconn=20,  # Increased maximum connections for better concurrency
        dbname='plantcare_db',
        user='postgres',
        password='jeremiaz',
        host='localhost'
    )
    logger.info("Database connection pool created successfully (2-20 connections)")
except Exception as e:
    logger.error(f"Error creating connection pool: {e}")

@view_config(route_name='dashboard_summary', renderer='json', request_method='GET')
@cached(expiry=60)  # Cache for 60 seconds since dashboard data changes less frequently
def dashboard_summary_view(request):
    conn = None
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        
        # Single optimized query to get all dashboard data
        dashboard_query = """
        WITH 
        tanaman_counts AS (
            SELECT 
                COUNT(*) as total_tanaman,
                COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_count
            FROM tanaman
        ),
        jadwal_counts AS (
            SELECT 
                COUNT(*) as total_jadwal,
                COUNT(*) FILTER (WHERE tanggal = CURRENT_DATE) as total_jadwal_hari_ini,
                COUNT(*) FILTER (WHERE tanggal >= CURRENT_DATE) as upcoming_count
            FROM jadwal
        ),
        recent_plants AS (
            SELECT 
                json_agg(
                    json_build_object(
                        'id', id,
                        'nama', nama, 
                        'jenis', jenis,
                        'lokasi', lokasi,
                        'created_at', created_at::text
                    ) ORDER BY created_at DESC
                ) as plants
            FROM (
                SELECT id, nama, jenis, lokasi, created_at 
                FROM tanaman 
                ORDER BY created_at DESC 
                LIMIT 5
            ) t
        ),
        upcoming_schedules AS (
            SELECT 
                json_agg(
                    json_build_object(
                        'id', id,
                        'namaTanaman', nama_tanaman,
                        'kegiatan', kegiatan,
                        'tanggal', tanggal::text
                    ) ORDER BY tanggal ASC
                ) as schedules
            FROM (
                SELECT id, nama_tanaman, kegiatan, tanggal 
                FROM jadwal 
                WHERE tanggal >= CURRENT_DATE 
                ORDER BY tanggal ASC 
                LIMIT 5
            ) s
        ),
        plant_stats AS (
            SELECT 
                json_agg(
                    json_build_object(
                        'jenis', jenis,
                        'jumlah', count
                    )
                ) as stats
            FROM (
                SELECT jenis, COUNT(*) as count
                FROM tanaman 
                GROUP BY jenis
                ORDER BY count DESC
            ) ps
        )
        SELECT 
            tc.total_tanaman,
            jc.total_jadwal,
            jc.total_jadwal_hari_ini,
            COALESCE(rp.plants, '[]'::json) as recent_plants,
            COALESCE(us.schedules, '[]'::json) as upcoming_schedules,
            COALESCE(ps.stats, '[]'::json) as plant_stats
        FROM tanaman_counts tc
        CROSS JOIN jadwal_counts jc
        CROSS JOIN recent_plants rp
        CROSS JOIN upcoming_schedules us
        CROSS JOIN plant_stats ps;
        """
        
        start_time = time.time()
        cur.execute(dashboard_query)
        result = cur.fetchone()
        query_time = time.time() - start_time
        
        logger.info(f"Dashboard query executed in {query_time:.3f} seconds")
        
        if result:
            total_tanaman, total_jadwal, total_jadwal_hari_ini, recent_plants_json, upcoming_schedules_json, plant_stats_json = result
            
            # Convert JSON strings to Python objects
            recent_plants = recent_plants_json if recent_plants_json else []
            upcoming_schedules = upcoming_schedules_json if upcoming_schedules_json else []
            plant_stats = plant_stats_json if plant_stats_json else []
        else:
            # Fallback to individual queries if the optimized query fails
            logger.warning("Optimized dashboard query returned no results, falling back to individual queries")
            cur.execute('SELECT COUNT(*) FROM tanaman')
            total_tanaman = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM jadwal')
            total_jadwal = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM jadwal WHERE tanggal = CURRENT_DATE")
            total_jadwal_hari_ini = cur.fetchone()[0]
            recent_plants = []
            upcoming_schedules = []
            plant_stats = []
        
        # System status (cached static data)
        system_status = {
            "status": "online",
            "version": "1.0.0",
            "lastUpdate": None,
            "queryTime": f"{query_time:.3f}s" if 'query_time' in locals() else "unknown",
            "weather": {
                "condition": "sunny",
                "temperature": 29,
                "humidity": 70,
                "ideal_for_plants": True
            }
        }
        
        logger.info(f"Dashboard data retrieved successfully - Plants: {total_tanaman}, Schedules: {total_jadwal}")
        
        return {
            "totalTanaman": total_tanaman,
            "totalJadwal": total_jadwal,
            "totalJadwalHariIni": total_jadwal_hari_ini,
            "recentPlants": recent_plants,
            "upcomingSchedules": upcoming_schedules,
            "plantStats": plant_stats,
            "systemStatus": system_status
        }
    except Exception as e:
        logger.error(f"Error in dashboard_summary_view: {e}")
        return {"error": str(e)}
    finally:
        if conn:
            return_db_conn(conn)
from pyramid.events import NewRequest
from pyramid.view import view_config
from pyramid.httpexceptions import HTTPFound, HTTPUnauthorized, HTTPNotFound, HTTPOk
import json
import psycopg2
import logging
from psycopg2 import pool
try:
    # Try relative import first (for normal app operation)
    from .caching import cached, clear_all_cache
except ImportError:
    # Fall back to absolute import (for testing)
    from caching import cached, clear_all_cache

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global CORS tween (for all responses, including errors)
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

# CORS helper for response callback
def add_cors_headers_response_callback(event):
    def cors_headers(request, response):
        response.headers.update({
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Credentials': 'true',
        })
    event.request.add_response_callback(cors_headers)

def includeme(config):
    config.add_subscriber(add_cors_headers_response_callback, NewRequest)

# Handler for preflight OPTIONS requests
@view_config(route_name='login', request_method='OPTIONS')
@view_config(route_name='dashboard_summary', request_method='OPTIONS')
@view_config(route_name='tanaman', request_method='OPTIONS')
@view_config(route_name='tanaman_detail', request_method='OPTIONS')
@view_config(route_name='jadwal', request_method='OPTIONS')
@view_config(route_name='jadwal_detail', request_method='OPTIONS')
def options_view(request):
    return Response()

# Database connection function
def get_db_conn():
    try:
        if pg_pool:
            return pg_pool.getconn()
        else:
            # Fallback to direct connection if pool is not available
            conn = psycopg2.connect(
                dbname='plantcare_db',
                user='postgres',
                password='jeremiaz',
                host='localhost'
            )
            return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise
        
# Function to return connection to pool        
def return_db_conn(conn):
    if pg_pool and conn:
        pg_pool.putconn(conn)
    else:
        # If not using pool, just close the connection
        try:
            if conn and not conn.closed:
                conn.close()
        except Exception as e:
            logger.error(f"Error closing database connection: {e}")

# Session management (temporary solution)
SESSIONS = set()

@view_config(route_name='home', renderer='json', request_method='GET')
def home_view(request):
    return {"message": "Welcome to PlantCare Pyramid API!"}

# --- AUTH ---
@view_config(route_name='login', renderer='json', request_method='POST')
def login_view(request):
    conn = None
    start_time = time.time()
    
    try:
        data = request.json_body
        username = data.get('username')
        password = data.get('password')
        
        logger.info(f"Login attempt for user: {username}")
        
        # Validate input first (fastest check)
        if not username or not password:
            return HTTPUnauthorized(json_body={"status": "fail", "msg": "Username and password are required"})
        
        # Prioritize hardcoded authentication for development (fastest path)
        if username == 'admin' and password == 'sainsdata':
            elapsed = time.time() - start_time
            logger.info(f"Login successful for admin via hardcoded credentials ({elapsed:.3f}s)")
            SESSIONS.add(username)
            return {"status": "success", "user": username}
            
        # Check cache first to avoid database hit
        if is_auth_cached(username, password):
            elapsed = time.time() - start_time
            logger.info(f"Login successful for {username} via auth cache ({elapsed:.3f}s)")
            SESSIONS.add(username)
            return {"status": "success", "user": username}
        
        # Only check database if not admin (avoid unnecessary DB calls)
        try:
            conn = get_db_conn()
            cur = conn.cursor()
            
            # Optimized query with explicit SELECT and potential for index usage
            cur.execute('SELECT username, password_hash FROM users WHERE username = %s LIMIT 1', [username])
            user_data = cur.fetchone()
            
            if user_data:
                stored_username, stored_password_hash = user_data
                
                # BCrypt check (this is inherently slow for security - ~100-300ms)
                if bcrypt.checkpw(password.encode('utf-8'), stored_password_hash.encode('utf-8')):
                    elapsed = time.time() - start_time
                    logger.info(f"Login successful for {username} via database ({elapsed:.3f}s)")
                    SESSIONS.add(username)
                    # Cache the successful authentication
                    cache_auth(username, password)
                    return {"status": "success", "user": username}
                else:
                    elapsed = time.time() - start_time
                    logger.warning(f"Invalid password for user: {username} ({elapsed:.3f}s)")
            else:
                elapsed = time.time() - start_time
                logger.warning(f"User not found: {username} ({elapsed:.3f}s)")
                
        except Exception as db_error:
            elapsed = time.time() - start_time
            logger.error(f"Database error during login: {db_error} ({elapsed:.3f}s)")
        finally:
            if conn:
                return_db_conn(conn)
            
        elapsed = time.time() - start_time
        logger.warning(f"Login failed for {username} ({elapsed:.3f}s)")
        return HTTPUnauthorized(json_body={"status": "fail", "msg": "Invalid username or password"})
        
    except Exception as e:
        elapsed = time.time() - start_time
        logger.error(f"Login error: {e} ({elapsed:.3f}s)")
        return HTTPUnauthorized(json_body={"status": "error", "msg": "Authentication failed"})

@view_config(route_name='logout', renderer='json', request_method='POST')
def logout_view(request):
    try:
        data = request.json_body
        username = data.get('username')
        SESSIONS.discard(username)
        return {"status": "logout"}
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return {"status": "error", "msg": str(e)}

# Helper function to hash passwords
def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

@view_config(route_name='register', renderer='json', request_method='POST')
def register_view(request):
    conn = None
    try:
        data = request.json_body
        username = data.get('username')
        password = data.get('password')
        
        logger.info(f"Registration attempt for user: {username}")
        
        # Validate input
        if not username or not password:
            return HTTPUnauthorized(json_body={"status": "fail", "msg": "Username and password are required"})
        
        if len(username) < 3:
            return HTTPUnauthorized(json_body={"status": "fail", "msg": "Username must be at least 3 characters"})
            
        if len(password) < 6:
            return HTTPUnauthorized(json_body={"status": "fail", "msg": "Password must be at least 6 characters"})
        
        conn = get_db_conn()
        cur = conn.cursor()
        
        # Check if user already exists
        cur.execute('SELECT username FROM users WHERE username = %s', [username])
        if cur.fetchone():
            return HTTPUnauthorized(json_body={"status": "fail", "msg": "Username already exists"})
        
        # Hash password and create user
        password_hash = hash_password(password)
        cur.execute(
            'INSERT INTO users (username, password_hash) VALUES (%s, %s)',
            [username, password_hash]
        )
        conn.commit()
        
        logger.info(f"User registered successfully: {username}")
        return {"status": "success", "msg": "User registered successfully"}
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        if conn:
            conn.rollback()
        return HTTPUnauthorized(json_body={"status": "error", "msg": "Registration failed"})
    finally:
        if conn:
            return_db_conn(conn)

# --- CRUD TANAMAN ---
@view_config(route_name='tanaman', renderer='json', request_method='GET')
@cached(expiry=60)  # Increased cache time for better performance
def get_tanaman(request):
    conn = None
    try:
        start_time = time.time()
        logger.info("GET /tanaman - Fetching plant data from database")
        conn = get_db_conn()
        cur = conn.cursor()
        
        # Get search parameter
        search = request.params.get('search', '')
        
        # Optimize query with LIMIT if pagination is needed
        limit = request.params.get('limit', '50')  # Reduced default limit for better performance
        offset = request.params.get('offset', '0')  # Default offset to 0
        
        # Validate inputs to prevent SQL injection
        try:
            limit = int(limit)
            offset = int(offset)
            # Limit maximum results to prevent overload
            limit = min(limit, 100)
        except ValueError:
            limit = 50
            offset = 0
            
        # Build optimized query with indexed columns
        base_query = 'SELECT id, nama, jenis, lokasi, created_at FROM tanaman'
        count_query = 'SELECT COUNT(*) FROM tanaman'
        params = []
        
        if search:
            # Use indexed columns for faster search
            search_param = f'%{search}%'
            where_clause = ' WHERE nama ILIKE %s OR jenis ILIKE %s OR lokasi ILIKE %s'
            base_query += where_clause
            count_query += where_clause
            params = [search_param, search_param, search_param]
        
        # Add ordering by indexed column and pagination
        base_query += ' ORDER BY created_at DESC LIMIT %s OFFSET %s'
        
        # Execute main query with performance monitoring
        query_start = time.time()
        if params:
            cur.execute(base_query, params + [limit, offset])
        else:
            cur.execute(base_query, [limit, offset])

        rows = cur.fetchall()
        tanaman = [
            {"id": r[0], "nama": r[1], "jenis": r[2], "lokasi": r[3], "created_at": str(r[4])}
            for r in rows
        ]

        # Get total count for pagination
        count_start = time.time()
        if params:
            cur.execute(count_query, params)
        else:
            cur.execute(count_query)
        total_count = cur.fetchone()[0]
        count_time = time.time() - count_start
        query_time = time.time() - query_start
        total_time = time.time() - start_time

        # Log performance metrics
        logger.info(f"GET /tanaman - Query: {query_time:.3f}s, Count: {count_time:.3f}s, Total: {total_time:.3f}s, Rows: {len(tanaman)} (total: {total_count})")
        if total_time > 0.2:
            logger.warning(f"Slow tanaman endpoint: {total_time:.3f}s")
        return {
            "tanaman": tanaman,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset,
                "queryTime": f"{query_time:.3f}s"
            }
        }
    except Exception as e:
        logger.error(f"Error getting tanaman: {e}")
        # Fallback to dummy data if database fails
        dummy_data = [
            {"id": 1, "nama": "Monstera", "jenis": "Hias", "lokasi": "Ruang Tamu", "created_at": "2025-05-29"},
            {"id": 2, "nama": "Sansevieria", "jenis": "Sukulen", "lokasi": "Kamar", "created_at": "2025-05-29"}
        ]
        logger.info("GET /tanaman - Using fallback dummy data due to database error")
        return {"tanaman": dummy_data, "error": str(e)}
    finally:
        if conn:
            return_db_conn(conn)

@view_config(route_name='tanaman', renderer='json', request_method='POST')
def add_tanaman(request):
    conn = None
    try:
        data = request.json_body
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute(
            'INSERT INTO tanaman (nama, jenis, lokasi) VALUES (%s, %s, %s) RETURNING id, nama, jenis, lokasi, created_at',
            (data.get('nama'), data.get('jenis'), data.get('lokasi'))
        )
        row = cur.fetchone()
        conn.commit()
        
        logger.info(f"Added new tanaman: {row[1]}")
        return {"id": row[0], "nama": row[1], "jenis": row[2], "lokasi": row[3], "created_at": str(row[4])}
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error adding tanaman: {e}")
        return {"status": "error", "msg": str(e)}
    finally:
        if conn:
            return_db_conn(conn)

@view_config(route_name='tanaman_detail', renderer='json', request_method='PUT')
def update_tanaman(request):
    conn = None
    try:
        id = request.matchdict['id']
        data = request.json_body
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute(
            'UPDATE tanaman SET nama = %s, jenis = %s, lokasi = %s WHERE id = %s RETURNING id, nama, jenis, lokasi, created_at',
            (data.get('nama'), data.get('jenis'), data.get('lokasi'), id)
        )
        row = cur.fetchone()
        conn.commit()
        
        if row:
            logger.info(f"Updated tanaman id {id}: {row[1]}")
            return {"id": row[0], "nama": row[1], "jenis": row[2], "lokasi": row[3], "created_at": str(row[4])}
        return HTTPNotFound(json_body={"status": "fail", "msg": f"Tanaman with id {id} not found"})
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error updating tanaman: {e}")
        return {"status": "error", "msg": str(e)}
    finally:
        if conn:
            return_db_conn(conn)

@view_config(route_name='tanaman_detail', renderer='json', request_method='DELETE')
def delete_tanaman(request):
    conn = None
    try:
        id = request.matchdict['id']
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute('DELETE FROM tanaman WHERE id = %s RETURNING id', (id,))
        row = cur.fetchone()
        conn.commit()
        
        if row:
            logger.info(f"Deleted tanaman id {id}")
            return {"status": "success", "msg": f"Tanaman with id {id} deleted"}
        return HTTPNotFound(json_body={"status": "fail", "msg": f"Tanaman with id {id} not found"})
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error deleting tanaman: {e}")
        return {"status": "error", "msg": str(e)}
    finally:
        if conn:
            return_db_conn(conn)

# --- CRUD JADWAL ---
@view_config(route_name='jadwal', renderer='json', request_method='GET')
@cached(expiry=60)  # Increased cache time
def get_jadwal(request):
    conn = None
    try:
        start_time = time.time()
        logger.info("GET /jadwal - Fetching schedule data from database")
        conn = get_db_conn()
        cur = conn.cursor()
        
        # Get query parameters for filtering and search
        search = request.params.get('search', '').strip()
        tanaman_filter = request.params.get('tanaman', '')
        tanggal_filter = request.params.get('tanggal', '')
        
        # Optimize query with reduced default limit
        limit = request.params.get('limit', '50')  # Reduced default limit
        offset = request.params.get('offset', '0')  # Default offset to 0
        
        # Validate inputs to prevent SQL injection
        try:
            limit = int(limit)
            offset = int(offset)
            limit = min(limit, 100)  # Cap maximum limit
        except ValueError:
            limit = 50
            offset = 0
        
        # Build optimized query with actual table columns
        base_query = 'SELECT id, nama_tanaman, kegiatan, tanggal FROM jadwal'
        count_query = 'SELECT COUNT(*) FROM jadwal'
        params = []
        
        where_clauses = []
        
        # Add search functionality
        if search:
            where_clauses.append('(nama_tanaman ILIKE %s OR kegiatan ILIKE %s)')
            search_param = f'%{search}%'
            params.extend([search_param, search_param])
        
        if tanaman_filter:
            where_clauses.append('nama_tanaman ILIKE %s')
            params.append(f'%{tanaman_filter}%')
        
        if tanggal_filter:
            where_clauses.append('tanggal::text = %s')
            params.append(tanggal_filter)
        
        # Apply WHERE clauses
        if where_clauses:
            where_clause = ' WHERE ' + ' AND '.join(where_clauses)
            base_query += where_clause
            count_query += where_clause
        
        # Add sorting by available columns and pagination
        base_query += ' ORDER BY tanggal ASC, id ASC LIMIT %s OFFSET %s'
        
        # Execute main query with performance monitoring
        query_start = time.time()
        if params:
            cur.execute(base_query, params + [limit, offset])
        else:
            cur.execute(base_query, [limit, offset])

        rows = cur.fetchall()
        jadwal = [
            {
                "id": r[0], 
                "namaTanaman": r[1], 
                "kegiatan": r[2], 
                "tanggal": str(r[3]),
                "waktu": None,  # Column doesn't exist in current schema
                "status": "pending"  # Default status since column doesn't exist
            }
            for r in rows
        ]

        # Get total count for pagination
        count_start = time.time()
        if params[:-2]:  # Exclude limit and offset from count query
            cur.execute(count_query, params[:-2])
        else:
            cur.execute(count_query)
        total_count = cur.fetchone()[0]
        count_time = time.time() - count_start
        query_time = time.time() - query_start
        total_time = time.time() - start_time

        logger.info(f"GET /jadwal - Query: {query_time:.3f}s, Count: {count_time:.3f}s, Total: {total_time:.3f}s, Rows: {len(jadwal)} (total: {total_count})")
        if total_time > 0.2:
            logger.warning(f"Slow jadwal endpoint: {total_time:.3f}s")
            cur.execute(count_query, params[:-2])
        else:
            cur.execute(count_query)
        
        total_count = cur.fetchone()[0]
        query_time = time.time() - start_time
        
        # Log performance metrics
        if query_time > 0.1:
            logger.warning(f"Slow jadwal query: {query_time:.3f}s")
        
        logger.info(f"GET /jadwal - Retrieved {len(jadwal)} schedules (total: {total_count}) in {query_time:.3f}s")
        
        return {
            "jadwal": jadwal,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset,
                "queryTime": f"{query_time:.3f}s"
            }
        }
        
        # Get total count for pagination
        count_query = 'SELECT COUNT(*) FROM jadwal'
        if where_clauses:
            count_query += ' WHERE ' + ' AND '.join(where_clauses)
            
        cur.execute(count_query, tuple(params[:-2]) if params else None)
        total_count = cur.fetchone()[0]
        
        logger.info(f"GET /jadwal - Retrieved {len(jadwal)} schedules from database (total: {total_count})")
        # Return in format expected by frontend with pagination info
        return {
            "jadwal": jadwal,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset
            }
        }
    except Exception as e:
        logger.error(f"Error getting jadwal: {e}")
        # Fallback to dummy data if database fails
        dummy_data = [
            {"id": 1, "namaTanaman": "Monstera", "kegiatan": "Menyiram", "tanggal": "2025-05-30", "catatan": "Pagi"}
        ]
        logger.info("GET /jadwal - Using fallback dummy data due to database error")
        return {"jadwal": dummy_data, "error": str(e)}
    finally:
        if conn:
            return_db_conn(conn)

@view_config(route_name='jadwal', renderer='json', request_method='POST')
def add_jadwal(request):
    conn = None
    try:
        data = request.json_body
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute(
            'INSERT INTO jadwal (nama_tanaman, kegiatan, tanggal) VALUES (%s, %s, %s) RETURNING id, nama_tanaman, kegiatan, tanggal',
            (data.get('namaTanaman'), data.get('kegiatan'), data.get('tanggal'))
        )
        row = cur.fetchone()
        conn.commit()
        
        logger.info(f"Added new jadwal for {row[1]}")
        return {"id": row[0], "namaTanaman": row[1], "kegiatan": row[2], "tanggal": str(row[3])}
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error adding jadwal: {e}")
        return {"status": "error", "msg": str(e)}
    finally:
        if conn:
            return_db_conn(conn)

@view_config(route_name='jadwal_detail', renderer='json', request_method='PUT')
def update_jadwal(request):
    conn = None
    try:
        id = request.matchdict['id']
        data = request.json_body
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute(
            'UPDATE jadwal SET nama_tanaman = %s, kegiatan = %s, tanggal = %s WHERE id = %s RETURNING id, nama_tanaman, kegiatan, tanggal',
            (data.get('namaTanaman'), data.get('kegiatan'), data.get('tanggal'), id)
        )
        row = cur.fetchone()
        conn.commit()
        
        if row:
            logger.info(f"Updated jadwal id {id} for {row[1]}")
            return {"id": row[0], "namaTanaman": row[1], "kegiatan": row[2], "tanggal": str(row[3])}
        return HTTPNotFound(json_body={"status": "fail", "msg": f"Jadwal with id {id} not found"})
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error updating jadwal: {e}")
        return {"status": "error", "msg": str(e)}
    finally:
        if conn:
            return_db_conn(conn)

@view_config(route_name='jadwal_detail', renderer='json', request_method='DELETE')
def delete_jadwal(request):
    conn = None
    try:
        id = request.matchdict['id']
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute('DELETE FROM jadwal WHERE id = %s RETURNING id', (id,))
        row = cur.fetchone()
        conn.commit()
        
        if row:
            logger.info(f"Deleted jadwal id {id}")
            return {"status": "success", "msg": f"Jadwal with id {id} deleted"}
        return HTTPNotFound(json_body={"status": "fail", "msg": f"Jadwal with id {id} not found"})
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error deleting jadwal: {e}")
        return {"status": "error", "msg": str(e)}
    finally:
        if conn:
            return_db_conn(conn)
