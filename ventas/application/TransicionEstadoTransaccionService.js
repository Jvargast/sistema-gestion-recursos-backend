import TransicionEstadoTransaccionRepository from "../infrastructure/repositories/TransicionEstadoTransaccionRepository.js";

class TransicionEstadoTransaccionService {
  async getAllTransitions() {
    return await TransicionEstadoTransaccionRepository.findAll();
  }

  async getTransition(estadoOrigen, estadoDestino) {
    const transition = await TransicionEstadoTransaccionRepository.findByStates(
      estadoOrigen,
      estadoDestino
    );

    if (!transition) {
      throw new Error(
        `No se encontró una transición entre ${estadoOrigen} y ${estadoDestino}`
      );
    }

    return transition;
  }

  async crearTransicionEstado(data) {
    const { id_estado_origen, id_estado_destino } = data;

    // Verificar si la transición ya existe
    const existente = await TransicionEstadoTransaccionRepository.findByStates(
      id_estado_origen,
      id_estado_destino
    );

    if (existente) {
      throw new Error(
        `Ya existe una transición entre ${id_estado_origen} y ${id_estado_destino}`
      );
    }

    // Crear la nueva transición
    return await TransicionEstadoTransaccionRepository.create(data);
  }

  // Podría ser un shared/util para varias instancias
  async validarTransicion(estadoOrigen, estadoDestino) {
    const transicion = await TransicionEstadoTransaccionRepository.findByStates(
      estadoOrigen,
      estadoDestino
    );

    if (!transicion) {
      throw new Error(
        `Transición no permitida de ${estadoOrigen} a ${estadoDestino}`
      );
    }
    return true;
  }

  async deleteTransition(id) {
    const deleted = await TransicionEstadoTransaccionRepository.deleteById(id);

    if (!deleted) {
      throw new Error("No se pudo eliminar la transición");
    }

    return { message: "Transición eliminada con éxito" };
  }

  // Retornar una lista de estados posibles a los que se puede transitar desde un estado específico.
  async obtenerEstadosPosibles(estadoOrigen) {
    const transiciones =
      await TransicionEstadoTransaccionRepository.findByOrigen(estadoOrigen);

    if (!transiciones || transiciones.length === 0) {
      throw new Error(
        `No se encontraron transiciones desde el estado ${estadoOrigen}`
      );
    }

    return transiciones.map((transicion) => transicion.estado_destino);
  }

  // Verificar un conjunto de transiciones para validaciones en lotes (ej., cambio masivo de estado para varios productos).
  async validarTransicionesMasivas(transiciones) {
    if (!Array.isArray(transiciones) || transiciones.length === 0) {
      throw new Error(
        "Debe proporcionar un conjunto de transiciones para validar."
      );
    }

    const resultados = [];

    for (const { estado_origen, estado_destino } of transiciones) {
      const transicionValida =
        await TransicionEstadoTransaccionRepository.findByStates(
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
}

export default new TransicionEstadoTransaccionService();
