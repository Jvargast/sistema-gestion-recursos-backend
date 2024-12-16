import DetalleTransaccionService from "../../application/DetalleTransaccionService.js";
import TransaccionService from "../../application/TransaccionService.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

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
      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search,
      };

      delete filters.limit;
      delete filters.offset;
      const transacciones = await TransaccionService.getAllTransacciones(
        filters,
        options
      );
      res.status(200).json(transacciones);
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

  async completeTransaction(req, res) {
    try {
      const { rut } = req.user;
      const { id } = req.params;
      const { metodo_pago, referencia } = req.body;

      const completeTransaction = await TransaccionService.completarTransaccion(
        id,
        metodo_pago,
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
      const logoPath = path.join(__dirname, "../../../public/images/logoLogin.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 50, { width: 100 }); // Posicionar y ajustar tamaño
      }

      // Manejar errores en la transmisión del PDF
      doc.on("error", (err) => {
        console.error("Error al generar el PDF:", err);
        return res.status(500).json({ message: "Error al generar el PDF." });
      });

      // Título
      doc
        .fillColor("#005cbf")
        .fontSize(24)
        .text("Cotización", { align: "center" })
        .moveDown(2);
      // Información general
      doc
        .fillColor("black")
        .fontSize(14)
        .text(`ID de Transacción: ${transaccion.transaccion.id_transaccion}`)
        .text(`Cliente: ${transaccion.transaccion.cliente.nombre}`)
        .text(
          `Fecha: ${new Date(
            transaccion.transaccion.fecha_creacion
          ).toLocaleDateString("es-ES")}`
        )
        .moveDown();

      // Línea separadora
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#cccccc").moveDown(1);

      // Encabezado de detalles
      doc
        .fillColor("#333333")
        .fontSize(16)
        .text("Detalles de la Cotización", { underline: true })
        .moveDown();

      // Tabla de productos
      transaccion.detalles.forEach((detalle, index) => {
        doc
          .fillColor("#555555")
          .fontSize(12)
          .text(
            `${index + 1}. ${detalle.producto.nombre_producto} - Cantidad: ${
              detalle.cantidad
            } - Precio: $${detalle.precio_unitario.toLocaleString()} - Subtotal: $${detalle.subtotal.toLocaleString()}`
          );
      });

      // Total
      doc
        .moveDown()
        .fillColor("black")
        .fontSize(14)
        .text(`Total: $${transaccion.transaccion.total.toLocaleString()}`, {
          align: "right",
        });

      // Firma o pie de página
      doc
        .moveDown(3)
        .fontSize(10)
        .fillColor("#888888")
        .text("Aguas Valentino © 2024 - Todos los derechos reservados", {
          align: "center",
        });

      // Finalizar el PDF
      doc.end();

    } catch (error) {
      console.error("Error en createPdf:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }
}

export default new TransaccionController();
