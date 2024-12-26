import { Op } from "sequelize";
import PagoRepository from "../infrastructure/repositories/PagoRepository.js";
import EstadoFacturaService from "./EstadoFacturaService.js";
import EstadoPagoService from "./EstadoPagoService.js";
import EstadoTransaccionService from "./EstadoTransaccionService.js";
import FacturaService from "./FacturaService.js";
import MetodoPagoService from "./MetodoPagoService.js";
import TransaccionService from "./TransaccionService.js";
import EstadoPagoRepository from "../infrastructure/repositories/EstadoPagoRepository.js";
import MetodoPagoRepository from "../infrastructure/repositories/MetodoPagoRepository.js";
import TransaccionRepository from "../infrastructure/repositories/TransaccionRepository.js";
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import paginate from "../../shared/utils/pagination.js";
import createFilter from "../../shared/utils/helpers.js";

class PagoService {
  async getPagoById(id) {
    const pago = await PagoRepository.findById(id);
    if (!pago) {
      throw new Error("Transacción no encontrada.");
    }
    return { pago };
  }
  async obtenerTodosLosPagos(
    filters = {},
    options /* = { page: 1, limit: 20, rolId: null } */
  ) {
    const allowedFields = [
      "id_pago",
      "id_transaccion",
      "id_estado_pago",
      "id_metodo_pago",
      "fecha_pago",
    ];
    const where = createFilter(filters, allowedFields);
    if (options.search) {
      where[Op.or] = [
        { "$metodo.nombre$": { [Op.like]: `%${options.search}%` } },
        { "$estado.nombre$": { [Op.like]: `%${options.search}%` } },
        {
          "$transaccionPago.cliente.nombre$": {
            [Op.like]: `%${options.search}%`,
          },
        },
        { referencia: { [Op.like]: `%${options.search}%` } },
      ];
    }
    const include = [
      {
        model: EstadoPagoRepository.getModel(),
        as: "estado",
        attributes: ["nombre", "descripcion"],
      },
      {
        model: MetodoPagoRepository.getModel(),
        as: "metodo",
        attributes: ["nombre", "descripcion"],
      },
      {
        model: TransaccionRepository.getModel(),
        as: "transaccionPago",
        include: [
          {
            model: ClienteRepository.getModel(),
            as: "cliente",
            attributes: ["nombre", "email", "rut", "direccion", "telefono"],
          },
        ],
      },
    ];
    const result = await paginate(PagoRepository.getModel(), options, {
      where,
      include,
      order: [["id_pago","ASC"]]
    });

    return result;
  }

  async crearPago(id_transaccion, metodo_pago, monto = 0) {
    const metodoPago = await MetodoPagoService.getMetodoByNombre(metodo_pago);

    if (!metodoPago) {
      throw new Error("Método de pago no encontrado");
    }
    const estadoInicial = await EstadoPagoService.findByNombre("Pendiente");

    const nuevoPago = await PagoRepository.create({
      id_transaccion,
      id_estado_pago: estadoInicial.dataValues.id_estado_pago,
      id_metodo_pago: metodoPago.dataValues.id_metodo_pago,
      monto,
    });

    return nuevoPago;
  }

  async updatePagoById(id_pago, monto, referencia, id_transaccion) {
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );

    // Validación del monto con el de la transacción
    /* if (monto != transaccion.transaccion.dataValues.total) {
      throw new Error(
        `El monto ingresado: $${monto} no concuerda con: $${transaccion.transaccion.dataValues.total}. En la transacción tipo: ${transaccion.transaccion.dataValues.tipo_transaccion}.`
      );
    } */

    const pagoActualizado = await PagoRepository.updatePagoWithConditions(
     { id_pago,
      monto,
      referencia}
    );

    return pagoActualizado;
  }

  async registrarMetodoPago(id_transaccion, metodo_pago) {
    // Validar si la transacción existe
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );
    if (!transaccion) {
      throw new Error("Transacción no encontrada.");
    }

    // Validar si el método de pago es válido
    const metodoPago = await MetodoPagoService.getMetodoByNombre(metodo_pago);
    if (!metodoPago) {
      throw new Error("Método de pago no válido.");
    }

    // Obtener el estado inicial "Pendiente"
    const estadoPendiente = await EstadoPagoService.findByNombre("Pendiente");

    // Verificar si ya existe un pago asociado a la transacción
    const pagosPrevios = await this.obtenerPagosPorTransaccion(id_transaccion);

    if (pagosPrevios.length > 0) {
      throw new Error("Ya existe método de pago asociado");
    } else {
      // Si no existe, crear un nuevo pago
      await PagoRepository.create({
        id_transaccion,
        id_metodo_pago: metodoPago.dataValues.id_metodo_pago,
        id_estado_pago: estadoPendiente.dataValues.id_estado_pago,
        monto: 0, // No se define monto en esta etapa
      });
    }

    return { mensaje: "Método de pago registrado exitosamente." };
  }

  async acreditarPago(id_transaccion, monto, metodo_pago, referencia) {
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );
    if (!transaccion) {
      throw new Error("Transacción no encontrada");
    }
    // Validar estado de la transacción
    const estadoPermitido = await EstadoTransaccionService.findByNombre(
      "Pago Pendiente"
    );

    if (
      transaccion.transaccion.dataValues.id_estado_transaccion !=
      estadoPermitido.dataValues.id_estado_transaccion
    ) {
      throw new Error(
        "El pago no se puede acreditar, se debe cambiar de estado"
      );
    }

    const metodoPagoValido = await MetodoPagoService.getMetodoByNombre(
      metodo_pago
    );
    const validar =
      metodoPagoValido.dataValues.id_metodo_pago !=
      transaccion.transaccion.dataValues.id_metodo_pago
        ? true
        : false;
    if (validar != true) {
      throw new Error("El método de pago debe ser el mismo que la transacción");
    }

    if (!metodoPagoValido) {
      throw new Error("Método de pago no válido.");
    }

    // Validación del monto del pago, que sea igual o no al total
    if (monto <= 0) {
      throw new Error("El monto del pago debe ser mayor a cero.");
    }
    const montoTransaccion = transaccion.transaccion.dataValues.total;
    if (monto !== montoTransaccion) {
      throw new Error(
        `El pago no coincide con el total de $${montoTransaccion} `
      );
    }

    const estadoPagado = await EstadoPagoService.findByNombre("Pagado");
    // Verificar si existe un pago previo
    const pagosPrevios = await this.obtenerPagosPorTransaccion(id_transaccion);

    let pagoActualizado;
    if (pagosPrevios.length > 0) {
      // Actualizar el pago existente
      const pagoPrevio = pagosPrevios[0].dataValues;
      pagoActualizado = await PagoRepository.updatePagoWithConditions({
        id_pago: pagoPrevio.id_pago,
        monto,
        id_metodo_pago: metodoPagoValido.dataValues.id_metodo_pago,
        referencia,
        id_estado_pago: estadoPagado.dataValues.id_estado_pago,
        fecha_pago: new Date(),
      });
    } else {
      // Registrar un nuevo pago
      pagoActualizado = await PagoRepository.create({
        id_transaccion,
        monto,
        id_metodo_pago: metodoPagoValido.dataValues.id_metodo_pago,
        referencia,
        id_estado_pago: estadoPagado.dataValues.id_estado_pago,
        fecha_pago: new Date(),
      });
    }
    // Si hay una factura asociada, actualizar su estado a "Pagada"
    if (transaccion.transaccion.dataValues.id_factura != null) {
      const estadoFacturaPagada = await EstadoFacturaService.findByNombre(
        "Pagada"
      );
      await FacturaService.actualizarEstadoFactura(
        transaccion.transaccion.dataValues.id_factura,
        estadoFacturaPagada.dataValues.id_estado_factura
      );
    }

    return pagoActualizado;
  }

  async obtenerPagosPorTransaccion(id_transaccion) {
    const pagos = await PagoRepository.findByTransaccionId(id_transaccion);
    return pagos;
  }

  async cambiarEstadoPago(id_pago, nuevo_estado) {
    const estado = await EstadoPagoService.findById(nuevo_estado);
    if (!estado) {
      throw new Error("Estado de pago no válido.");
    }

    const pagoActualizado = await PagoRepository.updateEstado(
      id_pago,
      nuevo_estado
    );

    // Registrar log si es necesario
    return {
      message: `Estado del pago actualizado a ${estado.nombre}.`,
      pagoActualizado,
    };
  }

  async actualizarMetodoPago(id_pago, id_metodo_pago) {
    const metodoPagoNuevo = await PagoRepository.updatePago(
      id_pago,
      id_metodo_pago
    );
    return metodoPagoNuevo;
  }

  async obtenerMetodosPago() {
    return await MetodoPagoService.getMetodosPago();
  }

  async deletePagos(ids, id_usuario) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error(
        "Debe proporcionar al menos un ID de pago para eliminar."
      );
    }
    // Buscar los pagos
    const pagos = await PagoRepository.findByIds(ids);
    if (pagos.length !== ids.length) {
      const notFoundIds = ids.filter(
        (id) => !pagos.some((pago) => pago.id_pago === id)
      );
      throw new Error(
        `Los siguientes pagos no fueron encontrados: ${notFoundIds.join(
          ", "
        )}`
      );
    }

    // Obtener Estados
    const estadoRechazado = await EstadoPagoService.findByNombre("Rechazado");

    for (const pago of pagos) {
      const estadoPago = estadoRechazado?.dataValues?.id_estado_pago;
      await PagoRepository.updateEstado(pago.id_pago, estadoPago);
    }

    return {
      message: `Se marcaron como eliminados ${ids.length} pagos.`,
    };
  }
}
export default new PagoService();
