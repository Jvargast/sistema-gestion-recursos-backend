class ITransicionEstadoProductoRepository {
  findAll() {
    throw new Error("Método no implementado");
  }

  findByStates(estadoOrigen, estadoDestino) {
    throw new Error("Método no implementado");
  }
  // Obtener todas las transiciones posibles desde un estado de origen.
  findByOrigen(estadoOrigen) {
    throw new Error("Método no implementado");
  }
  // Validar si existe alguna transición que termine en un estado específico.
  findByDestino(estadoDestino) {
    throw new Error("Método no implementado");
  }
  // Crear una nueva transición.
  create(data) {
    throw new Error("Método no implementado");
  }
  // Eliminar una transición específica.
  deleteById(idTransicion) {
    throw new Error("Método no implementado");
  }
  // Actualizar una transición.
  updateById(idTransicion, data) {
    throw new Error("Método no implementado");
  }
}

export default ITransicionEstadoProductoRepository;
