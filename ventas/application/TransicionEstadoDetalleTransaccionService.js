import TransicionEstadoDetalleRepository from "../infrastructure/repositories/TransicionEstadoDetalleRepository.js";

class TransicionEstadoDetalleService {
  async validarTransicion(estadoOrigen, estadoDestino) {
    const transicion = await TransicionEstadoDetalleRepository.findByStates(
      estadoOrigen,
      estadoDestino
    );

    if (!transicion) {
      throw new Error(
        `Transición no válida entre ${estadoOrigen} y ${estadoDestino}`
      );
    }

    return true;
  }

  async validarTransicionesMasivas(transiciones, estado_destino) {

    if (!Array.isArray(transiciones) || transiciones.length === 0) {
      throw new Error(
        "Debe proporcionar un conjunto de transiciones para validar."
      );
    }

    const resultados = [];

    for (const { estado_origen} of transiciones) {
      const transicionValida =
        await TransicionEstadoDetalleRepository.findByStates(
          estado_origen,
          estado_destino
        );

      resultados.push({
        estado_origen,
        estado_destino,
        valida: !!transicionValida,
        mensaje: transicionValida
          ? "Transición válida"
          : `Transición no válida de ${estado_origen} a ${estado_destino}`,
      });
    }

    return resultados;
  }

  // Obtener estados de destino posibles desde un estado origen
  async obtenerEstadosPosibles(estadoOrigen) {
    const transiciones = await TransicionEstadoDetalleRepository.findByOrigen(
      estadoOrigen
    );

    if (!transiciones || transiciones.length === 0) {
      throw new Error(
        `No se encontraron estados posibles desde el estado ${estadoOrigen}`
      );
    }

    return transiciones.map((transicion) => transicion.id_estado_destino);
  }

  // Crear una nueva transición
  async crearTransicion(data) {
    const { id_estado_origen, id_estado_destino } = data;

    const existing = await TransicionEstadoDetalleRepository.findByStates(
      id_estado_origen,
      id_estado_destino
    );

    if (existing) {
      throw new Error(
        `Ya existe una transición entre ${id_estado_origen} y ${id_estado_destino}`
      );
    }

    return await TransicionEstadoDetalleRepository.create(data);
  }

  // Eliminar una transición
  async eliminarTransicion(id_transicion) {
    const deleted = await TransicionEstadoDetalleRepository.deleteById(
      id_transicion
    );
    if (!deleted) {
      throw new Error("No se pudo eliminar la transición");
    }
    return { message: "Transición eliminada con éxito" };
  }
}

export default new TransicionEstadoDetalleService();
