import { Op } from "sequelize";
import EstadoTransaccionRepository from "../infrastructure/repositories/EstadoTransaccionRepository.js";

class EstadoTransaccionService {
  async findByNombre(nombreEstado) {
    const estado = await EstadoTransaccionRepository.findByNombre(nombreEstado);
    if (!estado) {
      throw new Error(`Estado "${nombreEstado}" no encontrado.`);
    }
    return estado;
  }
  // Método para devolver el estado inicial por tipo de transacción
  async findEstadoInicialByTipo(tipoTransaccion) {
    // Validar entrada
    if (!tipoTransaccion) {
      throw new Error("Debe proporcionar un tipo de transacción.");
    }

    // Buscar el estado inicial en el repositorio
    const estadoInicial =
      await EstadoTransaccionRepository.findByTipoTransaccion(tipoTransaccion);

    if (!estadoInicial) {
      throw new Error(
        `No se encontró un estado inicial para el tipo de transacción ${tipoTransaccion}.`
      );
    }

    return estadoInicial;
  }

  // Método para devolver los estados por tipo de transacción
  async findEstadosByTipo(tipoTransaccion) {
    // Validar entrada
    if (!tipoTransaccion) {
      throw new Error("Debe proporcionar un tipo de transacción.");
    }

    const estados = await EstadoTransaccionRepository.findAll({
      where: {
        tipo_transaccion: tipoTransaccion,
      },
    });

    return estados;
  }

  async findById(idEstado) {
    const estado = await EstadoTransaccionRepository.findById(idEstado);
    if (!estado) {
      throw new Error(`Estado con ID "${idEstado}" no encontrado.`);
    }
    return estado;
  }

  async findByNombres(nombresEstados) {
    const estados = await EstadoTransaccionRepository.findAll({
      where: { nombre_estado: nombresEstados },
    });

    // Verificar que todos los nombres requeridos estén en los resultados
    const nombresEncontrados = estados.map((estado) => estado.dataValues.nombre_estado);
    const nombresFaltantes = nombresEstados.filter(
      (nombre) => !nombresEncontrados.includes(nombre)
    );

    if (nombresFaltantes.length > 0) {
      throw new Error(
        `No se encontraron los estados con los nombres: ${nombresFaltantes.join(
          ", "
        )}`
      );
    }

    return estados;
  }

  async getAllEstados() {
    return await EstadoTransaccionRepository.findAll();
  }

  async obtenerEstadosPermitidos(estadosExcluidos) {
    const estados = await EstadoTransaccionRepository.findAll({
      where: {
        nombre_estado: {
          [Op.notIn]: estadosExcluidos,
        },
      },
    });

    return estados;
  }

  // Obtener IDs por nombres
  async obtenerIdsPorNombres(nombres) {
    const estados = await EstadoTransaccionRepository.findAll({
      where: { nombre_estado: { [Op.in]: nombres } },
    });

    return estados.map((estado) => estado.id_estado_transaccion);
  }

  async createEstado(data) {
    const { nombre_estado } = data;

    // Validar que no exista un estado con el mismo nombre
    const existingEstado = await EstadoTransaccionRepository.findByNombre(
      nombre_estado
    );
    if (existingEstado) {
      throw new Error(`El estado "${nombre_estado}" ya existe.`);
    }

    return await EstadoTransaccionRepository.create(data);
  }

  async updateEstado(idEstado, data) {
    const estado = await EstadoTransaccionRepository.findById(idEstado);
    if (!estado) {
      throw new Error(`Estado con ID "${idEstado}" no encontrado.`);
    }

    return await EstadoTransaccionRepository.update(idEstado, data);
  }

  async deleteEstado(idEstado) {
    const estado = await EstadoTransaccionRepository.findById(idEstado);
    if (!estado) {
      throw new Error(`Estado con ID "${idEstado}" no encontrado.`);
    }

    // Validación adicional: evitar eliminar estados críticos si es necesario
    if (
      estado.nombre_estado === "En Proceso" ||
      estado.nombre_estado === "Facturación Incompleta"
    ) {
      throw new Error(
        `No se puede eliminar el estado crítico "${estado.nombre_estado}".`
      );
    }

    return await EstadoTransaccionRepository.delete(idEstado);
  }
}

export default new EstadoTransaccionService();
