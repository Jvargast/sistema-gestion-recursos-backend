import jwt from "jsonwebtoken";
import AuthService from "../../auth/application/AuthService.js";
import {
  consumeRateLimit,
  getSocketIp,
} from "../middlewares/rateLimit.js";
import {
  socketConnectionRatePolicy,
  socketEventRatePolicies,
} from "../security/rateLimitPolicies.js";

let ioInstance = null;

const usuariosConectados = new Map();

const parseCookies = (cookieHeader = "") => {
  return String(cookieHeader)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, item) => {
      const [name, ...rest] = item.split("=");
      if (!name) return cookies;
      cookies[name] = decodeURIComponent(rest.join("=") || "");
      return cookies;
    }, {});
};

const getSocketToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) {
    return String(authToken).replace(/^Bearer\s+/i, "");
  }

  const cookies = parseCookies(socket.handshake?.headers?.cookie);
  const cookieToken = cookies.authToken;

  if (cookieToken) {
    return String(cookieToken).replace(/^Bearer\s+/i, "");
  }

  return null;
};

const toSocketError = (message, code, extra = {}) => {
  const error = new Error(message);
  error.data = { code, ...extra };
  return error;
};

const ensureSocketEventAllowed = (socket, policy, key) => {
  const result = consumeRateLimit(policy.scope, key, {
    windowMs: policy.windowMs,
    max: policy.max,
  });

  if (!result.allowed) {
    socket.emit("ws_error", {
      code: "RATE_LIMITED",
      message: policy.message,
      retryAfterSeconds: Math.max(1, Math.ceil(result.retryAfterMs / 1000)),
    });
    return false;
  }

  return true;
};

const setupWebSocket = (io) => {
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const ip = getSocketIp(socket);
      const connectionResult = consumeRateLimit(
        socketConnectionRatePolicy.scope,
        ip,
        {
          windowMs: socketConnectionRatePolicy.windowMs,
          max: socketConnectionRatePolicy.max,
        }
      );

      if (!connectionResult.allowed) {
        return next(
          toSocketError(
            socketConnectionRatePolicy.message,
            "RATE_LIMITED",
            {
              retryAfterSeconds: Math.max(
                1,
                Math.ceil(connectionResult.retryAfterMs / 1000)
              ),
            }
          )
        );
      }

      const token = getSocketToken(socket);
      if (!token) {
        return next(
          toSocketError("Token de WebSocket no encontrado.", "UNAUTHORIZED")
        );
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await AuthService.getUserFromToken(decoded);

      if (!user || user.activo === false) {
        return next(
          toSocketError(
            "Usuario no autorizado para conectarse por WebSocket.",
            "FORBIDDEN"
          )
        );
      }

      socket.data.user = user;
      socket.data.clientIp = ip;

      return next();
    } catch (error) {
      return next(
        toSocketError(
          "No se pudo autenticar la conexión WebSocket.",
          "UNAUTHORIZED"
        )
      );
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    const room = `usuario_${user.id}`;

    socket.join(room);
    usuariosConectados.set(user.id, socket.id);

    console.log("⚡ Cliente conectado:", socket.id);

    socket.on("subscribe", (usuarioId) => {
      if (
        !ensureSocketEventAllowed(
          socket,
          socketEventRatePolicies.subscribe,
          user.id
        )
      ) {
        return;
      }

      if (usuarioId && String(usuarioId) !== String(user.id)) {
        socket.emit("ws_error", {
          code: "FORBIDDEN",
          message: "No puedes suscribirte a la sala de otro usuario.",
        });
        return;
      }

      socket.join(room);
      usuariosConectados.set(user.id, socket.id);
      console.log(`✅ Usuario ${user.id} suscrito a sala: ${room}`);
    });

    socket.on("ubicacion_chofer", (data = {}) => {
      if (
        !ensureSocketEventAllowed(
          socket,
          socketEventRatePolicies.location,
          user.id
        )
      ) {
        return;
      }

      if (user.rol !== "chofer" && user.rol !== "administrador") {
        socket.emit("ws_error", {
          code: "FORBIDDEN",
          message: "No tienes permisos para emitir ubicaciones.",
        });
        return;
      }

      io.emit("ubicacion_chofer", {
        ...data,
        rut: user.rut,
        usuarioId: user.id,
      });
    });

    socket.on("disconnect", () => {
      for (let [userId, sockId] of usuariosConectados.entries()) {
        if (sockId === socket.id) {
          usuariosConectados.delete(userId);
          break;
        }
      }
      console.log("❌ Cliente desconectado:", socket.id);
    });
  });
};

const emitToUser = (userId, payload) => {
  if (!ioInstance) {
    console.error("⚠️ WebSocket no inicializado correctamente");
    return;
  }

  const room = `usuario_${userId}`;

  switch (payload.type) {
    case "actualizar_mis_pedidos":
      console.log(`📡 Enviando 'actualizar_mis_pedidos' a sala: ${room}`);
      ioInstance.to(room).emit("actualizar_mis_pedidos");
      break;

    case "actualizar_agenda_chofer":
      console.log(`📡 Enviando 'actualizar_agenda_chofer' a sala: ${room}`);
      ioInstance.to(room).emit("actualizar_agenda_chofer", payload.data);
      break;

    case "nueva_ubicacion_chofer":
      ioInstance.to(room).emit("nueva_ubicacion_chofer", payload.data);
      break;

    default:
      console.log(`📡 Enviando 'nueva_notificacion' a sala: ${room}`, payload);
      ioInstance.to(room).emit("nueva_notificacion", payload);
      break;
  }
};

export default {
  setupWebSocket,
  emitToUser,
};
