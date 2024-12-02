import InventarioService from "../../inventario/application/InventarioService.js";
import FacturaRepository from "../infrastructure/repositories/FacturaRepository.js";
import DetalleTransaccionService from "./DetalleTransaccionService.js";
import TransaccionService from "./TransaccionService.js";
import EstadoFacturaService from "./EstadoFacturaService.js";
import EstadoTransaccionService from "./EstadoTransaccionService.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import EstadoFacturaRepository from "../infrastructure/repositories/EstadoFacturaRepository.js";
import TransaccionRepository from "../infrastructure/repositories/TransaccionRepository.js";

class FacturaService {
  // Obtener una factura por ID
  async getFacturaById(id) {
    const factura = await FacturaRepository.findById(id);
    if (!factura) {
      throw new Error(`Factura con ID ${id} no encontrada.`);
    }
    return factura;
  }
  // Obtener todas las facturas con filtros y paginación
  async getAllFacturas(filters = {}, options = { page: 1, limit: 10 }) {
    const where = createFilter(filters, allowedFields);
    if (options.search) {
      where[Op.or] = [
        { observaciones: { [Op.like]: `%${options.search}%` } }, // Buscar en
        { fecha_emision: { [Op.like]: `%${options.search}%` } }, // Buscar
        { numero_factura: { [Op.like]: `%${options.search}%` } }, // Buscar en
      ];
    }
    const include = [
      {
        model: EstadoFacturaRepository.getModel(), // Modelo de EstadoTransaccion
        as: "estado", // Alias definido en las asociaciones
        attributes: ["nombre"], // Campos que deseas incluir
      },
    ];
    const result = await paginate(FacturaRepository.getModel(), options, {
      where,
      include,
    });
    return result.data;
  }

  // Crear una factura independiente (sin transacción asociada)
  async crearFacturaIndependiente(data) {
    const facturaData = {
      fecha_emision: new Date(),
      total: data.total,
      ...data,
    };

    return await FacturaRepository.create(facturaData);
  }

  async generarFactura(id_transaccion, id_usuario) {
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );

    if (transaccion.transaccion.dataValues.id_factura) {
      throw new Error("La transacción ya tiene una factura asociada");
    }

    
    // Validar que la transacción esté en un estado adecuado para emitir factura
    const estadoValidos = await EstadoTransaccionService.findByNombres([
      "En Proceso",
      "Pago Pendiente",
      "Pagada",
    ]);

    if (
      !estadoValidos.some(
        (estado) =>
          estado.dataValues.id_estado_transaccion ===
          transaccion.transaccion.dataValues.id_estado_transaccion
      )
    ) {
      throw new Error(
        "La transacción no está en un estado válido para generar factura."
      );
    }

    // Generar número de factura
    const numeroGenerado = await this.generarNumeroFactura();

    // Crear la factura
    const estadoFacturaCreada = await EstadoFacturaService.findByNombre(
      "Creada"
    );

    const factura = await FacturaRepository.create({
      numero_factura: numeroGenerado,
      /* id_cliente: transaccion.transaccion.dataValues.id_cliente, */
/*       id_usuario, */
      total: transaccion.transaccion.dataValues.total,
      id_estado_factura: estadoFacturaCreada.dataValues.id_estado_factura,
      fecha_emision: new Date(),
    });

    // Actualizar la transacción con el ID de la factura
    await TransaccionRepository.update(id_transaccion, {
      id_factura: factura.dataValues.id_factura,
    });

    return factura;
  }

  async generarBoleta(id_transaccion, id_usuario) {
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );

    // Verificar si ya tiene una factura o boleta asociada
    if (transaccion.transaccion.dataValues.id_factura) {
      throw new Error("La transacción ya tiene una factura o boleta asociada.");
    }

    // Validar que la transacción esté en un estado adecuado para emitir boleta
    const estadoCompletado = await EstadoTransaccionService.findByNombre(
      "Pagada"
    );
    if (
      transaccion.transaccion.dataValues.id_estado_transaccion !==
      estadoCompletado.dataValues.id_estado_transaccion
    ) {
      throw new Error(
        "La transacción debe estar pagada para generar una boleta."
      );
    }
    const estadoFacturaCompletado = await EstadoFacturaService.findByNombre(
      "Pagada"
    );

    const numeroGenerado = await this.generarNumeroFactura();
    const boleta = await FacturaRepository.create({
      numero_factura: numeroGenerado,
      id_transaccion,
      id_cliente: transaccion.transaccion.dataValues.id_cliente,
      id_usuario,
      total: transaccion.transaccion.dataValues.total,
      id_estado_factura: estadoFacturaCompletado.dataValues.id_estado_factura, // Las boletas suelen considerarse pagadas automáticamente
    });

    // Actualizar la transacción con el ID de la factura o boleta
    await TransaccionRepository.update(id_transaccion, {
      id_factura: boleta.dataValues.id_factura,
    });

    return boleta;
  }

  async generarNumeroFactura() {
    try {
      // Obtener el último número de factura
      const ultimaFactura = await FacturaRepository.findLastFactura({
        order: [["numero_factura", "DESC"]],
      });

      let nuevoNumero;
      const prefijo = new Date().getFullYear(); // Prefijo del año
      if (ultimaFactura) {
        // Incrementar el número de factura existente
        const ultimoNumero = parseInt(
          ultimaFactura.dataValues.numero_factura.split("-")[1]
        );
        nuevoNumero = `${prefijo}-${(ultimoNumero + 1)
          .toString()
          .padStart(6, "0")}`;
      } else {
        // Primera factura del año
        nuevoNumero = `${prefijo}-000001`;
      }

      return nuevoNumero;
    } catch (error) {
      throw new Error(`Error al generar número de factura: ${error.message}`);
    }
  }

  async crearFacturaDesdeTransaccion(id_transaccion, id_usuario, data) {
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );

    if (!transaccion) throw new Error("Transacción no encontrada.");

    if (transaccion.id_estado_transaccion !== "Completada") {
      throw new Error("Solo se pueden facturar transacciones completadas.");
    }

    const total = transaccion.total;
    const numeroFactura = await this.generarNumeroFactura(); // Método para generar el número.

    const estadoInicial = await EstadoFacturaService.findByNombre("Creada");

    const facturaData = {
      id_transaccion,
      numero_factura: numeroFactura,
      fecha_emision: data.fecha_emision || new Date(),
      total: total,
      estado_factura: estadoInicial,
      ...data,
    };

    const factura = await FacturaRepository.create(facturaData);

    /**
     *
     *
     * Revisar si es necesario cambiar el estado de la transacción
     *
     *
     *
     *
     */
    /* const estadoSiguiente = await EstadoTransaccionService.findByNombre(
      "Completada - Facturada"
    );

    // Actualizar estado de la transacción a "Facturada" si es necesario
    await TransaccionService.changeEstadoTransaccion(
      id_transaccion,
      estadoSiguiente,
      id_usuario
    ); */

    return factura;
  }
  /* Generar Factura para una Transacción */
  async generarFacturaParaTransaccion(
    id_transaccion,
    id_estado_factura,
    id_usuario
  ) {
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );

    if (transaccion.estado !== "Pagada") {
      throw new Error("Solo se puede facturar una transacción pagada");
    }

    return await this.crearFacturaIndependiente({
      id_transaccion,
      id_cliente: transaccion.id_cliente,
      total: transaccion.total,
      fecha: new Date(),
      id_usuario,
      estado: id_estado_factura,
    });
  }

  async actualizarEstadoFactura(id_factura, nuevo_estado) {
    const estado = await EstadoFacturaService.findById(nuevo_estado);

    if (!estado) throw new Error("estado no encontrado.");

    const factura = await FacturaRepository.findById(id_factura);

    if (!factura) throw new Error("Factura no encontrada.");

    await FacturaRepository.update(id_factura, {
      id_estado_factura: nuevo_estado,
    });

    return { message: "Estado de factura actualizado con éxito" };
  }

  async ajustarInventarioPorFactura(id_factura) {
    const factura = await this.getFacturaById(id_factura);

    if (!factura) throw new Error("Factura no encontrada.");

    const detalles = await DetalleTransaccionService.getDetallesByTransaccionId(
      factura.id_transaccion
    );

    for (const detalle of detalles) {
      await InventarioService.ajustarCantidadInventario(
        detalle.id_producto,
        -detalle.cantidad,
        factura.id_usuario
      );
    }

    return { message: "Inventario ajustado por factura emitida" };
  }
  // Eliminar una factura (borrado lógico)
  async eliminarFactura(id) {
    const factura = await FacturaRepository.findById(id);
    if (!factura) {
      throw new Error(`Factura con ID ${id} no encontrada.`);
    }

    await FacturaRepository.update(id, { estado: "Eliminada" });

    return { message: "Factura eliminada exitosamente." };
  }
}

export default new FacturaService();
