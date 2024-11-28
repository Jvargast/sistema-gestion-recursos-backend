import TransicionTipoTransaccion from "../../domain/models/TransicionTipoTransaccion.js";

class TransicionTipoTransaccionRepository {
  // Obtener todas las transiciones
  async findAll() {
    return await TransicionTipoTransaccion.findAll();
  }

  // Buscar una transición específica por tipo y estado
  async findByTransition(tipoOrigen, estadoOrigen, tipoDestino, estadoDestino) {
    return await TransicionTipoTransaccion.findOne({
      where: {
        tipo_origen: tipoOrigen,
        estado_origen: estadoOrigen,
        tipo_destino: tipoDestino,
        estado_destino: estadoDestino,
      },
    });
  }

  // Buscar todas las transiciones desde un tipo y estado de origen
  async findByOrigen(tipoOrigen, estadoOrigen) {
    return await TransicionTipoTransaccion.findAll({
      where: {
        tipo_origen: tipoOrigen,
        estado_origen: estadoOrigen,
      },
    });
  }

  // Crear una nueva transición
  async create(data) {
    return await TransicionTipoTransaccion.create(data);
  }

  // Actualizar una transición existente
  async updateById(id, data) {
    const [updatedRows] = await TransicionTipoTransaccion.update(data, {
      where: { id_transicion: id },
    });

    return updatedRows > 0;
  }

  // Buscar una transición por ID
  async findById(id) {
    return await TransicionTipoTransaccion.findByPk(id);
  }

  // Eliminar una transición por ID
  async deleteById(id) {
    return await TransicionTipoTransaccion.destroy({
      where: { id_transicion: id },
    });
  }

  // Validar si una transición ya existe
  async exists(tipoOrigen, estadoOrigen, tipoDestino, estadoDestino) {
    const existing = await this.findByTransition(
      tipoOrigen,
      estadoOrigen,
      tipoDestino,
      estadoDestino
    );
    return !!existing;
  }
}

export default new TransicionTipoTransaccionRepository();