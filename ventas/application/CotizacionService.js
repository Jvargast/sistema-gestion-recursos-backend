import EmpresaService from "../../auth/application/EmpresaService.js";
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import CotizacionRepository from "../infrastructure/repositories/CotizacionRepository.js";
import DetalleCotizacionRepository from "../infrastructure/repositories/DetalleCotizacionRepository.js";
import LogCotizacionRepository from "../infrastructure/repositories/LogCotizacionRepository.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import SucursalRepository from "../../auth/infraestructure/repositories/SucursalRepository.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CotizacionService {
  async getAllCotizaciones(filters = {}, options = {}) {
    const allowedFields = ["id_cliente", "id_vendedor", "estado", "fecha"];

    const where = createFilter(filters, allowedFields);

    if (options.search) {
      where[Op.or] = [
        { "$cliente.nombre$": { [Op.like]: `%${options.search}%` } },
        { "$vendedor.nombre$": { [Op.like]: `%${options.search}%` } },
      ];
    }

    if (filters.id_sucursal) {
      where.id_sucursal = Number(filters.id_sucursal);
    }

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
    ];


    const result = await paginate(CotizacionRepository.getModel(), options, {
      where,
      include,
      order: [["id_cotizacion", "DESC"]],
    });

    return result;
  }
  async createCotizacion(data, id_usuario_creador) {
    const {
      id_cliente,
      productos,
      fecha_vencimiento,
      notas,
      impuesto,
      descuento_total_porcentaje,
      id_sucursal,
    } = data;

    const cliente = id_cliente
      ? await ClienteRepository.findById(id_cliente)
      : null;
    const vendedor = await UsuariosRepository.findByRutBasic(id_usuario_creador);

    if (id_cliente && !cliente) {
      throw new Error(`Cliente con ID ${id_cliente} no encontrado.`);
    }
    if (!vendedor) {
      throw new Error(`Vendedor con RUT ${id_usuario_creador} no encontrado.`);
    }

    if (!productos || productos.length === 0) {
      throw new Error("Debe incluir al menos un producto en la cotización.");
    }

    const sucursalId = Number(id_sucursal);
    if (!sucursalId) {
      throw new Error("Debes indicar una sucursal (id_sucursal).");
    }
    const sucursal = await SucursalRepository.getSucursalById(sucursalId);
    if (!sucursal) {
      throw new Error(`Sucursal con ID ${sucursalId} no encontrada.`);
    }

    const productosSolo = productos.filter((item) => !!item.id_producto);
    const insumosSolo = productos.filter((item) => !!item.id_insumo);

    let subtotal = 0;
    let descuentoTotalProductos = 0;

    const detalles = productosSolo.map((producto) => {
      const { cantidad, precio_unitario, descuento_porcentaje = 0 } = producto;

      const subtotalProducto = cantidad * precio_unitario;
      const descuentoProducto = (subtotalProducto * descuento_porcentaje) / 100;

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

    const descuentoTotalCompra = (subtotal * descuento_total_porcentaje) / 100;
    const descuentoTotal = descuentoTotalProductos + descuentoTotalCompra;

    const totalAntesImpuestos = subtotal - descuentoTotal;

    const impuestos_totales =
      typeof impuesto === "number"
        ? totalAntesImpuestos * impuesto
        : totalAntesImpuestos * 0.19;

    const totalConImpuesto = totalAntesImpuestos + impuestos_totales;

    const cotizacion = await CotizacionRepository.create({
      id_cliente,
      id_vendedor: id_usuario_creador,
      id_sucursal: sucursalId,
      fecha: new Date(),
      fecha_vencimiento,
      total: totalConImpuesto,
      impuesto,
      impuestos_totales,
      descuento_total: descuentoTotal,
      estado: "activa",
      notas,
    });

    const detallesGuardados = [];

    for (const insumo of insumosSolo) {
      const {
        id_insumo,
        cantidad,
        precio_unitario,
        descuento_porcentaje = 0,
      } = insumo;
      const subtotalInsumo = cantidad * precio_unitario;
      const descuentoInsumo = (subtotalInsumo * descuento_porcentaje) / 100;

      subtotal += subtotalInsumo;
      descuentoTotalProductos += descuentoInsumo;

      const nuevoDetalle = await DetalleCotizacionRepository.create({
        id_cotizacion: cotizacion.id_cotizacion,
        id_insumo,
        cantidad,
        precio_unitario,
        descuento: descuentoInsumo,
        subtotal: subtotalInsumo - descuentoInsumo,
      });

      detallesGuardados.push(nuevoDetalle);
    }

    for (const detalle of detalles) {
      const nuevoDetalle = await DetalleCotizacionRepository.create({
        id_cotizacion: cotizacion.id_cotizacion,
        ...detalle,
      });
      detallesGuardados.push(nuevoDetalle);
    }

    await LogCotizacionRepository.create({
      id_cotizacion: cotizacion.id_cotizacion,
      accion: "creación",
      fecha: new Date(),
      usuario: id_usuario_creador,
      detalle: `Cotización creada con estado inicial 'activa'.`,
    });

    return {
      cotizacion,
      detalles: detallesGuardados,
    };
  }

  async getCotizacionById(id_cotizacion) {
    try {
      const cotizacion = await CotizacionRepository.findById(id_cotizacion);
      if (!cotizacion) {
        throw new Error("Cotización no encontrada.");
      }

      const detalles = await DetalleCotizacionRepository.findByCotizacionId(
        id_cotizacion
      );

      return { cotizacion, detalles };
    } catch (error) {
      throw new Error(`Error al obtener la cotización: ${error.message}`);
    }
  }

  async generarCotizacionPdf(id, stream, mostrarImpuestos = true) {
    const cotizacionData = await this.getCotizacionById(id);
    const empresa = await EmpresaService.obtenerEmpresaPorId(1);
    const { cotizacion, detalles } = cotizacionData;

    if (!cotizacionData) {
      throw new Error("Cotización no encontrada.");
    }
    if (!Array.isArray(detalles) || detalles.length === 0) {
      throw new Error("La cotización no tiene detalles.");
    }

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(stream);

    const logoPath = path.join(__dirname, "../../public/images/logoLogin.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 50, { width: 100 });
    }
    doc.on("error", (err) => {
      console.error("Error generando PDF:", err);
      throw new Error("Error al generar el PDF.");
    });
    // Encabezado
    doc
      .fillColor("#005cbf")
      .fontSize(24)
      .text("COTIZACIÓN", 0, 50, { align: "right" });

    doc
      .fillColor("#000")
      .fontSize(12)
      .text(`Nombre Empresa: ${empresa.nombre}`, 50, 130)
      .text(`Dirección: ${empresa.direccion}`, {
        width: 250,
        continued: false,
      })
      .text(`Teléfono: ${empresa.telefono}`)
      .text(`Email: ${empresa.email}`);

    // Cotización + Cliente
    doc.moveTo(50, 195).lineTo(550, 195).stroke("#cccccc");
    const yStart = 205;
    doc
      .fontSize(10)
      .text(
        `Fecha de emisión: ${new Date(cotizacion.fecha).toLocaleDateString(
          "es-CL"
        )}`,
        400,
        130
      )
      .text(`Cotización #: ${cotizacion.id_cotizacion}`, 400, 145)
      .text(
        `Fecha de vencimiento: ${new Date(
          cotizacion.fecha_vencimiento
        ).toLocaleDateString("es-CL")}`,
        400,
        160
      );
    // Vendedor
    doc
      .fontSize(12)
      .fillColor("#005cbf")
      .text("Vendedor", 50, yStart)
      .fillColor("#000")
      .fontSize(10)
      .text(
        `Nombre: ${cotizacion.vendedor.nombre} ${cotizacion.vendedor.apellido}`,
        50,
        yStart + 15
      )
      .text(`Rut: ${cotizacion.vendedor.rut}`, 50, yStart + 30);

    // Cliente
    doc
      .fillColor("#005cbf")
      .fontSize(12)
      .text("Cliente", 300, yStart)
      .fillColor("#000")
      .fontSize(10)
      .text(`Nombre: ${cotizacion.cliente.nombre}`, 300, yStart + 15)
      .text(`Dirección: ${cotizacion.cliente.direccion}`, 300, yStart + 30, {
        width: 220,
      })
      .text(`Teléfono: ${cotizacion.cliente.telefono}`, 300, yStart + 60);

    // TABLA DE DETALLES
    const tableTop = yStart + 90;
    const columnWidths = [50, 200, 70, 70, 70];
    const headers = ["# Artículo", "Descripción", "Cant", "P/U", "Total"];

    let x = 50;
    doc
      .moveTo(50, tableTop - 10)
      .lineTo(550, tableTop - 10)
      .stroke("#cccccc");

    doc.fontSize(10).fillColor("#000");
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop, {
        width: columnWidths[i],
        align: "center",
      });
      x += columnWidths[i];
    });

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    let position = tableTop + 25;
    let totalNeto = 0;

    detalles.forEach((detalle, index) => {
      const subtotal = detalle.cantidad * detalle.precio_unitario;
      totalNeto += subtotal;

      const nombre =
        detalle.producto?.nombre_producto ||
        detalle.insumo?.nombre_insumo ||
        "—";

      const row = [
        index + 1,
        nombre,
        detalle.cantidad,
        `$${detalle.precio_unitario.toLocaleString("es-CL")}`,
        `$${subtotal.toLocaleString("es-CL")}`,
      ];

      x = 50;
      row.forEach((cell, i) => {
        doc.text(cell, x, position, {
          width: columnWidths[i],
          align: "center",
        });
        x += columnWidths[i];
      });

      position += 20;
    });

    // LÍNEA FINAL DETALLES
    doc.moveTo(50, position).lineTo(550, position).stroke("#cccccc");

    // TOTALES
    const impuesto = cotizacion.impuesto || 0.19;
    const descuento = cotizacion.descuento_total || 0;
    const totalAntesDescuento = totalNeto;
    const totalConDescuento = totalAntesDescuento - descuento;
    const iva = totalConDescuento * impuesto;
    const totalFinal = totalConDescuento + iva;

    let yTotales = position + 10;
    doc
      .fontSize(10)
      .text(
        `Subtotal: $${totalAntesDescuento.toLocaleString("es-CL")}`,
        400,
        yTotales
      );

    if (mostrarImpuestos && descuento > 0) {
      yTotales += 15;
      doc.text(
        `Descuento: -$${descuento.toLocaleString("es-CL")}`,
        400,
        yTotales
      );
    }

    if (mostrarImpuestos) {
      yTotales += 15;
      doc.text(
        `IVA (${(impuesto * 100).toFixed(0)}%): $${iva.toLocaleString(
          "es-CL"
        )}`,
        400,
        yTotales
      );

      yTotales += 15;
      doc
        .font("Helvetica-Bold")
        .text(`Total: $${totalFinal.toLocaleString("es-CL")}`, 400, yTotales, {
          align: "right",
          underline: true,
        })
        .font("Helvetica");
    } else {
      yTotales += 15;
      doc
        .font("Helvetica-Bold")
        .text(
          `Total: $${totalConDescuento.toLocaleString("es-CL")}`,
          400,
          yTotales,
          {
            align: "right",
            underline: true,
          }
        )
        .font("Helvetica");
    }

    // MENSAJE FINAL
    doc
      .fontSize(10)
      .fillColor("#888")
      .text(
        "Si tiene alguna consulta sobre esta cotización, por favor contáctenos.",
        50,
        position + 80,
        {
          align: "center",
        }
      );
    doc.end();
  }

  async actualizarCotizacion(
    id_cotizacion,
    impuesto,
    descuento_total_porcentaje,
    notas,
    fecha_vencimiento,
    detalles_actualizados
  ) {
    const cotizacion = await CotizacionRepository.findById(id_cotizacion);
    if (!cotizacion) {
      const error = new Error("Cotización no encontrada");
      error.status = 404;
      throw error;
    }

    // 1. Si se proporcionan detalles, actualizarlos
    if (
      Array.isArray(detalles_actualizados) &&
      detalles_actualizados.length > 0
    ) {
      for (const detalle of detalles_actualizados) {
        const { id_detalle, cantidad, precio_unitario } = detalle;

        const detalleExistente =
          await DetalleCotizacionRepository.findByDetalleId(id_detalle);

        if (!detalleExistente) {
          throw new Error(`Detalle con ID ${id_detalle} no encontrado.`);
        }

        await detalleExistente.update({
          cantidad,
          precio_unitario,
          subtotal: cantidad * precio_unitario,
        });
      }
    }

    const detalles = await DetalleCotizacionRepository.findByCotizacionId(
      id_cotizacion
    );

    let subtotal = detalles.reduce(
      (acc, d) => acc + (d.cantidad || 0) * (d.precio_unitario || 0),
      0
    );

    const descuento = subtotal * (descuento_total_porcentaje || 0);

    const totalAntesImpuesto = subtotal - descuento;
    const impuestos_totales = totalAntesImpuesto * (impuesto || 0);
    const total = totalAntesImpuesto + impuestos_totales;

    await cotizacion.update({
      impuesto,
      descuento_total: descuento,
      impuestos_totales,
      total,
      notas,
      fecha_vencimiento,
    });

    return cotizacion;
  }

  async deleteCotizacion(id_cotizacion, usuario = null) {
    try {
      const detalles = await DetalleCotizacionRepository.findByCotizacionId(
        id_cotizacion
      );

      for (const detalle of detalles) {
        await DetalleCotizacionRepository.delete(detalle.id_detalle);
      }

      const deleted = await CotizacionRepository.delete(id_cotizacion);

      if (deleted) {
        if (usuario) {
          try {
            await LogCotizacionRepository.create({
              id_cotizacion,
              accion: "anulación",
              fecha: new Date(),
              usuario,
              detalle: `Cotización ${id_cotizacion} eliminada`,
            });
          } catch (logError) {
            console.error(
              "Error registrando log de eliminación de cotización:",
              logError
            );
          }
        }
        return true;
      }

      return false;
    } catch (error) {
      throw new Error(`Error al eliminar la cotización: ${error.message}`);
    }
  }
}

export default new CotizacionService();
