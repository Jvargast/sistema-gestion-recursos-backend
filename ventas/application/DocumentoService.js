import EstadoFacturaService from "./EstadoFacturaService.js";
import TransaccionService from "./TransaccionService.js";

class Documento {
  async crearDocumentoTransaccion(id_transaccion, tipo_documento, id_usuario) {
    const transaccion = await TransaccionService.getTransaccionById(
      id_transaccion
    );

    if (!transaccion) {
      throw new Error("Transacción no encontrada.");
    }

    const estadoInicial =
      tipo_documento === "Factura"
        ? await EstadoFacturaService.findByNombre("Pendiente")
        : await EstadoBoletaService.findByNombre("Pendiente");

    const documento = await DocumentoRepository.create({
      id_transaccion,
      tipo_documento,
      id_estado: estadoInicial.dataValues.id_estado,
      total: transaccion.transaccion.dataValues.total,
      id_usuario,
      fecha_emision: new Date(),
    });

    return documento;
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
}
export default new Documento();
