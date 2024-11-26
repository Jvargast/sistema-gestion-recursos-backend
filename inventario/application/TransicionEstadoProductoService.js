import TransicionEstadoProductoRepository from "../infrastructure/repositories/TransicionEstadoProductoRepository";

class TransicionEstadoProductoService {
  async getAllTransitions() {
    return await TransicionEstadoProductoRepository.findAll();
  }

  async getTransition(estadoOrigen, estadoDestino) {
    const transition = await TransicionEstadoProductoRepository.findByStates(
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

  async createTransition(data) {
    const existingTransition =
      await TransicionEstadoProductoRepository.findByStates(
        data.estado_origen,
        data.estado_destino
      );

    if (existingTransition) {
      throw new Error(
        `Ya existe una transición entre ${data.estado_origen} y ${data.estado_destino}`
      );
    }

    return await TransicionEstadoProductoRepository.create(data);
  }

  async validarTransicion(estadoOrigen, estadoDestino) {
    const transicion = await TransicionEstadoProductoRepository.findByStates(
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

  async updateTransition(id, data) {
    const updated = await TransicionEstadoProductoRepository.updateById(
      id,
      data
    );

    if (!updated) {
      throw new Error("No se pudo actualizar la transición");
    }

    return await TransicionEstadoProductoRepository.findById(id);
  }

  async deleteTransition(id) {
    const deleted = await TransicionEstadoProductoRepository.deleteById(id);

    if (!deleted) {
      throw new Error("No se pudo eliminar la transición");
    }

    return { message: "Transición eliminada con éxito" };
  }

  // Retornar una lista de estados posibles a los que se puede transitar desde un estado específico.
  async obtenerEstadosPosibles(estadoOrigen) {
    const transiciones = await TransicionEstadoProductoRepository.findByOrigen(
      estadoOrigen
    );

    if (!transiciones || transiciones.length === 0) {
      throw new Error(`No se encontraron transiciones desde el estado ${estadoOrigen}`);
    }

    return transiciones.map((transicion) => transicion.estado_destino);
  }

  // Verificar un conjunto de transiciones para validaciones en lotes (ej., cambio masivo de estado para varios productos).
  async validarTransicionesMasivas(transiciones) {
    if (!Array.isArray(transiciones) || transiciones.length === 0) {
      throw new Error("Debe proporcionar un conjunto de transiciones para validar.");
    }

    const resultados = [];

    for (const { estado_origen, estado_destino } of transiciones) {
      const transicionValida = await TransicionEstadoProductoRepository.findByStates(
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


    /*   Otra forma
    // Validar cada transición
    const resultados = await Promise.all(
      transiciones.map(async (transicion) => {
        const { id_producto, id_estado_origen, id_estado_destino } = transicion;
        const estadosPosibles = await this.obtenerEstadosPosibles(id_estado_origen);
        return estadosPosibles.includes(id_estado_destino);
      })
    );
    return resultados.every((valido) => valido);*/
  }
}

export default new TransicionEstadoProductoService();
