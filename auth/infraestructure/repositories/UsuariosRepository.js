import Usuario from "../../domain/models/Usuarios.js";
import IUsuariosRepository from "../../domain/repositories/IUsuariosRepository.js";

class UsuarioRepository extends IUsuariosRepository {
  async findByRut(rut) {
    return await Usuario.findOne({
      where: { rut, activo: true },
    });
  }

  async create(data) {
    return await Usuario.create({
      ...data,
      activo: true,
    });
  }

  async update(rut, data) {
    return await Usuario.update(data, { where: { rut } });
  }

  async deactivate(rut) {
    return await Usuario.update({ activo: false }, { where: { rut } });
  }

  async findAll() {
    return await Usuario.findAll();
  }
}

export default new UsuarioRepository();
