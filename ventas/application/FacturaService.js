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
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import { Op, Sequelize } from "sequelize";
import DocumentoRepository from "../infrastructure/repositories/DocumentoRepository.js";
import BoletaRepository from "../infrastructure/repositories/BoletaRepository.js";
import EstadoPagoRepository from "../infrastructure/repositories/EstadoPagoRepository.js";

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
  async getAllFacturas(filters = {}, options) {
    const allowedFields = [
      "id_factura",
      "numero_factura",
      "forma_pago",
      "precios_opcion",
    ];
    const where = createFilter(filters, allowedFields);
    if (options.search) {
      where[Op.or] = [
        { "$documento.cliente.nombre$": { [Op.like]: `%${options.search}%` } }, // Buscar en
        Sequelize.where(
          Sequelize.cast(Sequelize.col("documento.fecha_emision"), "text"),
          { [Op.like]: `%${options.search}%` }
        ), // Buscar
        { numero_factura: { [Op.like]: `%${options.search}%` } }, // Buscar en
      ];
    }
    const include = [
      {
        model: DocumentoRepository.getModel(),
        as: "documento",
        attributes: ["tipo_documento", "total", "fecha_emision"],
        include: [
          {
            model: ClienteRepository.getModel(),
            as: "cliente",
            attributes: ["id_cliente","nombre", "email", "rut"], // Atributos del cliente
          },
          {
            model: TransaccionRepository.getModel(),
            as: "transaccion",
          },
          {
            model: EstadoPagoRepository.getModel(),
            as: "estadoPago",
          },
        ],
      },
    ];
    const result = await paginate(FacturaRepository.getModel(), options, {
      where,
      include,
      order: [["id_factura", "ASC"]],
    });
    return result;
  }

  // Crear una factura independiente (sin transacción asociada)
  /*   async crearFacturaIndependiente(data) {
    const facturaData = {
      fecha_emision: new Date(),
      total: data.total,
      ...data,
    };

    return await FacturaRepository.create(facturaData);
  } */

  // Crear factura desde un documento
  async generarFacturaDesdeDocumento(id_documento, data = {}) {
    const documento = await DocumentoRepository.findById(id_documento);
    if (!documento) {
      throw new Error("Documento no encontrado.");
    }

    // Generar el número de factura
    const numeroFactura = await this.generarNumeroFactura();

    const factura = await FacturaRepository.create({
      id_documento: documento.id_documento,
      numero_factura: numeroFactura,
      tipo_factura: data.tipo_factura || "A",
      precios_opcion: data.precios_opcion || "Neto",
      forma_pago: data.forma_pago || "Contado",
    });

    return factura;
  }

  // Generar boleta desde un documento
  async generarBoletaDesdeDocumento(id_documento) {
    const documento = await DocumentoRepository.findById(id_documento);
    if (!documento) {
      throw new Error("Documento no encontrado.");
    }

    if (documento.tipo_documento !== "boleta") {
      throw new Error("El documento no es del tipo boleta.");
    }

    const boleta = await BoletaRepository.create({
      id_documento: documento.id_documento,
    });

    return boleta;
  }

  // Actualizar estado de un documento
  async actualizarEstadoDocumento(id_documento, nuevo_estado) {
    const estado = await EstadoPagoService.findById(nuevo_estado);
    if (!estado) {
      throw new Error("Estado no encontrado.");
    }

    const documento = await DocumentoRepository.findById(id_documento);
    if (!documento) {
      throw new Error("Documento no encontrado.");
    }

    await DocumentoRepository.update(id_documento, {
      id_estado_pago: estado.id_estado_pago,
    });

    return { message: "Estado del documento actualizado con éxito." };
  }

  // Generar número de factura
  async generarNumeroFactura() {
    const ultimaFactura = await FacturaRepository.findLastFactura({
      order: [["id_factura", "DESC"]],
    });

    const prefijo = new Date().getFullYear();
    if (ultimaFactura) {
      const ultimoNumero = parseInt(ultimaFactura.dataValues.id_factura);
      return `${prefijo}-${(ultimoNumero + 1).toString().padStart(6, "0")}`;
    }
    return `${prefijo}-000001`;
  }

  /*   async generarFactura(id_transaccion, id_usuario) {
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
      observaciones: "Factura generada",
      total: transaccion.transaccion.dataValues.total,
      id_estado_factura: estadoFacturaCreada.dataValues.id_estado_factura,
      fecha_emision: new Date(),
      id_transaccion: transaccion.transaccion.dataValues.id_transaccion,
    });

    // Actualizar la transacción con el ID de la factura
    await TransaccionRepository.update(id_transaccion, {
      id_factura: factura.dataValues.id_factura,
    });

    return factura;
  } */

  /*   async generarBoleta(id_transaccion, id_usuario) {
    try {
      const transaccion = await TransaccionService.getTransaccionById(
        id_transaccion
      );

      // Verificar si ya tiene una factura o boleta asociada
      if (transaccion.transaccion.dataValues.id_factura) {
        throw new Error(
          "La transacción ya tiene una factura o boleta asociada."
        );
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

      console.log("Datos para FacturaRepository.create:", {
        numero_factura: numeroGenerado,
        id_transaccion,
        id_cliente: transaccion.transaccion.dataValues.id_cliente,
        id_usuario,
        total: transaccion.transaccion.dataValues.total,
        id_estado_factura: estadoFacturaCompletado.dataValues.id_estado_factura,
      });

      const boleta = await FacturaRepository.create({
        numero_factura: numeroGenerado,
        id_transaccion,
        id_cliente: transaccion.transaccion.dataValues.id_cliente,
        id_usuario,
        total: transaccion.transaccion.dataValues.total,
        id_estado_factura: estadoFacturaCompletado.dataValues.id_estado_factura, // Las boletas suelen considerarse pagadas automáticamente
      });
      console.log("Boleta creada:", boleta);

      // Actualizar la transacción con el ID de la factura o boleta
      await TransaccionRepository.update(id_transaccion, {
        id_factura: boleta.dataValues.id_factura,
      });
      console.log(
        "Transacción actualizada con ID de boleta:",
        boleta.dataValues.id_factura
      );

      return boleta;
    } catch (error) {
      console.log("Error en generar Boleta", error.message);
      throw error;
    }
  } */

  /*   async generarNumeroFactura() {
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
  } */

  /*   async crearFacturaDesdeTransaccion(id_transaccion, id_usuario, data) {
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


    return factura;
  } */
  /* Generar Factura para una Transacción */
  /*   async generarFacturaParaTransaccion(
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
  } */

  /*   async actualizarEstadoFactura(id_factura, nuevo_estado) {
    const estado = await EstadoFacturaService.findById(nuevo_estado);

    if (!estado) throw new Error("estado no encontrado.");

    const factura = await FacturaRepository.findById(id_factura);

    if (!factura) throw new Error("Factura no encontrada.");

    await FacturaRepository.update(id_factura, {
      id_estado_factura: nuevo_estado,
    });

    return { message: "Estado de factura actualizado con éxito" };
  } */

  /*   async ajustarInventarioPorFactura(id_factura) {
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
  } */
  // Actualizar datos factura
  /*   async updateFactura(id, data) {
    return await FacturaRepository.update(id, data);
  } */

  // Eliminar una factura (borrado lógico)
  async eliminarFactura(id_factura) {
    const factura = await FacturaRepository.findById(id_factura);
    if (!factura) {
      throw new Error(`Factura con ID ${id_factura} no encontrada.`);
    }

    await DocumentoRepository.update(factura.id_documento, {
      id_estado_pago: await EstadoPagoService.findByNombre("Cancelada")
        .id_estado_pago,
    });

    return { message: "Factura eliminada exitosamente." };
  }

  async deleteFacturas(ids, id_usuario) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error(
        "Debe proporcionar al menos un ID de factura para eliminar."
      );
    }
    const facturas = await FacturaRepository.findByIds(ids);
    if (facturas.length !== ids.length) {
      const notFoundIds = ids.filter(
        (id) => !facturas.some((factura) => factura.id_factura === id)
      );
      throw new Error(
        `Los siguientes facturas no fueron encontrados: ${notFoundIds.join(
          ", "
        )}`
      );
    }
  }

  async updateFactura(id, data) {
    // Obtener la factura para acceder al id_documento
    const factura = await FacturaRepository.findById(id);
  
    if (!factura) {
      throw new Error("Factura no encontrada");
    }
  
    // Verificar si existe el documento asociado
    const documento = await DocumentoRepository.findById(factura.id_documento);
    if (!documento) {
      throw new Error("Documento asociado no encontrado");
    }
  
    // Actualizar campos de la factura
    const facturaActualizada = await FacturaRepository.update(id, {
      tipo_factura: data.tipo_factura,
      forma_pago: data.forma_pago,
      total: data.total,
    });
  
    // Actualizar estado del documento asociado
    const documentoActualizado = await DocumentoRepository.update(documento.id_documento, {
      id_estado_pago: data.id_estado_factura,
    });
  
    return {
      factura: facturaActualizada,
      documento: documentoActualizado,
    };
  }
  
}

export default new FacturaService();
