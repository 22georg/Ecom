/**
 * Ultra-fast in-memory cache for high-frequency catalog endpoints & category trees.
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCached<T>(key: string, data: T, ttlMs: number = 10000): T {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
  return data;
}

export function clearCachePattern(prefix: string): void {
  memoryCache.forEach((_, key) => {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  });
}
