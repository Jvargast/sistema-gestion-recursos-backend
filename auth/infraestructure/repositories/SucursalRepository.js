import Sucursal from "../../domain/models/Sucursal.js";

class SucursalRepository {

  async getAllSucursales() {
    try {
      const sucursales = await Sucursal.findAll();
      return sucursales;
    } catch (error) {
      console.error("Error al obtener sucursales:", error);
      throw new Error("Error al obtener sucursales.");
    }
  }

  async getSucursalById(id_sucursal) {
    try {
      const sucursal = await Sucursal.findByPk(id_sucursal);
      return sucursal;
    } catch (error) {
      console.error("Error al obtener la sucursal:", error);
      throw new Error("Error al obtener la sucursal.");
    }
  }

  async updateSucursal(id_sucursal, data) {
    try {
      const sucursal = await Sucursal.findByPk(id_sucursal);
      if (!sucursal) {
        throw new Error("Sucursal no encontrada.");
      }

      // Actualizar los datos de la sucursal
      await sucursal.update(data);

      return sucursal;
    } catch (error) {
      console.error("Error al actualizar la sucursal:", error);
      throw new Error("Error al actualizar la sucursal.");
    }
  }
}

export default new SucursalRepository();
