import EmpresaService from "../../application/EmpresaService.js";

class EmpresaController {
  // Obtener todas las empresas
  async getAllEmpresas(req, res) {
    try {
      const empresas = await EmpresaService.obtenerEmpresas();
      res.json(empresas);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obtener una empresa por ID
  async getEmpresaById(req, res) {
    try {
      const { id } = req.params;
      const empresa = await EmpresaService.obtenerEmpresaPorId(id);
      res.json(empresa);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Obtener una empresa por nombre
  async getEmpresaByNombre(req, res) {
    try {
      const { nombre } = req.query;
      const empresa = await EmpresaService.obtenerEmpresaPorNombre(nombre);
      res.json(empresa);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Obtener empresa de un usuario
  async getEmpresaByUsuario(req, res) {
    try {
      const { rutUsuario } = req.params;
      const empresa = await EmpresaService.obtenerEmpresaDeUsuario(rutUsuario);
      res.json(empresa);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Editar una empresa
  async updateEmpresa(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const empresaActualizada = await EmpresaService.editarEmpresa(id, data);
      res.json({
        message: "Empresa actualizada exitosamente.",
        data: empresaActualizada,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new EmpresaController();
