import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Shared Redis-backed rate limiter.
 *
 * This is suitable for serverless deployments such as Vercel
 * because the rate-limit state is stored in Redis rather than
 * in the memory of a single server instance.
 */

const redis = Redis.fromEnv();

/**
 * General API limiter.
 *
 * Allows 30 requests per minute per identifier.
 */
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "eventapp:api",
});

/**
 * Stricter limiter for sensitive actions such as:
 * - creating bookings
 * - processing payments
 * - generating tickets
 */
export const sensitiveRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "eventapp:sensitive",
});

/**
 * Very strict limiter for actions that could be abused
 * through repeated attempts, such as ticket verification.
 */
export const strictRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "eventapp:strict",
});