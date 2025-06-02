"""
Simple cache implementation for the PlantCare application
"""
import time
from functools import wraps
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Simple cache dictionary
cache = {}

def cached(key_prefix="", expiry=60):
    """
    A decorator that caches the result of a function for a specified time.
    
    Args:
        key_prefix: Optional prefix for the cache key
        expiry: The time to live for the cache in seconds
    """
    def decorator(func):
        from functools import wraps
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            # Create a cache key based on the function name and request params (for GET views)
            params = dict(request.params) if hasattr(request, 'params') else {}
            key = f"{key_prefix}{func.__name__}:{str(sorted(params.items()))}"
            
            # Check if we have a cached value that hasn't expired
            if key in cache and cache[key]['expires'] > time.time():
                logger.info(f"Cache hit for {key}")
                return cache[key]['value']
            
            # Call the original function
            result = func(request, *args, **kwargs)
              # Cache the result with an expiration time
            cache[key] = {
                'value': result,
                'expires': time.time() + expiry
            }
            logger.info(f"Cache miss for {key}, stored new result")
            
            return result
        
        # Add a method to clear the specific cache for this function
        def clear_cache():
            keys_to_remove = [k for k in cache if k.startswith(f"{func.__name__}:")]
            for k in keys_to_remove:
                del cache[k]
            logger.info(f"Cleared cache for {func.__name__}")
            
        wrapper.clear_cache = clear_cache
        return wrapper
    
    return decorator

def clear_all_cache():
    """Clear all cached data"""
    cache.clear()
    logger.info("Cleared all cache")
