import TransaccionRepository from "../infrastructure/repositories/TransaccionRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import EstadoTransaccionService from "./EstadoTransaccionService.js";
import ClienteService from "./ClienteService.js";
import LogTransaccionService from "./LogTransaccionService.js";
import DetalleTransaccionService from "./DetalleTransaccionService.js";
import { Op } from "sequelize";
import FacturaService from "./FacturaService.js";
import TransicionTipoTransaccionService from "./TransicionTipoTransaccionService .js";
import TransicionEstadoTransaccionService from "./TransicionEstadoTransaccionService.js";
import PagoService from "./PagoService.js";
import EstadoPagoService from "./EstadoPagoService.js";
import EstadoDetalleTransaccionService from "./EstadoDetalleTransaccionService.js";
import MetodoPagoService from "./MetodoPagoService.js";
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import EstadoTransaccionRepository from "../infrastructure/repositories/EstadoTransaccionRepository.js";
import DetalleTransaccionRepository from "../infrastructure/repositories/DetalleTransaccionRepository.js";
import UsuariosService from "../../auth/application/UsuariosService.js";

class TransaccionService {
  async getTransaccionById(id) {
    const transaccion = await TransaccionRepository.findById(id);
    if (!transaccion) {
      throw new Error("Transacción no encontrada.");
    }

    const detalles = await DetalleTransaccionService.getDetallesByTransaccionId(
      id
    );

    const pago = await PagoService.obtenerPagosPorTransaccion(id);

    const usuario_asignado = await UsuariosService.getUsuarioById(
      transaccion.dataValues.asignada_a
    );

    return { transaccion, detalles, pago, usuario_asignado };
  }

  async getAllTransacciones(
    filters = {},
    options = { page: 1, limit: 10, rolId: null }
  ) {
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
    // Incluir búsqueda global si se proporciona el parámetro `search`

    if (options.search) {
      where[Op.or] = [
        { "$cliente.nombre$": { [Op.like]: `%${options.search}%` } }, // Buscar en cliente.nombre
        { "$usuario.nombre$": { [Op.like]: `%${options.search}%` } }, // Buscar en usuario.nombre
        { "$estado.nombre_estado$": { [Op.like]: `%${options.search}%` } }, // Buscar en estado.nombre_estado
        { tipo_transaccion: { [Op.like]: `%${options.search}%` } }, // Buscar en tipo_transaccion
      ];
    }

    // Excluir estados para roles no administradores
    if (options.rolId !== 2) {
      // Asume que rolId 2 = administrador
      const excludedStates = ["Rechazada", "Cancelado", "Cancelada"];

      const estadosPermitidos =
        await EstadoTransaccionService.obtenerEstadosPermitidos(excludedStates);

      where.id_estado_transaccion = {
        [Op.in]: estadosPermitidos, // Directamente el array de IDs devuelto
      };
      /* console.log(estadosPermitidos) */
    }

    // Incluir datos relacionados (cliente, usuario, estado de la transacción)
    const include = [
      {
        model: ClienteRepository.getModel(), // Modelo de Cliente
        as: "cliente", // Alias definido en las asociaciones
        attributes: ["rut", "nombre", "tipo_cliente", "email"], // Campos que deseas incluir
      },
      {
        model: UsuariosRepository.getModel(), // Modelo de Usuario
        as: "usuario", // Alias definido en las asociaciones
        attributes: ["rut", "nombre", "email"], // Campos que deseas incluir
      },
      {
        model: EstadoTransaccionRepository.getModel(), // Modelo de EstadoTransaccion
        as: "estado", // Alias definido en las asociaciones
        attributes: ["nombre_estado"], // Campos que deseas incluir
      },
    ];

    // Aplicar paginación
    const result = await paginate(TransaccionRepository.getModel(), options, {
      where,
      include,
    });
    return result.data;
  }

  async createTransaccion(data, detalles = [], id_usuario) {
    const { id_cliente, tipo_transaccion, id_metodo_pago, tipo_documento } =
      data;

    // Validar cliente
    await ClienteService.getClienteById(id_cliente);
    // Validar método de pago si se proporciona
    let metodoPago = null;
    if (id_metodo_pago) {
      metodoPago = await MetodoPagoService.getMetodoPagoById(id_metodo_pago);
      if (!metodoPago) {
        throw new Error("El método de pago especificado no es válido.");
      }
    }

    // Buscar el estado inicial de la transacción dependiendo del tipo
    const estadoInicial =
      detalles && tipo_transaccion == "pedido"
        ? await EstadoTransaccionService.findByNombre("En Proceso")
        : await EstadoTransaccionService.findEstadoInicialByTipo(
            tipo_transaccion
          );

    // Crear transacción
    const nuevaTransaccion = await TransaccionRepository.create({
      ...data,
      id_estado_transaccion: estadoInicial.id_estado_transaccion,
      id_usuario,
    });

    let documentoEmitido = null;
    if (tipo_transaccion == "venta" && tipo_documento == "factura") {
      documentoEmitido = await FacturaService.generarFactura(
        nuevaTransaccion.dataValues.id_transaccion,
        id_usuario
      );
      //Se tiene que insertar la factura en la transacción
      await TransaccionRepository.update(
        nuevaTransaccion.dataValues.id_transaccion,
        {
          id_factura: documentoEmitido.dataValues.id_factura,
        }
      );
    }

    // Registrar log de creación de transacción
    await LogTransaccionService.createLog({
      id_transaccion: nuevaTransaccion.id_transaccion,
      id_usuario,
      estado: `${estadoInicial.nombre_estado}`,
      accion: "Creación de transacción",
      detalles: `Transacción creada con tipo: ${tipo_transaccion} y estado inicial: ${estadoInicial.nombre_estado}`,
    });

    // Agregar detalles si existen
    if (detalles) {
      await this.addDetallesToTransaccion(
        nuevaTransaccion.dataValues.id_transaccion,
        detalles,
        id_usuario
      );
    }

    // Registrar pago inicial si se proporcionó un método de pago y referencia

    if (data.monto_inicial && metodoPago) {
      /* const estadoPagoInicial = await EstadoPagoService.findByNombre(
                "Pendiente"
              ); */
      await PagoService.acreditarPago({
        id_transaccion: nuevaTransaccion.dataValues.id_transaccion,
        monto: data.monto_inicial,
        metodo_pago: metodoPago.dataValues.nombre,
        referencia: data.referencia || null,
        id_usuario: id_usuario,
      });
    }
    if (!data.monto_inicial && metodoPago) {
      await PagoService.crearPago(
        nuevaTransaccion.dataValues.id_transaccion,
        metodoPago.dataValues.nombre
      );
    }

    return nuevaTransaccion;
  }

  async asignarTransaccionAUsuario(id_transaccion, id_usuario, rut) {
    // Validar transacción existente
    const transaccion = await this.getTransaccionById(id_transaccion);

    const estado_verificador = await EstadoTransaccionService.findById(
      transaccion.transaccion.id_estado_transaccion
    );
    // Validar estado de la transacción
    if (
      transaccion.transaccion.id_estado_transaccion !==
      estado_verificador.dataValues.id_estado_transaccion
    ) {
      throw new Error("La transacción no está en un estado asignable.");
    }

    // Verificar si el usuario ya está asignado o no no
    if (id_usuario == transaccion.transaccion.dataValues.asignada_a) {
      const usuario_asignado = await UsuariosService.getUsuarioByRut(
        transaccion.transaccion.dataValues.asignada_a
      );
      throw new Error(
        `Ya tiene conductor asignado ${usuario_asignado.dataValues.nombre} ${usuario_asignado.dataValues.apellido}`
      );
    }

    // Asignar usuario (chofer) a la transacción
    const updatedTransaccion = await TransaccionRepository.update(
      id_transaccion,
      {
        asignada_a: id_usuario, // Campo para el usuario asignado
      }
    );

    // Registrar log de asignación
    await LogTransaccionService.createLog({
      id_transaccion,
      id_usuario: rut,
      accion: "Asignar transacción",
      detalles: `Transacción asignada al usuario con ID: ${id_usuario}`,
      estado: `En estado asignada`,
    });

    return updatedTransaccion;
  }

  async eliminarTransaccionAUsuario(id_transaccion, rut) {
    const transaccionExistente = await TransaccionRepository.findById(
      id_transaccion
    );

    if(!transaccionExistente) {
      throw new Error("Transacción no encontrada");
    }

    if(transaccionExistente.dataValues.asignada_a == null) {
      throw new Error("La transacción no tiene chofer asignado")
    }

    const updatedTransaccion = await TransaccionRepository.update(
      transaccionExistente.dataValues.id_transaccion,
      { asignada_a: null }
    );

    // Registrar log de asignación
    await LogTransaccionService.createLog({
      id_transaccion,
      id_usuario: rut,
      accion: "Desasignar transacción",
      detalles: `Transacción desasignada`,
      estado: `En estado desasignada`,
    });

    return updatedTransaccion;
  }

  async actualizarEstadoYRegistrarPago(
    id_transaccion,
    detallesActualizados,
    pago,
    id_usuario
  ) {
    // Validar transacción existente
    const transaccion = await this.getTransaccionById(id_transaccion);

    // Validar estado de la transacción
    if (
      transaccion.transaccion.id_estado_transaccion !== "En Proceso" &&
      transaccion.transaccion.id_estado_transaccion !==
        "Por entregar - Confirmado"
    ) {
      throw new Error(
        "La transacción no está en un estado válido para entrega."
      );
    }

    // Validar y actualizar detalles de la transacción
    for (const detalle of detallesActualizados) {
      const estadoDetalleActual =
        await EstadoDetalleTransaccionService.findById(detalle.estado_actual);

      // Validar transición de estado
      await TransicionEstadoDetalleService.validarTransicion(
        estadoDetalleActual.id_estado_detalle_transaccion,
        detalle.nuevo_estado
      );

      // Actualizar el detalle con el nuevo estado
      await DetalleTransaccionService.updateDetallesTransaccion(
        detalle.id_detalle_transaccion,
        {
          estado_producto_transaccion: detalle.nuevo_estado,
        }
      );
    }

    // Registrar el pago si es efectivo o tarjeta
    let pagoRegistrado = null;
    if (pago.id_metodo_pago !== "Transferencia") {
      const estadoPago = await EstadoPagoService.findByNombre("Pagado");

      pagoRegistrado = await PagoService.acreditarPago({
        id_transaccion,
        monto: pago.monto,
        id_metodo_pago: pago.id_metodo_pago,
        referencia: pago.referencia || null,
        id_estado_pago: estadoPago.id_estado_pago,
      });
    }

    // Cambiar estado de la transacción a "Completada" si todo está entregado
    const detalles = await DetalleTransaccionRepository.findByTransaccionId(
      id_transaccion
    );
    const todosEntregados = detalles.every(
      (d) => d.estado_producto_transaccion === "Entregado"
    );

    if (todosEntregados) {
      const estadoCompletada = await EstadoTransaccionService.findByNombre(
        "Completada"
      );
      await this.changeEstadoTransaccion(
        id_transaccion,
        estadoCompletada.id_estado_transaccion,
        id_usuario
      );
    }

    // Registrar log de entrega y pago
    await LogTransaccionService.createLog({
      id_transaccion,
      id_usuario,
      accion: "Actualizar transacción y registrar pago",
      detalles: `Estados de detalles actualizados y pago ${
        pagoRegistrado ? "acreditado" : "registrado previamente"
      }`,
    });

    return {
      mensaje: "Transacción actualizada con éxito.",
      pago: pagoRegistrado,
    };
  }

  async addDetallesToTransaccion(id_transaccion, detalles, id_usuario) {
    const transaccion = await this.getTransaccionById(id_transaccion);
    const estadoActual = await EstadoTransaccionService.findById(
      transaccion.transaccion.dataValues.id_estado_transaccion
    );

    await DetalleTransaccionService.createDetallesTransaccion(
      detalles,
      id_transaccion
      /* transaccion.transaccion.dataValues.tipo_transaccion,
      id_usuario */
    );

    // Calcular y actualizar el total de la transacción
    const total = await DetalleTransaccionService.calcularTotales(
      id_transaccion
    );

    //Actualizar transacción con el total
    await TransaccionRepository.update(id_transaccion, {
      total,
    });

    // Registrar log
    await LogTransaccionService.createLog({
      id_transaccion: id_transaccion,
      id_usuario: id_usuario,
      estado: `${estadoActual.dataValues.nombre_estado}`,
      accion: "Actualización de detalles",
      detalles: "Se agregaron o actualizaron detalles a la transacción.",
    });
  }

  // Darle ojo al como se completa la transacción
  async completarTransaccion(
    id_transaccion,
    metodo_pago,
    referencia,
    id_usuario /* ,
    tipo_documento */
  ) {
    // Verificar el estado de la transacción
    const transaccion = await this.getTransaccionById(id_transaccion);
    const estadoNuevo = await EstadoTransaccionService.findByNombre(
      "Pago Pendiente"
    );
    // Verificar el estado actual de la transacción
    if (
      transaccion.transaccion.dataValues.id_estado_transaccion !==
      estadoNuevo.dataValues.id_estado_transaccion
    ) {
      throw new Error(
        "La transacción no está en un estado válido para completar."
      );
    }
    // Solo se puede hacer esto cuando el estado de la transacción sea en "Pago Pendiente"
    // Verificar si hay pago antes
    const pagosPrevios = await PagoService.obtenerPagosPorTransaccion(
      id_transaccion
    );
    let pagoRegistrado;

    const estadoPago = await EstadoTransaccionService.findByNombre("Pagada");

    if (pagosPrevios > 0) {
      // Validar si el pago previo ya cubre el monto total
      const totalPagado = pagosPrevios.reduce(
        (total, pago) => total + pago.monto,
        0
      );
      if (totalPagado < transaccion.transaccion.dataValues.total) {
        throw new Error(
          "El monto del pago previo no cubre el total de la transacción."
        );
      }
      // El pago previo ya acredita la transacción como "Pagada"
      pagoRegistrado = pagosPrevios[0];
    } else {
      // Registrar un nuevo pago

      pagoRegistrado = await PagoService.acreditarPago(
        id_transaccion,
        transaccion.transaccion.dataValues.total,
        metodo_pago,
        referencia,
        id_usuario
      );
    }

    // Cambiar el estado de los detalles a "En Bodega - Reservado"
    const nuevoEstadoDetalle =
      await EstadoDetalleTransaccionService.findByNombre(
        "En bodega - Reservado"
      );
    await DetalleTransaccionService.cambiarEstadoDetalles(
      id_transaccion,
      nuevoEstadoDetalle.dataValues.id_estado_detalle_transaccion,
      id_usuario
    );

    // Emitir boleta si corresponde
    let documentoEmitido = null;
    if (transaccion.transaccion.dataValues.tipo_documento === "boleta") {
      documentoEmitido = await FacturaService.generarBoleta(
        id_transaccion,
        id_usuario
      );
    }

    await LogTransaccionService.createLog({
      id_transaccion,
      id_usuario,
      accion: "Transacción Pagada",
      detalles: `Pago acreditado y productos reservados. Documento emitido: ${
        documentoEmitido || "N/A"
      }.`,
      estado: `${estadoPago.dataValues.nombre_estado}`,
    });

    return {
      mensaje: "Transacción completada con éxito.",
      pago: pagoRegistrado,
      documento: documentoEmitido != null ? documentoEmitido : "",
    };
  }

  async finalizarTransaccion(id_transaccion, id_usuario) {
    // Obtener la transacción
    const transaccion = await this.getTransaccionById(id_transaccion);

    // Verificar si la transacción está en estado "Pagada"
    const estadoPagada = await EstadoTransaccionService.findByNombre("Pagada");
    if (
      transaccion.transaccion.dataValues.id_estado_transaccion !==
      estadoPagada.dataValues.id_estado_transaccion
    ) {
      throw new Error(
        "La transacción debe estar en estado 'Pagada' para ser finalizada."
      );
    }

    // Cambiar el estado de los detalles a "Entregado"
    const estadoEntregado = await EstadoDetalleTransaccionService.findByNombre(
      "Entregado"
    );
    await DetalleTransaccionService.cambiarEstadoDetalles(
      id_transaccion,
      estadoEntregado.dataValues.id_estado_detalle_transaccion,
      id_usuario
    );

    // Cambiar el estado de la transacción a "Completada"
    const estadoCompletada = await EstadoTransaccionService.findByNombre(
      "Completada"
    );
    await this.changeEstadoTransaccion(
      id_transaccion,
      estadoCompletada.dataValues.id_estado_transaccion,
      id_usuario
    );

    // Registrar un log
    await LogTransaccionService.createLog({
      id_transaccion,
      id_usuario,
      accion: "Finalizar transacción",
      detalles: "La transacción ha sido completada exitosamente",
      estado: estadoCompletada.dataValues.id_estado_transaccion,
    });

    return {
      mensaje: "Transacción finalizada con éxito.",
    };
  }

  async changeEstadoTransaccion(id, id_estado_transaccion, rut) {
    const transaccion = await this.getTransaccionById(id);

    const estadoActual =
      transaccion.transaccion.dataValues.id_estado_transaccion;

    // Validar si la transición es válida
    const esValida = await TransicionEstadoTransaccionService.validarTransicion(
      estadoActual,
      id_estado_transaccion
    );

    if (!esValida) {
      throw new Error(
        `La transición de estado de ${estadoActual} a ${id_estado_transaccion} no es válida.`
      );
    }
    // Actualizar el estado de la transacción
    const updated = await TransaccionRepository.update(id, {
      id_estado_transaccion,
    });

    // Obtener información del nuevo estado para el log
    const estadoACambiar = await EstadoTransaccionService.findById(
      id_estado_transaccion
    );

    // Registrar log de cambio de estado
    await LogTransaccionService.createLog({
      id_transaccion: id,
      id_usuario: rut,
      estado: `${estadoACambiar.dataValues.nombre_estado}`,
      accion: "Cambio de estado",
      detalles: `Estado cambiado a ${estadoACambiar.dataValues.nombre_estado}`,
    });

    return updated;
  }

  async changeTipoTransaccion(id, tipo_transaccion, id_usuario) {
    const transaccion = await this.getTransaccionById(id);

    // Obtener el estado inicial para el nuevo tipo de transacción
    const estadoInicial =
      await EstadoTransaccionService.findEstadoInicialByTipo(tipo_transaccion);
    // Validar transición de tipo y estado
    await TransicionTipoTransaccionService.validarTransicion(
      transaccion.transaccion.tipo_transaccion,
      transaccion.transaccion.id_estado_transaccion,
      tipo_transaccion,
      estadoInicial.id_estado_transaccion
    );

    // Actualizar tipo y estado
    const updated = await TransaccionRepository.update(id, {
      tipo_transaccion,
      id_estado_transaccion: estadoInicial.id_estado_transaccion,
    });

    // Registrar log de cambio de tipo
    await LogTransaccionService.createLog({
      id_transaccion: id,
      id_usuario,
      accion: "Cambio de tipo",
      detalles: `Tipo cambiado a ${tipo_transaccion}`,
      estado: `${estadoInicial.nombre_estado}`,
    });

    return updated;
  }

  async cambiarMetodoPago(id, metodo_pago, rut) {
    const transaccionExistente = await TransaccionRepository.findById(id);
    if (!transaccionExistente)
      throw new Error(`Transacción con ID ${id} no encontrada.`);

    const pagoAsociado = await PagoService.obtenerPagosPorTransaccion(
      transaccionExistente.dataValues.id_transaccion
    );

    if (!pagoAsociado)
      throw new Error(
        `La ${transaccionExistente.dataValues.tipo_transaccion} no tiene método de pago asociado`
      );

    const metodoNuevo = await MetodoPagoService.getMetodoByNombre(metodo_pago);

    const updated = await PagoService.actualizarMetodoPago(
      metodoNuevo?.dataValues.id_metodo_pago
    );

    await LogTransaccionService.createLog({
      id_transaccion: id,
      id_usuario: rut,
      accion: "Cambio de método de pago",
      detalles: `Método de pago cambiado a ${metodoNuevo.dataValues.nombre}`,
      estado: `Nuevo Método`,
    });

    return updated;
  }

  async getTransaccionesByCliente(id_cliente, filters = {}, options = {}) {
    const cliente = await ClienteService.getClienteById(id_cliente);

    // Agregar filtro por cliente
    filters.id_cliente = cliente.id_cliente;
    return await this.getAllTransacciones(filters, options);
  }

  // Borrar una sola
  async deleteTransaccion(id_transaccion, id_usuario) {
    await this.getTransaccionById(id_transaccion);
    // Cambiar estado a Eliminada
    const estadoEliminada = await EstadoTransaccionService.findByNombre(
      "Eliminada"
    );
    await TransaccionRepository.update(id_transaccion, {
      id_estado_transaccion: estadoEliminada.id_estado_transaccion,
    });

    // Registrar log
    await LogTransaccionService.createLog({
      id_transaccion,
      id_usuario,
      accion: "Eliminar transacción",
      detalles: `La transacción fue marcada como eliminada.`,
    });

    return { message: "Transacción eliminada exitosamente." };
  }

  async changeDetallesInfo(idTransaccion, detalles) {
    try {
      const transaccionExistente = await TransaccionRepository.findById(
        idTransaccion
      );
      if (!transaccionExistente) {
        throw new Error(`Transacción con ID ${idTransaccion} no encontrada.`);
      }
      let totalTransaccion = 0; // Variable para acumular el total
      for (const detalle of detalles) {
        const {
          id_detalle_transaccion,
          cantidad,
          precio_unitario,
          estado_producto_transaccion,
          id_producto,
        } = detalle;
        const subtotal = (cantidad ?? 1) * (precio_unitario ?? 0);

        if (!id_detalle_transaccion) {
          await DetalleTransaccionRepository.create({
            id_transaccion: idTransaccion,
            id_producto: id_producto,
            cantidad: cantidad ?? 1,
            precio_unitario: precio_unitario ?? 0,
            subtotal: subtotal,
            estado_producto_transaccion: estado_producto_transaccion ?? 1,
          });
        } else {
          // Buscar el detalle existente
          const detalleExistente = await DetalleTransaccionRepository.findById(
            id_detalle_transaccion
          );

          if (!detalleExistente) {
            throw new Error(
              `Detalle con ID ${id_detalle_transaccion} no encontrado.`
            );
          }

          // Actualizar los campos necesarios
          await detalleExistente.update({
            cantidad: cantidad ?? detalleExistente.cantidad,
            precio_unitario:
              precio_unitario ?? detalleExistente.precio_unitario,
            subtotal: subtotal,
            estado_producto_transaccion:
              estado_producto_transaccion ??
              detalleExistente.estado_producto_transaccion,
          });
        }
        totalTransaccion += subtotal;
      }

      await transaccionExistente.update({ total: totalTransaccion });
    } catch (error) {
      console.error("Error en TransaccionService.changeDetallesInfo:", error);
      throw error;
    }
  }

  // Borrar múltiples o una sola
  async deleteTransacciones(ids, id_usuario) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error(
        "Debe proporcionar al menos un ID de transacción para eliminar."
      );
    }

    // Buscar las transacciones antes de marcarlas como eliminadas
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

    // Obtener los estados en una sola consulta
    const estadoNombres = ["Rechazada", "Cancelado", "Cancelada"];
    const estadoIds = await EstadoTransaccionService.obtenerIdsPorNombres(
      estadoNombres
    );

    // Mapear estados por nombre
    const estados = {
      Rechazada: estadoIds[0],
      Cancelado: estadoIds[1],
      Cancelada: estadoIds[2],
    };

    // Cambiar el estado de las transacciones a "Eliminada"
    for (const transaccion of transacciones) {
      let nuevoEstadoId;

      switch (transaccion.tipo_transaccion) {
        case "cotizacion":
          nuevoEstadoId = estados.Rechazada;
          break;
        case "pedido":
          nuevoEstadoId = estados.Cancelado;
          break;
        case "venta":
          nuevoEstadoId = estados.Cancelada;
          break;
        default:
          throw new Error(
            `Tipo de transacción no reconocido: ${transaccion.tipo_transaccion}`
          );
      }

      await TransaccionRepository.update(transaccion.id_transaccion, {
        id_estado_transaccion: nuevoEstadoId,
      });

      // Registrar log
      await LogTransaccionService.createLog({
        id_transaccion: transaccion.id_transaccion,
        id_usuario,
        accion: "Cambio de estado",
        detalles: `Estado cambiado a ${
          transaccion.tipo_transaccion === "cotizacion"
            ? "Rechazada"
            : transaccion.tipo_transaccion === "pedido"
            ? "Cancelado"
            : "Cancelada"
        }`,
        estado: `${
          transaccion.tipo_transaccion === "cotizacion"
            ? "Rechazada"
            : transaccion.tipo_transaccion === "pedido"
            ? "Cancelado"
            : "Cancelada"
        }`,
      });
    }

    return {
      message: `Se marcaron como eliminadas ${ids.length} transacciones.`,
    };
  }

  async deleteDetalle(idTransaccion, idDetalle) {
    const detalle = await DetalleTransaccionRepository.findOne(
      idTransaccion,
      idDetalle
    );

    if (!detalle) {
      throw new Error(
        "El detalle no existe o no está asociado a esta transacción"
      );
    }

    await detalle.destroy(); // Elimina el detalle de la base de datos
  }
}

export default new TransaccionService();
