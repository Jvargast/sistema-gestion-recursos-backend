import rateLimitService from "../services/RateLimitService.js";

const getForwardedIp = (value = "") =>
  String(value)
    .split(",")
    .map((part) => part.trim())
    .find(Boolean);

export const getClientIp = (req) =>
  getForwardedIp(req.headers["x-forwarded-for"]) ||
  req.ip ||
  req.socket?.remoteAddress ||
  "unknown";

export const getSocketIp = (socket) =>
  getForwardedIp(socket.handshake?.headers?.["x-forwarded-for"]) ||
  socket.handshake?.address ||
  socket.conn?.remoteAddress ||
  "unknown";

export const consumeRateLimit = (scope, key, config) =>
  rateLimitService.consume(`${scope}:${key}`, config);

export const createRateLimit = ({
  scope,
  windowMs,
  max,
  message,
  keyGenerator,
  skip,
}) => {
  return (req, res, next) => {
    if (skip?.(req)) {
      return next();
    }

    const rawKey = keyGenerator ? keyGenerator(req) : getClientIp(req);
    const key = String(rawKey || "anonymous");
    const result = consumeRateLimit(scope, key, { windowMs, max });

    res.setHeader("X-RateLimit-Limit", String(result.limit));
    res.setHeader("X-RateLimit-Remaining", String(result.remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

    if (!result.allowed) {
      const retryAfterSeconds = Math.max(1, Math.ceil(result.retryAfterMs / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));

      return res.status(429).json({
        error: message || "Demasiadas solicitudes, intenta nuevamente más tarde.",
        retryAfterSeconds,
      });
    }

    return next();
  };
};
