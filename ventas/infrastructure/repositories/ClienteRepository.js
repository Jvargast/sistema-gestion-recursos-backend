import Cliente from "../../domain/models/Cliente.js";
import { Op } from "sequelize";

class ClienteRepository {
  async findWithFilter(where) {
    return await Cliente.findAll({ where });
  }

  async findById(id_cliente) {
    return await Cliente.findByPk(id_cliente);
  }

  async findByDireccion(direccion) {
    return await Cliente.findOne({ where: { direccion: direccion } });
  }

  async findAll() {
    return await Cliente.findAll();
  }

  async create(data) {
    return await Cliente.create(data);
  }

  async update(id_cliente, data) {
    return await Cliente.update(data, { where: { id_cliente } });
  }
  async updateWithconditions(id, data) {
    if (!id) {
      throw new Error("Se requiere de un Rut de cliente para actualizar.");
    }

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      throw new Error(`Cliente con RUT ${id} no encontrado.`);
    }

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && cliente[key] !== undefined) {
        cliente[key] = value;
      }
    }
    await cliente.save();

    return cliente;
  }

  async deactivate(id) {
    return await Cliente.update(
      { activo: false },
      { where: { id_cliente: id } }
    );
  }

  async reactivate(id) {
    return await Cliente.update(
      { activo: true },
      { where: { id_cliente: id } }
    );
  }

  async findByIds(ids) {
    return await Cliente.findAll({
      where: { id_cliente: ids },
    });
  }

  async getClientesRegistradosDesdeFecha(fechaInicio, fechaFin) {
    return await Cliente.count({
      where: {
        createdAt: {
          [Op.gte]: fechaInicio, // Mayor o igual que `fechaInicio`
          [Op.lt]: fechaFin, // Menor que `fechaFin`
        },
      },
    });
  }

  async getTotalClientes() {
    return await Cliente.count();
  }

  getModel() {
    return Cliente;
  }
}

export default new ClienteRepository();
