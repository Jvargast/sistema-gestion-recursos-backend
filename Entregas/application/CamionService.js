import SucursalRepository from "../../auth/infraestructure/repositories/SucursalRepository.js";
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import CamionRepository from "../infrastructure/repositories/CamionRepository.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";

class CamionService {
  async createCamion(data) {
    const { placa, capacidad, estado, id_sucursal } = data;

    if (!placa || !capacidad) {
      throw new Error("Missing required fields: placa, capacidad");
    }

    const sucursalId = Number(id_sucursal);
    if (!sucursalId || !Number.isInteger(sucursalId)) {
      throw new Error("id_sucursal is required and must be an integer");
    }

    const existe = await SucursalRepository.getSucursalById(sucursalId);
    if (!existe) {
      throw new Error(`La sucursal ${sucursalId} no existe`);
    }

    const payload = {
      placa: String(placa).trim().toUpperCase(),
      capacidad: Number(capacidad),
      estado: estado || "Disponible",
      id_sucursal: sucursalId,
    };

    return await CamionRepository.create(payload);
  }

  async getCamionById(id) {
    const camion = await CamionRepository.findById(id);
    if (!camion) {
      throw new Error("Camion not found");
    }
    return camion;
  }

  //Cambio de estado del camión para cuando se vuelve a planta
  async actualizarEstadoCamion(id_camion, nuevoEstado) {
    try {
      const camion = await CamionRepository.findById(id_camion);
      if (!camion) {
        throw new Error("Camión no encontrado");
      }
      camion.estado = nuevoEstado;
      await camion.save();
      return camion;
    } catch (error) {
      throw error;
    }
  }

  async getCapacityByChoferId(id_chofer) {
    const capacidad = await CamionRepository.findByChoferId(id_chofer);
    console.log(capacidad);
    return capacidad;
  }

  async getCurrentCapacity(id_camion) {
    // Obtener el inventario actual del camión por su ID
    const inventario = await InventarioCamionRepository.findByCamionId(
      id_camion
    );

    if (!inventario || inventario.length === 0) {
      const camion = await CamionRepository.findById(id_camion);
      if (!camion) {
        throw new Error(`Camión con id ${id_camion} no encontrado`);
      }

      return {
        capacidadTotal: camion.capacidad,
        capacidadUtilizada: 0,
        capacidadDisponible: camion.capacidad,
      };
    }

    // Filtrar los productos en estado "En Camión - Reservado" o "En Camión - Disponible"
    const inventarioFiltrado = inventario.filter(
      (item) =>
        item.estado === "En Camión - Reservado" ||
        item.estado === "En Camión - Disponible"
    );

    // Sumar las cantidades filtradas
    const capacidadUtilizada = inventarioFiltrado.reduce(
      (total, item) => total + item.cantidad,
      0
    );

    // Obtener la capacidad total del camión
    const camion = await CamionRepository.findById(id_camion);
    if (!camion) {
      throw new Error(`Camión con id ${id_camion} no encontrado`);
    }

    return {
      capacidadTotal: camion.capacidad,
      capacidadUtilizada,
      capacidadDisponible: camion.capacidad - capacidadUtilizada,
    };
  }

  async asignarChofer(id_camion, id_chofer) {
    const camion = await CamionRepository.findById(id_camion);
    if (!camion) {
      throw new Error("El camión no existe.");
    }

    const chofer = await UsuariosRepository.findByRut(id_chofer);
    if (!chofer) {
      throw new Error("El chofer no existe.");
    }

    await CamionRepository.update(id_camion, {
      id_chofer_asignado: id_chofer,
    });

    return await CamionRepository.findById(id_camion);
  }

  async desasignarChofer(id_camion) {
    const camion = await CamionRepository.findById(id_camion);
    if (!camion) {
      throw new Error("El camión no existe.");
    }

    await CamionRepository.update(id_camion, { id_chofer_asignado: null });
    return CamionRepository.findById(id_camion);
  }

  async getAllCamiones() {
    return await CamionRepository.findAll();
  }

  async updateCamion(id, data) {
    return await CamionRepository.update(id, data);
  }

  async deleteCamion(id) {
    return await CamionRepository.delete(id);
  }
}

export default new CamionService();
