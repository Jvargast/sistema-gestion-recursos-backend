import SucursalService from "../../application/SucursalService.js";


class SucursalController {
  // Obtener todas las Sucursals
  async getAllSucursals(req, res) {
    try {
      const sucursales = await SucursalService.obtenerSucursals();
      res.json(sucursales);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obtener una sucursal por ID
  async getSucursalById(req, res) {
    try {
      const { id } = req.params;
      const sucursal = await SucursalService.obtenerSucursalPorId(id);
      res.status(200).json(sucursal);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Obtener una sucursal por nombre
  async getSucursalByNombre(req, res) {
    try {
      const { nombre } = req.query;
      const sucursal = await SucursalService.obtenerSucursalPorNombre(nombre);
      res.json(sucursal);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Obtener sucursal de un usuario
  async getSucursalByUsuario(req, res) {
    try {
      const { rutUsuario } = req.params;
      const sucursal = await SucursalService.obtenerSucursalDeUsuario(
        rutUsuario
      );
      res.json(sucursal);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Editar una sucursal
  async updateSucursal(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const sucursalActualizada = await SucursalService.editarSucursal(
        id,
        data
      );
      res.json({
        message: "Sucursal actualizada exitosamente.",
        data: sucursalActualizada,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new SucursalController();
