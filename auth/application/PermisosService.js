import PermisosRepository from '../../auth/infraestructure/repositories/PermisosRepository.js';

class PermisosService {
  async createPermiso(data) {
    const { nombre } = data;

    // Verificar si ya existe un permiso con el mismo nombre
    const permisoExistente = await PermisosRepository.findAll();
    const existe = permisoExistente.some((permiso) => permiso.nombre === nombre);

    if (existe) {
      throw new Error('Ya existe un permiso con este nombre');
    }

    return await PermisosRepository.create(data);
  }

  async updatePermiso(id, data) {
    const permiso = await PermisosRepository.findById(id);
    if (!permiso) {
      throw new Error('Permiso no encontrado');
    }

    return await PermisosRepository.update(id, data);
  }

  async deletePermiso(id) {
    const permiso = await PermisosRepository.findById(id);
    if (!permiso) {
      throw new Error('Permiso no encontrado');
    }

    return await PermisosRepository.delete(id);
  }

  async getAllPermisos() {
    return await PermisosRepository.findAll();
  }

  async getPermisoById(id) {
    const permiso = await PermisosRepository.findById(id);
    if (!permiso) {
      throw new Error('Permiso no encontrado');
    }

    return permiso;
  }
}

export default new PermisosService();
