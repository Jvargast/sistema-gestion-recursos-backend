let ioInstance = null;

const usuariosConectados = new Map();

const setupWebSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("⚡ Cliente conectado:", socket.id);

    socket.on("subscribe", (usuarioId) => {
      const room = `usuario_${usuarioId}`;
      socket.join(room);
      usuariosConectados.set(usuarioId, socket.id);
      console.log(`✅ Usuario ${usuarioId} suscrito a sala: ${room}`);
    });

    socket.on("ubicacion_chofer", (data) => {
      io.emit("ubicacion_chofer", data); 
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
