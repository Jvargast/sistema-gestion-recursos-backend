import DocumentoRepository from "../infrastructure/repositories/DocumentoRepository.js";
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import paginate from "../../shared/utils/pagination.js";
import CuentaPorCobrarRepository from "../infrastructure/repositories/CuentaPorCobrarRepository.js";
import EmpresaService from "../../auth/application/EmpresaService.js";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import EstadoPagoRepository from "../infrastructure/repositories/EstadoPagoRepository.js";
import EstadoVentaRepository from "../infrastructure/repositories/EstadoVentaRepository.js";
import PagoRepository from "../infrastructure/repositories/PagoRepository.js";
import VentaRepository from "../infrastructure/repositories/VentaRepository.js";
import PedidoRepository from "../infrastructure/repositories/PedidoRepository.js";
import sequelize from "../../database/database.js";
import { obtenerFechaActualChile } from "../../shared/utils/fechaUtils.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLP = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(valor));

class CuentaPorCobrarService {
  async getAll(options = {}, filters = {}) {
    const where = {};

    if (filters.id_cliente) {
      where.id_cliente = filters.id_cliente;
    }
    if (filters.estado) {
      where.estado = filters.estado;
    }
    if (filters.id_sucursal != null) {
      where.id_sucursal = Number(filters.id_sucursal);
    }

    return await paginate(CuentaPorCobrarRepository.getModel(), options, {
      where,
      include: [
        {
          model: DocumentoRepository.getModel(),
          as: "documento",
          include: [
            {
              model: ClienteRepository.getModel(),
              as: "cliente",
              attributes: ["id_cliente", "nombre", "rut", "razon_social"],
            },
          ],
        },
      ],
      order: [["fecha_emision", "DESC"]],
    });
  }

  async getById(id) {
    return await CuentaPorCobrarRepository.findById(id);
  }

  async generarFacturaPdf(id, stream) {
    const cuenta = await CuentaPorCobrarRepository.findById(id);
    const empresa = await EmpresaService.obtenerEmpresaPorId(1);

    if (!cuenta) throw new Error("Cuenta por cobrar no encontrada");

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(stream);

    const logoPath = path.join(__dirname, "../../public/images/logoLogin.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 50, { width: 100 });
    }

    doc
      .fillColor("#1e88e5")
      .fontSize(24)
      .text("FACTURA", 0, 50, { align: "right" });

    doc
      .fillColor("#000")
      .fontSize(10)
      .text(`Nombre: ${empresa.nombre}`, 50, 130)
      .text(`Dirección: ${empresa.direccion}`)
      .text(`Teléfono: ${empresa.telefono}`)
      .text(`Email: ${empresa.email}`)
      .text(`RUT: ${empresa.rut_empresa}`);

    const y = 205;
    doc
      .fontSize(10)
      .text(`Factura #: ${cuenta.id_cxc}`, 400, 130)
      .text(
        `Emisión: ${new Date(cuenta.fecha_emision).toLocaleDateString(
          "es-CL"
        )}`,
        400,
        145
      )
      .text(
        `Vencimiento: ${new Date(cuenta.fecha_vencimiento).toLocaleDateString(
          "es-CL"
        )}`,
        400,
        160
      );

    doc
      .fontSize(12)
      .fillColor("#1e88e5")
      .text("Cliente", 50, y)
      .fillColor("#000")
      .fontSize(10)
      .text(`Razón Social: ${cuenta.venta.cliente.razon_social}`, 50, y + 15)
      .text(`RUT: ${cuenta.venta.cliente.rut}`, 50, y + 30);

    doc
      .fillColor("#1e88e5")
      .fontSize(12)
      .text("Documento", 300, y)
      .fillColor("#000")
      .fontSize(10)
      .text(
        `${cuenta.documento.tipo_documento.toUpperCase()} N° ${
          cuenta.documento.numero
        }`,
        300,
        y + 15
      )
      .text(`Estado: ${cuenta.estado}`, 300, y + 30);

    doc
      .moveTo(50, y + 60)
      .lineTo(550, y + 60)
      .stroke("#ccc");

    const headers = ["Producto", "Cantidad", "P/U", "Subtotal"];
    const columnWidths = [200, 100, 100, 100];
    let posY = y + 80;
    let total = 0;

    doc.fontSize(10).fillColor("#1e88e5").font("Helvetica-Bold");

    headers.forEach((header, i) => {
      doc.text(
        header,
        50 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
        posY,
        {
          width: columnWidths[i],
          align: "center",
        }
      );
    });

    doc
      .moveTo(50, posY + 15)
      .lineTo(550, posY + 15)
      .stroke();
    posY += 25;

    doc.font("Helvetica").fillColor("#000");

    cuenta.venta.detallesVenta.forEach((detalle) => {
      const { cantidad, precio_unitario, producto } = detalle;
      const subtotal = cantidad * precio_unitario;
      total += subtotal;

      const row = [
        producto.nombre_producto,
        cantidad,
        CLP(precio_unitario),
        CLP(subtotal),
      ];

      row.forEach((cell, i) => {
        doc.text(
          String(cell),
          50 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
          posY,
          {
            width: columnWidths[i],
            align: "center",
          }
        );
      });

      posY += 20;
    });

    doc.moveTo(50, posY).lineTo(550, posY).stroke("#ccc");

    posY += 20;
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`Monto Total: ${CLP(cuenta.monto_total)}`, 400, posY)
      .text(`Pagado: ${CLP(cuenta.monto_pagado)}`, 400, posY + 15)
      .text(`Pendiente: ${CLP(cuenta.saldo_pendiente)}`, 400, posY + 30);

    doc
      .font("Helvetica")
      .fillColor("#888")
      .fontSize(10)
      .text(
        "Esta factura ha sido generada automáticamente al emitir la venta.",
        50,
        posY + 60,
        { align: "center" }
      );

    doc.end();
  }

  async registrarPago({
    id_cxc,
    monto,
    metodo_pago,
    observaciones,
    usuario,
    referencia,
  }) {
    return sequelize.transaction(async (t) => {
      const cuenta = await CuentaPorCobrarRepository.findById(id_cxc, {
        transaction: t,
      });
      if (!cuenta) throw new Error("Cuenta por cobrar no encontrada");

      const fecha = obtenerFechaActualChile();

      const montoPendiente = parseFloat(cuenta.saldo_pendiente);
      const pago = parseFloat(monto);

      if (pago <= 0) throw new Error("El monto debe ser mayor a cero.");
      if (pago > montoPendiente)
        throw new Error("El monto excede el saldo pendiente.");

      cuenta.monto_pagado = parseFloat(
        (parseFloat(cuenta.monto_pagado) + pago).toFixed(2)
      );

      cuenta.saldo_pendiente = parseFloat(
        (parseFloat(cuenta.saldo_pendiente) - pago).toFixed(2)
      );

      const estaPagada = cuenta.saldo_pendiente <= 0;
      cuenta.estado = estaPagada ? "pagado" : "pendiente";
      cuenta.observaciones = observaciones;

      await cuenta.save({ transaction: t });

      const venta = cuenta.venta;

      const estadoPago = await EstadoPagoRepository.findByNombre(
        estaPagada ? "Pagado" : "Pendiente",
        { transaction: t }
      );
      const id_estado_pago = estadoPago.id_estado_pago;

      const id_estado_venta = estaPagada
        ? (
            await EstadoVentaRepository.findByNombre("Pagada", {
              transaction: t,
            })
          ).id_estado_venta
        : venta.id_estado_venta;

      const idSucursal = venta.id_sucursal;

      await PagoRepository.create(
        {
          id_venta: cuenta.id_venta,
          id_documento: cuenta.id_documento,
          id_metodo_pago: metodo_pago,
          id_estado_pago,
          monto: pago,
          fecha_pago: fecha,
          referencia: referencia || null,
          id_sucursal: idSucursal,
        },
        { transaction: t }
      );

      await DocumentoRepository.update(
        cuenta.id_documento,
        { id_estado_pago },
        { transaction: t }
      );

      await VentaRepository.update(
        cuenta.id_venta,
        { id_estado_venta },
        { transaction: t }
      );

      const pedidoAsociado = await PedidoRepository.findByIdVenta(
        cuenta.id_venta,
        { transaction: t }
      );

      if (pedidoAsociado) {
        await PedidoRepository.update(
          pedidoAsociado.id_pedido,
          {
            pagado: estaPagada,
            estado_pago: estaPagada ? "Pagado" : "Pendiente",
          },
          { transaction: t }
        );
      }

      return cuenta;
    });
  }

  async buscarCuentaPorCobrarPorVentaId(idVenta) {
    const factura = await CuentaPorCobrarRepository.findByIdVenta(idVenta);
    return factura;
  }

  async findByDocumentoId(id_documento) {
    return await CuentaPorCobrarRepository.findByIdDocumento(id_documento);
  }
}

export default new CuentaPorCobrarService();
