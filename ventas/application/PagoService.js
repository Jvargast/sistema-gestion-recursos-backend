import { Op } from "sequelize";
import PagoRepository from "../infrastructure/repositories/PagoRepository.js";
import DocumentoRepository from "../infrastructure/repositories/DocumentoRepository.js";
import FacturaRepository from "../infrastructure/repositories/FacturaRepository.js";
import BoletaRepository from "../infrastructure/repositories/BoletaRepository.js";
import EstadoPagoService from "./EstadoPagoService.js";
import MetodoPagoService from "./MetodoPagoService.js";
import TransaccionService from "./TransaccionService.js";
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import paginate from "../../shared/utils/pagination.js";
import createFilter from "../../shared/utils/helpers.js";
import MetodoPagoRepository from "../infrastructure/repositories/MetodoPagoRepository.js";
import EstadoPagoRepository from "../infrastructure/repositories/EstadoPagoRepository.js";

class PagoService {
  async getPagoById(id) {
    const pago = await PagoRepository.findById(id);
    if (!pago) {
      throw new Error("Pago no encontrado.");
    }
    return { pago };
  }

  async obtenerTodosLosPagos(filters = {}, options) {
    const allowedFields = [
      "id_pago",
      "id_documento",
      "id_estado_pago",
      "id_metodo_pago",
      "fecha",
      "referencia",
    ];
    const where = createFilter(filters, allowedFields);

    if (options.search) {
      where[Op.or] = [
        { "$metodo.nombre$": { [Op.like]: `%${options.search}%` } },
        {
          "$documento.estadoPago.nombre$": { [Op.like]: `%${options.search}%` },
        },
        { "$documento.tipo_documento$": { [Op.like]: `%${options.search}%` } }, // Buscar por tipo de documento
        { "$documento.cliente.nombre$": { [Op.like]: `%${options.search}%` } }, // Buscar por nombre del cliente
        { referencia: { [Op.like]: `%${options.search}%` } },
      ];
    }

    const include = [
      {
        model: DocumentoRepository.getModel(),
        as: "documento",
        include: [
          {
            model: ClienteRepository.getModel(),
            as: "cliente",
            attributes: ["id_cliente","nombre", "email", "rut", "direccion", "telefono"],
          },
          {
            model: EstadoPagoRepository.getModel(),
            as: "estadoPago",
          },
        ],
      },
      {
        model: MetodoPagoRepository.getModel(),
        as: "metodo",
        attributes: ["nombre", "descripcion"],
      },
    ];

    const result = await paginate(PagoRepository.getModel(), options, {
      where,
      include,
      order: [["id_pago", "ASC"]],
    });

    return result;
  }

  async crearPago(id_documento, metodo_pago, monto = 0) {
    const documento = await DocumentoRepository.findById(id_documento);
    if (!documento) {
      throw new Error("Documento no encontrado.");
    }

    const metodoPago = await MetodoPagoService.getMetodoByNombre(metodo_pago);
    if (!metodoPago) {
      throw new Error("Método de pago no encontrado.");
    }

    const estadoPendiente = await EstadoPagoService.findByNombre("Pendiente");

    const nuevoPago = await PagoRepository.create({
      id_documento,
      id_estado_pago: estadoPendiente.dataValues.id_estado_pago,
      id_metodo_pago: metodoPago.dataValues.id_metodo_pago,
      monto,
      fecha: new Date(),
    });

    // Actualizar estado del documento si es necesario
    if (documento.tipo_documento === "factura") {
      await FacturaService.actualizarEstadoFactura(
        documento.id_documento,
        estadoPendiente.dataValues.id_estado_pago
      );
    } else if (documento.tipo_documento === "boleta") {
      await BoletaRepository.update(documento.id_documento, {
        id_estado_pago: estadoPendiente.dataValues.id_estado_pago,
      });
    }

    return nuevoPago;
  }

  async completarPago(id_documento, metodo_pago, referencia, rut) {
    const documento = await DocumentoRepository.findById(id_documento);

    if (!documento) {
      throw new Error("Documento no encontrado.");
    }

    //const estadoPendiente = await EstadoPagoService.findByNombre("Pendiente");
    const estadoPagado = await EstadoPagoService.findByNombre("Pagado");

    if (documento.id_estado_pago === estadoPagado.dataValues.id_estado_pago) {
      throw new Error("El documento ya está completamente pagado.");
    }

    const metodoPagoValido = await MetodoPagoService.getMetodoByNombre(
      metodo_pago
    );
    if (!metodoPagoValido) {
      throw new Error("Método de pago no válido.");
    }

    const montoPendiente = documento.total - documento.monto_pagado;

    if (montoPendiente <= 0) {
      throw new Error("No hay monto pendiente para este documento.");
    }

    const nuevoPago = await PagoRepository.create({
      id_documento,
      monto: montoPendiente,
      id_metodo_pago: metodoPagoValido.dataValues.id_metodo_pago,
      referencia,
      tipo_documento: documento.tipo_documento,
      fecha: new Date(),
    });

    // Actualizar el documento como "Pagado"
    await DocumentoRepository.update(documento.id_documento, {
      monto_pagado: documento.total,
      referencia,
      id_estado_pago: estadoPagado.dataValues.id_estado_pago,
    });

    await TransaccionService.changeEstadoTransaccion(
      documento.id_transaccion,
      13,
      rut
    );

    return {
      message: "El pago total ha sido completado.",
      nuevoPago,
    };
  }

  async updatePagoById(id_pago, monto, referencia) {
    const pagoActualizado = await PagoRepository.update(id_pago, {
      monto,
      referencia,
    });

    if (!pagoActualizado) {
      throw new Error("Error al actualizar el pago.");
    }

    return pagoActualizado;
  }

  async acreditarPago(id_documento, monto, metodo_pago, referencia) {
    const documento = await DocumentoRepository.findById(id_documento);

    if (!documento) {
      throw new Error("Documento no encontrado.");
    }

    const estadoPendiente = await EstadoPagoService.findByNombre("Pendiente");

    const metodoPagoValido = await MetodoPagoService.getMetodoByNombre(
      metodo_pago
    );
    if (!metodoPagoValido) {
      throw new Error("Método de pago no válido.");
    }

    if (monto <= 0) {
      throw new Error(`El monto del pago debe ser mayor a cero.`);
    }
    // Verificar si el monto supera el total pendiente
    const montoPendiente = documento.total - documento.monto_pagado;
    if (monto > montoPendiente) {
      throw new Error(
        `El monto del pago excede el total pendiente de $${montoPendiente}.`
      );
    }

    const nuevoPago = await PagoRepository.create({
      id_documento,
      monto,
      id_metodo_pago: metodoPagoValido.dataValues.id_metodo_pago,
      referencia,
      tipo_documento: documento.tipo_documento,
      fecha: new Date(),
    });
    const nuevoMontoPagado =
      parseFloat(documento.monto_pagado) + parseFloat(monto);
    const nuevoEstado =
      nuevoMontoPagado >= documento.total
        ? await EstadoPagoService.findByNombre("Pagado")
        : documento.id_estado_pago;;

    // Actualizar el estado del documento directamente
    await DocumentoRepository.update(documento.id_documento, {
      monto_pagado: nuevoMontoPagado,
      id_estado_pago: nuevoEstado.dataValues.id_estado_pago, // Actualizar al estado "Pagado"
    });

    return nuevoPago;
  }

  async obtenerPagosPorDocumento(id_documento) {
    if (!id_documento) {
      throw new Error("El 'id_documento' proporcionado no es válido.");
    }

    // Pasar como filtro el id_documento
    const pagos = await PagoRepository.findAll({ id_documento });
    return pagos;
  }

  async cambiarEstadoPago(id_pago, nuevo_estado) {
    const estado = await EstadoPagoService.findByNombre(nuevo_estado);

    if (!estado) {
      throw new Error("Estado de pago no válido.");
    }

    const pagoActualizado = await PagoRepository.update(id_pago, {
      id_estado_pago: estado.dataValues.id_estado_pago,
    });

    return {
      message: `Estado del pago actualizado a ${estado.nombre}.`,
      pagoActualizado,
    };
  }

  async obtenerMetodosPago() {
    return await MetodoPagoService.getMetodosPago();
  }

  async registrarMetodoPago(id, metodo_pago) {
    return await Pago;
  }

  async deletePagos(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error(
        "Debe proporcionar al menos un ID de pago para eliminar."
      );
    }

    const estadoRechazado = await EstadoPagoService.findByNombre("Rechazado");

    let pagoAsociado = null;
    for (const id of ids) {
      // actualizar documento
      pagoAsociado = await PagoRepository.findById(id);
      await DocumentoRepository.update(pagoAsociado.dataValues.id_documento, {
        id_estado_pago: estadoRechazado.dataValues.id_estado_pago,
      });
    }

    return {
      message: `Se marcaron como rechazados ${ids.length} pagos.`,
    };
  }
}

export default new PagoService();
