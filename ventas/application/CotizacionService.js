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

    // Paginación y orden
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
    } = data;

    // 1. Validaciones iniciales
    const cliente = id_cliente
      ? await ClienteRepository.findById(id_cliente)
      : null;
    const vendedor = await UsuariosRepository.findByRut(id_usuario_creador);

    if (id_cliente && !cliente) {
      throw new Error(`Cliente con ID ${id_cliente} no encontrado.`);
    }
    if (!vendedor) {
      throw new Error(`Vendedor con RUT ${id_usuario_creador} no encontrado.`);
    }

    if (!productos || productos.length === 0) {
      throw new Error("Debe incluir al menos un producto en la cotización.");
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

    // Aplicar descuento total (si corresponde)
    const descuentoTotalCompra = (subtotal * descuento_total_porcentaje) / 100;
    const descuentoTotal = descuentoTotalProductos + descuentoTotalCompra;

    // Calcular impuestos y total final
    const totalAntesImpuestos = subtotal - descuentoTotal;
    const impuestos_totales = totalAntesImpuestos * (impuesto || 0.19); // 19% por defecto
    const totalConImpuesto = totalAntesImpuestos + impuestos_totales;

    // 3. Registrar la cotización
    const cotizacion = await CotizacionRepository.create({
      id_cliente,
      id_vendedor: id_usuario_creador,
      id_sucursal: sucursal,
      fecha: new Date(),
      fecha_vencimiento,
      total: totalConImpuesto,
      impuestos_totales,
      descuento_total: descuentoTotal,
      estado: "activa", // Estado inicial de la cotización
      notas,
    });

    // 4. Registrar los detalles de la cotización
    for (const detalle of detalles) {
      await DetalleCotizacionRepository.create({
        id_cotizacion: cotizacion.id_cotizacion,
        ...detalle,
      });
    }

    // 5. Registrar en LogCotizacion
    await LogCotizacionRepository.create({
      id_cotizacion: cotizacion.id_cotizacion,
      accion: "creación",
      fecha: new Date(),
      usuario: id_usuario_creador,
      detalle: `Cotización creada con estado inicial 'activa'.`,
    });

    // 5. Retornar la cotización creada con sus detalles
    return {
      cotizacion,
      detalles,
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

  async generarCotizacionPdf(id, stream) {
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

    detalles.forEach((detalle) => {
      const subtotal = detalle.cantidad * detalle.precio_unitario;
      totalNeto += subtotal;

      const row = [
        detalle.id_producto,
        detalle.producto.nombre_producto,
        detalle.cantidad,
        `$${detalle.precio_unitario.toLocaleString()}`,
        `$${subtotal.toLocaleString()}`,
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
    const iva = totalNeto * 0.19;
    const totalFinal = totalNeto + iva;

    doc
      .fontSize(10)
      .text(`Subtotal: $${totalNeto.toLocaleString()}`, 400, position + 10)
      .text(`IVA (19%): $${iva.toLocaleString()}`, 400, position + 25)
      .font("Helvetica-Bold")
      .text(`Total: $${totalFinal.toLocaleString()}`, 400, position + 40, {
        align: "right",
        underline: true,
      })
      .font("Helvetica");

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
}

export default new CotizacionService();
