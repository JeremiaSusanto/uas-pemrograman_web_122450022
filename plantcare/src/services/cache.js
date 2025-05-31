// src/services/cache.js
// Simple in-memory cache (untuk caching data API di client)

const cache = {};

export function setCache(key, value) {
  cache[key] = {
    value,
    timestamp: Date.now(),
  };
}

export function getCache(key, maxAgeMs = 60000) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > maxAgeMs) {
    delete cache[key];
    return null;
  }
  return entry.value;
}

export function clearCache(key) {
  delete cache[key];
}
