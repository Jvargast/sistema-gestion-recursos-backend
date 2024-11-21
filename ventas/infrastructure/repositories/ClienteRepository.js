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

  async update(id, data) {
    return await Cliente.update(data, { where: { id_cliente: id } });
  }

  async deactivate(id) {
    return await Cliente.update({ activo: false }, { where: { id_cliente: id } });
  }

  async reactivate(id) {
    return await Cliente.update({ activo: true }, { where: { id_cliente: id } });
  }

  getModel() {
    return Cliente;
  }
}

export default new ClienteRepository();
