import UsuariosRepository from '../infraestructure/repositories/UsuariosRepository.js';
import RolesRepository from '../infraestructure/repositories/RolRepository.js';

class UsuarioService {
  /**
   * Crear un nuevo usuario.
   */
  async createUsuario(data) {
    const { rut, nombre, apellido, email, password, rolId } = data;

    // Verificar que el rol exista
    const rol = await RolesRepository.findById(rolId);
    if (!rol) {
      throw new Error('El rol especificado no existe');
    }

    // Crear usuario
    return await UsuariosRepository.create({ rut, nombre, apellido, email, password, rolId });
  }

  /**
   * Obtener todos los usuarios.
   */
  async getAllUsuarios() {
    return await UsuariosRepository.findAll();
  }

  /**
   * Obtener un usuario por su RUT.
   */
  async getUsuarioByRut(rut) {
    return await UsuariosRepository.findByRut(rut);
  }

  /**
   * Actualizar un usuario.
   */
  async updateUsuario(rut, data) {
    const result = await UsuariosRepository.update(rut, data);

    if (result[0] === 0) {
      throw new Error('No se pudo actualizar el usuario, posiblemente no existe');
    }

    return { message: 'Usuario actualizado exitosamente' };
  }

  /**
   * Desactivar un usuario (marcar como inactivo).
   */
  async deactivateUsuario(rut) {
    const result = await UsuariosRepository.deactivate(rut);

    if (result[0] === 0) {
      throw new Error('No se pudo desactivar el usuario, posiblemente no existe');
    }

    return { message: 'Usuario desactivado exitosamente' };
  }
}

export default new UsuarioService();