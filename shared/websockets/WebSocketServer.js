let ioInstance = null;

const usuariosConectados = new Map(); // opcional si luego quieres emitir directamente por socket.id

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
  console.log(payload);
  console.log(userId);
  if (!ioInstance) {
    console.error("⚠️ WebSocket no inicializado correctamente");
    return;
  }

  const room = `usuario_${userId}`;
  if (payload.type === "actualizar_mis_pedidos") {
    console.log(`📡 Enviando 'actualizar_mis_pedidos' a sala: ${room}`);
    ioInstance.to(room).emit("actualizar_mis_pedidos");
  } else {
    console.log(`📡 Enviando 'nueva_notificacion' a sala: ${room}`, payload);
    ioInstance.to(room).emit("nueva_notificacion", payload);
  }
};

export default {
  setupWebSocket,
  emitToUser,
};
