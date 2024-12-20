import bcrypt from "bcrypt";
import crypto from "crypto";
import UsuariosRepository from "../infraestructure/repositories/UsuariosRepository.js";
import RolesRepository from "../infraestructure/repositories/RolRepository.js";
import EmailService from "../application/helpers/EmailService.js";
import RolesService from "./RolesService.js";

class UsuarioService {
  /**
   * Crear un nuevo usuario con una contraseña generada automáticamente.
   * @param {Object} data - Datos del usuario.
   * @returns {Promise<Object>} - Retorna el usuario creado.
   */
  async createUsuario(data) {
    const { rut, nombre, apellido, email, rolId, id_empresa, id_sucursal } =
      data;

    const usuario_existente = await UsuariosRepository.findByRut(rut);
    if (usuario_existente) {
      throw new Error("El usuario ya existe en el sistema");
    }
    // Verificar que el rol exista
    const rol = await RolesRepository.findById(rolId);
    if (!rol) {
      throw new Error("El rol especificado no existe");
    }

    // Generar una contraseña temporal
    const tempPassword = crypto.randomBytes(8).toString("hex"); // Genera una contraseña segura de 8 caracteres
    // Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    // Crear el usuario con la contraseña encriptada
    const usuario = await UsuariosRepository.create({
      rut,
      nombre,
      apellido,
      email,
      password: hashedPassword,
      rolId,
      id_empresa,
      id_sucursal
    });

    // Enviar la contraseña temporal por correo
    //
    // ATENCIÓN POR HACER EL SERVICIO DE ENVIAR CORREO
    await EmailService.sendPasswordEmail(email, tempPassword);

    return usuario;
  }

  /**
   * Obtener todos los usuarios.
   */
  async getAllUsuarios() {
    return await UsuariosRepository.findAll();
  }

  async getAllChoferes() {
    try {
      const rolIdChofer = await RolesService.getRolIdByName("chofer");

      const choferes = await UsuariosRepository.findAllByRolId(rolIdChofer);

      return choferes;
    } catch (error) {
      throw new Error(`Error al obtener choferes: ${error.message}`);
    }
  }

  /**
   * Obtener un usuario por su RUT.
   */
  async getUsuarioByRut(rut) {
    return await UsuariosRepository.findByRut(rut);
  }

  async getUsuarioById(rut){
    return await UsuariosRepository.findOne(rut);
  }

  /**
   * Actualizar un usuario.
   */
  async updateUsuario(rut, data) {
    const result = await UsuariosRepository.update(rut, data);

    if (result[0] === 0) {
      throw new Error(
        "No se pudo actualizar el usuario, posiblemente no existe"
      );
    }

    return { message: "Usuario actualizado exitosamente" };
  }

  /**
   * Desactivar un usuario (marcar como inactivo).
   */
  async deactivateUsuario(rut) {
    const result = await UsuariosRepository.deactivate(rut);

    if (result[0] === 0) {
      throw new Error(
        "No se pudo desactivar el usuario, posiblemente no existe"
      );
    }

    return { message: "Usuario desactivado exitosamente" };
  }

  /**
   * Cambiar la contraseña del usuario.
   * @param {string} rut - RUT del usuario.
   * @param {string} oldPassword - Contraseña actual.
   * @param {string} newPassword - Nueva contraseña.
   * @returns {Promise<void>}
   */
  async changePassword(rut, currentPassword, newPassword) {
    const usuario = await this.getUsuarioByRut(rut);

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    const isPasswordValid = await this.verifyPassword(
      currentPassword,
      usuario.password
    );
    if (!isPasswordValid) {
      throw new Error("La contraseña actual es incorrecta");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    return await this.updateUsuario(rut, { password: hashedNewPassword });
  }

  /**
   * Verificar si una contraseña es válida.
   * @param {string} plainPassword - Contraseña sin encriptar.
   * @param {string} hashedPassword - Contraseña encriptada.
   * @returns {Promise<boolean>} - True si las contraseñas coinciden.
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default new UsuarioService();
