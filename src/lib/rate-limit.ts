import { NextRequest, NextResponse } from "next/server";

// Simple in-memory LRU-like map for rate limiting
// Note: In serverless (Vercel), this is scoped per-instance. 
// It's not a distributed rate limiter, but it prevents basic spam loops.

interface RateLimitData {
  count: number;
  resetAt: number;
}

const rateLimitCache = new Map<string, RateLimitData>();

// Cleans up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitCache.entries()) {
    if (now > data.resetAt) {
      rateLimitCache.delete(key);
    }
  }
}, 60000); // Clean every minute

export function checkRateLimit(req: NextRequest, limit = 15, windowMs = 10000) {
  // Extract IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0].trim() || realIp || "unknown";

  const now = Date.now();
  let data = rateLimitCache.get(ip);

  // If entry exists but is expired, reset it
  if (data && now > data.resetAt) {
    data = undefined;
  }

  if (!data) {
    data = { count: 1, resetAt: now + windowMs };
    rateLimitCache.set(ip, data);
    return null; // OK
  }

  data.count += 1;
  rateLimitCache.set(ip, data);

  if (data.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": Math.ceil((data.resetAt - now) / 1000).toString() } }
    );
  }

  return null; // OK
}
