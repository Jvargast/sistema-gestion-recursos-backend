import TransaccionRepository from "../infrastructure/repositories/TransaccionRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import EstadoTransaccionService from "./EstadoTransaccionService.js";
import ClienteService from "./ClienteService.js";
import LogTransaccionService from "./LogTransaccionService.js";
import DetalleTransaccionService from "./DetalleTransaccionService.js";

class TransaccionService {
  async getTransaccionById(id) {
    const transaccion = await TransaccionRepository.findById(id);
    if (!transaccion) {
      throw new Error("Transacción no encontrada.");
    }

    const detalles = await DetalleTransaccionService.getDetallesByTransaccionId(
      id
    );
    return { transaccion, detalles };
  }

  async getAllTransacciones(filters = {}, options = {}) {
    const allowedFields = [
      "tipo_transaccion",
      "estado_pago",
      "id_cliente",
      "id_usuario",
      "fecha_creacion",
      "total",
      "numero_factura",
      "tipo_comprobante",
      "id_estado_transaccion",
    ];
    const where = createFilter(filters, allowedFields);

    // Aplicar paginación
    return await paginate(TransaccionRepository.getModel(), options, { where });
  }

  async createTransaccion(data, detalles = []) {
    const { id_cliente, id_usuario, tipo_transaccion } = data;

    // Validar cliente
    await ClienteService.getClienteById(id_cliente);

    // Buscar el estado inicial de la transacción
    const estadoInicialNombre =
      tipo_transaccion === "factura" ? "Facturación Incompleta" : "En Proceso";

    const estadoInicial = await EstadoTransaccionService.findByNombre(
      estadoInicialNombre
    );

    // Crear transacción
    const transaccion = await TransaccionRepository.create({
      ...data,
      id_estado_transaccion: estadoInicial.id_estado_transaccion,
      fecha_creacion: new Date()
    });

    // Registrar log de creación de transacción
    await LogTransaccionService.createLog({
      id_transaccion: transaccion.id_transaccion,
      id_usuario,
      accion: "Creación de transacción",
      detalles: `Transacción creada con tipo: ${tipo_transaccion} y estado inicial: ${estadoInicialNombre}`,
    });

    return transaccion;
  }

  async addDetallesToTransaccion(id_transaccion, detalles, id_usuario) {
    const transaccion = await this.getTransaccionById(id_transaccion);

    const detallesData = detalles.map((detalle) => ({
      ...detalle,
      id_transaccion,
    }));
    await DetalleTransaccionService.createDetalles(detalles, id_transaccion, transaccion.transaccion.tipo_transaccion);

    // Cambiar estado de la transacción si es necesario
    if (transaccion.transaccion.tipo_transaccion === "venta") {
      //Verificar con otro servicio el estado
      const estadoCompletado = await EstadoTransaccionService.findByNombre(
        "Completada"
      );
      if (!estadoCompletado) {
        throw new Error('Estado "Completada" no encontrado.');
      }
      await this.changeEstadoTransaccion(
        id_transaccion,
        estadoCompletado.id_estado_transaccion,
        id_usuario
      );
    }
  }

  async changeEstadoTransaccion(id, id_estado_transaccion, id_usuario) {
    await this.getTransaccionById(id);
    const updated = await TransaccionRepository.update(id, {
      id_estado_transaccion,
    });

    // Registrar log de cambio de estado
    await LogTransaccionRepository.create({
      id_transaccion: id,
      id_usuario,
      accion: "Cambio de estado",
      detalles: `Estado cambiado a ${id_estado_transaccion}`,
      fecha_modificacion: new Date(),
    });

    return updated;
  }

  async changeTipoTransaccion(id, tipo_transaccion, id_usuario) {
    const transaccion = await this.getTransaccionById(id);

    // Validar reglas de cambio de tipo
    if (
      transaccion.tipo_transaccion === "factura" &&
      tipo_transaccion !== "venta"
    ) {
      throw new Error(
        "No se puede cambiar una factura a otro tipo que no sea venta."
      );
    }

    // Actualizar tipo
    const updated = await TransaccionRepository.update(id, {
      tipo_transaccion,
    });

    // Registrar log de cambio de tipo
    await LogTransaccionRepository.create({
      id_transaccion: id,
      id_usuario,
      accion: "Cambio de tipo",
      detalles: `Tipo cambiado a ${tipo_transaccion}`,
      fecha_modificacion: new Date(),
    });

    return updated;
  }

  async getTransaccionesByCliente(id_cliente, filters = {}, options = {}) {
    const cliente = await ClienteService.getClienteById(id_cliente);

    // Agregar filtro por cliente
    filters.id_cliente = id_cliente;
    return await this.getAllTransacciones(filters, options);
  }

  async deleteTransacciones(ids, id_usuario) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error(
        "Debe proporcionar al menos un ID de transacción para eliminar."
      );
    }

    // Buscar las transacciones antes de eliminarlas
    const transacciones = await TransaccionRepository.findByIds(ids);
    if (transacciones.length !== ids.length) {
      const notFoundIds = ids.filter(
        (id) =>
          !transacciones.some(
            (transaccion) => transaccion.id_transaccion === id
          )
      );
      throw new Error(
        `Las siguientes transacciones no fueron encontradas: ${notFoundIds.join(
          ", "
        )}`
      );
    }

    // Eliminar todas las transacciones en una sola operación
    await TransaccionRepository.bulkDelete(ids);

    // Registrar logs para cada transacción eliminada
    const logs = transacciones.map((transaccion) => ({
      id_transaccion: transaccion.id_transaccion,
      id_usuario,
      accion: "Eliminación de transacción",
      detalles: `Transacción eliminada con ID ${transaccion.id_transaccion}`,
      fecha_modificacion: new Date(),
    }));

    await LogTransaccionRepository.bulkCreate(logs);

    return {
      message: `Se eliminaron ${ids.length} transacciones.`,
      transaccionesEliminadas: ids,
    };
  }
}

export default new TransaccionService();
