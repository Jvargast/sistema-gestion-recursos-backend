class RateLimitService {
  constructor() {
    this.windows = new Map();
    this.lastCleanupAt = 0;
  }

  consume(key, { windowMs, max }) {
    const now = Date.now();
    this.cleanupExpired(now);

    const current = this.windows.get(key);

    if (!current || current.resetAt <= now) {
      const nextWindow = {
        count: 1,
        resetAt: now + windowMs,
      };

      this.windows.set(key, nextWindow);

      return {
        allowed: true,
        limit: max,
        remaining: Math.max(0, max - nextWindow.count),
        retryAfterMs: 0,
        resetAt: nextWindow.resetAt,
      };
    }

    current.count += 1;

    if (current.count > max) {
      return {
        allowed: false,
        limit: max,
        remaining: 0,
        retryAfterMs: Math.max(0, current.resetAt - now),
        resetAt: current.resetAt,
      };
    }

    return {
      allowed: true,
      limit: max,
      remaining: Math.max(0, max - current.count),
      retryAfterMs: 0,
      resetAt: current.resetAt,
    };
  }

  cleanupExpired(now = Date.now()) {
    if (now - this.lastCleanupAt < 60_000) {
      return;
    }

    for (const [key, value] of this.windows.entries()) {
      if (value.resetAt <= now) {
        this.windows.delete(key);
      }
    }

    this.lastCleanupAt = now;
  }
}

export default new RateLimitService();
