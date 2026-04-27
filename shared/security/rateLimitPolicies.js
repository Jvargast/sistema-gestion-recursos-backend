import { createRateLimit, getClientIp } from "../middlewares/rateLimit.js";

const normalizeUserKey = (value) =>
  String(value || "anonymous")
    .trim()
    .toLowerCase();

export const authLoginLimiter = createRateLimit({
  scope: "auth-login",
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Demasiados intentos de inicio de sesión. Intenta nuevamente en unos minutos.",
  keyGenerator: (req) => `${getClientIp(req)}:${normalizeUserKey(req.body?.rut)}`,
});

export const authRefreshLimiter = createRateLimit({
  scope: "auth-refresh",
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Demasiadas renovaciones de sesión. Intenta nuevamente más tarde.",
});

export const searchLimiter = createRateLimit({
  scope: "public-search",
  windowMs: 60 * 1000,
  max: 60,
  message: "Demasiadas búsquedas en poco tiempo. Espera un momento e inténtalo otra vez.",
});

export const productImageUploadLimiter = createRateLimit({
  scope: "product-image-upload",
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Demasiadas cargas de imágenes en poco tiempo. Intenta nuevamente más tarde.",
  keyGenerator: (req) => req.user?.id || getClientIp(req),
});

export const socketConnectionRatePolicy = {
  scope: "socket-connection",
  windowMs: 60 * 1000,
  max: 30,
  message: "Demasiadas conexiones de WebSocket desde esta IP.",
};

export const socketEventRatePolicies = {
  subscribe: {
    scope: "socket-subscribe",
    windowMs: 60 * 1000,
    max: 20,
    message: "Demasiadas suscripciones de WebSocket en poco tiempo.",
  },
  location: {
    scope: "socket-location",
    windowMs: 60 * 1000,
    max: 120,
    message: "Demasiados eventos de ubicación en poco tiempo.",
  },
};
