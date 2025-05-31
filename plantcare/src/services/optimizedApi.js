// Optimized API service with intelligent caching, request batching, and performance monitoring

class OptimizedApiService {
  constructor(baseURL = 'http://localhost:6543') {
    this.baseURL = baseURL;
    this.cache = new Map();
    this.requestQueue = new Map();
    this.performanceMetrics = {
      requests: 0,
      cacheHits: 0,
      averageResponseTime: 0,
      slowQueries: []
    };
  }

  // Cache management
  setCache(key, data, ttl = 60000) { // Default 1 minute TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    // Auto-cleanup old cache entries
    setTimeout(() => this.cache.delete(key), ttl);
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    this.performanceMetrics.cacheHits++;
    return cached.data;
  }

  // Request deduplication - prevent duplicate requests
  async dedupedRequest(key, requestFn) {
    if (this.requestQueue.has(key)) {
      console.log(`Deduplicating request: ${key}`);
      return this.requestQueue.get(key);
    }

    const promise = requestFn();
    this.requestQueue.set(key, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      this.requestQueue.delete(key);
    }
  }

  // Enhanced fetch with performance monitoring
  async enhancedFetch(url, options = {}) {
    const startTime = performance.now();
    this.performanceMetrics.requests++;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Update performance metrics
      this.performanceMetrics.averageResponseTime = 
        (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.requests - 1) + responseTime) / 
        this.performanceMetrics.requests;

      // Track slow queries
      if (responseTime > 1000) {
        this.performanceMetrics.slowQueries.push({
          url,
          responseTime,
          timestamp: Date.now()
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`API Request: ${url} - ${responseTime.toFixed(2)}ms`);
      
      return data;
    } catch (error) {
      console.error(`API Error: ${url}`, error);
      throw error;
    }
  }

  // Optimized dashboard data fetching
  async getDashboardSummary(forceRefresh = false) {
    const cacheKey = 'dashboard_summary';
    
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        console.log('Using cached dashboard data');
        return cached;
      }
    }

    return this.dedupedRequest(cacheKey, async () => {
      const data = await this.enhancedFetch(`${this.baseURL}/dashboard/summary`);
      
      // Cache for 60 seconds
      this.setCache(cacheKey, data, 60000);
      
      return data;
    });
  }

  // Optimized tanaman fetching with search debouncing
  async getTanaman({ search = '', limit = 10, offset = 0 } = {}) {
    const cacheKey = `tanaman_${search}_${limit}_${offset}`;
    
    const cached = this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    return this.dedupedRequest(cacheKey, async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('limit', limit);
      params.append('offset', offset);

      const data = await this.enhancedFetch(`${this.baseURL}/tanaman?${params}`);
      
      // Cache search results for 30 seconds
      this.setCache(cacheKey, data, 30000);
      
      return data;
    });
  }

  // Optimized jadwal fetching
  async getJadwal({ search = '', date = '', limit = 10, offset = 0 } = {}) {
    const cacheKey = `jadwal_${search}_${date}_${limit}_${offset}`;
    
    const cached = this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    return this.dedupedRequest(cacheKey, async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (date) params.append('date', date);
      params.append('limit', limit);
      params.append('offset', offset);

      const data = await this.enhancedFetch(`${this.baseURL}/jadwal?${params}`);
      
      // Cache schedule results for 30 seconds
      this.setCache(cacheKey, data, 30000);
      
      return data;
    });
  }

  // Batch request functionality
  async batchRequests(requests) {
    const promises = requests.map(({ key, requestFn }) => 
      this.dedupedRequest(key, requestFn)
    );
    
    return Promise.allSettled(promises);
  }

  // CRUD operations with cache invalidation
  async createTanaman(tanamanData) {
    const data = await this.enhancedFetch(`${this.baseURL}/tanaman`, {
      method: 'POST',
      body: JSON.stringify(tanamanData),
    });

    // Invalidate related caches
    this.invalidateCache(['dashboard_summary', 'tanaman_']);
    
    return data;
  }

  async updateTanaman(id, tanamanData) {
    const data = await this.enhancedFetch(`${this.baseURL}/tanaman/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tanamanData),
    });

    // Invalidate related caches
    this.invalidateCache(['dashboard_summary', 'tanaman_']);
    
    return data;
  }

  async deleteTanaman(id) {
    const data = await this.enhancedFetch(`${this.baseURL}/tanaman/${id}`, {
      method: 'DELETE',
    });

    // Invalidate related caches
    this.invalidateCache(['dashboard_summary', 'tanaman_']);
    
    return data;
  }

  async createJadwal(jadwalData) {
    const data = await this.enhancedFetch(`${this.baseURL}/jadwal`, {
      method: 'POST',
      body: JSON.stringify(jadwalData),
    });

    // Invalidate related caches
    this.invalidateCache(['dashboard_summary', 'jadwal_']);
    
    return data;
  }

  async updateJadwal(id, jadwalData) {
    const data = await this.enhancedFetch(`${this.baseURL}/jadwal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jadwalData),
    });

    // Invalidate related caches
    this.invalidateCache(['dashboard_summary', 'jadwal_']);
    
    return data;
  }

  async deleteJadwal(id) {
    const data = await this.enhancedFetch(`${this.baseURL}/jadwal/${id}`, {
      method: 'DELETE',
    });

    // Invalidate related caches
    this.invalidateCache(['dashboard_summary', 'jadwal_']);
    
    return data;
  }

  // Cache invalidation
  invalidateCache(patterns) {
    patterns.forEach(pattern => {
      if (pattern.endsWith('_')) {
        // Pattern-based invalidation
        for (const [key] of this.cache) {
          if (key.startsWith(pattern)) {
            this.cache.delete(key);
          }
        }
      } else {
        // Exact key invalidation
        this.cache.delete(pattern);
      }
    });
  }

  // Clear all cache
  clearCache() {
    this.cache.clear();
    console.log('All cache cleared');
  }

  // Performance metrics
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheSize: this.cache.size,
      cacheHitRate: this.performanceMetrics.requests > 0 
        ? (this.performanceMetrics.cacheHits / this.performanceMetrics.requests * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  // Health check
  async checkHealth() {
    try {
      const data = await this.enhancedFetch(`${this.baseURL}/health`);
      return data;
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Preload critical data
  async preloadCriticalData() {
    console.log('Preloading critical data...');
    
    const criticalRequests = [
      { key: 'dashboard_preload', requestFn: () => this.getDashboardSummary() },
    ];

    await this.batchRequests(criticalRequests);
    console.log('Critical data preloaded');
  }
}

// Create singleton instance
const optimizedApi = new OptimizedApiService();

// Export individual functions for backward compatibility
export const getDashboardSummary = (forceRefresh) => optimizedApi.getDashboardSummary(forceRefresh);
export const getTanaman = (params) => optimizedApi.getTanaman(params);
export const getJadwal = (params) => optimizedApi.getJadwal(params);
export const createTanaman = (data) => optimizedApi.createTanaman(data);
export const updateTanaman = (id, data) => optimizedApi.updateTanaman(id, data);
export const deleteTanaman = (id) => optimizedApi.deleteTanaman(id);
export const createJadwal = (data) => optimizedApi.createJadwal(data);
export const updateJadwal = (id, data) => optimizedApi.updateJadwal(id, data);
export const deleteJadwal = (id) => optimizedApi.deleteJadwal(id);

// Export utilities
export const clearApiCache = () => optimizedApi.clearCache();
export const getApiMetrics = () => optimizedApi.getPerformanceMetrics();
export const checkApiHealth = () => optimizedApi.checkHealth();
export const preloadData = () => optimizedApi.preloadCriticalData();

// Export the service instance for advanced usage
export default optimizedApi;
