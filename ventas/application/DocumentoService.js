import DocumentoRepository from "../infrastructure/repositories/DocumentoRepository.js";

class DocumentoService {
  async obtenerDocumentoPorId(id_documento) {
    if (!id_documento) throw new Error("Debe proporcionar un ID de documento.");
    const documento = await DocumentoRepository.findById(id_documento);
    if (!documento) throw new Error("Documento no encontrado.");
    return documento;
  }

  async obtenerDocumentosPorVenta(id_venta) {
    if (!id_venta) throw new Error("El ID de la venta es obligatorio.");
    return await DocumentoRepository.findByVentaId(id_venta);
  }

  async crearDocumento(data) {
    if (
      !data ||
      !data.id_venta ||
      !data.tipo_documento ||
      !data.numero ||
      !data.total ||
      !data.id_estado_pago
    ) {
      throw new Error("Faltan datos requeridos para crear el documento.");
    }
    return await DocumentoRepository.create(data);
  }

  async actualizarDocumento(id_documento, updates) {
    if (!id_documento)
      throw new Error("Debe proporcionar el ID del documento a actualizar.");
    return await DocumentoRepository.update(id_documento, updates);
  }

  async eliminarDocumento(id_documento) {
    if (!id_documento)
      throw new Error("Debe proporcionar el ID del documento a eliminar.");
    return await DocumentoRepository.delete(id_documento);
  }
}

export default new DocumentoService();
