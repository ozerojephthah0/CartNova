import type { Request, Response, NextFunction } from 'express';

export interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds (e.g. 60000 for 1 minute)
  maxRequests: number; // Maximum allowed requests in windowMs
  message?: string;
  statusCode?: number;
  name?: string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

export interface ClientRateData {
  timestamps: number[];
  firstRequestTime: number;
  blockedUntil?: number;
  violationsCount: number;
}

export interface BlockedViolationLog {
  id: string;
  timestamp: string;
  ip: string;
  clientKey: string;
  endpoint: string;
  method: string;
  limiterName: string;
  limit: number;
  windowSeconds: number;
  userAgent?: string;
}

export interface RateLimiterStats {
  limiterName: string;
  windowSeconds: number;
  maxRequests: number;
  activeTrackedKeys: number;
  totalAllowedRequests: number;
  totalBlockedRequests: number;
  recentViolations: BlockedViolationLog[];
}

export class SlidingWindowRateLimiter {
  private clients: Map<string, ClientRateData> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;
  public totalAllowed = 0;
  public totalBlocked = 0;
  public recentViolations: BlockedViolationLog[] = [];
  private readonly maxViolationsToKeep = 50;

  constructor(public readonly options: RateLimiterOptions) {
    // Periodically clean up stale client entries every 3 minutes
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 3 * 60 * 1000);

    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Cleans up client records whose timestamps have all expired beyond the window.
   */
  public cleanup(): void {
    const now = Date.now();
    const threshold = now - this.options.windowMs;

    for (const [key, data] of this.clients.entries()) {
      data.timestamps = data.timestamps.filter((ts) => ts > threshold);
      if (data.timestamps.length === 0 && (!data.blockedUntil || data.blockedUntil < now)) {
        this.clients.delete(key);
      }
    }
  }

  /**
   * Reset all records or a specific key
   */
  public reset(key?: string): void {
    if (key) {
      this.clients.delete(key);
    } else {
      this.clients.clear();
      this.totalAllowed = 0;
      this.totalBlocked = 0;
      this.recentViolations = [];
    }
  }

  /**
   * Check and record a request for the given key
   */
  public consume(key: string, now = Date.now()): {
    allowed: boolean;
    remaining: number;
    resetSeconds: number;
    retryAfterSeconds: number;
    currentHits: number;
  } {
    const windowStart = now - this.options.windowMs;
    let data = this.clients.get(key);

    if (!data) {
      data = {
        timestamps: [],
        firstRequestTime: now,
        violationsCount: 0,
      };
      this.clients.set(key, data);
    }

    // Filter out old timestamps outside the current sliding window
    data.timestamps = data.timestamps.filter((ts) => ts > windowStart);

    const currentHits = data.timestamps.length;
    const remaining = Math.max(0, this.options.maxRequests - currentHits);

    // Oldest timestamp in current active window gives the reset time
    const oldestTimestamp = data.timestamps[0] || now;
    const resetTimeMs = oldestTimestamp + this.options.windowMs;
    const resetSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

    if (currentHits >= this.options.maxRequests) {
      // Exceeded
      data.violationsCount += 1;
      this.totalBlocked += 1;
      return {
        allowed: false,
        remaining: 0,
        resetSeconds,
        retryAfterSeconds: resetSeconds,
        currentHits,
      };
    }

    // Allowed
    data.timestamps.push(now);
    this.totalAllowed += 1;

    return {
      allowed: true,
      remaining: Math.max(0, this.options.maxRequests - (currentHits + 1)),
      resetSeconds,
      retryAfterSeconds: 0,
      currentHits: currentHits + 1,
    };
  }

  /**
   * Record a violation log for audit & security inspection
   */
  public recordViolation(req: Request, clientKey: string, ip: string): void {
    const violation: BlockedViolationLog = {
      id: `viol-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ip,
      clientKey,
      endpoint: req.originalUrl || req.url,
      method: req.method,
      limiterName: this.options.name || 'default',
      limit: this.options.maxRequests,
      windowSeconds: Math.round(this.options.windowMs / 1000),
      userAgent: req.headers['user-agent'] as string | undefined,
    };

    this.recentViolations.unshift(violation);
    if (this.recentViolations.length > this.maxViolationsToKeep) {
      this.recentViolations.pop();
    }
  }

  /**
   * Get stats for this rate limiter
   */
  public getStats(): RateLimiterStats {
    this.cleanup();
    return {
      limiterName: this.options.name || 'rate-limiter',
      windowSeconds: Math.round(this.options.windowMs / 1000),
      maxRequests: this.options.maxRequests,
      activeTrackedKeys: this.clients.size,
      totalAllowedRequests: this.totalAllowed,
      totalBlockedRequests: this.totalBlocked,
      recentViolations: [...this.recentViolations],
    };
  }
}

/**
 * Extract reliable client IP from headers or socket
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const first = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
    if (first && first.trim()) {
      return first.trim();
    }
  }

  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (typeof cfConnectingIp === 'string' && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }

  return (
    req.ip ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
}

/**
 * Default composite key generator: IP address + optional User ID
 */
export function defaultKeyGenerator(req: Request, prefix = 'rl'): string {
  const ip = getClientIp(req);
  const userId = (req.headers['x-user-id'] as string) || '';
  return `${prefix}:${ip}${userId ? `:${userId}` : ''}`;
}

/**
 * Creates Express middleware for rate limiting
 */
export function createRateLimiterMiddleware(options: RateLimiterOptions) {
  const limiter = new SlidingWindowRateLimiter(options);

  const middleware = (req: Request, res: Response, next: NextFunction) => {
    // Check if request should bypass rate limiting (e.g. health check)
    if (options.skip && options.skip(req)) {
      return next();
    }

    const ip = getClientIp(req);
    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : defaultKeyGenerator(req, options.name || 'api');

    const result = limiter.consume(key);

    // Standard IETF & draft RateLimit headers
    res.setHeader('RateLimit-Limit', options.maxRequests);
    res.setHeader('RateLimit-Remaining', result.remaining);
    res.setHeader('RateLimit-Reset', result.resetSeconds);

    // Legacy X-RateLimit headers
    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Date.now() + result.resetSeconds * 1000);

    if (!result.allowed) {
      limiter.recordViolation(req, key, ip);

      res.setHeader('Retry-After', result.retryAfterSeconds);

      return res.status(options.statusCode || 429).json({
        success: false,
        error: 'Too Many Requests',
        message:
          options.message ||
          `Rate limit exceeded: Maximum ${options.maxRequests} requests allowed per ${Math.round(
            options.windowMs / 1000
          )}s. Please retry in ${result.retryAfterSeconds} seconds.`,
        code: 'RATE_LIMIT_EXCEEDED',
        limit: options.maxRequests,
        remaining: 0,
        retryAfter: result.retryAfterSeconds,
        windowSeconds: Math.round(options.windowMs / 1000),
        resetTime: new Date(Date.now() + result.retryAfterSeconds * 1000).toISOString(),
      });
    }

    next();
  };

  // Attach limiter instance to the middleware function for programmatic stats and control
  (middleware as any).limiter = limiter;

  return middleware;
}

// =========================================================================
// PRESET RATE LIMITERS FOR CARTNOVA
// =========================================================================

/**
 * Auth Limiter: Protects login, registration, and session tokens from brute-force attacks.
 * Limit: 20 requests per 1 minute per IP.
 */
export const authRateLimiter = createRateLimiterMiddleware({
  name: 'auth-security',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  message: 'Too many authentication attempts. Please wait a moment before trying again.',
  keyGenerator: (req) => defaultKeyGenerator(req, 'auth'),
});

/**
 * AI Assistant & Generator Limiter: Prevents prompt spamming, quota drainage & billing attacks.
 * Limit: 25 requests per 1 minute per IP/User.
 */
export const aiRateLimiter = createRateLimiterMiddleware({
  name: 'ai-concierge',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 25,
  message: 'AI assistant request quota reached. Please wait 60 seconds before sending more prompts.',
  keyGenerator: (req) => defaultKeyGenerator(req, 'ai'),
});

/**
 * Payment & Checkout Limiter: Protects Paystack & Simulated payment endpoints against card testing & fraud.
 * Limit: 30 requests per 1 minute per IP/User.
 */
export const paymentRateLimiter = createRateLimiterMiddleware({
  name: 'payment-security',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Payment request limit reached. Please wait a moment to prevent duplicate charges.',
  keyGenerator: (req) => defaultKeyGenerator(req, 'payment'),
});

/**
 * Admin Action Limiter: Protects high-privilege configuration and administrative dispatch routes.
 * Limit: 40 requests per 1 minute.
 */
export const adminRateLimiter = createRateLimiterMiddleware({
  name: 'admin-operations',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 40,
  message: 'Too many administrative requests executed. Throttling active.',
  keyGenerator: (req) => defaultKeyGenerator(req, 'admin'),
});

/**
 * Global API Limiter: Baseline DoS / DDoS mitigation for all /api/* requests.
 * Limit: 120 requests per 1 minute per IP.
 */
export const globalApiRateLimiter = createRateLimiterMiddleware({
  name: 'global-api',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 120,
  message: 'CartNova API request limit reached. Please slow down your requests.',
  skip: (req) => {
    // Skip health checks from throttling
    return req.path === '/api/health' || req.path === '/health';
  },
  keyGenerator: (req) => defaultKeyGenerator(req, 'global'),
});

/**
 * Collect aggregated stats across all preset limiters
 */
export function getAllRateLimiterStats(): Record<string, RateLimiterStats> {
  return {
    global: (globalApiRateLimiter as any).limiter.getStats(),
    auth: (authRateLimiter as any).limiter.getStats(),
    ai: (aiRateLimiter as any).limiter.getStats(),
    payment: (paymentRateLimiter as any).limiter.getStats(),
    admin: (adminRateLimiter as any).limiter.getStats(),
  };
}

/**
 * Reset all or specific rate limiters
 */
export function resetAllRateLimiters(targetKey?: string): void {
  (globalApiRateLimiter as any).limiter.reset(targetKey);
  (authRateLimiter as any).limiter.reset(targetKey);
  (aiRateLimiter as any).limiter.reset(targetKey);
  (paymentRateLimiter as any).limiter.reset(targetKey);
  (adminRateLimiter as any).limiter.reset(targetKey);
}
