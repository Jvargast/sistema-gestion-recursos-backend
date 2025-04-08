import DocumentoService from "../../application/DocumentoService.js";
import CuentaPorCobrarRepository from "../repositories/CuentaPorCobrarRepository.js";

class DocumentoController {
  async getDocumentoById(req, res) {
    try {
      const documento = await DocumentoService.obtenerDocumentoPorId(
        req.params.id
      );
      res.json(documento);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getDocumentosByVenta(req, res) {
    try {
      const documentos = await DocumentoService.obtenerDocumentosPorVenta(
        req.params.id_venta
      );
      res.json(documentos);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async createDocumento(req, res) {
    try {
      const nuevo = await DocumentoService.crearDocumento(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateDocumento(req, res) {
    try {
      const actualizado = await DocumentoService.actualizarDocumento(
        req.params.id,
        req.body
      );
      res.json(actualizado);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteDocumento(req, res) {
    try {
      await DocumentoService.eliminarDocumento(req.params.id);
      res.json({ message: "Documento eliminado." });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new DocumentoController();
