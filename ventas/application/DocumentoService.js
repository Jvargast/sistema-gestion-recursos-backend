import BoletaRepository from "../infrastructure/repositories/BoletaRepository.js";
import DocumentoRepository from "../infrastructure/repositories/DocumentoRepository.js";
import EstadoPagoService from "./EstadoPagoService.js";
import FacturaService from "./FacturaService.js";


class Documento {
  async crearDocumento({ id_transaccion, tipo_documento, id_cliente, total }) {
    const estadoInicial = await EstadoPagoService.findByNombre("Pendiente");

    const documento = await DocumentoRepository.create({
      id_transaccion,
      tipo_documento,
      id_estado_pago: estadoInicial.dataValues.id_estado_pago,
      total,
      id_cliente,
      fecha_emision: new Date(),
    });
    if (tipo_documento === "factura") {
      const factura = await FacturaService.generarFacturaDesdeDocumento(
        documento.id_documento,
      );
      return { ...documento.dataValues, factura };
    } else if (tipo_documento === "boleta") {
      const boleta = await BoletaRepository.create({
        id_documento: documento.id_documento,
      });
      return { ...documento.dataValues, boleta };
    }
    throw new Error("Tipo de documento no válido.");
  }
  // Obtener documento por ID de transacción
  async obtenerDocumentoPorTransaccion(id_transaccion) {
    const documento = await DocumentoRepository.findByTransaccionId(
      id_transaccion
    );

    if (!documento) {
      throw new Error(
        "Documento no encontrado para la transacción proporcionada."
      );
    }

    return documento;
  }

  // Actualizar un documento
  async actualizarDocumento(id_documento, updates) {
    const documento = await DocumentoRepository.update(id_documento, updates);
    return documento;
  }

  // Eliminar un documento
  async eliminarDocumento(id_documento) {
    const result = await DocumentoRepository.delete(id_documento);
    return result;
  }

  async actualizarTotalDocumento(id_documento, total) {
    const documento = await DocumentoRepository.findById(id_documento);
    if (!documento) {
      throw new Error("Documento no encontrado.");
    }

    await DocumentoRepository.update(id_documento, { total });
    return documento;
  }
}
export default new Documento();
