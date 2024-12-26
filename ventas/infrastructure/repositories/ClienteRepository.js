import IClienteRepository from "../../domain/repositories/IClienteRepository.js";
import Cliente from "../../domain/models/Cliente.js";

class ClienteRepository extends IClienteRepository {
  async findWithFilter(where) {
    return await Cliente.findAll({ where });
  }

  async findById(id) {
    return await Cliente.findByPk(id);
  }

  async findAll() {
    return await Cliente.findAll();
  }

  async create(data) {
    return await Cliente.create(data);
  }

  async update(rut, data) {
    return await Cliente.update(data, { where: { rut: rut } });
  }
  async updateWithconditions(id, data) {
    if (!id) {
      throw new Error("Se requiere de un Rut de cliente para actualizar.");
    };

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      throw new Error(`Cliente con RUT ${id} no encontrado.`);
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && cliente[key] !== undefined) {
        cliente[key] = value;
      }
    };
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

  async findByIds(ruts) {
    return await Cliente.findAll({
      where: { rut: ruts },
    });
  }

  getModel() {
    return Cliente;
  }
}

export default new ClienteRepository();
