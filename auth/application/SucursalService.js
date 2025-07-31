import SucursalRepository from "../infraestructure/repositories/SucursalRepository.js";

class SucursalService {
  async crearSucursal(data) {
    try {
      if (!data.id_empresa || isNaN(data.id_empresa)) {
        throw new Error("El id_empresa es requerido y debe ser válido.");
      }
      const nuevaSucursal = await SucursalRepository.createSucursal(data);
      return nuevaSucursal;
    } catch (error) {
      console.error("Error al crear la sucursal:", error);
      throw new Error("Error al crear la sucursal.");
    }
  }

  async eliminarSucursal(id_sucursal) {
    try {
      const eliminado = await SucursalRepository.deleteSucursal(id_sucursal);
      if (!eliminado) {
        throw new Error("Sucursal no encontrada para eliminar.");
      }
      return eliminado;
    } catch (error) {
      console.error("Error al eliminar la sucursal:", error);
      throw new Error("Error al eliminar la sucursal.");
    }
  }

  async obtenerSucursals() {
    try {
      const sucursales = await SucursalRepository.getAllSucursales();
      return sucursales;
    } catch (error) {
      console.error("Error al obtener las sucursales:", error);
      throw new Error("Error al obtener las sucursales.");
    }
  }

  async obtenerSucursalPorId(id_sucursal) {
    try {
      const sucursal = await SucursalRepository.getSucursalById(id_sucursal);
      if (!sucursal) {
        throw new Error("Sucursal no encontrada.");
      }
      return sucursal;
    } catch (error) {
      console.error("Error al obtener la sucursal por ID:", error);
      throw new Error("Error al obtener la sucursal.");
    }
  }

  async obtenerSucursalPorNombre(nombre) {
    try {
      const sucursal = await SucursalRepository.getSucursalByNombre(nombre);
      if (!sucursal) {
        throw new Error("Sucursal no encontrada.");
      }
      return sucursal;
    } catch (error) {
      console.error("Error al obtener la sucursal por nombre:", error);
      throw new Error("Error al obtener la sucursal.");
    }
  }

  async obtenerSucursalDeUsuario(rutUsuario) {
    try {
      const sucursal = await SucursalRepository.getSucursalByUsuario(
        rutUsuario
      );
      if (!sucursal) {
        throw new Error("No se encontró la sucursal asociada al usuario.");
      }
      return sucursal;
    } catch (error) {
      console.error("Error al obtener la sucursal del usuario:", error);
      throw new Error("Error al obtener la sucursal asociada al usuario.");
    }
  }

  async editarSucursal(id_sucursal, data) {
    try {
      const sucursalActualizada = await SucursalRepository.updateSucursal(
        id_sucursal,
        data
      );
      return sucursalActualizada;
    } catch (error) {
      console.error("Error al editar la sucursal:", error);
      throw new Error("Error al editar la sucursal.");
    }
  }
}

export default new SucursalService();
