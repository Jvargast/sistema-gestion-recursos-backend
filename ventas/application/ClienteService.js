import createFilter from "../../shared/utils/helpers.js";
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import TransaccionRepository from "../infrastructure/repositories/TransaccionRepository.js";

class ClienteService {

  async getClienteById(id) {
    const cliente = await ClienteRepository.findById(id);
    if (!cliente) {
      throw new Error("Cliente no encontrado.");
    }
    return cliente;
  }

  async getAllClientes() {
    return await ClienteRepository.findAll();
  }

  async createCliente(data) {
    const existingCliente = await ClienteRepository.findById(data.rut);
    if (existingCliente) {
      throw new Error("El cliente ya existe con este email.");
    }

    return await ClienteRepository.create(data);
  }

  async updateCliente(id, data) {
    return await ClienteRepository.update(id, data);
  }

  async deactivateCliente(id) {
    const cliente = await ClienteRepository.findById(id);
    if (!cliente || !cliente.activo) {
      throw new Error("El cliente ya está desactivado o no existe.");
    }

    return await ClienteRepository.update(id, { activo: false });
  }

  async reactivateCliente(id) {
    const cliente = await ClienteRepository.findById(id);
    if (!cliente || cliente.activo) {
      throw new Error("El cliente ya está activo o no existe.");
    }

    return await ClienteRepository.update(id, { activo: true });
  }

  async getClienteTransacciones(id) {
    const cliente = await ClienteRepository.findById(id);
    if (!cliente) {
      throw new Error("Cliente no encontrado.");
    }

    return await TransaccionRepository.findByClienteId(id);
  }

  async searchClientes(filters) {
    const allowedFields = ["rut", "nombre", "email", "tipo_cliente", "razon_social", "apellido", "telefono", "activo"];
    const where = createFilter(filters, allowedFields);
    return await ClienteRepository.findWithFilter(where);
  }
}

export default new ClienteService();
