import { Op } from "sequelize";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
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

  async getAllClientes(
    filters = {},
    options /* = { page: 1, limit: 20, rolId: null } */
  ) {
    const allowedFields = [
      "rut",
      "razon_social",
      "tipo_cliente",
      "nombre",
      "apellido",
      "direccion",
      "telefono",
      "email",
      "activo",
    ];
    const where = createFilter(filters, allowedFields);

    if (options.search) {
      where[Op.or] = [
        { rut: { [Op.like]: `%${options.search}%` } },
        { nombre: { [Op.like]: `%${options.search}%` } },
        { direccion: { [Op.like]: `%${options.search}%` } },
        { telefono: { [Op.like]: `%${options.search}%` } },
        { email: { [Op.like]: `%${options.search}%` } },
      ];
    }
    const result = await paginate(ClienteRepository.getModel(), options, {
      where,
      order: [["fecha_registro", "ASC"]],
    });
    return await result;
  }

  async createCliente(data) {
    const existingCliente = await ClienteRepository.findById(data.rut);
    if (existingCliente) {
      throw new Error("El cliente ya existe con este rut.");
    }

    return await ClienteRepository.create(data);
  }

  async updateCliente(id, data) {
    if (!id) {
      throw new Error("Se requiere de un Rut de cliente para actualizar.");
    }

    // Llama al repositorio con id y datos separados
    const clienteActualizado = await ClienteRepository.updateWithconditions(
      id,
      data
    );
    return clienteActualizado;
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
    const allowedFields = [
      "rut",
      "nombre",
      "email",
      "tipo_cliente",
      "razon_social",
      "apellido",
      "telefono",
      "activo",
    ];
    const where = createFilter(filters, allowedFields);
    return await ClienteRepository.findWithFilter(where);
  }
  async deleteClientes(ruts, id_usuario) {
    if (!Array.isArray(ruts) || ruts.length === 0) {
      throw new Error(
        "Debe proporcionar al menos un ID de cliente para eliminar."
      );
    }
    const clientes = await ClienteRepository.findByIds(ruts);
    if (clientes.length !== ruts.length) {
      const notFoundIds = ruts.filter(
        (rut) => !clientes.some((cliente) => cliente.rut === rut)
      );
      throw new Error(
        `Las siguientes clientes no fueron encontradas: ${notFoundIds.join(
          ", "
        )}`
      );
    }

    for (const cliente of clientes) {
      const activo = false;
      await ClienteRepository.update(cliente.rut, { activo: activo });
    }

    return {
      message: `Se marcaron como eliminados ${ruts.length} clientes.`,
    };
  }
}

export default new ClienteService();
