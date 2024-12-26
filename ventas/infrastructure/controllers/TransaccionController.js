import DetalleTransaccionService from "../../application/DetalleTransaccionService.js";
import TransaccionService from "../../application/TransaccionService.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import EmpresaService from "../../../auth/application/EmpresaService.js";

class TransaccionController {
  async getTransaccionById(req, res) {
    try {
      const { id } = req.params;
      const transaccion = await TransaccionService.getTransaccionById(id);
      res.status(200).json(transaccion);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllTransacciones(req, res) {
    try {
      const filters = req.query; // Filtros enviados en los query params
      const rolId = req.user.rol.id;

      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search,
        rolId,
      };
      delete filters.limit;
      delete filters.offset;
      const transacciones = await TransaccionService.getAllTransacciones(
        filters,
        options
      );
      res.status(200).json({data: transacciones.data, total: transacciones.pagination});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createTransaccion(req, res) {
    try {
      const { detalles, ...data } = req.body;
      const { rut } = req.user;
      const transaccion = await TransaccionService.createTransaccion(
        data,
        detalles,
        rut
      );
      res.status(201).json(transaccion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async addDetallesToTransaccion(req, res) {
    try {
      const { id } = req.params;
      const { productos } = req.body;
      const { rut } = req.user; // Se obtiene del token del usuario autenticado
      await TransaccionService.addDetallesToTransaccion(id, productos, rut);
      res
        .status(200)
        .json({ message: "Detalles agregados a la transacción con éxito." });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async changeDetallesInfo(req, res) {
    const { id } = req.params; // ID de la transacción
    const { detalles } = req.body; // Detalles actualizados que vienen en el body
    try {
      // Delegar la lógica al servicio
      await TransaccionService.changeDetallesInfo(id, detalles);

      // Enviar respuesta exitosa
      res.status(200).json({
        message: "Detalles actualizados correctamente.",
      });
    } catch (error) {
      console.error("Error al actualizar los detalles:", error);
      res.status(500).json({
        message: "Hubo un error al actualizar los detalles.",
        error: error.message,
      });
    }
  }

  async changeEstado(req, res) {
    try {
      const { id } = req.params;
      const { id_estado_transaccion } = req.body;
      const { rut } = req.user;
      await TransaccionService.changeEstadoTransaccion(
        id,
        id_estado_transaccion,
        rut
      );

      res
        .status(200)
        .json({ message: "Estado de la transacción cambiada con éxito." });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async changeTipoTransaccion(req, res) {
    try {
      const { id } = req.params;
      const { tipo_transaccion } = req.body;
      const { rut } = req.user;
      await TransaccionService.changeTipoTransaccion(id, tipo_transaccion, rut);
      res
        .status(200)
        .json({ message: "Tipo de la transacción cambiado con éxito." });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async changeEstadoDetalles(req, res) {
    try {
      const { id } = req.params;
      const { nuevoEstado } = req.body;
      const { rut } = req.user;
      await DetalleTransaccionService.cambiarEstadoDetalles(
        id,
        nuevoEstado,
        rut
      );
      res
        .status(200)
        .json({ message: "Estado del detalle cambiado con éxito." });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async changeMetodoPago(req, res) {
    try {
      const { id } = req.params;
      const { metodo_pago } = req.body;
      const { rut } = req.user;
      await TransaccionService.cambiarMetodoPago(id, metodo_pago, rut);
      res.status(200).json({ message: "Método de pago actualizado" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async completeTransaction(req, res) {
    try {
      const { rut } = req.user;
      const { id } = req.params;
      const { metodo_pago, monto, referencia } = req.body;
      const completeTransaction = await TransaccionService.completarTransaccion(
        id,
        metodo_pago,
        monto,
        referencia,
        rut
      );
      res.status(200).json(completeTransaction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async finalizarTransaccion(req, res) {
    try {
      const { rut } = req.user;
      const { id } = req.params;

      const finalizarTransaccion =
        await TransaccionService.finalizarTransaccion(id, rut);
      res.status(200).json(finalizarTransaccion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async asignarTransaccion(req, res) {
    try {
      //Falta lógica para el usuario que lo hace
      const { rut } = req.user;
      const { id } = req.params;
      const { id_usuario } = req.body;

      await TransaccionService.asignarTransaccionAUsuario(id, id_usuario, rut);
      res.status(200).json({ message: "Usuario asigado con éxito" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async eliminarAsignadoTransaccion(req, res) {
    try {
      const { rut } = req.user;
      const { id } = req.params;

      await TransaccionService.eliminarTransaccionAUsuario(id, rut);
      
      res.status(200).json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async actualizarEstadoYRegistrarPago(req, res) {
    try {
      const { id_transaccion, detallesActualizados, pago } = req.body;
      const { id_usuario } = req.user;

      const resultado = await TransaccionService.actualizarEstadoYRegistrarPago(
        id_transaccion,
        detallesActualizados,
        pago,
        id_usuario
      );
      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTransacciones(req, res) {
    try {
      const { ids } = req.body;
      const { rut } = req.user;
      const result = await TransaccionService.deleteTransacciones(ids, rut);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteDetalle(req, res) {
    const { id, idDetalle } = req.params;

    try {
      // Llamar al servicio que realiza la eliminación
      await TransaccionService.deleteDetalle(id, idDetalle);
      return res
        .status(200)
        .json({ message: "Detalle eliminado correctamente" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al eliminar el detalle" });
    }
  }

  // PDF
  async createPdf(req, res) {
    try {
      const { id } = req.params;
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      // Obtener la transacción y sus detalles
      const transaccion = await TransaccionService.getTransaccionById(id);
      const empresa = await EmpresaService.obtenerEmpresaPorId(1);
      if (!transaccion || !transaccion.transaccion) {
        return res.status(404).json({ message: "Transacción no encontrada" });
      }

      const { transaccion: transaccionData, detalles } = transaccion;

      // Validar que existan detalles
      if (!Array.isArray(detalles) || detalles.length === 0) {
        return res
          .status(400)
          .json({ message: "La transacción no tiene detalles." });
      }

      // Configurar encabezados para descarga
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=cotizacion_${id}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");

      // Crear un nuevo PDF
      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(res); // Enviar el PDF al cliente directamente

      // Cargar el logo
      const logoPath = path.join(
        __dirname,
        "../../../public/images/logoLogin.png"
      );
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 50, { width: 100 }); // Posicionar y ajustar tamaño
      }

      // Manejar errores en la transmisión del PDF
      doc.on("error", (err) => {
        console.error("Error al generar el PDF:", err);
        return res.status(500).json({ message: "Error al generar el PDF." });
      });

      // Encabezado Empresa
      doc
        .fillColor("#005cbf")
        .fontSize(24)
        .text("COTIZACIÓN", 0, 50, { align: "right" });

      doc
        .fillColor("#000000")
        .fontSize(12)
        .text(`Nombre Empresa: ${empresa.nombre}`, 50, 130)
        .text(`Dirección: ${empresa.direccion}`, 50, 145)
        .text(`Teléfono: ${empresa.telefono}`, 50, 160)
        .text(`Email: ${empresa.email}`, 50, 175);

      // Información del Cliente
      doc
        .fontSize(10)
        .text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 400, 130)
        .text(`Cotización #: ${transaccionData.id_transaccion}`, 400, 145);

      doc.moveDown();

      // Cliente
      doc
        .fontSize(12)
        .fillColor("#005cbf")
        .text("Vendedor:", 50, 200)
        .fillColor("#000000")
        .text(
          `Nombre vendedor: ${transaccionData.usuario.nombre} ${transaccionData.usuario.apellido}`,
          50,
          215
        )
        .text(`Rut: ${transaccionData.usuario.rut}`, 50, 230);

      doc
        .fillColor("#005cbf")
        .text("Enviado a:", 300, 200)
        .fillColor("#000000")
        .text(`Nombre Cliente: ${transaccionData.cliente.nombre}`, 300, 215)
        .text(`Dirección: ${transaccionData.cliente.direccion}`, 300, 230)
        .text(`Telefono: ${transaccionData.cliente.telefono}`, 300, 245);

      // Línea Separadora
      doc.moveTo(50, 260).lineTo(550, 260).stroke("#cccccc");

      // Tabla de Detalles
      const tableTop = 270;
      const columnWidths = [50, 200, 70, 70, 70];

      doc.fontSize(10).fillColor("#000000");

      // Encabezado de la tabla
      const headers = ["# Artículo", "Descripción", "Cant", "P/U", "Total"];
      let x = 50;

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

      // Contenido de la tabla
      let position = tableTop + 25;
      let totalNeto = 0;

      detalles.forEach((detalle, index) => {
        const subtotal = detalle.cantidad * detalle.precio_unitario;
        totalNeto += subtotal;

        x = 50;
        const row = [
          detalle.id_producto,
          detalle.producto.nombre_producto,
          detalle.cantidad,
          `$${detalle.precio_unitario.toLocaleString()}`,
          `$${subtotal.toLocaleString()}`,
        ];

        row.forEach((cell, i) => {
          doc.text(cell, x, position, {
            width: columnWidths[i],
            align: "center",
          });
          x += columnWidths[i];
        });

        position += 20;
      });

      // Calcular IVA y Total
      const iva = totalNeto * 0.19;
      const totalFinal = totalNeto + iva;

      // Totales
      doc
        .fontSize(10)
        .text(`Subtotal: $${totalNeto.toLocaleString()}`, 400, position + 10)
        .text(`IVA (19%): $${iva.toLocaleString()}`, 400, position + 25)
        .text(`Total: $${totalFinal.toLocaleString()}`, 400, position + 40, {
          align: "right",
          underline: true,
        });

      // Pie de página
      doc
        .fontSize(10)
        .fillColor("#888888")
        .text(
          "Si tiene alguna consulta sobre esta cotización, por favor contáctenos.",
          50,
          position + 100,
          { align: "center" }
        );

      doc.end();
    } catch (error) {
      console.error("Error en createPdf:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }
}

export default new TransaccionController();
