/**
 * In-memory sliding window rate limiter
 */

const clientBuckets = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 300;     // 300 ops/min per client

function rateLimiter(req, res, next) {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const now = Date.now();

  let bucket = clientBuckets.get(clientIp);
  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    bucket = { windowStart: now, count: 0 };
    clientBuckets.set(clientIp, bucket);
  }

  bucket.count++;

  if (bucket.count > MAX_REQUESTS) {
    return res.status(429).json({
      errors: [{
        message: 'Too Many Requests: Supergraph operation rate limit exceeded. Please retry shortly.',
        retryAfterMs: WINDOW_MS - (now - bucket.windowStart),
      }],
    });
  }

  next();
}

module.exports = rateLimiter;
