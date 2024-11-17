import bcrypt from "bcrypt";
import crypto from "crypto";
import UsuariosRepository from "../infraestructure/repositories/UsuariosRepository.js";
import RolesRepository from "../infraestructure/repositories/RolRepository.js";
import EmailService from "../application/helpers/EmailService.js";

class UsuarioService {
  /**
   * Crear un nuevo usuario con una contraseña generada automáticamente.
   * @param {Object} data - Datos del usuario.
   * @returns {Promise<Object>} - Retorna el usuario creado.
   */
  async createUsuario(data) {
    const { rut, nombre, apellido, email, rolId } = data;

    const usuario_existente = await UsuariosRepository.findByRut(rut);
    if(usuario_existente) {
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
  async changePassword(rut, oldPassword, newPassword) {
    const usuario = await UsuariosRepository.findByRut(rut);

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(oldPassword, usuario.password);
    if (!isPasswordValid) {
      throw new Error("La contraseña actual es incorrecta");
    }

    // Encriptar la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar la contraseña en la base de datos
    await UsuariosRepository.update(rut, { password: hashedPassword });
  }
}

export default new UsuarioService();
