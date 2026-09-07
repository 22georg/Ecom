interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const tracker = new Map<string, RateLimitRecord>();

/**
 * Basic rate limiter for authentication routes
 * @param key Unique identifier (IP address + route action)
 * @param limit Max attempts allowed within window
 * @param windowMs Time window in milliseconds (default 15 mins)
 */
export function checkRateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000): { isAllowed: boolean; remaining: number } {
  const now = Date.now();
  const record = tracker.get(key);

  if (!record || now > record.resetTime) {
    tracker.set(key, { count: 1, resetTime: now + windowMs });
    return { isAllowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { isAllowed: false, remaining: 0 };
  }

  record.count += 1;
  return { isAllowed: true, remaining: limit - record.count };
}
