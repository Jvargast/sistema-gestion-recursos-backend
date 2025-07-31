import Empresa from "../../domain/models/Empresa.js";
import Sucursal from "../../domain/models/Sucursal.js";
import Usuarios from "../../domain/models/Usuarios.js";

class SucursalRepository {
  async createSucursal(data) {
    try {
      const nuevaSucursal = await Sucursal.create(data);
      return nuevaSucursal;
    } catch (error) {
      console.error("Error al crear sucursal:", error);
      throw new Error("Error al crear sucursal.");
    }
  }

  async deleteSucursal(id_sucursal) {
    try {
      const sucursal = await Sucursal.findByPk(id_sucursal);
      if (!sucursal) {
        return false; 
      }
      await sucursal.destroy();
      return true; 
    } catch (error) {
      console.error("Error al eliminar sucursal:", error);
      throw new Error("Error al eliminar sucursal.");
    }
  }
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

  async getSucursalByUsuario(rutUsuario) {
    return await Sucursal.findOne({
      include: [
        {
          model: Usuarios,
          as: "usuarios",
          where: { rut: rutUsuario },
          attributes: ["rut", "nombre", "apellido", "email"],
        },
      ],
    });
  }

  async getSucursalByNombre(nombre) {
    return await Sucursal.findOne({
      where: { nombre: { [Op.iLike]: `%${nombre}%` } }, // Búsqueda no sensible a mayúsculas
      include: [
        {
          model: Empresa,
          as: "empresas",
          attributes: ["id_empresa", "nombre", "direccion", "telefono"],
        },
      ],
    });
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

  getModel() {
    return Sucursal;
  }
}

export default new SucursalRepository();
