import { Op } from "sequelize";
import createFilter from "../../shared/utils/helpers.js";
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import VentaRepository from "../infrastructure/repositories/VentaRepository.js";
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import EstadoVentaRepository from "../infrastructure/repositories/EstadoVentaRepository.js";
import paginate from "../../shared/utils/pagination.js";
import CajaRepository from "../infrastructure/repositories/CajaRepository.js";
import MetodoPagoRepository from "../infrastructure/repositories/MetodoPagoRepository.js";
import DetalleVentaRepository from "../infrastructure/repositories/DetalleVentaRepository.js";
import InventarioService from "../../inventario/application/InventarioService.js";
import DocumentoRepository from "../infrastructure/repositories/DocumentoRepository.js";
import EstadoPagoRepository from "../infrastructure/repositories/EstadoPagoRepository.js";
import PagoRepository from "../infrastructure/repositories/PagoRepository.js";
import LogVentaRepository from "../infrastructure/repositories/LogVentaRepository.js";
import MovimientoCajaService from "./MovimientoCajaService.js";
import ProductoRetornableRepository from "../../inventario/infrastructure/repositories/ProductoRetornableRepository.js";
import DetalleVentaService from "./DetalleVentaService.js";
import DocumentoService from "./DocumentoService.js";
import PagoService from "./PagoService.js";
import PedidoService from "./PedidoService.js";
import sequelize from "../../database/database.js";

class VentaService {
  async getVentaById(id) {
    try {
      const venta = await VentaRepository.findById(id);
      if (!venta) {
        throw new Error("Venta no encontrada.");
      }

      const detalles = await DetalleVentaService.getDetallesPorVenta(id);

      const documentos = await DocumentoService.obtenerDocumentosPorVenta(id);

      let pagos = [];
      if (documentos.length > 0) {
        const pagosPromises = documentos.map((doc) =>
          PagoService.obtenerPagosPorDocumento(doc.id_documento)
        );
        pagos = (await Promise.all(pagosPromises)).flat();
      }

      const cliente = venta.id_cliente
        ? await ClienteRepository.findById(venta.id_cliente)
        : null;

      const vendedor = await UsuariosRepository.findByRut(venta.id_vendedor);

      return { venta, detalles, documentos, pagos, cliente, vendedor };
    } catch (error) {
      throw new Error(`Error al obtener la venta: ${error.message}`);
    }
  }

  async getAllVentas(filters = {}, options = {}) {
    // Definir los campos permitidos para los filtros
    const allowedFields = [
      "id_cliente",
      "id_vendedor",
      "id_caja",
      "id_sucursal",
      "tipo_entrega",
      "estado",
      "fecha",
    ];

    const where = createFilter(filters, allowedFields);

    // Buscar coincidencias en datos relacionados si hay una búsqueda
    if (options.search) {
      where[Op.or] = [
        { "$cliente.nombre$": { [Op.like]: `%${options.search}%` } },
        { "$vendedor.nombre$": { [Op.like]: `%${options.search}%` } },
        { "$estado.nombre_estado$": { [Op.like]: `%${options.search}%` } },
      ];
    }

    // Incluir datos relacionados
    const include = [
      {
        model: ClienteRepository.getModel(),
        as: "cliente",
        attributes: ["id_cliente", "nombre", "rut", "email"],
      },
      {
        model: UsuariosRepository.getModel(),
        as: "vendedor",
        attributes: ["rut", "nombre", "email"],
      },
      {
        model: EstadoVentaRepository.getModel(),
        as: "estadoVenta",
        attributes: ["nombre_estado"],
      },
    ];

    // Paginación y orden
    const result = await paginate(VentaRepository.getModel(), options, {
      where,
      include,
      order: [["fecha", "DESC"]],
    });

    return result;
  }

  async createVenta(data, id_usuario_creador) {
    const {
      id_cliente,
      id_vendedor,
      id_caja,
      tipo_entrega,
      direccion_entrega,
      productos,
      productos_retornables,
      id_metodo_pago,
      notas,
      impuesto = 0,
      descuento_total_porcentaje = 0,
      tipo_documento = "boleta",
    } = data;

    const transaction = await sequelize.transaction();
    try {
      // 1. Validaciones iniciales
      const cliente = id_cliente
        ? await ClienteRepository.findById(id_cliente, { transaction })
        : null;
      const vendedor = await UsuariosRepository.findByRut(id_vendedor, {
        transaction,
      });
      const caja = await CajaRepository.findById(id_caja, { transaction });
      const metodoPago = await MetodoPagoRepository.findById(id_metodo_pago, {
        transaction,
      });

      if (id_cliente && !cliente) {
        throw new Error(`Cliente con ID ${id_cliente} no encontrado.`);
      }
      if (!vendedor) {
        throw new Error(`Vendedor con RUT ${id_vendedor} no encontrado.`);
      }
      if (!caja || caja.estado !== "abierta") {
        throw new Error(`Caja con ID ${id_caja} no está abierta o no existe.`);
      }
      if (!metodoPago) {
        throw new Error(
          `Método de pago con ID ${id_metodo_pago} no encontrado.`
        );
      }

      // Obtener la sucursal del vendedor
      const sucursal = vendedor.id_sucursal;
      if (!sucursal) {
        throw new Error(
          `El vendedor con RUT ${id_usuario_creador} no está asociado a ninguna sucursal.`
        );
      }

      // 2. Calcular totales
      let subtotal = 0;
      let descuentoTotalProductos = 0;

      const detalles = productos.map((producto) => {
        const {
          cantidad,
          precio_unitario,
          descuento_porcentaje = 0,
        } = producto;

        const subtotalProducto = cantidad * precio_unitario;
        const descuentoProducto =
          (subtotalProducto * descuento_porcentaje) / 100;

        subtotal += subtotalProducto;
        descuentoTotalProductos += descuentoProducto;

        return {
          id_producto: producto.id_producto,
          cantidad,
          precio_unitario,
          descuento: descuentoProducto,
          subtotal: subtotalProducto - descuentoProducto,
        };
      });
      // Aplicar descuento total (si corresponde)
      const descuentoTotalCompra =
        (subtotal * descuento_total_porcentaje) / 100;
      const descuentoTotal = descuentoTotalProductos + descuentoTotalCompra;

      // Calcular impuestos y total final
      const totalAntesImpuestos = subtotal - descuentoTotal;
      const impuestos_totales = totalAntesImpuestos * (impuesto / 100); // 19% por defecto
      const totalConImpuesto = totalAntesImpuestos + impuestos_totales;

      let estado_venta;
      if (
        tipo_documento === "boleta" &&
        tipo_entrega != "despacho_a_domicilio"
      ) {
        estado_venta = await EstadoVentaRepository.findByNombre("Pagada", {
          transaction,
        });
      } else if (
        tipo_documento === "factura" ||
        (tipo_entrega === "despacho_a_domicilio" && tipo_documento === "boleta")
      ) {
        estado_venta = await EstadoVentaRepository.findByNombre(
          "Pendiente de Pago",
          { transaction }
        );
      }
      // 3. Registrar la venta
      const venta = await VentaRepository.create(
        {
          id_cliente,
          id_vendedor,
          id_caja,
          id_sucursal: sucursal,
          tipo_entrega,
          direccion_entrega:
            tipo_entrega === "despacho_a_domicilio" ? direccion_entrega : null,
          fecha: new Date(),
          total: totalConImpuesto,
          impuestos_totales,
          id_estado_venta: estado_venta.id_estado_venta,
          descuento_total: descuentoTotal,
          id_metodo_pago,
          notas,
        },
        { transaction }
      );

      // 4. Registrar los detalles de la venta

      for (const detalle of detalles) {
        await DetalleVentaRepository.create(
          {
            id_venta: venta.id_venta,
            ...detalle,
          },
          { transaction }
        );

        // 5. Manejo del inventario
        if (tipo_entrega === "retiro_en_sucursal") {
          const disponible = await InventarioService.validarDisponibilidad(
            detalle.id_producto,
            detalle.cantidad,
            { transaction }
          );
          if (!disponible) {
            throw new Error(
              `Producto con ID ${detalle.id_producto} no tiene suficiente inventario.`
            );
          }

          await InventarioService.decrementarStock(
            detalle.id_producto,
            detalle.cantidad,
            { transaction }
          );
        }
      }

      const estado_pago_documento =
        tipo_documento === "boleta" && tipo_entrega === "retiro_en_sucursal"
          ? await EstadoPagoRepository.findByNombre("Pagado", { transaction })
          : await EstadoPagoRepository.findByNombre("Pendiente", {
              transaction,
            });

      if (productos_retornables && productos_retornables.length > 0) {
        for (const retornable of productos_retornables) {
          await ProductoRetornableRepository.create(
            {
              id_producto: retornable.id_producto,
              id_venta: venta.id_venta,
              id_entrega: null,
              cantidad: retornable.cantidad,
              estado: retornable.estado || "reutilizable",
              tipo_defecto:
                retornable.estado === "defectuoso"
                  ? retornable.tipo_defecto
                  : null,
              fecha_retorno: new Date(),
            },
            { transaction }
          );
        }
      }

      let estado_pago,
        documento = null,
        vuelto = 0;

      // 7. Registrar el pago si es boleta (pago inmediato)

      if (
        tipo_documento === "boleta" &&
        tipo_entrega === "retiro_en_sucursal" &&
        (data.tipo_referencia || data.monto_recibido)
      ) {
        documento = await DocumentoRepository.create(
          {
            id_venta: venta.id_venta,
            tipo_documento,
            numero: `${tipo_documento === "boleta" ? "B" : "F"}-${
              venta.id_venta
            }`,
            fecha_emision: new Date(),
            id_cliente,
            id_usuario_creador,
            subtotal,
            monto_neto: totalAntesImpuestos,
            iva: impuestos_totales,
            total: totalConImpuesto,
            id_estado_pago: estado_pago_documento.id_estado_pago,
            estado: "emitido",
            observaciones: notas,
          },
          { transaction }
        );

        estado_pago = await EstadoPagoRepository.findByNombre("Pagado", {
          transaction,
        });
        await PagoRepository.create(
          {
            id_venta: venta.id_venta,
            id_documento: documento.id_documento,
            id_metodo_pago,
            id_estado_pago: estado_pago.id_estado_pago, // Estado "acreditado" para boletas
            monto: totalConImpuesto,
            fecha_pago: new Date(),
            id_caja: caja.id_caja,
            referencia:
              data.referencia || `AUTO-${tipo_documento}-${venta.id_venta}`, // Por defecto nulo, se puede actualizar después
          },
          { transaction }
        );

        // Registrar movimiento en caja solo si es efectivo
        const metodo = await MetodoPagoRepository.findById(id_metodo_pago, {
          transaction,
        });

        if (metodo.nombre.toLowerCase() === "efectivo") {
          if (data.pago_recibido < totalConImpuesto) {
            throw new Error(
              "El monto recibido es insuficiente para realizar la venta."
            );
          }

          vuelto = data.pago_recibido - totalConImpuesto;

          // Registrar el movimiento en caja con el monto recibido
          await MovimientoCajaService.registrarMovimiento(
            {
              id_caja,
              tipo_movimiento: "ingreso",
              monto: data.pago_recibido,
              descripcion: `Venta con boleta ID ${venta.id_venta}`,
              id_venta: venta.id_venta,
              id_metodo_pago,
            },
            { transaction }
          );

          if (vuelto > 0) {
            await MovimientoCajaService.registrarMovimiento(
              {
                id_caja,
                tipo_movimiento: "egreso",
                monto: vuelto,
                descripcion: `Vuelto entregado para venta ID ${venta.id_venta}`,
                id_venta: venta.id_venta,
                id_metodo_pago: null,
              },
              { transaction }
            );
          }
        }
      } else if (tipo_documento === "factura") {
        estado_pago = await EstadoPagoRepository.findByNombre("Pendiente");
        await PagoRepository.create(
          {
            id_venta: venta.id_venta,
            id_documento: documento.id_documento,
            id_metodo_pago,
            id_estado_pago: estado_pago.id_estado_pago,
            monto: totalConImpuesto,
            fecha_pago: null,
            referencia: null,
          },
          { transaction }
        );
      }

      const esEntrega = tipo_entrega === "despacho_a_domicilio";
      if (esEntrega) {
        const payload = {
          id_cliente,
          id_creador: id_usuario_creador,
          direccion_entrega,
          productos,
          metodo_pago: id_metodo_pago,
          pagado: data.pago_recibido || data.referencia ? true : false,
        };
        await PedidoService.createPedido(payload, { transaction });
      }

      // 8. Registrar log de la venta
      await LogVentaRepository.create(
        {
          id_venta: venta.id_venta,
          accion: "creación",
          fecha: new Date(),
          usuario: id_usuario_creador,
          detalle: `Venta creada con documento ${tipo_documento.toUpperCase()}-${
            documento ? documento.numero : "Sin Pagar aún"
          }`,
        },
        { transaction }
      );

      // 9. Respuesta final
      await transaction.commit();
      return {
        venta,
        productos: detalles,
        documento: documento,
        vuelto,
        mensaje:
          vuelto > 0
            ? `Venta realizada con éxito. Vuelto entregado: ${vuelto}`
            : "Venta realizada con éxito. Sin vuelto.",
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new VentaService();
