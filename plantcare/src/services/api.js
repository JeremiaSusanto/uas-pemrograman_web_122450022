// src/services/api.js
// Handler utama untuk request API dengan caching

const BASE_URL = 'http://localhost:6543';

// Simple cache implementation for GET requests
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute cache

function getCacheKey(path, options) {
  return `${path}_${JSON.stringify(options || {})}`;
}

function isValidCache(cacheEntry) {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
}

export async function apiRequest(path, options = {}) {
  try {
    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      const cacheKey = getCacheKey(path, options);
      const cached = cache.get(cacheKey);
      
      if (isValidCache(cached)) {
        console.log(`Cache hit for ${path}`);
        return cached.data;
      }
    }

    const res = await fetch(BASE_URL + path, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.msg || data.message || 'API error: ' + res.status);
    }
    
    // Cache successful GET requests
    if (!options.method || options.method === 'GET') {
      const cacheKey = getCacheKey(path, options);
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }
    
    // Clear cache on write operations
    if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
      cache.clear();
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Function to manually clear cache
export function clearApiCache() {
  cache.clear();
}

// Authentication API
export async function login(username, password) {
  return apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logout(username) {
  return apiRequest('/logout', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}
